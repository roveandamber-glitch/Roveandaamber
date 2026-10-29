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
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    isActive: {
      type: Boolean,
      default: true
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
  if (this.status) {
    this.isActive = this.status === 'Active';
  } else if (this.isActive !== undefined) {
    this.status = this.isActive ? 'Active' : 'Inactive';
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
    const Product = mongoose.models.Product;

    return Promise.all(
      categories.map(async (c) => {
        let count = c.itemCount || 0;
        if (Product) {
          try {
            const prodCount = await Product.countDocuments({
              $or: [
                { category_id: c._id },
                { category: c.name },
                { categoryName: c.name }
              ]
            });
            if (prodCount > 0) count = prodCount;
          } catch {
            // Keep default count if Product query fails
          }
        }
        return {
          ...c.toObject(),
          id: c._id.toString(),
          _id: c._id.toString(),
          itemCount: count,
          status: c.status || (c.isActive === false ? 'Inactive' : 'Active')
        };
      })
    );
  },

  findById: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const cat = await Category.findById(id);
    if (!cat) return null;
    return {
      ...cat.toObject(),
      id: cat._id.toString(),
      _id: cat._id.toString(),
      status: cat.status || (cat.isActive === false ? 'Inactive' : 'Active')
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
      _id: cat._id.toString(),
      status: cat.status || (cat.isActive === false ? 'Inactive' : 'Active')
    };
  },

  findByName: async (name) => {
    const cat = await Category.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (!cat) return null;
    return {
      ...cat.toObject(),
      id: cat._id.toString(),
      _id: cat._id.toString(),
      status: cat.status || (cat.isActive === false ? 'Inactive' : 'Active')
    };
  },

  create: async ({ name, slug, description = '', image = '', status = 'Active', itemCount = 0 }) => {
    const calculatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const isAct = status === 'Active' || status === true;
    const cat = await Category.create({ 
      name: name.trim(), 
      slug: calculatedSlug, 
      description, 
      image,
      status: isAct ? 'Active' : 'Inactive',
      isActive: isAct,
      itemCount
    });
    return {
      ...cat.toObject(),
      id: cat._id.toString(),
      _id: cat._id.toString(),
      status: cat.status
    };
  },

  update: async (id, { name, slug, description, image, status, isActive, itemCount }) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (slug) updateData.slug = slug.trim().toLowerCase();
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (status !== undefined) {
      const isAct = status === 'Active' || status === true;
      updateData.status = isAct ? 'Active' : 'Inactive';
      updateData.isActive = isAct;
    } else if (isActive !== undefined) {
      updateData.status = isActive ? 'Active' : 'Inactive';
      updateData.isActive = Boolean(isActive);
    }
    if (itemCount !== undefined) updateData.itemCount = itemCount;

    const cat = await Category.findByIdAndUpdate(id, updateData, { new: true });
    if (!cat) return null;
    return {
      ...cat.toObject(),
      id: cat._id.toString(),
      _id: cat._id.toString(),
      status: cat.status
    };
  },

  delete: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await Category.findByIdAndDelete(id);
    return !!result;
  }
};

export default CategoryModel;
