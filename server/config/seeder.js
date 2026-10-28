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
    // 1. Seed or verify default administrator account
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@roveandamber.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    const existingAdmin = await User.findOne({
      email: { $in: [adminEmail.toLowerCase(), 'admin@roveandamber.com', 'admin@zyra.com'] }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log(`✨ Seeded default admin account: ${adminEmail}`);
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
