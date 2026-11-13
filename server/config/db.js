import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Roveandamber';
const LOCAL_MONGODB_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/Roveandamber';

// Resilient Mongoose connection options for MongoDB Atlas
const mongooseOptions = {
  serverSelectionTimeoutMS: 15000, // 15s to allow cloud DNS SRV lookup and TLS handshake
  connectTimeoutMS: 20000,
  socketTimeoutMS: 45000,
  maxPoolSize: 25,
  minPoolSize: 2, // Keep connections warm so Atlas doesn't drop idle pool
  heartbeatFrequencyMS: 10000, // Regular heartbeats prevent socket idling
  family: 4, // Force IPv4 to prevent IPv6 DNS routing stalls
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
 * Initialize database connection
 */
export const initDB = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  }
};

// Lifecycle Event Listeners
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB connection lost. Reconnecting...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB connection successfully re-established.');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

export default { connectDB, initDB };
