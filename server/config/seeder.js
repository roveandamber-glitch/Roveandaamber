import bcrypt from 'bcryptjs';
import { User } from '../models/userModel.js';
import { Category } from '../models/categoryModel.js';
import { Product } from '../models/productModel.js';
import { CouponModel } from '../models/couponModel.js';
import { BannerModel } from '../models/bannerModel.js';
import { ReviewModel } from '../models/reviewModel.js';
import { InventoryModel } from '../models/inventoryModel.js';
import { luxuryCategories, initialPerfumes } from './seedData.js';

/**
 * Orchestrates all initial data seeding for ROVE & AMBER
 */
export const seedDatabase = async () => {
  try {
    // 1. Verify administrator account in database
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log(`✨ Verified active administrator account in database: ${existingAdmin.email}`);
    } else {
      console.log('ℹ️ Administrator accounts are managed directly via backend MongoDB database.');
    }

    // 2. Seed default categories if empty
    const categoryCount = await Category.countDocuments();
    const categoriesMap = {};

    if (categoryCount === 0) {
      for (const cat of luxuryCategories) {
        const createdCat = await Category.create(cat);
        categoriesMap[cat.name] = createdCat._id;
      }
      console.log('✨ Seeded default luxury perfume categories');
    } else {
      const allCategories = await Category.find().lean();
      for (const cat of allCategories) {
        categoriesMap[cat.name] = cat._id;
      }
    }

    // 3. Seed initial perfume catalog if empty or missing fragrance data
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      for (const p of initialPerfumes) {
        const catId = categoriesMap[p.categoryName] || null;
        await Product.create({
          ...p,
          category_id: catId
        });
      }
      console.log(`✨ Seeded ${initialPerfumes.length} initial luxury perfume creations into catalogue`);
    }

    // 4. Seed default promotional luxury coupons
    await CouponModel.seedDefaultCoupons();

    // 5. Seed default promotional luxury banners
    await BannerModel.seedDefaultBanners();

    // 6. Seed default customer reviews and sync perfume ratings
    await ReviewModel.seedDefaultReviews();

    // 7. Seed initial inventory movements and audit history
    await InventoryModel.seedDefaultInventoryHistory();
  } catch (error) {
    console.warn('⚠️ [Database Seeder Notice]:', error.message);
  }
};

export default seedDatabase;
