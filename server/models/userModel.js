import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    phone: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    }
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

userSchema.virtual('id').get(function () {
  return this._id ? this._id.toString() : null;
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);

export const UserModel = {
  findByEmail: async (email) => {
    if (!email) return null;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return null;
    return {
      ...user.toObject(),
      id: user._id.toString(),
      _id: user._id.toString()
    };
  },

  findById: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const user = await User.findById(id).select('-password');
    if (!user) return null;
    return {
      ...user.toObject(),
      id: user._id.toString(),
      _id: user._id.toString()
    };
  },

  findWithPasswordById: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const user = await User.findById(id);
    if (!user) return null;
    return {
      ...user.toObject(),
      id: user._id.toString(),
      _id: user._id.toString()
    };
  },

  findAll: async () => {
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: 1 }).lean();
    
    // Dynamically calculate orders count and total spent for each user
    const Order = mongoose.models.Order;
    const enrichedUsers = await Promise.all(
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

    return enrichedUsers;
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
    return {
      ...user.toObject(),
      id: user._id.toString(),
      _id: user._id.toString()
    };
  },

  updateProfile: async (id, { name, phone, address }) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    const user = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true }).select('-password');
    if (!user) return null;
    return {
      ...user.toObject(),
      id: user._id.toString(),
      _id: user._id.toString()
    };
  },

  updatePassword: async (id, hashedPassword) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    await User.findByIdAndUpdate(id, { password: hashedPassword });
    return true;
  }
};

export default UserModel;
