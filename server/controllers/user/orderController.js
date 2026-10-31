import { OrderModel } from '../../models/orderModel.js';
import { buildInvoiceData, generateInvoicePDF } from '../../services/invoiceService.js';
import { emailService, isEmailConfigured } from '../../services/emailService.js';
import jwt from 'jsonwebtoken';

// Helper to verify if user has access to this order (Owner or Admin)
const checkOrderAccess = (order, req) => {
  if (!order) return false;
  if (!req.user) return false;

  const reqUserId = String(req.user.id || req.user._id);
  const orderUserId = order.user_id ? String(order.user_id._id || order.user_id) : '';

  if (req.user.role === 'admin') return true;
  return reqUserId === orderUserId;
};

// Helper to authenticate user from header or query token (useful for direct PDF links)
const resolveUserFromRequest = (req) => {
  if (req.user) return req.user;

  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query?.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
      req.user = decoded;
      return decoded;
    } catch (e) {}
  }
  return null;
};

// ==========================================
// 4.1 Order Confirmation & Management
// ==========================================

// 1. Create Order (Checkout placement)
export const createOrder = async (req, res) => {
  try {
    let {
      items,
      productId,
      quantity,
      size,
      customerName,
      name,
      phone,
      email,
      address,
      isGift,
      occasion,
      giftMessage,
      giftWrap,
      giftRecipient,
      paymentMethod
    } = req.body;

    if (!items && productId) {
      items = [
        {
          productId,
          quantity: parseInt(quantity, 10) || 1,
          size: size || '50ml'
        }
      ];
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one fragrance item.'
      });
    }

    const userId = req.user ? (req.user.id || req.user._id) : null;
    const finalCustomerName = customerName || name || (req.user ? req.user.name : 'Valued Client');
    const finalPhone = phone || (req.user ? req.user.phone : '');
    const finalEmail = email || (req.user ? req.user.email : '');
    const finalAddress = address || (req.user ? req.user.address : 'Standard Delivery');

    const order = await OrderModel.createOrder({
      userId,
      customerName: finalCustomerName,
      phone: finalPhone,
      email: finalEmail,
      address: finalAddress,
      items,
      isGift,
      occasion,
      giftMessage,
      giftWrap,
      giftRecipient,
      paymentMethod: paymentMethod || 'Razorpay',
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Pending'
    });

    // 7. Automated Email Notification: Send order confirmation
    emailService.sendOrderConfirmation(order).catch((err) => {
      console.warn('⚠️ [Automated Email Notice]: Failed to send order confirmation email:', err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully. Confirmation generated.',
      data: {
        orderId: order.orderId,
        id: order.id || order._id,
        invoiceNumber: order.invoice?.invoiceNumber,
        totalAmount: order.total_amount,
        paymentStatus: order.paymentStatus,
        status: order.status,
        customerName: order.customer_name,
        estimatedDelivery: order.tracking?.estimatedDelivery
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to place order.'
    });
  }
};

// 2. Order Confirmation Screen (Secure Display of newly placed order & payment status)
export const getOrderConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phone } = req.query;

    const order = await OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Security Verification: If authenticated, must be owner or admin.
    // If guest, must provide matching email or phone.
    const isOwnerOrAdmin = checkOrderAccess(order, req);
    let isGuestAuthorized = false;

    if (!isOwnerOrAdmin && (email || phone)) {
      const cleanEmail = (email || '').toLowerCase().trim();
      const cleanPhone = (phone || '').trim();
      const orderEmail = (order.email || '').toLowerCase();
      const orderPhone = order.phone || '';
      const recipientEmail = (order.giftRecipient?.email || '').toLowerCase();
      const recipientPhone = order.giftRecipient?.phone || '';

      if (
        (cleanEmail && (orderEmail === cleanEmail || recipientEmail === cleanEmail)) ||
        (cleanPhone && (orderPhone === cleanPhone || recipientPhone === cleanPhone))
      ) {
        isGuestAuthorized = true;
      }
    }

    if (!isOwnerOrAdmin && !isGuestAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Please log in or provide matching contact details to view this order confirmation.'
      });
    }

    return res.json({
      success: true,
      message: 'Order confirmation retrieved.',
      data: {
        orderId: order.orderId,
        id: order.id || order._id,
        invoiceNumber: order.invoice?.invoiceNumber,
        createdAt: order.createdAt,
        status: order.status,
        payment: {
          method: order.paymentMethod,
          status: order.paymentStatus,
          transactionId: order.razorpayPaymentId || order.paymentDetails?.transactionId || 'N/A'
        },
        customer: {
          name: order.customer_name,
          phone: order.phone,
          email: order.email,
          address: order.address
        },
        gift: order.isGift ? {
          isGift: true,
          occasion: order.occasion,
          giftMessage: order.giftMessage,
          giftWrap: order.giftWrap,
          recipient: order.giftRecipient
        } : null,
        items: order.items,
        charges: {
          subtotal: order.subtotal,
          discountAmount: order.discountAmount,
          couponCode: order.couponCode,
          giftWrapFee: order.giftWrapFee,
          shippingFee: order.shippingFee,
          totalAmount: order.total_amount,
          currency: 'INR'
        },
        trackingPreview: {
          stage: order.status,
          courierName: order.tracking?.courierName,
          trackingNumber: order.tracking?.trackingNumber,
          estimatedDelivery: order.tracking?.estimatedDelivery
        }
      }
    });
  } catch (error) {
    console.error('Order confirmation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order confirmation.' });
  }
};

// 3. Customer Order History (Protected)
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const orders = await OrderModel.findByUserId(userId);

    const formatted = orders.map((o) => {
      const ordId = o.orderId || `#ORD-${String(o.id || o._id).slice(-4).toUpperCase()}`;
      return {
        id: String(o.id || o._id),
        _id: String(o.id || o._id),
        orderId: ordId,
        invoiceNumber: o.invoice?.invoiceNumber || `INV-${ordId.replace('#', '')}`,
        date: new Date(o.createdAt || Date.now()).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        createdAt: o.createdAt,
        status: o.status,
        paymentStatus: o.paymentStatus || 'Pending',
        paymentMethod: o.paymentMethod || 'Razorpay',
        totalAmount: o.total_amount,
        total_amount: o.total_amount,
        total: o.total_amount,
        subtotal: o.subtotal || o.total_amount,
        address: o.address || 'Standard Delivery Address',
        isGift: !!o.isGift,
        giftMessage: o.giftMessage || '',
        giftRecipient: o.giftRecipient || null,
        itemsCount: (o.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0),
        items: o.items,
        tracking: {
          currentStage: o.status,
          courierName: o.tracking?.courierName || 'Maison White-Glove Express',
          trackingNumber: o.tracking?.trackingNumber || `TRK-${String(o.id || o._id).slice(-8).toUpperCase()}`,
          estimatedDelivery: o.tracking?.estimatedDelivery || new Date(new Date(o.createdAt || Date.now()).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        },
        invoiceUrl: `/api/orders/${ordId}/invoice`
      };
    });

    return res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch customer order history.' });
  }
};

// 4. Get Specific Order Details by ID (Protected)
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!checkOrderAccess(order, req)) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You cannot access this order record.' });
    }

    return res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch order details.' });
  }
};

// ==========================================
// 4.2 Delivery Tracking
// ==========================================

// 5. Get Real-Time Delivery Tracking (Protected)
export const getDeliveryTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!checkOrderAccess(order, req)) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to delivery tracking.' });
    }

    // Determine current progress percentage
    const stagesOrder = ['Order Placed', 'Processing', 'Confirmed', 'Shipped', 'Delivered'];
    const currentStatus = order.status || 'Order Placed';
    let progressPercent = 20;
    if (currentStatus === 'Processing' || currentStatus === 'Confirmed') progressPercent = 45;
    if (currentStatus === 'Shipped') progressPercent = 75;
    if (currentStatus === 'Delivered') progressPercent = 100;
    if (currentStatus === 'Cancelled') progressPercent = 0;

    return res.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        progressPercent,
        courier: {
          name: order.tracking?.courierName || 'BlueDart Luxury Express',
          trackingNumber: order.tracking?.trackingNumber || 'BD-PENDING',
          trackingUrl: order.tracking?.trackingUrl || 'https://www.bluedart.com',
          dispatchedAt: order.tracking?.dispatchedAt || null,
          deliveredAt: order.tracking?.deliveredAt || null,
          estimatedDelivery: order.tracking?.estimatedDelivery || null,
          currentLocation: order.tracking?.currentLocation || 'Maison Fulfillment Hub, Mumbai'
        },
        recipient: {
          name: order.isGift && order.giftRecipient?.name ? order.giftRecipient.name : order.customer_name,
          address: order.isGift && order.giftRecipient?.address ? order.giftRecipient.address : order.address
        },
        history: order.tracking?.history || []
      }
    });
  } catch (error) {
    console.error('Get delivery tracking error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch delivery tracking.' });
  }
};

// 6. Track Guest Order (Secure verification without requiring account login)
export const trackGuestOrder = async (req, res) => {
  try {
    const { orderId, email, phone } = req.body;

    if (!orderId || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and either email or phone number are required to verify guest order tracking.'
      });
    }

    const order = await OrderModel.findByGuestVerification(orderId, email || phone);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No matching order found with the provided details. Please verify your Order ID and contact details.'
      });
    }

    return res.json({
      success: true,
      message: 'Guest order verified successfully.',
      data: {
        orderId: order.orderId,
        status: order.status,
        courier: {
          name: order.tracking?.courierName || 'BlueDart Luxury Express',
          trackingNumber: order.tracking?.trackingNumber || 'Available shortly',
          trackingUrl: order.tracking?.trackingUrl || 'https://www.bluedart.com',
          estimatedDelivery: order.tracking?.estimatedDelivery,
          currentLocation: order.tracking?.currentLocation || 'In Transit'
        },
        history: order.tracking?.history || []
      }
    });
  } catch (error) {
    console.error('Track guest order error:', error);
    return res.status(500).json({ success: false, message: 'Failed to track order.' });
  }
};

// 7. Update Delivery Tracking & Courier Details (Admin Only)
export const updateDeliveryTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      courierName,
      trackingNumber,
      trackingUrl,
      estimatedDelivery,
      currentLocation,
      stage,
      title,
      description
    } = req.body;

    const order = await OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const updated = await OrderModel.updateTracking(id, {
      courierName,
      trackingNumber,
      trackingUrl,
      estimatedDelivery,
      currentLocation,
      stage,
      title,
      description
    });

    // 7. Automated Email Notification: Dispatch tracking updates
    if (stage === 'Shipped') {
      emailService.sendShippingNotification(updated).catch(e => console.warn(e.message));
    } else if (stage === 'Delivered') {
      emailService.sendDeliveryNotification(updated).catch(e => console.warn(e.message));
    } else if (stage) {
      emailService.sendTransactionalUpdate(updated, {
        subject: `Delivery Progress: ${stage}`,
        stage,
        message: description || `Your package location has been updated to "${currentLocation || 'In Transit'}".`
      }).catch(e => console.warn(e.message));
    }

    return res.json({
      success: true,
      message: 'Delivery tracking updated and synchronized with order management.',
      data: {
        orderId: updated.orderId,
        status: updated.status,
        tracking: updated.tracking
      }
    });
  } catch (error) {
    console.error('Update delivery tracking error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update delivery tracking.' });
  }
};

// ==========================================
// 4.3 Invoice Generation & Downloads
// ==========================================

// 8. Get Structured Invoice Details in JSON (Protected)
export const getInvoiceData = async (req, res) => {
  try {
    resolveUserFromRequest(req);
    const { id } = req.params;

    const order = await OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }

    if (!checkOrderAccess(order, req)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this invoice.' });
    }

    const invoice = buildInvoiceData(order);

    return res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice data error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate invoice details.' });
  }
};

// 9. Download Official PDF Invoice (Protected)
export const downloadInvoicePDF = async (req, res) => {
  try {
    resolveUserFromRequest(req);
    const { id } = req.params;

    const order = await OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for invoice generation.' });
    }

    if (!checkOrderAccess(order, req)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to download this invoice.' });
    }

    // Stream PDF directly to client response
    generateInvoicePDF(order, res);
  } catch (error) {
    console.error('Download invoice PDF error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to generate PDF invoice.' });
    }
  }
};

// 10. Admin List All Invoices (Admin Only)
export const getAllInvoices = async (req, res) => {
  try {
    const orders = await OrderModel.findAll();

    const invoiceList = orders.map((o) => {
      const ordId = o.orderId || `#ORD-${String(o.id || o._id).slice(-4).toUpperCase()}`;
      return {
        orderId: ordId,
        invoiceNumber: o.invoice?.invoiceNumber || `INV-${ordId.replace('#', '')}`,
        invoiceDate: o.invoice?.invoiceDate || o.createdAt,
        customerName: o.customer_name || 'Valued Client',
        customerEmail: o.email || o.user_email || 'N/A',
        totalAmount: o.total_amount,
        paymentStatus: o.paymentStatus || 'Pending',
        paymentMethod: o.paymentMethod || 'Razorpay',
        downloadUrl: `/api/orders/${ordId}/invoice/download`
      };
    });

    return res.json({
      success: true,
      data: {
        totalInvoices: invoiceList.length,
        invoices: invoiceList
      }
    });
  } catch (error) {
    console.error('Get all invoices error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch invoice records.' });
  }
};

// ==========================================
// Admin Order Status Update & Overview
// ==========================================

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const order = await OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const updated = await OrderModel.updateStatus(id, status);
    const ordId = updated.orderId || `#ORD-${String(updated.id || updated._id).slice(-4).toUpperCase()}`;

    // 7. Automated Email Notification: Status synchronized updates
    if (status === 'Shipped') {
      emailService.sendShippingNotification(updated).catch(e => console.warn(e.message));
    } else if (status === 'Delivered') {
      emailService.sendDeliveryNotification(updated).catch(e => console.warn(e.message));
    } else if (status === 'Cancelled') {
      emailService.sendTransactionalUpdate(updated, {
        subject: 'Order Cancelled',
        stage: 'Cancelled',
        message: 'Your order has been cancelled. Any processed charges will be refunded to your source payment method within 3-5 business days.'
      }).catch(e => console.warn(e.message));
    } else {
      emailService.sendTransactionalUpdate(updated, {
        subject: `Order Update: ${status}`,
        stage: status,
        message: `Your order status has progressed to "${status}".`
      }).catch(e => console.warn(e.message));
    }

    return res.json({
      success: true,
      message: `Order status synchronized to "${status}".`,
      data: {
        ...updated,
        id: String(updated.id || updated._id),
        _id: String(updated.id || updated._id),
        orderId: ordId
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.findAll();

    const formattedOrders = orders.map((o) => {
      const firstItem = o.items && o.items[0];
      const ordId = o.orderId || `#ORD-${String(o.id || o._id).slice(-4).toUpperCase()}`;
      return {
        ...o,
        id: String(o.id || o._id),
        _id: String(o.id || o._id),
        orderId: ordId,
        invoiceNumber: o.invoice?.invoiceNumber || `INV-${ordId.replace('#', '')}`,
        customerName: o.customer_name || o.user_name || 'Valued Client',
        phone: o.phone || o.user_email || 'N/A',
        address: o.address || 'Standard Delivery',
        productName: firstItem
          ? (firstItem.name || firstItem.product_name) +
            (o.items.length > 1 ? ` (+${o.items.length - 1} more)` : '')
          : 'Luxury Perfume',
        productImage: firstItem ? firstItem.image || firstItem.product_image : '',
        quantity: firstItem ? firstItem.quantity : 1,
        size: firstItem ? firstItem.size || '50ml' : '50ml',
        status: o.status,
        isGift: !!o.isGift,
        occasion: o.occasion || '',
        giftMessage: o.giftMessage || '',
        giftWrap: !!o.giftWrap,
        giftRecipient: o.giftRecipient || {},
        tracking: o.tracking || {},
        date: new Date(o.createdAt || o.created_at || Date.now()).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        createdAt: o.createdAt || o.created_at
      };
    });

    return res.json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

// ==========================================
// 7. Automated Email Notification Controllers
// ==========================================

// Helper to validate email string format
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
};

// 7.1 Resend Order Confirmation Email
export const resendOrderConfirmationEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order "${id}" not found.`
      });
    }

    if (!checkOrderAccess(order, req)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have permission to trigger notifications for this order.'
      });
    }

    const targetEmail = order.email || (order.user_id && order.user_id.email);
    if (!targetEmail || !isValidEmail(targetEmail)) {
      return res.status(400).json({
        success: false,
        message: 'No valid recipient email address is associated with this order.'
      });
    }

    const result = await emailService.sendOrderConfirmation(order);

    return res.json({
      success: true,
      message: `Order confirmation email dispatched to ${targetEmail}.`,
      data: result
    });
  } catch (error) {
    console.error('Resend order confirmation email error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch order confirmation email.'
    });
  }
};

// 7.2 Resend Payment Confirmation Email
export const resendPaymentConfirmationEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order "${id}" not found.`
      });
    }

    if (!checkOrderAccess(order, req)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have permission to access payment notifications for this order.'
      });
    }

    if (order.paymentStatus !== 'Paid') {
      return res.status(400).json({
        success: false,
        message: `Cannot send payment confirmation: Order payment status is "${order.paymentStatus}". Only verified paid orders are eligible.`
      });
    }

    const targetEmail = order.email || (order.user_id && order.user_id.email);
    if (!targetEmail || !isValidEmail(targetEmail)) {
      return res.status(400).json({
        success: false,
        message: 'No valid recipient email address is associated with this order.'
      });
    }

    const result = await emailService.sendPaymentConfirmation(order);

    return res.json({
      success: true,
      message: `Payment confirmation email dispatched to ${targetEmail}.`,
      data: result
    });
  } catch (error) {
    console.error('Resend payment confirmation email error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch payment confirmation email.'
    });
  }
};

// 7.3 Send Invoice Email (with Attached Official PDF)
export const sendOrderInvoiceEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipientEmail } = req.body;

    const order = await OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order "${id}" not found.`
      });
    }

    if (!checkOrderAccess(order, req)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have permission to email this invoice.'
      });
    }

    const targetEmail = recipientEmail || order.email || (order.user_id && order.user_id.email);
    if (!targetEmail || !isValidEmail(targetEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid recipient email address.'
      });
    }

    const result = await emailService.sendInvoiceEmail(order, targetEmail);

    return res.json({
      success: true,
      message: `Official PDF invoice dispatched to ${targetEmail}.`,
      data: result
    });
  } catch (error) {
    console.error('Send invoice email error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch invoice email.'
    });
  }
};

// 7.4 Send Shipping & Delivery Tracking Email
export const sendOrderTrackingEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order "${id}" not found.`
      });
    }

    if (!checkOrderAccess(order, req)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have permission to trigger tracking notifications for this order.'
      });
    }

    const targetEmail = order.email || (order.user_id && order.user_id.email);
    if (!targetEmail || !isValidEmail(targetEmail)) {
      return res.status(400).json({
        success: false,
        message: 'No valid recipient email address is associated with this order.'
      });
    }

    let result;
    if (order.status === 'Delivered') {
      result = await emailService.sendDeliveryNotification(order);
    } else {
      result = await emailService.sendShippingNotification(order);
    }

    return res.json({
      success: true,
      message: `Tracking update notification dispatched to ${targetEmail}.`,
      data: result
    });
  } catch (error) {
    console.error('Send tracking email error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch tracking email.'
    });
  }
};

// 7.5 Send Custom Transactional Notification (Admin Only)
export const sendCustomTransactionalEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message, stage } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required fields.'
      });
    }

    const order = await OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order "${id}" not found.`
      });
    }

    const targetEmail = order.email || (order.user_id && order.user_id.email);
    if (!targetEmail || !isValidEmail(targetEmail)) {
      return res.status(400).json({
        success: false,
        message: 'No valid recipient email address is associated with this order.'
      });
    }

    const result = await emailService.sendTransactionalUpdate(order, {
      subject,
      message,
      stage
    });

    return res.json({
      success: true,
      message: `Transactional update dispatched to ${targetEmail}.`,
      data: result
    });
  } catch (error) {
    console.error('Send transactional email error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch transactional email.'
    });
  }
};

// 7.6 Telemetry & Email Service Status
export const getEmailServiceStatus = async (req, res) => {
  try {
    const configured = isEmailConfigured();
    return res.json({
      success: true,
      data: {
        service: 'Nodemailer Luxury Email Suite',
        isConfigured: configured,
        mode: configured ? 'Live SMTP Delivery' : 'Simulated Development Environment',
        senderAddress: process.env.EMAIL_FROM || 'concierge@roveandamber.com',
        supportedEvents: [
          'Order Confirmation',
          'Payment Verification & Receipt',
          'Courier Dispatch & In-Transit Shipping',
          'Delivery Completed',
          'PDF Tax Invoice Delivery',
          'Transactional Status Updates'
        ],
        host: configured ? process.env.SMTP_HOST : 'Unset (Running in console simulation mode)'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to check email service status.' });
  }
};

export default {
  createOrder,
  getOrderConfirmation,
  getMyOrders,
  getOrderById,
  getDeliveryTracking,
  trackGuestOrder,
  updateDeliveryTracking,
  getInvoiceData,
  downloadInvoicePDF,
  getAllInvoices,
  updateOrderStatus,
  getAllOrders,
  resendOrderConfirmationEmail,
  resendPaymentConfirmationEmail,
  sendOrderInvoiceEmail,
  sendOrderTrackingEmail,
  sendCustomTransactionalEmail,
  getEmailServiceStatus
};

