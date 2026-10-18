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
      default: 'M'
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
      type: String
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
    address: {
      type: String,
      default: ''
    },
    total_amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      default: 'Processing'
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
  createOrder: async ({ userId, customerName, phone, address, items }) => {
    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    let calculatedTotal = 0;
    const verifiedItems = [];

    // Step 1: Verify each product, its price, and check size-specific stock availability
    for (const item of items) {
      const pid = item.productId || item.product_id;
      const qty = parseInt(item.quantity, 10) || 1;
      const size = (item.size || 'M').toUpperCase();

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
      calculatedTotal += itemTotal;

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

    // Step 2: Ensure valid user ID
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
      address: address || '',
      total_amount: calculatedTotal,
      status: 'Processing',
      items: verifiedItems
    });

    // Step 4: Decrement product stock & size-wise stock
    for (const item of verifiedItems) {
      await ProductModel.decrementStock(item.productId, item.size, item.quantity);
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
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const order = await Order.findById(id).populate('user_id', 'name email');
    if (!order) return null;
    const doc = order.toObject();
    return {
      ...doc,
      id: order._id.toString(),
      _id: order._id.toString()
    };
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
