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
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: 1 }).lean();
    const Order = mongoose.models.Order;

    return Promise.all(
      users.map(async (u) => {
        let ordersCount = 0;
        let totalSpent = 0;
        if (Order) {
          const orders = await Order.find({ user_id: u._id }).select('total_amount').lean();
          ordersCount = orders.length;
          totalSpent = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        }
        return {
          ...u,
          id: u._id.toString(),
          _id: u._id.toString(),
          orders_count: ordersCount,
          total_spent: totalSpent
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
