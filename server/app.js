import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Route Handlers
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ==========================================
// 1. Proxy Trust Configuration
// ==========================================
// Trust first proxy hop for accurate client IP resolution behind reverse proxies (Nginx, Cloudflare, etc.)
app.set('trust proxy', 1);

// ==========================================
// 2. HTTP Security Headers & Hardening
// ==========================================
// Strip technology signature to prevent automated vulnerability profiling
app.disable('x-powered-by');

// Enterprise Helmet Security Suite
app.use(
  helmet({
    // Permissive cross-origin policy for luxury perfume media delivery
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'http:', 'https:'],
        mediaSrc: ["'self'", 'data:', 'blob:', 'http:', 'https:'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", 'http:', 'https:']
      }
    },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'sameorigin' }, // Clickjacking protection
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, // 1-year HSTS
    ieNoOpen: true,
    noSniff: true, // MIME-sniffing prevention
    originAgentCluster: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  })
);

// ==========================================
// 3. Strict CORS Enforcement
// ==========================================
const configuredOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
  : [];

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...configuredOrigins
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow local development, mobile apps, or same-origin non-browser requests
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: Origin ${origin} not permitted.`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-id', 'x-admin-key', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400 // Preflight cache for 24h
  })
);

// ==========================================
// 4. Rate Limiting (DDoS & Brute Force Defense)
// ==========================================
// Global API Limiter: 300 requests / 15 mins per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded. Please wait 15 minutes before retrying.'
  }
});
app.use('/api', apiLimiter);

// Strict Authentication Limiter: 25 attempts / 15 mins per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ==========================================
// 5. Body Parsing & Payload Quotas
// ==========================================
// Protect memory against buffer exhaustion attacks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==========================================
// 6. Deep NoSQL Injection & Prototype Sanitizer
// ==========================================
const sanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    // Prevent Mongo operator injection ($gt, $ne, $where) and prototype pollution
    if (key.startsWith('$') || key.includes('.') || key === '__proto__' || key === 'constructor') {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitize(obj[key]);
    }
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
});

// ==========================================
// 7. Secure Static File Serving
// ==========================================
const staticOptions = {
  dotfiles: 'ignore', // Never serve hidden/system files (.env, .git)
  etag: true,
  maxAge: '1d', // 1-day client cache for high performance
  fallthrough: true
};

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), staticOptions));
app.use('/Images', express.static(path.resolve(__dirname, '../client/public/Images'), staticOptions));
app.use('/images', express.static(path.resolve(__dirname, '../client/public/images'), staticOptions));

// ==========================================
// 8. Application API Routes
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// ==========================================
// 9. Health & Diagnostics Telemetry
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    uptime: `${Math.floor(process.uptime())}s`,
    database: 'MongoDB Atlas',
    security: {
      helmet: 'active',
      cors: 'enforced',
      rateLimiting: 'active',
      noSqlSanitizer: 'active',
      hsts: 'enabled'
    },
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 10. 404 Route Catch-All
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: [${req.method}] ${req.originalUrl}`
  });
});

// ==========================================
// 11. Centralized Secure Error Handler
// ==========================================
app.use((err, req, res, next) => {
  console.error(`[Server Error] [${req.method}] ${req.originalUrl}:`, err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Internal Server Error',
    ...(isProduction ? {} : { stack: err.stack })
  });
});

export default app;
