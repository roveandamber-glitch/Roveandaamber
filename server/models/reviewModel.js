import mongoose from 'mongoose';
import { Product } from './productModel.js';

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    customerEmail: {
      type: String,
      trim: true,
      default: ''
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
      index: true
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved', // Auto-approves initial verified reviews, pending when flagged
      index: true
    },
    isVisible: {
      type: Boolean,
      default: true,
      index: true
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    moderatedAt: {
      type: Date,
      default: null
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

reviewSchema.virtual('id').get(function () {
  return this._id ? this._id.toString() : null;
});

// Calculate and synchronize product average rating and count
reviewSchema.statics.syncProductRating = async function (productId) {
  if (!mongoose.Types.ObjectId.isValid(productId)) return;

  const stats = await this.aggregate([
    {
      $match: {
        productId: new mongoose.Types.ObjectId(productId),
        status: 'approved',
        isVisible: true
      }
    },
    {
      $group: {
        _id: '$productId',
        avgRating: { $avg: '$rating' },
        reviewsCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    const roundedRating = Math.round(stats[0].avgRating * 10) / 10;
    await Product.findByIdAndUpdate(productId, {
      rating: roundedRating,
      reviewsCount: stats[0].reviewsCount
    });
  }
};

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export const ReviewModel = {
  findApprovedByProduct: async (productId) => {
    if (!mongoose.Types.ObjectId.isValid(productId)) return [];
    return Review.find({
      productId,
      status: 'approved',
      isVisible: true
    }).sort({ createdAt: -1 });
  },

  findAllAdmin: async ({ status, rating, productId } = {}) => {
    const query = {};
    if (status) query.status = status;
    if (rating) query.rating = Number(rating);
    if (productId && mongoose.Types.ObjectId.isValid(productId)) query.productId = productId;

    return Review.find(query)
      .populate('productId', 'name slug image')
      .populate('user_id', 'name email')
      .sort({ createdAt: -1 });
  },

  findById: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Review.findById(id).populate('productId', 'name slug image');
  },

  create: async (data) => {
    const review = await Review.create(data);
    await Review.syncProductRating(review.productId);
    return review;
  },

  moderate: async (id, { status, isVisible, adminId }) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const review = await Review.findById(id);
    if (!review) return null;

    if (status) review.status = status;
    if (isVisible !== undefined) review.isVisible = isVisible;
    review.moderatedBy = adminId || null;
    review.moderatedAt = new Date();

    await review.save();
    await Review.syncProductRating(review.productId);
    return review;
  },

  delete: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const review = await Review.findById(id);
    if (!review) return false;
    const pid = review.productId;
    await Review.findByIdAndDelete(id);
    await Review.syncProductRating(pid);
    return true;
  },

  seedDefaultReviews: async () => {
    const count = await Review.countDocuments();
    if (count === 0) {
      const amberOud = await Product.findOne({ slug: 'amber-oud' });
      const goldenSaffron = await Product.findOne({ slug: 'golden-saffron' });

      if (amberOud) {
        await Review.create({
          productId: amberOud._id,
          customerName: 'Kabir Singhania',
          customerEmail: 'kabir@example.com',
          rating: 5,
          title: 'Unrivaled Sillage and Richness',
          comment: 'The opening smoky oud blends seamlessly into radiant amber. Lasts over 14 hours on skin. True haute perfumerie.',
          status: 'approved',
          isVisible: true,
          isVerifiedPurchase: true
        });
        await Review.create({
          productId: amberOud._id,
          customerName: 'Dr. Alistair Vance',
          customerEmail: 'alistair@example.com',
          rating: 5,
          title: 'Masterpiece of Modern Oriental Scents',
          comment: 'A magnificent flacon. The magnetic cap and velvet presentation coffret make this feel completely bespoke.',
          status: 'approved',
          isVisible: true,
          isVerifiedPurchase: true
        });
        await Review.syncProductRating(amberOud._id);
      }

      if (goldenSaffron) {
        await Review.create({
          productId: goldenSaffron._id,
          customerName: 'Meera Deshmukh',
          customerEmail: 'meera@example.com',
          rating: 5,
          title: 'Golden Sunlight in a Flacon',
          comment: 'Kashmiri saffron and ambergris create an aura that draws compliments everywhere I go. My signature scent forever.',
          status: 'approved',
          isVisible: true,
          isVerifiedPurchase: true
        });
        await Review.syncProductRating(goldenSaffron._id);
      }
      console.log('✨ Seeded default customer reviews and synchronized product ratings');
    }
  }
};

export default Review;
