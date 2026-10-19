import mongoose from 'mongoose';
import { ProductModel, Product } from './productModel.js';
import { User } from './userModel.js';

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
    total_amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending'
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

      const product = await ProductModel.findById(pid);
      if (!product) {
        throw new Error(`Product with ID ${pid} not found`);
      }

      // Check size-specific stock if size inventory exists
      if (product.sizes) {
        try {
          const sizesMap = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
          if (sizesMap[size] !== undefined && sizesMap[size] < qty) {
            throw new Error(
              `Insufficient stock for "${product.name}" in Size ${size}. Available: ${sizesMap[size]}, Requested: ${qty}`
            );
          }
        } catch (e) {}
      }

      if (product.stock < qty) {
        throw new Error(
          `Insufficient total stock for "${product.name}". Available: ${product.stock}, Requested: ${qty}`
        );
      }

      const itemTotal = product.price * qty;
      calculatedSubtotal += itemTotal;

      verifiedItems.push({
        productId: product._id,
        product_id: product._id.toString(),
        name: product.name,
        product_name: product.name,
        price: product.price,
        quantity: qty,
        size,
        image: product.image,
        product_image: product.image
      });
    }

    const calculatedTotal = Math.max(0, calculatedSubtotal - discountAmount + shippingFee + giftWrapFee);

    // Step 2: Ensure valid user ID or fallback
    let effectiveUserId = userId;
    if (!effectiveUserId || !mongoose.Types.ObjectId.isValid(effectiveUserId)) {
      const existingUser = await User.findOne();
      effectiveUserId = existingUser ? existingUser._id : new mongoose.Types.ObjectId();
    }

    // Generate readable orderId code
    const count = await Order.countDocuments();
    const displayOrderId = `#ORD-${String(count + 1001).padStart(4, '0')}`;

    // Step 3: Create order document
    const order = await Order.create({
      orderId: displayOrderId,
      user_id: effectiveUserId,
      customer_name: customerName || 'Direct Customer',
      phone: phone || '',
      email: email || '',
      address: address || '',
      subtotal: calculatedSubtotal,
      discountAmount,
      couponCode,
      shippingFee,
      giftWrapFee,
      total_amount: calculatedTotal,
      status: paymentStatus === 'Paid' ? 'Processing' : 'Pending',
      paymentMethod,
      paymentStatus,
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
      items: verifiedItems
    });

    // If order is paid upfront (e.g. COD or instant paid), decrement stock
    if (paymentStatus === 'Paid' || paymentMethod === 'Cash on Delivery') {
      for (const item of verifiedItems) {
        await ProductModel.decrementStock(item.productId, item.size, item.quantity);
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
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).populate('user_id', 'name email');
    }
    if (!order) {
      order = await Order.findOne({ orderId: id }).populate('user_id', 'name email');
    }
    if (!order) {
      order = await Order.findOne({ razorpayOrderId: id }).populate('user_id', 'name email');
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

    order.paymentStatus = 'Failed';
    order.paymentDetails = {
      ...order.paymentDetails,
      failureReason: failureReason || 'Transaction declined or failed'
    };

    await order.save();
    return order.toObject();
  },

  updateStatus: async (id, status) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return null;
    const doc = order.toObject();
    return {
      ...doc,
      id: order._id.toString(),
      _id: order._id.toString()
    };
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
