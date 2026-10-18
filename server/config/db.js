import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load server/.env so it works regardless of working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ [MongoDB Error]: MONGODB_URI is not defined in environment variables.');
  console.error('👉 Please define MONGODB_URI in your server/.env file.');
}

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is missing from environment variables (.env)');
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log('✅ MongoDB Connected successfully');
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

export default { connectDB };
