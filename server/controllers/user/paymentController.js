import { OrderModel } from '../../models/orderModel.js';
import { CartModel } from '../../models/cartModel.js';
import { razorpayService } from '../../services/razorpayService.js';
import { emailService } from '../../services/emailService.js';

// Helper to extract identity
const getIdentity = (req) => {
  const userId = req.user ? (req.user.id || req.user._id) : null;
  const guestId = req.headers['x-guest-id'] || req.query.guestId || (req.body ? req.body.guestId : null);
  return { userId, guestId };
};

// 1. Initialize Razorpay Payment Order (Online Payment Processing)
export const createPaymentOrder = async (req, res) => {
  try {
    const { userId, guestId } = getIdentity(req);
    let {
      orderId,
      items,
      customerName,
      phone,
      email,
      address,
      isGift,
      occasion,
      giftMessage,
      giftWrap,
      giftRecipient,
      couponCode
    } = req.body;

    let targetOrder = null;

    // Case A: Existing order provided by ID
    if (orderId) {
      targetOrder = await OrderModel.findById(orderId);
      if (!targetOrder) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }
      if (targetOrder.paymentStatus === 'Paid') {
        return res.status(400).json({ success: false, message: 'This order has already been paid.' });
      }
    } else {
      // Case B: Create new order directly from checkout request or active cart
      let orderItems = items;
      let calculatedDiscount = 0;
      let appliedCode = couponCode || '';

      if (!orderItems || orderItems.length === 0) {
        const cart = await CartModel.getCart({ userId, guestId });
        if (!cart.items || cart.items.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Your shopping cart is empty. Cannot initiate checkout.'
          });
        }
        orderItems = cart.items.map(i => ({
          productId: i.productId,
          size: i.size,
          quantity: i.quantity
        }));
        calculatedDiscount = cart.discountAmount || 0;
        appliedCode = cart.coupon ? cart.coupon.code : '';
        if (isGift === undefined) isGift = cart.isGift;
        if (occasion === undefined) occasion = cart.occasion;
        if (giftMessage === undefined) giftMessage = cart.giftMessage;
        if (giftWrap === undefined) giftWrap = cart.giftWrap;
        if (!giftRecipient) giftRecipient = cart.giftRecipient;
      }

      // Customer contact & delivery resolution
      const finalName = customerName || (req.user ? req.user.name : 'Valued Customer');
      const finalPhone = phone || (req.user ? req.user.phone : '');
      const finalEmail = email || (req.user ? req.user.email : '');
      const finalAddress = address || (req.user ? req.user.address : 'Standard Delivery');

      const giftWrapFee = giftWrap ? 150 : 0;

      targetOrder = await OrderModel.createOrder({
        userId,
        customerName: finalName,
        phone: finalPhone,
        email: finalEmail,
        address: finalAddress,
        items: orderItems,
        discountAmount: calculatedDiscount,
        couponCode: appliedCode,
        giftWrapFee,
        isGift: !!isGift,
        occasion: occasion || '',
        giftMessage: giftMessage || '',
        giftWrap: !!giftWrap,
        giftRecipient: giftRecipient || {},
        paymentMethod: 'Razorpay',
        paymentStatus: 'Pending'
      });
    }

    // Step 2: Create Razorpay Order with live or simulated gateway
    const razorpayOrder = await razorpayService.createOrder({
      amount: targetOrder.total_amount,
      currency: process.env.RAZORPAY_CURRENCY || 'INR',
      receipt: targetOrder.orderId || `rcpt_${targetOrder.id}`,
      notes: {
        orderId: targetOrder.orderId,
        customerName: targetOrder.customer_name,
        email: targetOrder.email || ''
      }
    });

    // Step 3: Link Razorpay Order ID to database order
    await OrderModel.updateStatus(targetOrder.id || targetOrder._id, 'Pending');
    targetOrder.razorpayOrderId = razorpayOrder.id;
    const OrderModelSchema = (await import('../../models/orderModel.js')).Order;
    await OrderModelSchema.findByIdAndUpdate(targetOrder.id || targetOrder._id, {
      razorpayOrderId: razorpayOrder.id
    });

    return res.status(200).json({
      success: true,
      message: 'Razorpay payment order initialized.',
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount, // in paise
        currency: razorpayOrder.currency,
        keyId: razorpayOrder.keyId,
        orderId: targetOrder.orderId,
        internalId: targetOrder.id || targetOrder._id,
        customer: {
          name: targetOrder.customer_name,
          email: targetOrder.email || '',
          phone: targetOrder.phone || ''
        },
        isMock: !!razorpayOrder.isMock,
        notice: razorpayOrder.notice
      }
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize payment.'
    });
  }
};

// 2. Backend Cryptographic Verification of Razorpay Payment Transactions (HMAC-SHA256)
export const verifyPayment = async (req, res) => {
  try {
    const { userId, guestId } = getIdentity(req);
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing razorpay_order_id or razorpay_payment_id.'
      });
    }

    // Cryptographic signature check
    const isValidSignature = razorpayService.verifySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    const targetIdentifier = orderId || razorpay_order_id;

    if (!isValidSignature) {
      // Mark as Failed if signature verification failed
      await OrderModel.markAsFailed(targetIdentifier, 'Invalid cryptographic payment signature.');
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid transaction signature.'
      });
    }

    // On valid signature: Update order to Paid & Processing, deduct stock
    const paidOrder = await OrderModel.markAsPaid(targetIdentifier, {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentDetails: {
        transactionId: razorpay_payment_id,
        method: 'Razorpay',
        paidAt: new Date()
      }
    });

    if (!paidOrder) {
      return res.status(404).json({ success: false, message: 'Matching order not found to update.' });
    }

    // Clear user's shopping cart upon successful checkout
    await CartModel.clearCart({ userId, guestId });

    // 7. Automated Email Notifications: Send payment receipt and invoice access
    emailService.sendPaymentConfirmation(paidOrder).catch(err => {
      console.warn('⚠️ [Automated Email Notice]: Failed to send payment confirmation email:', err.message);
    });
    emailService.sendInvoiceEmail(paidOrder).catch(err => {
      console.warn('⚠️ [Automated Email Notice]: Failed to send invoice email:', err.message);
    });

    return res.json({
      success: true,
      message: 'Payment verified successfully. Order confirmed!',
      data: {
        orderId: paidOrder.orderId,
        paymentStatus: paidOrder.paymentStatus,
        status: paidOrder.status,
        totalAmount: paidOrder.total_amount,
        transactionId: razorpay_payment_id,
        paidAt: paidOrder.paymentDetails?.paidAt
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Payment verification processing error.'
    });
  }
};

// 3. Handle Failed or Cancelled Payments
export const handlePaymentFailure = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, error_description, error_code } = req.body;
    const targetIdentifier = orderId || razorpay_order_id;

    if (!targetIdentifier) {
      return res.status(400).json({ success: false, message: 'orderId or razorpay_order_id is required.' });
    }

    const failureReason = error_description || error_code || 'Payment cancelled or declined by user/bank.';
    const updated = await OrderModel.markAsFailed(targetIdentifier, failureReason);

    return res.json({
      success: true,
      message: 'Payment failure recorded.',
      data: {
        orderId: updated ? updated.orderId : targetIdentifier,
        paymentStatus: 'Failed',
        failureReason
      }
    });
  } catch (error) {
    console.error('Payment failure recording error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record payment failure.' });
  }
};

// 4. Track Payment Status Associated with Customer Orders
export const getPaymentStatus = async (req, res) => {
  try {
    const rawId = req.params.orderId || req.query.orderId;

    if (!rawId) {
      return res.status(400).json({ success: false, message: 'orderId parameter is required.' });
    }

    const decodedId = decodeURIComponent(rawId).trim();
    let order = await OrderModel.findById(decodedId);

    if (!order && !decodedId.startsWith('#') && decodedId.startsWith('ORD-')) {
      order = await OrderModel.findById(`#${decodedId}`);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        paymentStatus: order.paymentStatus || 'Pending',
        paymentMethod: order.paymentMethod,
        totalAmount: order.total_amount,
        transactionId: order.razorpayPaymentId || order.paymentDetails?.transactionId || '',
        paidAt: order.paymentDetails?.paidAt || null,
        failureReason: order.paymentDetails?.failureReason || ''
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve payment status.' });
  }
};
