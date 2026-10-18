import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Cross-Origin Resource Sharing (CORS)
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// 2. Request Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Static Media Asset Serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/Images', express.static(path.resolve(__dirname, '../client/public/Images')));

// 4. API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// 5. Health & Diagnostic Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: 'SQLite (SQL)',
    architecture: 'MVC',
    timestamp: new Date().toISOString()
  });
});

// 6. Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

export default app;
