import mongoose from 'mongoose';
import { ProductModel, Product } from '../../models/productModel.js';
import { OrderModel, Order } from '../../models/orderModel.js';
import { BannerModel, Banner } from '../../models/bannerModel.js';
import { ReviewModel, Review } from '../../models/reviewModel.js';
import { Category } from '../../models/categoryModel.js';
import { UserModel, User } from '../../models/userModel.js';
import { emailService } from '../../services/emailService.js';

// Format product for consistent output
const formatProduct = (p) => {
  const doc = p._doc || p;
  let sizesObj = { '50ml': 10, '100ml': 5 };
  if (doc.sizes) {
    try {
      sizesObj = typeof doc.sizes === 'string' ? JSON.parse(doc.sizes) : doc.sizes;
    } catch {
      sizesObj = { '50ml': 10, '100ml': 5 };
    }
  }

  return {
    id: String(doc._id || doc.id),
    _id: String(doc._id || doc.id),
    name: doc.name,
    slug: doc.slug,
    price: doc.price,
    originalPrice: doc.originalPrice || doc.price,
    stock: doc.stock !== undefined ? doc.stock : 10,
    sizes: sizesObj,
    image: doc.image || '',
    images: doc.images || (doc.image ? [{ url: doc.image, alt: doc.name }] : []),
    category_id: doc.category_id,
    categoryName: doc.categoryName || '',
    subcategory: doc.subcategory || '',
    fragranceFamily: doc.fragranceFamily || 'Oriental Woody',
    gender: doc.gender || 'unisex',
    rating: doc.rating || 5.0,
    reviewsCount: doc.reviewsCount || 0,
    description: doc.description || '',
    status: (doc.stock > 0) ? 'In Stock' : 'Out of Stock',
    isFeatured: Boolean(doc.isFeatured),
    isNewArrival: Boolean(doc.isNewArrival),
    isBestSeller: Boolean(doc.isBestSeller),
    isGiftEligible: doc.isGiftEligible !== undefined ? Boolean(doc.isGiftEligible) : true,
    giftOccasions: doc.giftOccasions || ['Birthday', 'Anniversary', 'Special Occasions'],
    createdAt: doc.createdAt
  };
};

/* ==========================================================================
   ADMIN DASHBOARD OVERVIEW & METRICS
   ========================================================================== */

/**
 * GET /api/admin/stats
 * Overview metrics for Admin Dashboard
 */
export const getAdminDashboardStats = async (req, res) => {
  try {
    const productsCount = await Product.countDocuments();
    const outOfStockCount = await Product.countDocuments({ stock: { $lte: 0 } });
    const ordersCount = await Order.countDocuments();
    const registeredUsersCount = await User.countDocuments();
    const guestEmails = await Order.distinct('email');
    const customersCount = Math.max(registeredUsersCount, guestEmails.filter(Boolean).length, 1);
    const categoriesCount = await Category.countDocuments();
    const bannersCount = await Banner.countDocuments({ isActive: true });
    const giftOrdersCount = await Order.countDocuments({ isGift: true });
    const pendingReviewsCount = await Review.countDocuments({ status: 'pending' });

    // Total revenue aggregate
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: { $ne: 'Failed' }, status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Orders status breakdown
    const ordersByStatusAgg = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const ordersByStatus = {};
    ordersByStatusAgg.forEach(item => {
      ordersByStatus[item._id] = item.count;
    });

    // Top products by sales frequency using order items
    const topProductsAgg = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          sales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 }
    ]);

    let topProducts = topProductsAgg;
    if (topProducts.length === 0) {
      const sampleProducts = await Product.find().limit(5).lean();
      topProducts = sampleProducts.map(p => ({
        _id: p._id,
        name: p.name,
        sales: 0,
        revenue: 0,
        image: p.image
      }));
    }

    // Recent orders with populated customer & items info
    const recentOrdersRaw = await Order.find()
      .populate('user_id', 'name email')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const recentOrders = recentOrdersRaw.map(o => {
      const itemsList = o.items || [];
      const firstItem = itemsList[0];
      const itemsCount = itemsList.length;
      let summary = 'Artisanal Perfume Flacon';
      if (firstItem?.name) {
        summary = firstItem.name + (itemsCount > 1 ? ` (+${itemsCount - 1} more)` : '');
      }

      const custName = o.customer_name || (o.user_id ? o.user_id.name : 'Valued Patron');
      const custEmail = o.email || (o.user_id ? o.user_id.email : '');
      const orderNum = o.orderId || `#ORD-${o._id.toString().slice(-4).toUpperCase()}`;

      return {
        _id: o._id.toString(),
        id: o._id.toString(),
        orderId: orderNum,
        orderNumber: orderNum,
        customerName: custName,
        customer: {
          name: custName,
          email: custEmail,
          avatar: o.user_id?.avatar || null
        },
        email: custEmail,
        createdAt: o.createdAt ? o.createdAt.toISOString() : new Date().toISOString(),
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today',
        totalPrice: o.total_amount || 0,
        total: o.total_amount || 0,
        status: o.status || 'Pending',
        paymentStatus: o.paymentStatus || 'Pending',
        paymentMethod: o.paymentMethod || 'Razorpay',
        productSummary: summary,
        isGift: Boolean(o.isGift)
      };
    });

    return res.json({
      success: true,
      data: {
        stats: {
          totalCustomers: customersCount,
          totalProducts: productsCount,
          outOfStockProducts: outOfStockCount,
          totalOrders: ordersCount,
          giftOrdersCount,
          totalCategories: categoriesCount,
          activeBanners: bannersCount,
          pendingReviews: pendingReviewsCount,
          totalRevenue,
          ordersByStatus
        },
        topProducts: topProducts.map(p => ({
          id: String(p._id),
          name: p.name,
          sales: p.sales || 0,
          revenue: p.revenue || 0,
          image: p.image || ''
        })),
        recentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard metrics.' });
  }
};

/**
 * GET /api/admin/users
 * View customer accounts list
 */
export const getAdminUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll();
    return res.json({
      success: true,
      data: users.map(u => ({
        ...u,
        _id: String(u.id || u._id),
        userId: `#USR-${String(u.id || u._id).slice(-4).toUpperCase()}`
      }))
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users list.' });
  }
};

/* ==========================================================================
   9.1 PRODUCT MANAGEMENT
   • Add, edit, and remove perfume products.
   • Update product names, descriptions, prices, and images.
   • Manage product sizes, categories, and availability.
   • Maintain accurate product catalogue information.
   ========================================================================== */

/**
 * GET /api/admin/products
 * List all products with admin controls and filters
 */
export const getAdminProducts = async (req, res) => {
  try {
    const { search, category, gender, availability, page, limit } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { fragranceFamily: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.categoryName = { $regex: category, $options: 'i' };
    }

    if (gender) {
      query.gender = gender.toLowerCase();
    }

    if (availability === 'in_stock') {
      query.stock = { $gt: 0 };
    } else if (availability === 'out_of_stock') {
      query.stock = { $lte: 0 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: {
        products: products.map(formatProduct),
        pagination: {
          total,
          page: pageNum,
          totalPages: Math.ceil(total / limitNum),
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Admin get products error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch catalogue products.' });
  }
};

/**
 * POST /api/admin/products
 * Add a new perfume product with sizes, media, and categories
 */
export const createAdminProduct = async (req, res) => {
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

    let parsedSizesMap = {};
    if (sizes) {
      try {
        parsedSizesMap = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch {
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

    // Media processing: handle uploaded files or direct URLs
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

    const primaryImage = imageList.length > 0 ? imageList[0].url : '/images/perfumes/signature_flacon.jpg';

    let parsedDetails = details;
    if (typeof details === 'string') {
      try {
        parsedDetails = JSON.parse(details);
      } catch {
        parsedDetails = details.split('\n').filter(Boolean);
      }
    }

    let parsedOccasions = giftOccasions;
    if (typeof giftOccasions === 'string') {
      try {
        parsedOccasions = JSON.parse(giftOccasions);
      } catch {
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
      categoryName: categoryName || 'Haute Parfumerie',
      subcategory: subcategory || '',
      description: description || '',
      fragranceFamily: fragranceFamily || 'Oriental Woody',
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
      message: 'Product added successfully to catalogue.',
      data: formatProduct(product)
    });
  } catch (error) {
    console.error('Admin create product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create perfume product.' });
  }
};

/**
 * PUT /api/admin/products/:id
 * Edit perfume product details, descriptions, prices, media, and categories
 */
export const updateAdminProduct = async (req, res) => {
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
      } catch {
        // preserve existing if invalid
      }
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
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.json({
      success: true,
      message: 'Product updated successfully.',
      data: formatProduct(updated)
    });
  } catch (error) {
    console.error('Admin update product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

/**
 * PATCH /api/admin/products/:id/stock
 * Manage product sizes, stock levels, and availability (In Stock / Out of Stock)
 */
export const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, sizes, status } = req.body;

    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    let parsedSizesMap = {};
    if (sizes) {
      parsedSizesMap = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    } else if (product.sizes) {
      try {
        parsedSizesMap = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
      } catch {
        parsedSizesMap = {};
      }
    }

    let finalStock = product.stock;
    if (stock !== undefined) {
      finalStock = parseInt(stock, 10);
    } else if (sizes) {
      finalStock = Object.values(parsedSizesMap).reduce((sum, val) => sum + (parseInt(val, 10) || 0), 0);
    }

    if (status === 'Out of Stock') {
      finalStock = 0;
    } else if (status === 'In Stock' && finalStock === 0) {
      finalStock = 10;
    }

    const updated = await ProductModel.update(id, {
      stock: finalStock,
      sizes: JSON.stringify(parsedSizesMap)
    });

    return res.json({
      success: true,
      message: `Product stock updated to ${finalStock} units (${finalStock > 0 ? 'In Stock' : 'Out of Stock'}).`,
      data: formatProduct(updated)
    });
  } catch (error) {
    console.error('Update product stock error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update stock and availability.' });
  }
};

/**
 * DELETE /api/admin/products/:id
 * Remove perfume product from catalogue
 */
export const deleteAdminProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ProductModel.delete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.json({
      success: true,
      message: 'Product removed from catalogue successfully.'
    });
  } catch (error) {
    console.error('Admin delete product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};

/* ==========================================================================
   9.2 BANNER MANAGEMENT
   • Upload and update homepage promotional banners.
   • Highlight featured collections, new arrivals, and special offers.
   • Manage banner content and destination links.
   • Update promotional content without modifying application code for routine changes.
   ========================================================================== */

/**
 * GET /api/admin/banners
 * View all homepage promotional banners
 */
export const getAdminBanners = async (req, res) => {
  try {
    const banners = await BannerModel.findAllAdmin();
    return res.json({
      success: true,
      data: banners
    });
  } catch (error) {
    console.error('Admin get banners error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch banners.' });
  }
};

/**
 * POST /api/admin/banners
 * Upload and create promotional banners
 */
export const createAdminBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      badge,
      highlightType,
      image,
      mobileImage,
      linkUrl,
      buttonText,
      isActive,
      displayOrder,
      startDate,
      endDate
    } = req.body;

    let bannerImageUrl = image;
    let bannerMobileImageUrl = mobileImage || '';

    if (req.files && req.files.length > 0) {
      bannerImageUrl = `/uploads/${req.files[0].filename}`;
      if (req.files[1]) {
        bannerMobileImageUrl = `/uploads/${req.files[1].filename}`;
      }
    } else if (req.file) {
      bannerImageUrl = `/uploads/${req.file.filename}`;
    }

    if (!bannerImageUrl) {
      return res.status(400).json({ success: false, message: 'Banner image is required.' });
    }

    const banner = await BannerModel.create({
      title,
      subtitle: subtitle || '',
      badge: badge || 'EXCLUSIVE',
      highlightType: highlightType || 'hero',
      image: bannerImageUrl,
      mobileImage: bannerMobileImageUrl,
      linkUrl: linkUrl || '/shop',
      buttonText: buttonText || 'EXPLORE COLLECTION',
      isActive: isActive === undefined ? true : (isActive === 'true' || isActive === true),
      displayOrder: displayOrder ? parseInt(displayOrder, 10) : 0,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    });

    return res.status(201).json({
      success: true,
      message: 'Promotional banner created successfully.',
      data: banner
    });
  } catch (error) {
    console.error('Admin create banner error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create banner.' });
  }
};

/**
 * PUT /api/admin/banners/:id
 * Update banner content, links, and highlighted collections without code modifications
 */
export const updateAdminBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      badge,
      highlightType,
      image,
      mobileImage,
      linkUrl,
      buttonText,
      isActive,
      displayOrder,
      startDate,
      endDate
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (badge !== undefined) updateData.badge = badge;
    if (highlightType !== undefined) updateData.highlightType = highlightType;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
    if (buttonText !== undefined) updateData.buttonText = buttonText;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder, 10);
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

    if (req.files && req.files.length > 0) {
      updateData.image = `/uploads/${req.files[0].filename}`;
      if (req.files[1]) {
        updateData.mobileImage = `/uploads/${req.files[1].filename}`;
      }
    } else if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    } else {
      if (image !== undefined) updateData.image = image;
      if (mobileImage !== undefined) updateData.mobileImage = mobileImage;
    }

    const updated = await BannerModel.update(id, updateData);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }

    return res.json({
      success: true,
      message: 'Banner updated successfully.',
      data: updated
    });
  } catch (error) {
    console.error('Admin update banner error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update banner.' });
  }
};

/**
 * PATCH /api/admin/banners/:id/toggle
 * Toggle banner active visibility status
 */
export const toggleBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await BannerModel.findById(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    return res.json({
      success: true,
      message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: banner
    });
  } catch (error) {
    console.error('Toggle banner status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle banner status.' });
  }
};

/**
 * DELETE /api/admin/banners/:id
 * Remove promotional banner
 */
export const deleteAdminBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BannerModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }

    return res.json({
      success: true,
      message: 'Banner deleted successfully.'
    });
  } catch (error) {
    console.error('Admin delete banner error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete banner.' });
  }
};

/**
 * GET /api/banners (Public)
 * Get active promotional banners for homepage showcase
 */
export const getPublicBanners = async (req, res) => {
  try {
    const { highlightType } = req.query;
    const banners = await BannerModel.findActive(highlightType);
    return res.json({
      success: true,
      data: banners
    });
  } catch (error) {
    console.error('Get public banners error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch promotional banners.' });
  }
};

/* ==========================================================================
   9.3 ORDER MANAGEMENT
   • View customer orders and associated details.
   • Monitor order and payment statuses.
   • Update order processing and delivery information.
   • Access customer and delivery details for fulfilment.
   ========================================================================== */

/**
 * GET /api/admin/orders
 * View customer orders with filterable criteria (status, paymentStatus, date, search)
 */
export const getAdminOrders = async (req, res) => {
  try {
    const { status, paymentStatus, search, startDate, endDate, isGift, page, limit } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    if (isGift !== undefined) {
      query.isGift = isGift === 'true' || isGift === true;
    }

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customer_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user_id', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query)
    ]);

    const formattedOrders = orders.map(o => ({
      _id: o._id.toString(),
      id: o._id.toString(),
      orderId: o.orderId || `#ORD-${o._id.toString().slice(-4).toUpperCase()}`,
      customerName: o.customer_name || (o.user_id ? o.user_id.name : 'Valued Customer'),
      email: o.email || (o.user_id ? o.user_id.email : ''),
      phone: o.phone || '',
      address: o.address || '',
      itemsCount: (o.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0),
      items: o.items || [],
      subtotal: o.subtotal || 0,
      discountAmount: o.discountAmount || 0,
      total_amount: o.total_amount,
      status: o.status,
      paymentMethod: o.paymentMethod || 'Razorpay',
      paymentStatus: o.paymentStatus || 'Pending',
      isGift: Boolean(o.isGift),
      giftRecipient: o.giftRecipient || null,
      giftMessage: o.giftMessage || '',
      giftFulfillment: o.giftFulfillment || null,
      tracking: o.tracking || null,
      createdAt: o.createdAt
    }));

    return res.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          total,
          page: pageNum,
          totalPages: Math.ceil(total / limitNum),
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Admin get orders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch customer orders.' });
  }
};

/**
 * GET /api/admin/orders/:id
 * Access customer and delivery details for fulfilment
 */
export const getAdminOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    let order;

    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).populate('user_id', 'name email').lean();
    }
    if (!order) {
      order = await Order.findOne({ orderId: id }).populate('user_id', 'name email').lean();
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({
      success: true,
      data: {
        ...order,
        _id: order._id.toString(),
        id: order._id.toString(),
        orderId: order.orderId || `#ORD-${order._id.toString().slice(-4).toUpperCase()}`
      }
    });
  } catch (error) {
    console.error('Admin get order by ID error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order details.' });
  }
};

/**
 * PUT /api/admin/orders/:id/status
 * Update order processing and delivery information (status, courier tracking, hub location)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      paymentStatus,
      courierName,
      trackingNumber,
      trackingUrl,
      currentLocation,
      estimatedDelivery,
      statusNote
    } = req.body;

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).populate('user_id', 'name email');
    }
    if (!order) {
      order = await Order.findOne({ orderId: id }).populate('user_id', 'name email');
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const previousStatus = order.status;

    if (status) {
      order.status = status;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    // Ensure tracking object initialized
    if (!order.tracking) {
      order.tracking = { history: [] };
    }

    if (courierName) order.tracking.courierName = courierName;
    if (trackingNumber) order.tracking.trackingNumber = trackingNumber;
    if (trackingUrl) order.tracking.trackingUrl = trackingUrl;
    if (currentLocation) order.tracking.currentLocation = currentLocation;
    if (estimatedDelivery) order.tracking.estimatedDelivery = new Date(estimatedDelivery);

    if (status === 'Shipped' && !order.tracking.dispatchedAt) {
      order.tracking.dispatchedAt = new Date();
    }
    if (status === 'Delivered' && !order.tracking.deliveredAt) {
      order.tracking.deliveredAt = new Date();
    }

    // Append history checkpoint
    order.tracking.history.push({
      stage: status || previousStatus,
      title: `Order ${status || previousStatus}`,
      description: statusNote || `Status updated to ${status || previousStatus} by atelier fulfillment.`,
      location: currentLocation || order.tracking.currentLocation || 'Maison Fulfillment Center, Mumbai',
      timestamp: new Date()
    });

    await order.save();

    // Trigger automated email notifications on major fulfillment milestones
    if (status === 'Shipped' && previousStatus !== 'Shipped') {
      emailService.sendShippingNotification(order).catch(err => {
        console.warn('⚠️ Auto shipping email dispatch failed:', err.message);
      });
    } else if (status === 'Delivered' && previousStatus !== 'Delivered') {
      emailService.sendDeliveryNotification(order).catch(err => {
        console.warn('⚠️ Auto delivery email dispatch failed:', err.message);
      });
    }

    return res.json({
      success: true,
      message: `Order status updated to ${order.status} successfully.`,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order processing status.' });
  }
};

/* ==========================================================================
   9.4 GIFT ORDER MANAGEMENT
   • Identify orders marked as gifts.
   • View personalized gift messages and recipient details.
   • Manage gift-related fulfilment information.
   ========================================================================== */

/**
 * GET /api/admin/gifts
 * View all orders identified as gifts with recipient details and messages
 */
export const getAdminGiftOrders = async (req, res) => {
  try {
    const { fulfillmentStatus, occasion, page, limit } = req.query;

    const query = { isGift: true };

    if (fulfillmentStatus) {
      query['giftFulfillment.status'] = fulfillmentStatus;
    }

    if (occasion) {
      query.occasion = { $regex: occasion, $options: 'i' };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [giftOrders, total] = await Promise.all([
      Order.find(query)
        .populate('user_id', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query)
    ]);

    const formatted = giftOrders.map(o => ({
      _id: o._id.toString(),
      id: o._id.toString(),
      orderId: o.orderId || `#ORD-${o._id.toString().slice(-4).toUpperCase()}`,
      senderName: o.customer_name || (o.user_id ? o.user_id.name : 'Valued Client'),
      senderEmail: o.email || (o.user_id ? o.user_id.email : ''),
      senderPhone: o.phone || '',
      isGift: true,
      occasion: o.occasion || 'Special Celebration',
      giftMessage: o.giftMessage || 'No personalized message provided',
      giftWrap: Boolean(o.giftWrap),
      giftRecipient: {
        name: o.giftRecipient?.name || 'Recipient',
        phone: o.giftRecipient?.phone || '',
        address: o.giftRecipient?.address || o.address || '',
        city: o.giftRecipient?.city || '',
        postalCode: o.giftRecipient?.postalCode || '',
        email: o.giftRecipient?.email || ''
      },
      giftFulfillment: o.giftFulfillment || {
        status: 'Pending Packaging',
        greetingCardPrinted: false,
        ribbonSealed: false,
        packagingNotes: ''
      },
      orderStatus: o.status,
      paymentStatus: o.paymentStatus,
      totalAmount: o.total_amount,
      items: o.items || [],
      createdAt: o.createdAt
    }));

    return res.json({
      success: true,
      data: {
        giftOrders: formatted,
        pagination: {
          total,
          page: pageNum,
          totalPages: Math.ceil(total / limitNum),
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Admin get gift orders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch gift orders.' });
  }
};

/**
 * PUT /api/admin/gifts/:id/fulfillment
 * Manage gift-related fulfilment information (packaging, gift cards, ribbon sealing)
 */
export const updateGiftFulfillment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, greetingCardPrinted, ribbonSealed, packagingNotes } = req.body;

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderId: id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Gift order not found.' });
    }

    if (!order.isGift) {
      return res.status(400).json({ success: false, message: 'This order is not designated as a gift.' });
    }

    if (!order.giftFulfillment) {
      order.giftFulfillment = {};
    }

    if (status) order.giftFulfillment.status = status;
    if (greetingCardPrinted !== undefined) order.giftFulfillment.greetingCardPrinted = greetingCardPrinted;
    if (ribbonSealed !== undefined) order.giftFulfillment.ribbonSealed = ribbonSealed;
    if (packagingNotes !== undefined) order.giftFulfillment.packagingNotes = packagingNotes;
    order.giftFulfillment.updatedAt = new Date();

    // If gift is ready for dispatch, update tracking checkpoint
    if (status === 'Ready for Dispatch' || status === 'Dispatched') {
      if (order.tracking && order.tracking.history) {
        order.tracking.history.push({
          stage: 'Gift Packaging Complete',
          title: 'Handcrafted Packaging Complete',
          description: `Presentation box sealed and personalized card prepared for ${order.giftRecipient?.name || 'recipient'}.`,
          location: 'Atelier Packaging Suite, Mumbai',
          timestamp: new Date()
        });
      }
    }

    await order.save();

    return res.json({
      success: true,
      message: 'Gift order fulfillment details updated successfully.',
      data: {
        orderId: order.orderId,
        giftFulfillment: order.giftFulfillment
      }
    });
  } catch (error) {
    console.error('Update gift fulfillment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update gift fulfillment details.' });
  }
};

/* ==========================================================================
   9.5 REVIEW MANAGEMENT
   • View and moderate submitted reviews.
   • Manage review visibility.
   • Monitor customer feedback and product ratings.
   ========================================================================== */

/**
 * GET /api/admin/reviews
 * View customer reviews with moderation filters
 */
export const getAdminReviews = async (req, res) => {
  try {
    const { status, rating, productId, page, limit } = req.query;

    const query = {};
    if (status) query.status = status;
    if (rating) query.rating = Number(rating);
    if (productId && mongoose.Types.ObjectId.isValid(productId)) query.productId = productId;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('productId', 'name slug image')
        .populate('user_id', 'name email')
        .populate('moderatedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Review.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: {
        reviews: reviews.map(r => ({
          _id: r._id.toString(),
          id: r._id.toString(),
          product: r.productId ? {
            id: r.productId._id.toString(),
            name: r.productId.name,
            slug: r.productId.slug,
            image: r.productId.image
          } : null,
          customerName: r.customerName,
          customerEmail: r.customerEmail,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          status: r.status,
          isVisible: r.isVisible,
          isVerifiedPurchase: Boolean(r.isVerifiedPurchase),
          moderatedBy: r.moderatedBy ? r.moderatedBy.name : null,
          moderatedAt: r.moderatedAt,
          createdAt: r.createdAt
        })),
        pagination: {
          total,
          page: pageNum,
          totalPages: Math.ceil(total / limitNum),
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Admin get reviews error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch customer reviews.' });
  }
};

/**
 * PUT /api/admin/reviews/:id/moderate
 * Moderate submitted reviews and manage visibility
 */
export const moderateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isVisible } = req.body;
    const adminId = req.user ? (req.user._id || req.user.id) : null;

    const updated = await ReviewModel.moderate(id, {
      status,
      isVisible,
      adminId
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    return res.json({
      success: true,
      message: `Review ${status || (isVisible ? 'published' : 'hidden')} successfully.`,
      data: updated
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    return res.status(500).json({ success: false, message: 'Failed to moderate review.' });
  }
};

/**
 * DELETE /api/admin/reviews/:id
 * Remove inappropriate or spam review
 */
export const deleteAdminReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ReviewModel.delete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    return res.json({
      success: true,
      message: 'Review deleted and product ratings recalculated.'
    });
  } catch (error) {
    console.error('Admin delete review error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
};

/**
 * GET /api/admin/reviews/stats
 * Monitor customer feedback and product ratings distribution
 */
export const getReviewStats = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    const approvedReviews = await Review.countDocuments({ status: 'approved' });
    const pendingReviews = await Review.countDocuments({ status: 'pending' });
    const rejectedReviews = await Review.countDocuments({ status: 'rejected' });

    // Rating star distribution
    const ratingDistributionAgg = await Review.aggregate([
      { $match: { status: 'approved', isVisible: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistributionAgg.forEach(r => {
      if (distribution[r._id] !== undefined) {
        distribution[r._id] = r.count;
      }
    });

    // Average overall rating
    const avgRatingAgg = await Review.aggregate([
      { $match: { status: 'approved', isVisible: true } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    const overallAvgRating = avgRatingAgg.length > 0 ? Math.round(avgRatingAgg[0].avg * 10) / 10 : 5.0;

    return res.json({
      success: true,
      data: {
        totalReviews,
        approvedReviews,
        pendingReviews,
        rejectedReviews,
        overallAvgRating,
        ratingDistribution: distribution
      }
    });
  } catch (error) {
    console.error('Review stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch review statistics.' });
  }
};

/**
 * GET /api/products/:id/reviews (Public)
 * View approved and visible reviews for a product
 */
export const getProductReviews = async (req, res) => {
  try {
    const { id } = req.params;
    let productId = id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const prod = await Product.findOne({ slug: id });
      if (!prod) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      productId = prod._id;
    }

    const reviews = await ReviewModel.findApprovedByProduct(productId);

    return res.json({
      success: true,
      data: {
        reviews,
        total: reviews.length
      }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
};

/**
 * POST /api/products/:id/reviews (Public/Authenticated)
 * Submit customer review and feedback for a fragrance
 */
export const submitProductReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, customerName, customerEmail } = req.body;

    let productId = id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const prod = await Product.findOne({ slug: id });
      if (!prod) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      productId = prod._id;
    }

    const userId = req.user ? (req.user._id || req.user.id) : null;
    const name = customerName || (req.user ? req.user.name : 'Perfume Connoisseur');
    const email = customerEmail || (req.user ? req.user.email : '');

    // Check if user has purchased this product
    let isVerifiedPurchase = false;
    if (userId) {
      const purchaseCount = await Order.countDocuments({
        user_id: userId,
        'items.productId': productId,
        paymentStatus: 'Paid'
      });
      isVerifiedPurchase = purchaseCount > 0;
    }

    const review = await ReviewModel.create({
      productId,
      user_id: userId,
      customerName: name,
      customerEmail: email,
      rating: Number(rating),
      title: title || '',
      comment,
      status: 'approved', // Auto-approved by default for smooth experience; admin can moderate anytime
      isVisible: true,
      isVerifiedPurchase
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for sharing your olfactory review.',
      data: review
    });
  } catch (error) {
    console.error('Submit review error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};
