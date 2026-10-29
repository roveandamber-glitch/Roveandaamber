import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedDatabase } from './seeder.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Roveandamber';
const LOCAL_MONGODB_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/Roveandamber';

// Set mongoose connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 20,
  autoIndex: true
};

/**
 * Connect to MongoDB Atlas with fallback to Local MongoDB
 */
export const connectDB = async () => {
  try {
    if (MONGODB_URI.includes('<username>') || MONGODB_URI.includes('<password>')) {
      console.warn('⚠️ [MongoDB]: Placeholder credentials detected in MONGODB_URI. Using local instance.');
    } else {
      console.log('🔄 Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(MONGODB_URI, mongooseOptions);
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
      return conn;
    }
  } catch (error) {
    console.warn(`⚠️ MongoDB Atlas Connection Warning: ${error.message}`);
    console.log('🔄 Attempting local MongoDB connection (127.0.0.1:27017)...');
  }

  // Fallback to local MongoDB instance
  try {
    const localConn = await mongoose.connect(LOCAL_MONGODB_URI, {
      ...mongooseOptions,
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✅ Connected to Local MongoDB Fallback: ${localConn.connection.host}`);
    return localConn;
  } catch (localErr) {
    console.error('❌ Could not connect to MongoDB Atlas or Local MongoDB.');
    console.error('👉 Tip: Check your network connection or add your IP address to MongoDB Atlas Network Access.');
    throw localErr;
  }
};

/**
 * Initialize database connection and run data seeders
 */
export const initDB = async () => {
  try {
    await connectDB();
    await seedDatabase();
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  }
};

// Lifecycle Event Listeners
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB connection lost. Reconnecting...');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

export default { connectDB, initDB };
