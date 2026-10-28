import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    itemCount: {
      type: Number,
      default: 0
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

categorySchema.pre('save', function () {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
});

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

  findBySlugOrName: async (term) => {
    if (!term) return null;
    const clean = term.trim();
    let cat = await Category.findOne({ slug: clean.toLowerCase() });
    if (!cat) {
      cat = await Category.findOne({ name: new RegExp(`^${clean}$`, 'i') });
    }
    if (!cat && mongoose.Types.ObjectId.isValid(clean)) {
      cat = await Category.findById(clean);
    }
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

  create: async ({ name, slug, description = '', image = '' }) => {
    const calculatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const cat = await Category.create({ name: name.trim(), slug: calculatedSlug, description, image });
    return {
      ...cat.toObject(),
      id: cat._id.toString(),
      _id: cat._id.toString()
    };
  },

  update: async (id, { name, slug, description, image }) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (slug) updateData.slug = slug.trim().toLowerCase();
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;

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
