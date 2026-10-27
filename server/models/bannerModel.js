import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true
    },
    subtitle: {
      type: String,
      default: '',
      trim: true
    },
    badge: {
      type: String,
      default: 'LIMITED EDITION',
      trim: true
    },
    highlightType: {
      type: String,
      enum: ['hero', 'featured_collection', 'new_arrival', 'special_offer', 'seasonal'],
      default: 'hero'
    },
    image: {
      type: String,
      required: [true, 'Banner image URL is required'],
      trim: true
    },
    mobileImage: {
      type: String,
      default: '',
      trim: true
    },
    linkUrl: {
      type: String,
      default: '/shop',
      trim: true
    },
    buttonText: {
      type: String,
      default: 'EXPLORE COLLECTION',
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
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

bannerSchema.virtual('id').get(function () {
  return this._id ? this._id.toString() : null;
});

export const Banner = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);

export const BannerModel = {
  findActive: async (highlightType = null) => {
    const now = new Date();
    const query = {
      isActive: true,
      $or: [
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: { $gte: now } }
      ]
    };

    if (highlightType) {
      query.highlightType = highlightType;
    }

    return Banner.find(query).sort({ displayOrder: 1, createdAt: -1 });
  },

  findAllAdmin: async () => {
    return Banner.find().sort({ displayOrder: 1, createdAt: -1 });
  },

  findById: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Banner.findById(id);
  },

  create: async (data) => {
    return Banner.create(data);
  },

  update: async (id, data) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Banner.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  delete: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await Banner.findByIdAndDelete(id);
    return !!result;
  },

  seedDefaultBanners: async () => {
    const count = await Banner.countDocuments();
    if (count === 0) {
      const defaultBanners = [
        {
          title: 'Imperial Oud & Golden Amber',
          subtitle: 'Pure Cambodian wild oud steeped with aged resins and Turkish damask rose.',
          badge: 'NEW ARRIVAL',
          highlightType: 'hero',
          image: '/images/perfumes/hero_desert_fragrance.jpg',
          linkUrl: '/product/amber-oud',
          buttonText: 'DISCOVER AMBER OUD',
          displayOrder: 1,
          isActive: true
        },
        {
          title: 'The Signature Coffrets',
          subtitle: 'Curated flacons housed in hand-embossed gold and velvet presentation cases.',
          badge: 'FEATURED COLLECTION',
          highlightType: 'featured_collection',
          image: '/images/perfumes/signature_collection.jpg',
          linkUrl: '/products/gifts',
          buttonText: 'VIEW GIFT SETS',
          displayOrder: 2,
          isActive: true
        },
        {
          title: 'Festive Grandeur Offer',
          subtitle: 'Enjoy 20% off on signature fragrances with promotional code AMBER20.',
          badge: 'SPECIAL OFFER',
          highlightType: 'special_offer',
          image: '/images/perfumes/liquid_gold_perfume.jpg',
          linkUrl: '/shop?sort=popularity',
          buttonText: 'SHOP FESTIVE OFFER',
          displayOrder: 3,
          isActive: true
        }
      ];

      for (const b of defaultBanners) {
        await Banner.create(b);
      }
      console.log('✨ Seeded default promotional luxury banners');
    }
  }
};

export default Banner;
