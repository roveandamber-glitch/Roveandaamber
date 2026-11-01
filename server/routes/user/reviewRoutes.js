import express from 'express';
import { Review } from '../../models/reviewModel.js';

const router = express.Router();

/**
 * Public: Get approved reviews with product details for customer testimonials
 */
router.get('/', async (req, res) => {
  try {
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
        rating: r.rating || 5,
        title: r.title || '',
        quote: r.comment || '',
        isVerified: r.isVerifiedPurchase ?? true,
        date: r.createdAt,
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
});

export default router;

