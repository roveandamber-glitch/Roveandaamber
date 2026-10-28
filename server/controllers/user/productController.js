import { ProductModel } from '../../models/productModel.js';

// Helper to parse images whether stored as single path, JSON array, or CSV
const parseImages = (imgField, imagesField, name) => {
  const result = [];

  if (Array.isArray(imagesField) && imagesField.length > 0) {
    imagesField.forEach(img => {
      if (typeof img === 'string') result.push({ url: img, alt: name });
      else if (img && img.url) result.push({ url: img.url, alt: img.alt || name });
    });
    return result;
  }

  if (typeof imagesField === 'string' && imagesField.trim()) {
    try {
      const parsed = JSON.parse(imagesField);
      if (Array.isArray(parsed)) {
        return parsed.map(u => ({ url: typeof u === 'string' ? u : u.url, alt: name }));
      }
    } catch (e) {}
  }

  if (!imgField) return result;

  if (Array.isArray(imgField)) {
    return imgField.map(u => ({ url: typeof u === 'string' ? u : u.url, alt: name }));
  }

  if (typeof imgField === 'string') {
    const trimmed = imgField.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const arr = JSON.parse(trimmed);
        return arr.map(u => ({ url: typeof u === 'string' ? u : u.url, alt: name }));
      } catch (e) {}
    }
    if (trimmed.includes(',')) {
      return trimmed.split(',').map(s => s.trim()).filter(Boolean).map(u => ({ url: u, alt: name }));
    }
    return [{ url: trimmed, alt: name }];
  }

  return [{ url: String(imgField), alt: name }];
};

// Helper to parse sizes map
const parseSizesMap = (sizesField, totalStock = 0) => {
  if (!sizesField) {
    const defaultQty = Math.max(1, Math.floor((totalStock || 12) / 2));
    return { '50ml': defaultQty, '100ml': defaultQty };
  }
  if (typeof sizesField === 'object' && !Array.isArray(sizesField)) {
    return sizesField;
  }
  if (typeof sizesField === 'string') {
    try {
      const parsed = JSON.parse(sizesField);
      if (typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed)) {
        const map = {};
        parsed.forEach(s => {
          map[s] = Math.max(1, Math.floor((totalStock || 12) / parsed.length));
        });
        return map;
      }
    } catch (e) {}
  }
  return { '50ml': 6, '100ml': 4 };
};

// Helper to format product data for frontend consistency
export const formatProduct = (p) => {
  if (!p) return null;
  const doc = p.toObject ? p.toObject() : p;
  const idStr = String(doc._id || doc.id);
  const imageList = parseImages(doc.image, doc.images, doc.name);
  const primaryImage = imageList.length > 0 ? imageList[0].url : (doc.image || '');
  const sizeMap = parseSizesMap(doc.sizes, doc.stock);
  const sizeKeys = Object.keys(sizeMap);

  return {
    ...doc,
    id: idStr,
    _id: idStr,
    slug: doc.slug || doc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category: doc.category_name || (doc.category_id && doc.category_id.name ? doc.category_id.name : (doc.categoryName || '')),
    image: primaryImage,
    images: imageList,
    video: doc.video || '',
    sizes_stock: sizeMap,
    sizes: sizeKeys,
    fragranceFamily: doc.fragranceFamily || 'Amber & Woods',
    gender: doc.gender || 'unisex',
    rating: doc.rating !== undefined ? doc.rating : 4.8,
    reviewsCount: doc.reviewsCount || 0,
    popularity: doc.popularity || 0,
    isFeatured: !!doc.isFeatured,
    isNewArrival: !!doc.isNewArrival,
    isBestSeller: !!doc.isBestSeller,
    isGiftEligible: doc.isGiftEligible !== undefined ? !!doc.isGiftEligible : true,
    giftOccasions: doc.giftOccasions || ['Birthday', 'Anniversary', 'Special Occasions'],
    giftOptions: doc.giftOptions || { allowGiftWrap: true, allowPersonalizedMessage: true, wrapPrice: 0 },
    status: (doc.stock > 0) ? 'In Stock' : 'Out of Stock'
  };
};

// 1. Browsing & Advanced Filters: Get all products
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      collection,
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
      sort,
      page,
      limit
    } = req.query;

    const rawProducts = await ProductModel.findAll({
      category: category || collection,
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
      sort: sort || 'newest'
    });

    const formatted = rawProducts.map(formatProduct);

    // Optional pagination
    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 12;
      const startIndex = (pageNum - 1) * limitNum;
      const paginated = formatted.slice(startIndex, startIndex + limitNum);

      return res.json({
        success: true,
        data: {
          products: paginated,
          total: formatted.length,
          page: pageNum,
          totalPages: Math.ceil(formatted.length / limitNum)
        }
      });
    }

    return res.json({
      success: true,
      data: {
        products: formatted,
        total: formatted.length
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

// 2. View product details by ID or Slug (with images, notes, video, sizes)
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.json({
      success: true,
      data: formatProduct(product)
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch product.' });
  }
};

// 3. Featured perfumes showcase
export const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 8;
    const products = await ProductModel.findFeatured(limit);
    return res.json({
      success: true,
      data: products.map(formatProduct)
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch featured products.' });
  }
};

// 4. New arrivals
export const getNewArrivals = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 8;
    const products = await ProductModel.findNewArrivals(limit);
    return res.json({
      success: true,
      data: products.map(formatProduct)
    });
  } catch (error) {
    console.error('Get new arrivals error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch new arrivals.' });
  }
};

// 5. Bestsellers
export const getBestSellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 8;
    const products = await ProductModel.findBestSellers(limit);
    return res.json({
      success: true,
      data: products.map(formatProduct)
    });
  } catch (error) {
    console.error('Get best sellers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch best sellers.' });
  }
};

// 6. Dedicated collections (For Him, For Her, Unisex, Signature)
export const getCollections = async (req, res) => {
  try {
    const { collection } = req.params;
    const { sort } = req.query;

    let products;
    const lower = (collection || '').toLowerCase();

    if (['him', 'men', 'male', 'for-him'].includes(lower)) {
      products = await ProductModel.findByGender('him', sort);
    } else if (['her', 'women', 'female', 'for-her'].includes(lower)) {
      products = await ProductModel.findByGender('her', sort);
    } else if (['unisex', 'shared'].includes(lower)) {
      products = await ProductModel.findByGender('unisex', sort);
    } else {
      products = await ProductModel.findAll({ category: collection, sort });
    }

    return res.json({
      success: true,
      data: {
        collection,
        products: products.map(formatProduct),
        total: products.length
      }
    });
  } catch (error) {
    console.error('Get collections error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch collection.' });
  }
};

// 7. Gift Shopping – For Him and Her, Birthdays, Anniversaries, Special Occasions
export const getGiftSelections = async (req, res) => {
  try {
    const { occasion, gender, minPrice, maxPrice } = req.query;

    const products = await ProductModel.findGiftSelections({
      occasion,
      gender,
      minPrice,
      maxPrice
    });

    return res.json({
      success: true,
      data: {
        giftSelections: products.map(formatProduct),
        total: products.length,
        filters: { occasion, gender, minPrice, maxPrice }
      }
    });
  } catch (error) {
    console.error('Get gift selections error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch gift selections.' });
  }
};

// 8. Dynamic Filter Options (Categories, Fragrance Families, Price Range, Sizes, Occasions)
export const getFilterOptions = async (req, res) => {
  try {
    const options = await ProductModel.getFilterOptions();
    return res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Get filter options error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch filter options.' });
  }
};

// 9. Admin Create Product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      price,
      originalPrice,
      stock,
      category_id,
      categoryName,
      subcategory,
      description,
      fragranceFamily,
      gender,
      sizes,
      details,
      video,
      giftOccasions,
      isFeatured,
      isNewArrival,
      isBestSeller,
      isGiftEligible
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product name and price are required.'
      });
    }

    let parsedSizesMap = {};
    if (sizes) {
      try {
        parsedSizesMap = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch (e) {
        parsedSizesMap = {};
      }
    }

    let calculatedStock = parseInt(stock, 10) || 0;
    if (Object.keys(parsedSizesMap).length > 0) {
      calculatedStock = Object.values(parsedSizesMap).reduce((sum, val) => sum + (parseInt(val, 10) || 0), 0);
    } else {
      parsedSizesMap = {
        '50ml': Math.floor(calculatedStock * 0.6) || 6,
        '100ml': Math.floor(calculatedStock * 0.4) || 4
      };
      calculatedStock = Object.values(parsedSizesMap).reduce((sum, val) => sum + val, 0);
    }

    let imageList = [];
    if (req.files && req.files.length > 0) {
      imageList = req.files.map(f => ({ url: `/uploads/${f.filename}`, alt: name }));
    } else if (req.file) {
      imageList = [{ url: `/uploads/${req.file.filename}`, alt: name }];
    } else if (req.body.images) {
      const raw = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      imageList = raw.map(u => (typeof u === 'string' ? { url: u, alt: name } : u));
    } else if (req.body.image) {
      imageList = [{ url: req.body.image, alt: name }];
    }

    const primaryImage = imageList.length > 0 ? imageList[0].url : '';

    let parsedDetails = details;
    if (typeof details === 'string') {
      try {
        parsedDetails = JSON.parse(details);
      } catch (e) {
        parsedDetails = details.split('\n').filter(Boolean);
      }
    }

    let parsedOccasions = giftOccasions;
    if (typeof giftOccasions === 'string') {
      try {
        parsedOccasions = JSON.parse(giftOccasions);
      } catch (e) {
        parsedOccasions = giftOccasions.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    const product = await ProductModel.create({
      name,
      slug,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price),
      stock: calculatedStock,
      image: primaryImage,
      images: imageList,
      video: video || '',
      category_id,
      categoryName,
      subcategory,
      description,
      fragranceFamily,
      gender: gender || 'unisex',
      sizes: JSON.stringify(parsedSizesMap),
      details: Array.isArray(parsedDetails) ? parsedDetails : [],
      giftOccasions: Array.isArray(parsedOccasions) ? parsedOccasions : ['Birthday', 'Anniversary'],
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isNewArrival: isNewArrival === 'true' || isNewArrival === true,
      isBestSeller: isBestSeller === 'true' || isBestSeller === true,
      isGiftEligible: isGiftEligible === undefined || isGiftEligible === 'true' || isGiftEligible === true
    });

    return res.status(201).json({
      success: true,
      message: 'Perfume created successfully.',
      data: formatProduct(product)
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
};

// 10. Admin Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      price,
      originalPrice,
      stock,
      category_id,
      categoryName,
      subcategory,
      description,
      fragranceFamily,
      gender,
      sizes,
      details,
      video,
      giftOccasions,
      isFeatured,
      isNewArrival,
      isBestSeller,
      isGiftEligible
    } = req.body;

    let parsedSizesMap;
    let calculatedStock = stock !== undefined ? parseInt(stock, 10) : undefined;

    if (sizes) {
      try {
        parsedSizesMap = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
        calculatedStock = Object.values(parsedSizesMap).reduce((sum, val) => sum + (parseInt(val, 10) || 0), 0);
      } catch (e) {}
    }

    let imageList;
    if (req.files && req.files.length > 0) {
      imageList = req.files.map(f => ({ url: `/uploads/${f.filename}`, alt: name || '' }));
    } else if (req.file) {
      imageList = [{ url: `/uploads/${req.file.filename}`, alt: name || '' }];
    } else if (req.body.images !== undefined) {
      const raw = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      imageList = raw.map(u => (typeof u === 'string' ? { url: u, alt: name || '' } : u));
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (originalPrice !== undefined) updateData.originalPrice = parseFloat(originalPrice);
    if (calculatedStock !== undefined) updateData.stock = calculatedStock;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (categoryName !== undefined) updateData.categoryName = categoryName;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (description !== undefined) updateData.description = description;
    if (fragranceFamily !== undefined) updateData.fragranceFamily = fragranceFamily;
    if (gender !== undefined) updateData.gender = gender;
    if (parsedSizesMap) updateData.sizes = JSON.stringify(parsedSizesMap);
    if (video !== undefined) updateData.video = video;

    if (imageList) {
      updateData.images = imageList;
      updateData.image = imageList.length > 0 ? imageList[0].url : '';
    } else if (req.body.image !== undefined) {
      updateData.image = req.body.image;
    }

    if (details !== undefined) {
      updateData.details = typeof details === 'string' ? JSON.parse(details) : details;
    }
    if (giftOccasions !== undefined) {
      updateData.giftOccasions = typeof giftOccasions === 'string' ? JSON.parse(giftOccasions) : giftOccasions;
    }
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isNewArrival !== undefined) updateData.isNewArrival = isNewArrival === 'true' || isNewArrival === true;
    if (isBestSeller !== undefined) updateData.isBestSeller = isBestSeller === 'true' || isBestSeller === true;
    if (isGiftEligible !== undefined) updateData.isGiftEligible = isGiftEligible === 'true' || isGiftEligible === true;

    const updated = await ProductModel.update(id, updateData);

    return res.json({
      success: true,
      message: 'Product updated successfully.',
      data: formatProduct(updated)
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

// 11. Admin Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ProductModel.delete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};
