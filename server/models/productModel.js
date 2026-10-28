import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    slug: {
      type: String,
      trim: true,
      index: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be positive']
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price must be positive']
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    sku: {
      type: String,
      trim: true,
      default: ''
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, 'Threshold cannot be negative']
    },
    reorderQuantity: {
      type: Number,
      default: 15,
      min: [1, 'Reorder quantity must be at least 1']
    },
    lastRestockedAt: {
      type: Date,
      default: null
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    categoryName: {
      type: String,
      default: ''
    },
    subcategory: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    fragranceFamily: {
      type: String,
      default: 'Amber & Woods'
    },
    gender: {
      type: String,
      enum: ['him', 'her', 'unisex', 'men', 'women', 'all'],
      default: 'unisex'
    },
    sizes: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: '' }
      }
    ],
    video: {
      type: String,
      default: ''
    },
    details: [
      {
        type: String
      }
    ],
    colors: [
      {
        name: { type: String },
        code: { type: String }
      }
    ],
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5
    },
    reviewsCount: {
      type: Number,
      default: 0
    },
    popularity: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isNewArrival: {
      type: Boolean,
      default: false
    },
    isBestSeller: {
      type: Boolean,
      default: false
    },
    isGiftEligible: {
      type: Boolean,
      default: true
    },
    giftOccasions: [
      {
        type: String
      }
    ],
    giftOptions: {
      allowGiftWrap: { type: Boolean, default: true },
      allowPersonalizedMessage: { type: Boolean, default: true },
      wrapPrice: { type: Number, default: 0 }
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

productSchema.pre('save', function () {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
});

productSchema.virtual('id').get(function () {
  return this._id ? this._id.toString() : null;
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Normalize gender matching (e.g. 'men' -> 'him', 'women' -> 'her')
const normalizeGender = (g) => {
  if (!g) return null;
  const lower = String(g).toLowerCase().trim();
  if (lower === 'men' || lower === 'him' || lower === 'male' || lower === 'for-him') return 'him';
  if (lower === 'women' || lower === 'her' || lower === 'female' || lower === 'for-her') return 'her';
  if (lower === 'unisex' || lower === 'both') return 'unisex';
  return lower;
};

export const ProductModel = {
  findAll: async ({
    categoryId,
    category,
    search,
    fragranceFamily,
    gender,
    minPrice,
    maxPrice,
    size,
    occasion,
    featured,
    newArrival,
    bestSeller,
    isGift,
    sort = 'newest'
  } = {}) => {
    const query = {};

    // 1. Keyword search (Name, Description, Fragrance Family, Details)
    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { fragranceFamily: { $regex: term, $options: 'i' } },
        { details: { $elemMatch: { $regex: term, $options: 'i' } } }
      ];
    }

    // 2. Fragrance Family Filter
    if (fragranceFamily && fragranceFamily.trim()) {
      const families = fragranceFamily.split(',').map(f => f.trim()).filter(Boolean);
      if (families.length === 1) {
        query.fragranceFamily = { $regex: families[0], $options: 'i' };
      } else if (families.length > 1) {
        query.$or = (query.$or || []).concat(
          families.map(f => ({ fragranceFamily: { $regex: f, $options: 'i' } }))
        );
      }
    }

    // 3. Gender / For Him & Her
    if (gender) {
      const normalized = normalizeGender(gender);
      if (normalized === 'him') {
        query.gender = { $in: ['him', 'men', 'unisex'] };
      } else if (normalized === 'her') {
        query.gender = { $in: ['her', 'women', 'unisex'] };
      } else if (normalized === 'unisex') {
        query.gender = 'unisex';
      }
    }

    // 4. Price Range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // 5. Featured, New Arrivals, BestSellers
    if (featured === true || featured === 'true') {
      query.isFeatured = true;
    }
    if (newArrival === true || newArrival === 'true') {
      query.isNewArrival = true;
    }
    if (bestSeller === true || bestSeller === 'true') {
      query.isBestSeller = true;
    }

    // 6. Gift Eligibility & Occasion Filter
    if (isGift === true || isGift === 'true') {
      query.isGiftEligible = true;
    }
    if (occasion && occasion.trim()) {
      query.giftOccasions = { $regex: occasion.trim(), $options: 'i' };
    }

    // Build sort options
    let sortObj = { createdAt: -1 };
    switch (sort) {
      case 'price_asc':
      case 'price-low-to-high':
        sortObj = { price: 1 };
        break;
      case 'price_desc':
      case 'price-high-to-low':
        sortObj = { price: -1 };
        break;
      case 'popularity':
        sortObj = { popularity: -1, rating: -1, reviewsCount: -1 };
        break;
      case 'rating':
        sortObj = { rating: -1, reviewsCount: -1 };
        break;
      case 'newest':
      case 'new-arrivals':
        sortObj = { isNewArrival: -1, createdAt: -1 };
        break;
      case 'name_asc':
        sortObj = { name: 1 };
        break;
      case 'name_desc':
        sortObj = { name: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    let products = await Product.find(query).populate('category_id').sort(sortObj);

    // 7. Category Filter (by ObjectId, slug, or name)
    const targetCat = categoryId || category;
    if (targetCat) {
      const catSearch = String(targetCat).trim().toLowerCase();
      products = products.filter(p => {
        const catObj = p.category_id;
        const pCatName = (p.categoryName || '').toLowerCase();
        const pSubCatName = (p.subcategory || '').toLowerCase();

        if (pCatName.includes(catSearch) || pSubCatName.includes(catSearch)) {
          return true;
        }

        if (catObj) {
          const catIdMatch = String(catObj._id) === catSearch || String(catObj.id) === catSearch;
          const catNameMatch = catObj.name && catObj.name.toLowerCase().includes(catSearch);
          const catSlugMatch = catObj.slug && catObj.slug.toLowerCase().includes(catSearch);
          return catIdMatch || catNameMatch || catSlugMatch;
        }
        return false;
      });
    }

    // 8. Size Filter
    if (size && size.trim()) {
      const targetSize = size.trim().toLowerCase();
      products = products.filter(p => {
        if (!p.sizes) return false;
        try {
          const parsed = typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes;
          if (Array.isArray(parsed)) {
            return parsed.some(s => String(s).toLowerCase().includes(targetSize));
          }
          if (typeof parsed === 'object') {
            return Object.keys(parsed).some(s => s.toLowerCase().includes(targetSize));
          }
        } catch (e) {
          return String(p.sizes).toLowerCase().includes(targetSize);
        }
        return false;
      });
    }

    return products.map(p => {
      const obj = p.toObject();
      return {
        ...obj,
        id: p._id.toString(),
        _id: p._id.toString(),
        category_name: p.category_id ? p.category_id.name : p.categoryName || ''
      };
    });
  },

  findById: async (id) => {
    if (!id) return null;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).populate('category_id');
    }
    if (!product) {
      product = await Product.findOne({ slug: String(id).toLowerCase().trim() }).populate('category_id');
    }

    if (!product) return null;
    const obj = product.toObject();
    return {
      ...obj,
      id: product._id.toString(),
      _id: product._id.toString(),
      category_name: product.category_id ? product.category_id.name : product.categoryName || ''
    };
  },

  findFeatured: async (limit = 8) => {
    return ProductModel.findAll({ featured: true, sort: 'popularity' }).then(p => p.slice(0, limit));
  },

  findNewArrivals: async (limit = 8) => {
    return ProductModel.findAll({ newArrival: true, sort: 'newest' }).then(p => p.slice(0, limit));
  },

  findBestSellers: async (limit = 8) => {
    return ProductModel.findAll({ bestSeller: true, sort: 'popularity' }).then(p => p.slice(0, limit));
  },

  findByGender: async (gender, sort = 'popularity') => {
    return ProductModel.findAll({ gender, sort });
  },

  findGiftSelections: async ({ occasion, gender, minPrice, maxPrice } = {}) => {
    return ProductModel.findAll({
      isGift: true,
      occasion,
      gender,
      minPrice,
      maxPrice,
      sort: 'popularity'
    });
  },

  getFilterOptions: async () => {
    const products = await Product.find({}).populate('category_id');
    
    const categoriesSet = new Map();
    const fragranceFamiliesSet = new Set();
    const sizesSet = new Set();
    const giftOccasionsSet = new Set();
    let minPrice = Infinity;
    let maxPrice = 0;

    for (const p of products) {
      if (p.price !== undefined) {
        if (p.price < minPrice) minPrice = p.price;
        if (p.price > maxPrice) maxPrice = p.price;
      }
      if (p.category_id) {
        categoriesSet.set(String(p.category_id._id), {
          id: String(p.category_id._id),
          name: p.category_id.name,
          slug: p.category_id.slug
        });
      } else if (p.categoryName) {
        categoriesSet.set(p.categoryName, {
          id: p.categoryName,
          name: p.categoryName
        });
      }

      if (p.fragranceFamily) {
        fragranceFamiliesSet.add(p.fragranceFamily.trim());
      }

      if (p.sizes) {
        try {
          const parsed = typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes;
          if (Array.isArray(parsed)) {
            parsed.forEach(s => sizesSet.add(String(s)));
          } else if (typeof parsed === 'object') {
            Object.keys(parsed).forEach(s => sizesSet.add(String(s)));
          }
        } catch (e) {
          sizesSet.add(String(p.sizes));
        }
      }

      if (Array.isArray(p.giftOccasions)) {
        p.giftOccasions.forEach(occ => giftOccasionsSet.add(occ));
      }
    }

    if (minPrice === Infinity) minPrice = 0;
    if (maxPrice === 0) maxPrice = 10000;

    return {
      categories: Array.from(categoriesSet.values()),
      fragranceFamilies: Array.from(fragranceFamiliesSet),
      sizes: Array.from(sizesSet),
      giftOccasions: Array.from(giftOccasionsSet),
      genders: [
        { label: 'All Fragrances', value: 'all' },
        { label: 'For Him', value: 'him' },
        { label: 'For Her', value: 'her' },
        { label: 'Unisex', value: 'unisex' }
      ],
      priceRange: {
        min: minPrice,
        max: maxPrice
      }
    };
  },

  create: async (data) => {
    const {
      name,
      slug,
      price,
      originalPrice,
      stock = 0,
      image = '',
      images = [],
      video = '',
      category_id,
      categoryName = '',
      subcategory = '',
      description = '',
      fragranceFamily = 'Amber & Woods',
      gender = 'unisex',
      sizes = '',
      details = [],
      colors = [],
      rating = 4.8,
      reviewsCount = 0,
      popularity = 50,
      isFeatured = false,
      isNewArrival = false,
      isBestSeller = false,
      isGiftEligible = true,
      giftOccasions = [],
      giftOptions
    } = data;

    const finalSizes = typeof sizes === 'object' ? JSON.stringify(sizes) : (sizes || '');
    const validCategoryId = mongoose.Types.ObjectId.isValid(category_id) ? category_id : null;

    let finalImages = images;
    if (typeof images === 'string') {
      try {
        finalImages = JSON.parse(images);
      } catch (e) {
        finalImages = [{ url: images, alt: name }];
      }
    }
    if (!Array.isArray(finalImages) || finalImages.length === 0) {
      if (image) finalImages = [{ url: image, alt: name }];
    }

    const calculatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product = await Product.create({
      name: name.trim(),
      slug: calculatedSlug,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      stock: Number(stock),
      image: image || (finalImages[0] ? finalImages[0].url : ''),
      images: finalImages,
      video,
      category_id: validCategoryId,
      categoryName,
      subcategory,
      description,
      fragranceFamily,
      gender: normalizeGender(gender) || 'unisex',
      sizes: finalSizes,
      details,
      colors,
      rating: Number(rating) || 4.8,
      reviewsCount: Number(reviewsCount) || 0,
      popularity: Number(popularity) || 0,
      isFeatured: !!isFeatured,
      isNewArrival: !!isNewArrival,
      isBestSeller: !!isBestSeller,
      isGiftEligible: isGiftEligible !== undefined ? !!isGiftEligible : true,
      giftOccasions,
      giftOptions
    });

    const populated = await Product.findById(product._id).populate('category_id');
    const obj = populated.toObject();
    return {
      ...obj,
      id: populated._id.toString(),
      _id: populated._id.toString(),
      category_name: populated.category_id ? populated.category_id.name : populated.categoryName || ''
    };
  },

  update: async (id, updateFields) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const product = await Product.findById(id);
    if (!product) return null;

    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] !== undefined) {
        if (key === 'category_id') {
          product.category_id = mongoose.Types.ObjectId.isValid(updateFields[key]) ? updateFields[key] : null;
        } else if (key === 'sizes') {
          product.sizes = typeof updateFields[key] === 'object' ? JSON.stringify(updateFields[key]) : updateFields[key];
        } else if (key === 'gender') {
          product.gender = normalizeGender(updateFields[key]) || 'unisex';
        } else {
          product[key] = updateFields[key];
        }
      }
    });

    await product.save();

    const populated = await Product.findById(id).populate('category_id');
    const obj = populated.toObject();
    return {
      ...obj,
      id: populated._id.toString(),
      _id: populated._id.toString(),
      category_name: populated.category_id ? populated.category_id.name : populated.categoryName || ''
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
      const defQty = Math.max(1, Math.floor((product.stock || 12) / 2));
      sizesMap = { '50ml': defQty, '100ml': defQty };
    }

    const normalizedSize = size || '50ml';
    if (sizesMap[normalizedSize] !== undefined) {
      sizesMap[normalizedSize] = Math.max(0, sizesMap[normalizedSize] - quantity);
    } else {
      sizesMap[normalizedSize] = 0;
    }

    product.stock = Math.max(0, product.stock - quantity);
    product.sizes = JSON.stringify(sizesMap);
    await product.save();
    return product;
  },

  incrementStock: async (id, size, quantity) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const product = await Product.findById(id);
    if (!product) return null;

    let sizesMap = {};
    if (product.sizes) {
      try {
        sizesMap = JSON.parse(product.sizes);
      } catch (e) {}
    }

    const normalizedSize = size || '50ml';
    if (sizesMap[normalizedSize] !== undefined) {
      sizesMap[normalizedSize] = sizesMap[normalizedSize] + quantity;
    } else {
      sizesMap[normalizedSize] = quantity;
    }

    product.stock = (product.stock || 0) + quantity;
    product.sizes = JSON.stringify(sizesMap);
    product.lastRestockedAt = new Date();
    await product.save();
    return product;
  },

  findLowStock: async (thresholdOverride = null) => {
    const products = await Product.find().sort({ stock: 1 }).lean();
    return products.filter(p => {
      const threshold = thresholdOverride !== null ? Number(thresholdOverride) : (p.lowStockThreshold !== undefined ? p.lowStockThreshold : 5);
      return (p.stock || 0) <= threshold;
    });
  },

  updateThresholds: async (id, { lowStockThreshold, reorderQuantity, sku }) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const update = {};
    if (lowStockThreshold !== undefined) update.lowStockThreshold = Number(lowStockThreshold);
    if (reorderQuantity !== undefined) update.reorderQuantity = Number(reorderQuantity);
    if (sku !== undefined) update.sku = sku;
    return Product.findByIdAndUpdate(id, update, { new: true });
  }
};

export default ProductModel;
