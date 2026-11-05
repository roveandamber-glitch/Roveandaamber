import mongoose from 'mongoose';
import { Review, ReviewModel } from '../../models/reviewModel.js';
import { Product, ProductModel } from '../../models/productModel.js';
import { Order } from '../../models/orderModel.js';

/**
 * Public: Get approved reviews with product details for customer testimonials (Homepage / Global)
 */
export const getPublicReviews = async (req, res) => {
  try {
    const { productId, sort, rating } = req.query;

    // If productId query param is provided, redirect logic to getProductReviews
    if (productId) {
      return getProductReviews(req, res);
    }

    const reviews = await Review.find({ status: 'approved', isVisible: true })
      .populate('productId', 'name slug image price rating')
      .sort({ rating: -1, createdAt: -1 })
      .limit(12);

    const formatted = reviews.map(r => {
      const prod = r.productId;
      return {
        id: r._id.toString(),
        _id: r._id.toString(),
        author: r.customerName || 'Fragrance Enthusiast',
        customerName: r.customerName || 'Fragrance Enthusiast',
        rating: r.rating || 5,
        title: r.title || '',
        quote: r.comment || '',
        comment: r.comment || '',
        isVerified: r.isVerifiedPurchase ?? true,
        isVerifiedPurchase: r.isVerifiedPurchase ?? true,
        date: r.createdAt,
        createdAt: r.createdAt,
        product: prod ? {
          id: prod._id ? prod._id.toString() : prod.toString(),
          _id: prod._id ? prod._id.toString() : prod.toString(),
          name: prod.name || 'Artisan Perfume',
          slug: prod.slug || '',
          image: prod.image || '',
          price: prod.price || 0
        } : null
      };
    });

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Failed to get public reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve reviews'
    });
  }
};

/**
 * Public: Get approved reviews for a specific product by ID or Slug
 */
export const getProductReviews = async (req, res) => {
  try {
    const productId = req.params.productId || req.query.productId;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product identifier is required.'
      });
    }

    // Resolve product by ID or Slug
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const targetProductId = product._id;

    // Query filters
    const query = {
      productId: targetProductId,
      status: 'approved',
      isVisible: true
    };

    if (req.query.rating) {
      const ratingFilter = parseInt(req.query.rating, 10);
      if (!isNaN(ratingFilter) && ratingFilter >= 1 && ratingFilter <= 5) {
        query.rating = ratingFilter;
      }
    }

    // Sort order
    let sortCriteria = { createdAt: -1 };
    if (req.query.sort === 'highest') {
      sortCriteria = { rating: -1, createdAt: -1 };
    } else if (req.query.sort === 'lowest') {
      sortCriteria = { rating: 1, createdAt: -1 };
    } else if (req.query.sort === 'oldest') {
      sortCriteria = { createdAt: 1 };
    }

    const [reviews, allApprovedReviews] = await Promise.all([
      Review.find(query).sort(sortCriteria),
      Review.find({ productId: targetProductId, status: 'approved', isVisible: true })
    ]);

    // Calculate rating breakdown & statistics
    const totalCount = allApprovedReviews.length;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sumRating = 0;
    let recommendCount = 0;

    allApprovedReviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      ratingCounts[star] = (ratingCounts[star] || 0) + 1;
      sumRating += Number(r.rating) || 5;
      if (r.rating >= 4) {
        recommendCount += 1;
      }
    });

    const averageRating = totalCount > 0 
      ? Math.round((sumRating / totalCount) * 10) / 10 
      : (product.rating || 5.0);

    const ratingPercentages = {
      5: totalCount > 0 ? Math.round((ratingCounts[5] / totalCount) * 100) : 0,
      4: totalCount > 0 ? Math.round((ratingCounts[4] / totalCount) * 100) : 0,
      3: totalCount > 0 ? Math.round((ratingCounts[3] / totalCount) * 100) : 0,
      2: totalCount > 0 ? Math.round((ratingCounts[2] / totalCount) * 100) : 0,
      1: totalCount > 0 ? Math.round((ratingCounts[1] / totalCount) * 100) : 0
    };

    const recommendPercentage = totalCount > 0 
      ? Math.round((recommendCount / totalCount) * 100) 
      : 100;

    const formattedReviews = reviews.map(r => ({
      id: r._id.toString(),
      _id: r._id.toString(),
      productId: r.productId.toString(),
      userId: r.user_id ? r.user_id.toString() : null,
      user_id: r.user_id ? r.user_id.toString() : null,
      customerName: r.customerName || 'Fragrance Enthusiast',
      customerEmail: r.customerEmail || '',
      rating: r.rating,
      title: r.title || '',
      comment: r.comment || '',
      isVerifiedPurchase: Boolean(r.isVerifiedPurchase),
      createdAt: r.createdAt,
      date: r.createdAt
    }));

    return res.json({
      success: true,
      count: formattedReviews.length,
      stats: {
        totalReviews: totalCount,
        averageRating,
        ratingCounts,
        ratingPercentages,
        recommendPercentage
      },
      data: formattedReviews
    });
  } catch (error) {
    console.error('Failed to get product reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve product reviews.'
    });
  }
};

/**
 * Customer / Guest: Add a new review for a product
 */
export const createProductReview = async (req, res) => {
  try {
    const productId = req.params.productId || req.body.productId;
    const { rating, title, comment, customerName, customerEmail } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.'
      });
    }

    const numericRating = Number(rating);
    if (!numericRating || isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5 stars.'
      });
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Review comment must be at least 3 characters long.'
      });
    }

    // Resolve target product
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Determine user identity
    let userId = null;
    let reviewerName = (customerName || '').trim();
    let reviewerEmail = (customerEmail || '').trim().toLowerCase();
    let isVerified = false;

    if (req.user) {
      userId = req.user._id || req.user.id;
      if (!reviewerName) reviewerName = req.user.name || 'Valued Fragrance Connoisseur';
      if (!reviewerEmail) reviewerEmail = req.user.email || '';

      // Check verified purchase from Order history
      try {
        const orderMatch = await Order.findOne({
          user_id: userId,
          $or: [
            { 'items.productId': product._id },
            { 'items.product_id': String(product._id) },
            { 'items.name': new RegExp(`^${product.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
          ],
          status: { $nin: ['Cancelled'] }
        });
        if (orderMatch) {
          isVerified = true;
        }
      } catch (err) {
        console.warn('Order verification lookup error:', err);
      }
    } else {
      if (!reviewerName) {
        reviewerName = 'Fragrance Enthusiast';
      }
    }

    // Create review with auto-approved status for immediate customer display
    const newReview = await Review.create({
      productId: product._id,
      user_id: userId,
      customerName: reviewerName,
      customerEmail: reviewerEmail,
      rating: numericRating,
      title: (title || '').trim(),
      comment: comment.trim(),
      status: 'approved',
      isVisible: true,
      isVerifiedPurchase: isVerified
    });

    // Synchronize rating and review count on product
    await Review.syncProductRating(product._id);

    // Fetch updated product data
    const updatedProduct = await Product.findById(product._id).select('rating reviewsCount');

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your fragrance review has been published.',
      data: {
        id: newReview._id.toString(),
        _id: newReview._id.toString(),
        productId: newReview.productId.toString(),
        userId: newReview.user_id ? newReview.user_id.toString() : null,
        user_id: newReview.user_id ? newReview.user_id.toString() : null,
        customerName: newReview.customerName,
        customerEmail: newReview.customerEmail,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        isVerifiedPurchase: newReview.isVerifiedPurchase,
        createdAt: newReview.createdAt,
        date: newReview.createdAt
      },
      updatedProduct: {
        rating: updatedProduct?.rating || numericRating,
        reviewsCount: updatedProduct?.reviewsCount || 1
      }
    });
  } catch (error) {
    console.error('Create product review error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit review.'
    });
  }
};

/**
 * Customer: Delete own review (or admin can delete any review)
 */
export const deleteUserReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID.'
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    const currentUserId = req.user ? String(req.user._id || req.user.id) : null;
    const isOwner = review.user_id && String(review.user_id) === currentUserId;
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review.'
      });
    }

    const targetProductId = review.productId;
    await Review.findByIdAndDelete(id);
    await Review.syncProductRating(targetProductId);

    const updatedProduct = await Product.findById(targetProductId).select('rating reviewsCount');

    return res.json({
      success: true,
      message: 'Review deleted successfully.',
      updatedProduct: {
        rating: updatedProduct?.rating || 5.0,
        reviewsCount: updatedProduct?.reviewsCount || 0
      }
    });
  } catch (error) {
    console.error('Delete user review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete review.'
    });
  }
};

