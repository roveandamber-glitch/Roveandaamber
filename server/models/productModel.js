import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be positive']
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    image: {
      type: String,
      default: ''
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    sizes: {
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

productSchema.virtual('id').get(function () {
  return this._id ? this._id.toString() : null;
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export const ProductModel = {
  findAll: async ({ categoryId, search } = {}) => {
    const query = {};

    if (search) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    let products = await Product.find(query).populate('category_id').sort({ createdAt: -1 });

    if (categoryId) {
      const catSearch = String(categoryId).trim().toLowerCase();
      products = products.filter(p => {
        const catObj = p.category_id;
        if (!catObj) return false;
        const catIdMatch = String(catObj._id) === String(categoryId) || String(catObj.id) === String(categoryId);
        const catNameMatch = catObj.name && catObj.name.toLowerCase().includes(catSearch);
        return catIdMatch || catNameMatch;
      });
    }

    return products.map(p => {
      const obj = p.toObject();
      return {
        ...obj,
        id: p._id.toString(),
        _id: p._id.toString(),
        category_name: p.category_id ? p.category_id.name : ''
      };
    });
  },

  findById: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const product = await Product.findById(id).populate('category_id');
    if (!product) return null;
    const obj = product.toObject();
    return {
      ...obj,
      id: product._id.toString(),
      _id: product._id.toString(),
      category_name: product.category_id ? product.category_id.name : ''
    };
  },

  create: async ({ name, price, stock = 0, image = '', category_id, sizes = '' }) => {
    const finalSizes = typeof sizes === 'object' ? JSON.stringify(sizes) : (sizes || '');
    const validCategoryId = mongoose.Types.ObjectId.isValid(category_id) ? category_id : null;

    const product = await Product.create({
      name: name.trim(),
      price: Number(price),
      stock: Number(stock),
      image,
      category_id: validCategoryId,
      sizes: finalSizes
    });

    const populated = await Product.findById(product._id).populate('category_id');
    const obj = populated.toObject();
    return {
      ...obj,
      id: populated._id.toString(),
      _id: populated._id.toString(),
      category_name: populated.category_id ? populated.category_id.name : ''
    };
  },

  update: async (id, { name, price, stock, image, category_id, sizes }) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const product = await Product.findById(id);
    if (!product) return null;

    if (name !== undefined) product.name = name.trim();
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (image !== undefined) product.image = image;
    if (category_id !== undefined) {
      product.category_id = mongoose.Types.ObjectId.isValid(category_id) ? category_id : null;
    }
    if (sizes !== undefined) {
      product.sizes = typeof sizes === 'object' ? JSON.stringify(sizes) : sizes;
    }

    await product.save();

    const populated = await Product.findById(id).populate('category_id');
    const obj = populated.toObject();
    return {
      ...obj,
      id: populated._id.toString(),
      _id: populated._id.toString(),
      category_name: populated.category_id ? populated.category_id.name : ''
    };
  },

  delete: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await Product.findByIdAndDelete(id);
    return !!result;
  },

  decrementStock: async (id, size, quantity) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const product = await Product.findById(id);
    if (!product) return null;

    let sizesMap = {};
    if (product.sizes) {
      try {
        sizesMap = JSON.parse(product.sizes);
      } catch (e) {}
    }

    if (!sizesMap || Object.keys(sizesMap).length === 0) {
      const defQty = Math.max(1, Math.floor((product.stock || 12) / 4));
      sizesMap = { 'S': defQty, 'M': defQty, 'L': defQty, 'XL': defQty };
    }

    const normalizedSize = (size || 'M').toUpperCase();
    if (sizesMap[normalizedSize] !== undefined) {
      sizesMap[normalizedSize] = Math.max(0, sizesMap[normalizedSize] - quantity);
    } else {
      sizesMap[normalizedSize] = 0;
    }

    product.stock = Math.max(0, product.stock - quantity);
    product.sizes = JSON.stringify(sizesMap);
    await product.save();
    return product;
  }
};

export default ProductModel;
