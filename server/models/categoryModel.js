import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true
    },
    image: {
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

// Virtual id getter
categorySchema.virtual('id').get(function () {
  return this._id ? this._id.toString() : null;
});

export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export const CategoryModel = {
  findAll: async () => {
    const categories = await Category.find().sort({ createdAt: 1 });
    return categories.map(c => ({
      ...c.toObject(),
      id: c._id.toString(),
      _id: c._id.toString()
    }));
  },

  findById: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const cat = await Category.findById(id);
    if (!cat) return null;
    return {
      ...cat.toObject(),
      id: cat._id.toString(),
      _id: cat._id.toString()
    };
  },

  findByName: async (name) => {
    const cat = await Category.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (!cat) return null;
    return {
      ...cat.toObject(),
      id: cat._id.toString(),
      _id: cat._id.toString()
    };
  },

  create: async ({ name, image = '' }) => {
    const cat = await Category.create({ name: name.trim(), image });
    return {
      ...cat.toObject(),
      id: cat._id.toString(),
      _id: cat._id.toString()
    };
  },

  update: async (id, { name, image }) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const updateData = { name: name.trim() };
    if (image !== undefined) {
      updateData.image = image;
    }
    const cat = await Category.findByIdAndUpdate(id, updateData, { new: true });
    if (!cat) return null;
    return {
      ...cat.toObject(),
      id: cat._id.toString(),
      _id: cat._id.toString()
    };
  },

  delete: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await Category.findByIdAndDelete(id);
    return !!result;
  }
};

export default CategoryModel;
