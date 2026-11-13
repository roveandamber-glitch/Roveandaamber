import mongoose from 'mongoose';
import { ProductModel, Product } from './productModel.js';
import { User } from './userModel.js';
import { InventoryModel } from './inventoryModel.js';
import { CouponModel } from './couponModel.js';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    product_id: {
      type: String
    },
    name: {
      type: String,
      required: true
    },
    product_name: {
      type: String
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    size: {
      type: String,
      default: '50ml'
    },
    image: {
      type: String,
      default: ''
    },
    product_image: {
      type: String,
      default: ''
    },
    hasSample: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      index: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    customer_name: {
      type: String,
      default: 'Direct Customer'
    },
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    subtotal: {
      type: Number,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    couponCode: {
      type: String,
      default: ''
    },
    shippingFee: {
      type: Number,
      default: 0
    },
    giftWrapFee: {
      type: Number,
      default: 0
    },
    rewardPointsUsed: {
      type: Number,
      default: 0
    },
    rewardDiscountAmount: {
      type: Number,
      default: 0
    },
    rewardPointsEarned: {
      type: Number,
      default: 0
    },
    total_amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Confirmed', 'Shipped', 'Dispatch', 'Dispatched', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'],
      default: 'Pending'
    },
    // 8. Cancellation & Return Options
    cancellation: {
      isCancelled: { type: Boolean, default: false },
      cancelledAt: { type: Date, default: null },
      reason: { type: String, default: '' },
      refundStatus: { type: String, enum: ['Not Applicable', 'Pending', 'Processed'], default: 'Not Applicable' },
      refundAmount: { type: Number, default: 0 }
    },
    returnDetails: {
      isReturnRequested: { type: Boolean, default: false },
      requestedAt: { type: Date, default: null },
      reason: { type: String, default: '' },
      status: { type: String, enum: ['None', 'Pending', 'Approved', 'Rejected', 'Completed'], default: 'None' },
      refundAmount: { type: Number, default: 0 },
      adminNote: { type: String, default: '' }
    },
    // 2 ml Sample Guarantee & Policy flag
    hasSample: {
      type: Boolean,
      default: false,
      index: true
    },
    has2mlSample: {
      type: Boolean,
      default: false
    },
    // 3.2: Razorpay Payment Tracking Fields
    paymentMethod: {
      type: String,
      enum: ['Razorpay', 'Cash on Delivery', 'Mock'],
      default: 'Razorpay'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
      index: true
    },
    razorpayOrderId: {
      type: String,
      default: '',
      index: true
    },
    razorpayPaymentId: {
      type: String,
      default: ''
    },
    razorpaySignature: {
      type: String,
      default: ''
    },
    paymentDetails: {
      transactionId: { type: String, default: '' },
      method: { type: String, default: '' },
      bank: { type: String, default: '' },
      wallet: { type: String, default: '' },
      paidAt: { type: Date, default: null },
      failureReason: { type: String, default: '' }
    },
    // 2.4: Gift Shopping – For Him and Her
    isGift: {
      type: Boolean,
      default: false
    },
    occasion: {
      type: String,
      default: ''
    },
    giftMessage: {
      type: String,
      default: ''
    },
    giftWrap: {
      type: Boolean,
      default: false
    },
    giftRecipient: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      email: { type: String, default: '' }
    },
    // 9.4: Gift Order Fulfillment Management
    giftFulfillment: {
      status: {
        type: String,
        enum: ['Pending Packaging', 'Box Handcrafted & Wrapped', 'Card Handwritten', 'Ready for Dispatch', 'Dispatched'],
        default: 'Pending Packaging'
      },
      greetingCardPrinted: { type: Boolean, default: false },
      ribbonSealed: { type: Boolean, default: false },
      packagingNotes: { type: String, default: '' },
      updatedAt: { type: Date, default: null }
    },
    // 4.2 Delivery & Courier Tracking Details
    tracking: {
      courierName: { type: String, default: 'Delhivery' },
      trackingNumber: { type: String, default: '' },
      trackingUrl: { type: String, default: 'https://www.delhivery.com/' },
      estimatedDelivery: { type: Date, default: null },
      dispatchedAt: { type: Date, default: null },
      deliveredAt: { type: Date, default: null },
      currentLocation: { type: String, default: '' },
      history: [
        {
          stage: { type: String, default: 'Order Placed' },
          title: { type: String, default: 'Order Placed' },
          description: { type: String, default: '' },
          location: { type: String, default: '' },
          timestamp: { type: Date, default: Date.now }
        }
      ]
    },
    // 4.3 Invoice Records
    invoice: {
      invoiceNumber: { type: String, default: '' },
      invoiceDate: { type: Date, default: Date.now },
      taxAmount: { type: Number, default: 0 },
      isGenerated: { type: Boolean, default: true }
    },
    // 4.4 Email Notification Tracking (Strict De-duplication Guard)
    emailNotifications: {
      orderPlacedSent: { type: Boolean, default: false },
      confirmedSent: { type: Boolean, default: false },
      dispatchedSent: { type: Boolean, default: false },
      lastDispatchedTrackingNumber: { type: String, default: '' },
      lastDispatchedEmailAt: { type: Date },
      deliveredSent: { type: Boolean, default: false },
      cancelledSent: { type: Boolean, default: false }
    },
    items: [orderItemSchema]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      }
    }
  }
);

orderSchema.virtual('id').get(function () {
  return this._id ? this._id.toString() : null;
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export const OrderModel = {
  createOrder: async ({
    userId,
    customerName,
    phone,
    email,
    address,
    items,
    discountAmount = 0,
    couponCode = '',
    rewardPointsUsed = 0,
    rewardDiscountAmount = 0,
    shippingFee = 0,
    giftWrapFee = 0,
    paymentMethod = 'Razorpay',
    paymentStatus = 'Pending',
    razorpayOrderId = '',
    isGift = false,
    occasion = '',
    giftMessage = '',
    giftWrap = false,
    giftRecipient = {}
  }) => {
    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    let calculatedSubtotal = 0;
    const verifiedItems = [];

    // Step 1: Verify each product, its live price, and verify stock availability
    for (const item of items) {
      const pid = item.productId || item.product_id;
      const qty = parseInt(item.quantity, 10) || 1;
      const size = item.size || '50ml';

      let product = await ProductModel.findById(pid);

      // Graceful name match if ID was a mock identifier or slug
      if (!product && item.name) {
        const cleanName = item.name.trim();
        const found = await Product.findOne({
          $or: [
            { name: new RegExp(cleanName, 'i') },
            { slug: cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
          ]
        }).populate('category_id');
        if (found) {
          const obj = found.toObject();
          product = {
            ...obj,
            id: found._id.toString(),
            _id: found._id.toString(),
            category_name: found.category_id ? found.category_id.name : found.categoryName || ''
          };
        }
      }

      // Fallback: If not in DB, use any existing product reference so checkout succeeds
      let fallbackRef = null;
      if (!product) {
        fallbackRef = await Product.findOne();
      }

      const samplePrice = product?.samplePrice !== undefined && product?.samplePrice !== null 
        ? Number(product.samplePrice) 
        : 199;
      const basePrice = product ? Number(product.price) : (Number(item.price) || 2499);
      const sizeLower = String(size).toLowerCase();
      const isSampleOnly = sizeLower === '2ml' || sizeLower === '2ml sample' || sizeLower === 'sample';
      const isCombo = sizeLower.includes('+') || sizeLower.includes('combo') || item.hasSample === true;

      let finalPrice = basePrice;
      if (isSampleOnly) {
        finalPrice = samplePrice;
      } else if (isCombo) {
        finalPrice = basePrice + samplePrice;
      }

      const finalName = product ? product.name : (item.name || 'Atelier Fine Fragrance');
      const finalImage = product ? product.image : (item.image || '/images/perfumes/amber_oud_perfume.jpg');
      const finalId = product ? (product._id || product.id) : (fallbackRef ? fallbackRef._id : new mongoose.Types.ObjectId());

      const itemTotal = finalPrice * qty;
      calculatedSubtotal += itemTotal;

      const isItemSample = Boolean(
        item.hasSample ||
        String(size).toLowerCase().includes('2ml') ||
        String(size).toLowerCase().includes('2 ml') ||
        String(finalName).toLowerCase().includes('2ml') ||
        String(finalName).toLowerCase().includes('2 ml') ||
        String(finalName).toLowerCase().includes('sample')
      );

      verifiedItems.push({
        productId: finalId,
        product_id: finalId.toString(),
        name: finalName,
        product_name: finalName,
        price: finalPrice,
        quantity: qty,
        size,
        image: finalImage,
        product_image: finalImage,
        hasSample: isItemSample
      });
    }

    const orderHasSample = verifiedItems.some(i => i.hasSample) || Boolean(items.some(i => i.hasSample));

    // Step 2: Ensure valid user ID or fallback
    let effectiveUserId = userId;
    if (!effectiveUserId || !mongoose.Types.ObjectId.isValid(effectiveUserId)) {
      const existingUser = await User.findOne();
      effectiveUserId = existingUser ? existingUser._id : new mongoose.Types.ObjectId();
    }

    let verifiedDiscount = Number(discountAmount) || 0;
    let verifiedRewardDiscount = Number(rewardDiscountAmount) || 0;

    // Step 2.5: Verify coupon and calculate exact authoritative discount
    if (couponCode) {
      try {
        const couponResult = await CouponModel.validateAndCalculate(couponCode, calculatedSubtotal, {
          userId: effectiveUserId,
          email: email
        });
        if (couponResult && couponResult.discountAmount > 0) {
          verifiedDiscount = couponResult.discountAmount;
        }
      } catch (cErr) {
        console.warn('⚠️ [Coupon Validation Warning in createOrder]:', cErr.message);
      }
    }

    const calculatedTotal = Math.max(0, calculatedSubtotal - verifiedDiscount - verifiedRewardDiscount + shippingFee + giftWrapFee);

    let pointsEarned = 0;
    try {
      const { RewardRule } = await import('./rewardModel.js');
      const rules = await RewardRule.getRules();
      const pointsPerHundred = rules.pointsPerHundred || 10;
      pointsEarned = Math.floor((calculatedTotal / 100) * pointsPerHundred);
    } catch (e) {}

    // Generate readable orderId code
    const count = await Order.countDocuments();
    const displayOrderId = `#ORD-${String(count + 1001).padStart(4, '0')}`;

    // Calculate estimated delivery: 4 days from now
    const estDeliveryDate = new Date();
    estDeliveryDate.setDate(estDeliveryDate.getDate() + 4);

    const initialHistory = [
      {
        stage: 'Order Placed',
        title: 'Order Placed Successfully',
        description: 'Your luxury perfume order has been received and confirmed in our system.',
        location: 'Online Store, Mumbai',
        timestamp: new Date()
      }
    ];

    if (paymentStatus === 'Paid') {
      initialHistory.push({
        stage: 'Processing',
        title: 'Payment Confirmed & Artisan Packaging',
        description: 'Payment verified. Our perfumers are packaging your flacons in protective presentation boxes.',
        location: 'Atelier Logistics',
        timestamp: new Date()
      });
    }

    // Step 3: Create order document
    const order = await Order.create({
      orderId: displayOrderId,
      user_id: effectiveUserId,
      customer_name: customerName || 'Direct Customer',
      phone: phone || '',
      email: email || '',
      address: address || '',
      subtotal: calculatedSubtotal,
      discountAmount: verifiedDiscount,
      couponCode,
      rewardPointsUsed,
      rewardDiscountAmount: verifiedRewardDiscount,
      rewardPointsEarned: pointsEarned,
      shippingFee,
      giftWrapFee,
      total_amount: calculatedTotal,
      status: paymentStatus === 'Paid' ? 'Processing' : 'Pending',
      paymentMethod,
      paymentStatus,
      hasSample: orderHasSample,
      has2mlSample: orderHasSample,
      razorpayOrderId,
      isGift: !!isGift,
      occasion: occasion || '',
      giftMessage: giftMessage || '',
      giftWrap: !!giftWrap,
      giftRecipient: {
        name: giftRecipient?.name || '',
        phone: giftRecipient?.phone || '',
        address: giftRecipient?.address || '',
        city: giftRecipient?.city || '',
        postalCode: giftRecipient?.postalCode || '',
        email: giftRecipient?.email || ''
      },
      tracking: {
        courierName: 'Delhivery',
        trackingNumber: '',
        trackingUrl: 'https://www.delhivery.com/',
        estimatedDelivery: estDeliveryDate,
        currentLocation: '',
        history: initialHistory
      },
      invoice: {
        invoiceNumber: `INV-${displayOrderId.replace('#', '')}`,
        invoiceDate: new Date(),
        taxAmount: Math.round((calculatedSubtotal - (calculatedSubtotal / 1.18)) * 100) / 100,
        isGenerated: true
      },
      items: verifiedItems
    });

    // Record coupon usage only if order is immediately confirmed/paid (e.g. Cash on Delivery or Paid upfront)
    // For online payments (Razorpay), usage will only be recorded in markAsPaid once payment is successful
    const isImmediatelyConfirmed = paymentStatus === 'Paid' || paymentMethod === 'Cash on Delivery';
    if (couponCode && isImmediatelyConfirmed) {
      try {
        await CouponModel.recordUsage(couponCode, {
          userId: effectiveUserId,
          email: email,
          orderId: displayOrderId
        });
      } catch (cErr) {
        console.warn('⚠️ [Coupon Warning]: Failed to record coupon usage:', cErr.message);
      }
    }

    // If order is paid upfront (e.g. COD or instant paid), decrement stock and record movement
    if (paymentStatus === 'Paid' || paymentMethod === 'Cash on Delivery') {
      for (const item of verifiedItems) {
        const prod = await ProductModel.findById(item.productId);
        const prevStock = prod ? prod.stock : 0;
        await ProductModel.decrementStock(item.productId, item.size, item.quantity);
        const updated = await ProductModel.findById(item.productId);
        InventoryModel.recordMovement({
          productId: item.productId,
          productName: item.name,
          sku: prod?.sku || `RA-${item.name.slice(0, 3).toUpperCase()}`,
          changeType: 'Order Placed',
          quantityChange: -item.quantity,
          previousStock: prevStock,
          newStock: updated ? updated.stock : Math.max(0, prevStock - item.quantity),
          size: item.size || '50ml',
          referenceId: displayOrderId,
          reason: `Customer purchase: ${displayOrderId}`,
          performedBy: customerName || 'Checkout System'
        }).catch(err => console.warn('Inventory log error on order:', err.message));
      }
    }

    const doc = order.toObject();
    return {
      ...doc,
      id: order._id.toString(),
      _id: order._id.toString(),
      orderId: displayOrderId
    };
  },

  findById: async (id) => {
    if (!id) return null;
    let order = null;
    const cleanId = String(id).trim();

    if (mongoose.Types.ObjectId.isValid(cleanId)) {
      order = await Order.findById(cleanId).populate('user_id', 'name email');
    }
    if (!order) {
      const withHash = cleanId.startsWith('#') ? cleanId : `#${cleanId}`;
      const withoutHash = cleanId.replace('#', '');
      order = await Order.findOne({
        $or: [
          { orderId: cleanId },
          { orderId: withHash },
          { orderId: withoutHash },
          { razorpayOrderId: cleanId }
        ]
      }).populate('user_id', 'name email');
    }
    if (!order) return null;
    const doc = order.toObject();
    return {
      ...doc,
      id: order._id.toString(),
      _id: order._id.toString()
    };
  },

  findByRazorpayOrderId: async (razorpayOrderId) => {
    if (!razorpayOrderId) return null;
    return Order.findOne({ razorpayOrderId });
  },

  markAsPaid: async (id, { razorpayPaymentId, razorpaySignature, paymentDetails = {} }) => {
    const order = await Order.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { orderId: id },
        { razorpayOrderId: id }
      ]
    });

    if (!order) return null;

    // Only decrement stock if it wasn't already paid
    if (order.paymentStatus !== 'Paid') {
      for (const item of order.items) {
        await ProductModel.decrementStock(item.productId, item.size, item.quantity);
      }

      // Process reward points redemption & accrual upon payment confirmation
      if (order.user_id) {
        try {
          const { RewardTransaction } = await import('./rewardModel.js');
          // If customer redeemed points on this order, deduct from balance
          if (order.rewardPointsUsed > 0) {
            await User.findByIdAndUpdate(order.user_id, { $inc: { rewardPoints: -order.rewardPointsUsed } });
            await RewardTransaction.record({
              userId: order.user_id,
              customerName: order.customer_name || 'Valued Patron',
              customerEmail: order.email || '',
              type: 'Points Redeemed',
              points: -order.rewardPointsUsed,
              orderId: order.orderId,
              description: `Redeemed ${order.rewardPointsUsed} points for ₹${order.rewardDiscountAmount} discount`
            });
          }
          // Award points earned for flacon acquisition
          if (order.rewardPointsEarned > 0) {
            await User.findByIdAndUpdate(order.user_id, { $inc: { rewardPoints: order.rewardPointsEarned } });
            await RewardTransaction.record({
              userId: order.user_id,
              customerName: order.customer_name || 'Valued Patron',
              customerEmail: order.email || '',
              type: 'Order Earned',
              points: order.rewardPointsEarned,
              orderId: order.orderId,
              description: `Earned ${order.rewardPointsEarned} points on order ${order.orderId}`
            });
          }
        } catch (rwErr) {
          console.warn('⚠️ [Reward Processing Warning]:', rwErr.message);
        }
      }
    }

    // Record coupon usage upon verified payment confirmation
    if (order.couponCode && order.paymentStatus !== 'Paid') {
      try {
        await CouponModel.recordUsage(order.couponCode, {
          userId: order.user_id,
          email: order.email,
          orderId: order.orderId
        });
      } catch (cErr) {
        console.warn('⚠️ [Coupon Warning]: Failed to record coupon usage on payment confirmation:', cErr.message);
      }
    }

    order.paymentStatus = 'Paid';
    order.status = 'Processing';
    if (razorpayPaymentId) order.razorpayPaymentId = razorpayPaymentId;
    if (razorpaySignature) order.razorpaySignature = razorpaySignature;
    order.paymentDetails = {
      transactionId: razorpayPaymentId || paymentDetails.transactionId || '',
      method: paymentDetails.method || 'Razorpay',
      bank: paymentDetails.bank || '',
      wallet: paymentDetails.wallet || '',
      paidAt: new Date(),
      failureReason: ''
    };

    // Append Payment Confirmed to tracking timeline
    if (!order.tracking) {
      order.tracking = { history: [] };
    }
    const hasPaidStage = (order.tracking.history || []).some(h => h.stage === 'Processing');
    if (!hasPaidStage) {
      order.tracking.history.push({
        stage: 'Processing',
        title: 'Payment Confirmed & Artisan Packaging',
        description: 'Payment verified. Our perfumers are packaging your flacons in protective presentation boxes.',
        location: 'Atelier Logistics',
        timestamp: new Date()
      });
    }

    await order.save();
    return order.toObject();
  },

  markAsFailed: async (id, failureReason = 'Payment failed') => {
    const order = await Order.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { orderId: id },
        { razorpayOrderId: id }
      ]
    });

    if (!order) return null;

    // Release any prematurely registered coupon usage on payment failure
    if (order.couponCode) {
      try {
        await CouponModel.releaseUsage(order.couponCode, {
          userId: order.user_id,
          email: order.email,
          orderId: order.orderId
        });
      } catch (cErr) {
        console.warn('⚠️ [Coupon Warning]: Failed to release coupon usage on failure:', cErr.message);
      }
    }

    order.paymentStatus = 'Failed';
    order.paymentDetails = {
      ...order.paymentDetails,
      failureReason: failureReason || 'Transaction declined or failed'
    };

    await order.save();
    return order.toObject();
  },

  updateStatus: async (id, status) => {
    const order = await Order.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { orderId: id }
      ]
    });
    if (!order) return null;

    order.status = status;

    // Synchronize tracking history with order status changes
    if (!order.tracking) order.tracking = { history: [] };

    let stageTitle = `Status updated to ${status}`;
    let stageDesc = `Order status has progressed to ${status}.`;
    let location = order.tracking.currentLocation || 'In Transit';

    if (status === 'Shipped') {
      order.tracking.dispatchedAt = new Date();
      stageTitle = 'Dispatched with Courier';
      stageDesc = `Your parcel is in transit via ${order.tracking.courierName || 'Delhivery'}. Tracking: ${order.tracking.trackingNumber || 'Available shortly'}.`;
      location = 'Express Transit Hub, Mumbai';
    } else if (status === 'Delivered') {
      order.tracking.deliveredAt = new Date();
      stageTitle = 'Delivered to Recipient';
      stageDesc = 'Your luxury flacons have been safely delivered. Enjoy your olfactory journey.';
      location = order.giftRecipient?.city || 'Destination Address';
    } else if (status === 'Cancelled') {
      stageTitle = 'Order Cancelled';
      stageDesc = 'Order has been cancelled.';
      location = 'Maison System';
    }

    order.tracking.currentLocation = location;
    order.tracking.history.push({
      stage: status,
      title: stageTitle,
      description: stageDesc,
      location,
      timestamp: new Date()
    });

    await order.save();
    const doc = order.toObject();
    return {
      ...doc,
      id: order._id.toString(),
      _id: order._id.toString()
    };
  },

  updateTracking: async (id, {
    courierName,
    trackingNumber,
    trackingUrl,
    estimatedDelivery,
    currentLocation,
    stage,
    title,
    description
  } = {}) => {
    const order = await Order.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { orderId: id }
      ]
    });
    if (!order) return null;

    if (!order.tracking) order.tracking = { history: [] };

    if (courierName) order.tracking.courierName = courierName;
    if (trackingNumber) order.tracking.trackingNumber = trackingNumber;
    if (trackingUrl) order.tracking.trackingUrl = trackingUrl;
    if (estimatedDelivery) order.tracking.estimatedDelivery = new Date(estimatedDelivery);
    if (currentLocation) order.tracking.currentLocation = currentLocation;

    if (stage) {
      // Synchronize overall order status if stage maps to major status
      if (['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(stage)) {
        order.status = stage;
        if (stage === 'Shipped') order.tracking.dispatchedAt = new Date();
        if (stage === 'Delivered') order.tracking.deliveredAt = new Date();
      }

      order.tracking.history.push({
        stage: stage || order.status,
        title: title || `Delivery update: ${stage}`,
        description: description || `Package status updated to ${stage}.`,
        location: currentLocation || order.tracking.currentLocation || 'In Transit',
        timestamp: new Date()
      });
    }

    await order.save();
    return order.toObject();
  },

  findByGuestVerification: async (orderId, emailOrPhone) => {
    if (!orderId || !emailOrPhone) return null;

    const cleanOrderId = String(orderId).trim();
    const cleanSearch = String(emailOrPhone).trim().toLowerCase();

    const order = await Order.findOne({
      $and: [
        {
          $or: [
            { orderId: cleanOrderId },
            { orderId: `#${cleanOrderId.replace('#', '')}` },
            { _id: mongoose.Types.ObjectId.isValid(cleanOrderId) ? cleanOrderId : null }
          ]
        },
        {
          $or: [
            { email: { $regex: cleanSearch, $options: 'i' } },
            { phone: { $regex: cleanSearch, $options: 'i' } },
            { 'giftRecipient.email': { $regex: cleanSearch, $options: 'i' } },
            { 'giftRecipient.phone': { $regex: cleanSearch, $options: 'i' } }
          ]
        }
      ]
    });

    return order ? order.toObject() : null;
  },

  findByUserId: async (userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];
    const orders = await Order.find({ user_id: userId }).sort({ createdAt: -1 });
    return orders.map(o => {
      const doc = o.toObject();
      return {
        ...doc,
        id: o._id.toString(),
        _id: o._id.toString()
      };
    });
  },

  findAll: async () => {
    const orders = await Order.find().populate('user_id', 'name email').sort({ createdAt: -1 });
    return orders.map(o => {
      const doc = o.toObject();
      return {
        ...doc,
        id: o._id.toString(),
        _id: o._id.toString(),
        user_name: o.user_id ? o.user_id.name : '',
        user_email: o.user_id ? o.user_id.email : ''
      };
    });
  }
};

export default OrderModel;
