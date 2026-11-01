import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'Home',
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true
    },
    addressLine1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true
    },
    addressLine2: {
      type: String,
      default: '',
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      default: '',
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [70, 'Name cannot exceed 70 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    addresses: [addressSchema]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
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

// Virtual field for string id
userSchema.virtual('id').get(function () {
  return this._id ? this._id.toString() : null;
});

// Instance Method: Compare candidate password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password || !candidatePassword) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Static Model Methods
userSchema.statics.findByEmail = function (email) {
  if (!email) return null;
  return this.findOne({ email: email.toLowerCase().trim() });
};

userSchema.statics.findSafeById = function (id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return this.findById(id).select('-password');
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);

// Backward-compatible query adapter for legacy callers
export const UserModel = {
  findByEmail: async (email) => {
    if (!email) return null;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return null;
    const doc = user.toObject();
    return { ...doc, id: user._id.toString(), _id: user._id.toString() };
  },

  findAdmin: async () => {
    const admin = await User.findOne({ role: 'admin' }).select('-password');
    if (!admin) return null;
    const doc = admin.toObject ? admin.toObject() : admin;
    return { ...doc, id: admin._id ? admin._id.toString() : admin.id, _id: admin._id ? admin._id.toString() : admin._id };
  },

  findById: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const user = await User.findById(id).select('-password');
    if (!user) return null;
    const doc = user.toObject();
    return { ...doc, id: user._id.toString(), _id: user._id.toString() };
  },

  findWithPasswordById: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const user = await User.findById(id);
    if (!user) return null;
    const doc = user.toObject();
    return { ...doc, id: user._id.toString(), _id: user._id.toString() };
  },

  findAll: async () => {
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 }).lean();
    let Order = mongoose.models.Order;
    if (!Order) {
      try {
        const orderMod = await import('./orderModel.js');
        Order = orderMod.Order || mongoose.models.Order;
      } catch (err) {
        Order = mongoose.models.Order;
      }
    }

    return Promise.all(
      users.map(async (u) => {
        let ordersCount = 0;
        let totalSpent = 0;
        let ordersList = [];
        if (Order) {
          const userEmail = (u.email || '').toLowerCase().trim();
          const orders = await Order.find({
            $or: [
              { user_id: u._id },
              { email: userEmail },
              { 'customer.email': userEmail }
            ]
          }).sort({ createdAt: -1 }).lean();

          ordersCount = orders.length;
          totalSpent = orders.reduce((sum, o) => {
            const amt = Number(o.total_amount ?? o.total ?? o.totalPrice ?? 0);
            return sum + (isNaN(amt) ? 0 : amt);
          }, 0);

          ordersList = orders.map(o => ({
            _id: String(o._id),
            id: String(o._id),
            orderNumber: o.order_number || ('#ORD-' + String(o._id).slice(-4).toUpperCase()),
            totalAmount: Number(o.total_amount ?? o.total ?? 0),
            status: o.status || 'Pending',
            paymentStatus: o.payment_status || o.paymentStatus || 'Paid',
            createdAt: o.createdAt
          }));
        }

        const defaultAddr = (u.addresses && u.addresses.find(a => a.isDefault)) || (u.addresses && u.addresses[0]);
        const cityStr = defaultAddr 
          ? ((defaultAddr.city || '') + (defaultAddr.state ? ', ' + defaultAddr.state : '')).trim()
          : (u.address || 'Mumbai, Maharashtra');

        const joinedDateStr = u.createdAt 
          ? new Date(u.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
          : '29 Oct 2026';

        return {
          ...u,
          id: u._id.toString(),
          _id: u._id.toString(),
          orders_count: ordersCount,
          ordersCount: ordersCount,
          total_spent: totalSpent,
          totalSpent: totalSpent,
          rewardPoints: Math.floor(totalSpent * 0.1),
          city: cityStr,
          phone: u.phone || (defaultAddr && defaultAddr.phone) || '',
          joinedDate: joinedDateStr,
          orders: ordersList
        };
      })
    );
  },

  create: async ({ name, email, password, role = 'user', phone = '', address = '' }) => {
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      phone: phone || '',
      address: address || ''
    });
    const doc = user.toObject();
    return { ...doc, id: user._id.toString(), _id: user._id.toString() };
  },

  updateProfile: async (id, { name, phone, address }) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    const user = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true }).select('-password');
    if (!user) return null;
    const doc = user.toObject();
    return { ...doc, id: user._id.toString(), _id: user._id.toString() };
  },

  updatePassword: async (id, hashedPassword) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    await User.findByIdAndUpdate(id, { password: hashedPassword });
    return true;
  }
};

export default User;
