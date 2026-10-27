import mongoose from 'mongoose';

/**
 * Validates product creation & update inputs
 */
export const validateProductInput = (req, res, next) => {
  const { name, price, stock, sizes, gender, fragranceFamily } = req.body;

  // On create (POST), name and price are mandatory
  if (req.method === 'POST') {
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required.'
      });
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid non-negative product price is required.'
      });
    }
  }

  // Price validation if provided
  if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Product price must be a non-negative number.'
    });
  }

  // Stock validation if provided
  if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Product stock must be a non-negative number.'
    });
  }

  // Gender validation if provided
  if (gender && !['him', 'her', 'unisex', 'men', 'women'].includes(gender.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: 'Gender must be one of: him, her, unisex.'
    });
  }

  // Sizes parsing validation if provided as string
  if (sizes && typeof sizes === 'string') {
    try {
      const parsed = JSON.parse(sizes);
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error();
      }
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Product sizes must be a valid JSON key-value map (e.g. {"50ml": 10, "100ml": 5}).'
      });
    }
  }

  next();
};

/**
 * Validates product stock and availability updates
 */
export const validateProductStockUpdate = (req, res, next) => {
  const { stock, sizes, status } = req.body;

  if (stock === undefined && !sizes && !status) {
    return res.status(400).json({
      success: false,
      message: 'Provide at least stock quantity, sizes map, or availability status to update.'
    });
  }

  if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Stock must be a non-negative number.'
    });
  }

  if (status && !['In Stock', 'Out of Stock', 'Discontinued'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be "In Stock", "Out of Stock", or "Discontinued".'
    });
  }

  next();
};

/**
 * Validates promotional banner creation and update inputs
 */
export const validateBannerInput = (req, res, next) => {
  const { title, image, highlightType, linkUrl } = req.body;

  if (req.method === 'POST') {
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Banner title is required.'
      });
    }

    // Require image URL or an uploaded file
    const hasUploadedFile = req.file || (req.files && req.files.length > 0);
    if (!image && !hasUploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'Banner image or file upload is required.'
      });
    }
  }

  if (highlightType) {
    const validTypes = ['hero', 'featured_collection', 'new_arrival', 'special_offer', 'seasonal'];
    if (!validTypes.includes(highlightType)) {
      return res.status(400).json({
        success: false,
        message: `highlightType must be one of: ${validTypes.join(', ')}`
      });
    }
  }

  next();
};

/**
 * Validates order processing status and courier tracking update
 */
export const validateOrderStatusUpdate = (req, res, next) => {
  const { status, paymentStatus, courierName, trackingNumber, currentLocation } = req.body;

  const validStatuses = [
    'Pending',
    'Processing',
    'Confirmed',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Return Requested',
    'Returned'
  ];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid order status. Allowed: ${validStatuses.join(', ')}`
    });
  }

  if (paymentStatus && !['Pending', 'Paid', 'Failed', 'Refunded'].includes(paymentStatus)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment status. Allowed: Pending, Paid, Failed, Refunded'
    });
  }

  next();
};

/**
 * Validates gift fulfillment updates
 */
export const validateGiftFulfillmentUpdate = (req, res, next) => {
  const { status, greetingCardPrinted, ribbonSealed } = req.body;

  const validStatuses = [
    'Pending Packaging',
    'Box Handcrafted & Wrapped',
    'Card Handwritten',
    'Ready for Dispatch',
    'Dispatched'
  ];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid gift fulfillment status. Allowed: ${validStatuses.join(', ')}`
    });
  }

  if (greetingCardPrinted !== undefined && typeof greetingCardPrinted !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'greetingCardPrinted must be a boolean.'
    });
  }

  if (ribbonSealed !== undefined && typeof ribbonSealed !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'ribbonSealed must be a boolean.'
    });
  }

  next();
};

/**
 * Validates review moderation inputs
 */
export const validateReviewModeration = (req, res, next) => {
  const { status, isVisible } = req.body;

  if (status && !['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Review moderation status must be "pending", "approved", or "rejected".'
    });
  }

  if (isVisible !== undefined && typeof isVisible !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isVisible must be a boolean.'
    });
  }

  if (status === undefined && isVisible === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Provide status or isVisible to update review moderation.'
    });
  }

  next();
};

/**
 * Validates public review submission
 */
export const validateReviewSubmission = (req, res, next) => {
  const { productId, rating, comment, customerName } = req.body;

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({
      success: false,
      message: 'A valid product ID is required for the review.'
    });
  }

  if (!customerName || !customerName.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Customer name is required.'
    });
  }

  if (rating === undefined || isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be an integer between 1 and 5.'
    });
  }

  if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
    return res.status(400).json({
      success: false,
      message: 'Review comment must be at least 5 characters long.'
    });
  }

  next();
};
