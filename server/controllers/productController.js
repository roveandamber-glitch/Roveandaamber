import { ProductModel } from '../models/productModel.js';

// Helper to parse images whether stored as single path, JSON array, or CSV
const parseImages = (imgField, name) => {
  if (!imgField) return [];
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
    const defaultQty = Math.max(1, Math.floor((totalStock || 12) / 4));
    return { 'S': defaultQty, 'M': defaultQty, 'L': defaultQty, 'XL': defaultQty };
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
        parsed.forEach(s => { map[s] = Math.max(1, Math.floor((totalStock || 12) / parsed.length)); });
        return map;
      }
    } catch (e) {}
  }
  return { 'S': 3, 'M': 5, 'L': 4, 'XL': 2 };
};

// Helper to format product data for frontend consistency
const formatProduct = (p) => {
  if (!p) return null;
  const imageList = parseImages(p.image, p.name);
  const primaryImage = imageList.length > 0 ? imageList[0].url : '';
  const sizeMap = parseSizesMap(p.sizes, p.stock);
  const sizeKeys = Object.keys(sizeMap);

  return {
    ...p,
    _id: String(p.id),
    category: p.category_name || (typeof p.category_id === 'string' ? p.category_id : ''),
    image: primaryImage,
    images: imageList,
    sizes_stock: sizeMap,
    sizes: sizeKeys,
    status: p.stock > 0 ? 'In Stock' : 'Out of Stock',
    isFeatured: true
  };
};

export const getProducts = async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    const rawProducts = await ProductModel.findAll({ categoryId: category, search });
    const formatted = rawProducts.map(formatProduct);

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

export const createProduct = async (req, res) => {
  try {
    const { name, price, stock, category_id, category, sizes } = req.body;

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

    // Calculate total stock from size-wise quantities if provided
    let calculatedStock = parseInt(stock, 10) || 0;
    if (Object.keys(parsedSizesMap).length > 0) {
      calculatedStock = Object.values(parsedSizesMap).reduce((sum, val) => sum + (parseInt(val, 10) || 0), 0);
    } else {
      parsedSizesMap = {
        'S': Math.floor(calculatedStock * 0.25) || 3,
        'M': Math.floor(calculatedStock * 0.35) || 5,
        'L': Math.floor(calculatedStock * 0.25) || 4,
        'XL': Math.floor(calculatedStock * 0.15) || 2
      };
      calculatedStock = Object.values(parsedSizesMap).reduce((sum, val) => sum + val, 0);
    }

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(f => `/uploads/${f.filename}`);
    } else if (req.file) {
      imagePaths = [`/uploads/${req.file.filename}`];
    } else if (req.body.images) {
      imagePaths = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    } else if (req.body.image) {
      imagePaths = [req.body.image];
    }

    const finalImageString = imagePaths.length > 0
      ? (imagePaths.length > 1 ? JSON.stringify(imagePaths) : imagePaths[0])
      : '';

    const product = await ProductModel.create({
      name,
      price: parseFloat(price),
      stock: calculatedStock,
      image: finalImageString,
      category_id: category_id || category || null,
      sizes: JSON.stringify(parsedSizesMap)
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully with size inventory.',
      data: formatProduct(product)
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, category_id, category, sizes } = req.body;

    let parsedSizesMap;
    let calculatedStock = stock !== undefined ? parseInt(stock, 10) : undefined;

    if (sizes) {
      try {
        parsedSizesMap = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
        calculatedStock = Object.values(parsedSizesMap).reduce((sum, val) => sum + (parseInt(val, 10) || 0), 0);
      } catch (e) {}
    }

    let finalImageString;
    if (req.files && req.files.length > 0) {
      const uploaded = req.files.map(f => `/uploads/${f.filename}`);
      finalImageString = uploaded.length > 1 ? JSON.stringify(uploaded) : uploaded[0];
    } else if (req.file) {
      finalImageString = `/uploads/${req.file.filename}`;
    } else if (req.body.images !== undefined) {
      const imgs = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      finalImageString = imgs.length > 1 ? JSON.stringify(imgs) : (imgs[0] || '');
    } else if (req.body.image !== undefined) {
      finalImageString = req.body.image;
    }

    const updated = await ProductModel.update(id, {
      name,
      price: price !== undefined ? parseFloat(price) : undefined,
      stock: calculatedStock,
      image: finalImageString,
      category_id: category_id || category,
      sizes: parsedSizesMap ? JSON.stringify(parsedSizesMap) : undefined
    });

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
