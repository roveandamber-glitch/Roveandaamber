import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/userModel.js';
import { Category } from '../models/categoryModel.js';
import { Product } from '../models/productModel.js';

dotenv.config();

let rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Roveandamber';
if (rawUri.includes('<username>') || rawUri.includes('<password>')) {
  console.warn('⚠️ [MongoDB]: Placeholder credentials detected in MONGODB_URI.');
  console.warn('🔄 Falling back to local MongoDB at mongodb://127.0.0.1:27017/Roveandamber');
  rawUri = 'mongodb://127.0.0.1:27017/Roveandamber';
}

const MONGODB_URI = rawUri;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      dbName: 'Roveandamber'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

// Seed default accounts, categories, and products if the database is newly initialized
export const initDB = async () => {
  try {
    await connectDB();

    // 1. Seed or verify default admin account
    const existingAdmin = await User.findOne({ 
      email: { $in: ['admin@roveandamber.com', 'admin@zyra.com'] } 
    });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@roveandamber.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Seeded default admin account: admin@roveandamber.com');
    }

    // 2. Seed default categories if empty
    const categoryCount = await Category.countDocuments();
    let categoriesMap = {};

    if (categoryCount === 0) {
      const defaultCategories = [
        { name: 'Ethnic Wear', image: '/Images/ethinic.png' },
        { name: 'Western Wear', image: '/Images/western.png' },
        { name: 'Casual Wear', image: '/Images/casual.png' },
        { name: 'Party Wear', image: '/Images/party.png' }
      ];

      for (const cat of defaultCategories) {
        const createdCat = await Category.create(cat);
        categoriesMap[cat.name] = createdCat._id;
      }
      console.log('✅ Seeded default luxury fashion categories');
    } else {
      const allCategories = await Category.find();
      for (const cat of allCategories) {
        categoriesMap[cat.name] = cat._id;
      }
    }

    // 3. Seed initial products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const initialProducts = [
        {
          name: 'Tailored Trench Coat',
          price: 4499,
          stock: 15,
          image: '/Images/brown.png',
          categoryName: 'Western Wear',
          sizes: JSON.stringify({ 'S': 4, 'M': 5, 'L': 4, 'XL': 2 })
        },
        {
          name: 'Western Blue Flare Dress',
          price: 2999,
          stock: 20,
          image: '/Images/blueWestern.png',
          categoryName: 'Western Wear',
          sizes: JSON.stringify({ 'S': 5, 'M': 7, 'L': 5, 'XL': 3 })
        },
        {
          name: 'Embroidered Ethnic Kurti Set',
          price: 2499,
          stock: 18,
          image: '/Images/kurthi.png',
          categoryName: 'Ethnic Wear',
          sizes: JSON.stringify({ 'S': 4, 'M': 6, 'L': 5, 'XL': 3 })
        },
        {
          name: 'Classic Striped Linen Shirt',
          price: 1899,
          stock: 25,
          image: '/Images/casual.png',
          categoryName: 'Casual Wear',
          sizes: JSON.stringify({ 'S': 6, 'M': 9, 'L': 6, 'XL': 4 })
        },
        {
          name: 'Designer Party Wear Gown',
          price: 3999,
          stock: 10,
          image: '/Images/party.png',
          categoryName: 'Party Wear',
          sizes: JSON.stringify({ 'S': 2, 'M': 4, 'L': 3, 'XL': 1 })
        },
        {
          name: 'Emerald Green Silk Top',
          price: 1499,
          stock: 12,
          image: '/Images/greenTop.png',
          categoryName: 'Western Wear',
          sizes: JSON.stringify({ 'S': 3, 'M': 4, 'L': 3, 'XL': 2 })
        },
        {
          name: 'Classic Noir Evening Dress',
          price: 3499,
          stock: 14,
          image: '/Images/black.png',
          categoryName: 'Western Wear',
          sizes: JSON.stringify({ 'S': 3, 'M': 5, 'L': 4, 'XL': 2 })
        },
        {
          name: 'Bohemian Western Maxi Dress',
          price: 2799,
          stock: 8,
          image: '/Images/western.png',
          categoryName: 'Western Wear',
          sizes: JSON.stringify({ 'S': 2, 'M': 3, 'L': 2, 'XL': 1 })
        }
      ];

      for (const p of initialProducts) {
        const catId = categoriesMap[p.categoryName] || null;
        await Product.create({
          name: p.name,
          price: p.price,
          stock: p.stock,
          image: p.image,
          category_id: catId,
          sizes: p.sizes
        });
      }
      console.log('✅ Seeded initial product catalog into MongoDB');
    }
  } catch (error) {
    console.error('Database initialization error:', error.message);
  }
};

export default { connectDB, initDB };
