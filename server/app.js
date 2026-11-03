import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Organized Route Modules (Admin & User)
import adminRouter, { inventoryRoutes, reportRoutes } from './routes/admin/index.js';
import userRouter from './routes/user/index.js';

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
// 3. Dynamic CORS & Preflight Guard
// ==========================================
const configuredOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim().replace(/\/+$/, ''))
  : [];

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://roveandamber.com',
  'https://www.roveandamber.com',
  'https://admin.roveandamber.com',
  'https://api.roveandamber.com',
  ...configuredOrigins
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, server-to-server, curl)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.trim().replace(/\/+$/, '');

    // 1. Check explicit allowed list
    if (allowedOrigins.some(o => o.toLowerCase() === cleanOrigin.toLowerCase())) {
      return callback(null, true);
    }

    // 2. Automatically permit roveandamber.com apex and all subdomains (www, api, admin, etc.)
    if (/^https?:\/\/([a-z0-9-]+\.)*roveandamber\.com(:\d+)?$/i.test(cleanOrigin)) {
      return callback(null, true);
    }

    // 3. Automatically permit Vercel and Render deployments
    if (/^https?:\/\/([a-z0-9-]+\.)*(vercel\.app|onrender\.com)$/i.test(cleanOrigin)) {
      return callback(null, true);
    }

    // Gracefully reject without throwing 500 error
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-id', 'x-admin-key', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // Preflight cache for 24h
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ==========================================
// 4. Rate Limiting (DDoS & Brute Force Defense)
// ==========================================
// Global API Limiter: 300 requests / 15 mins per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
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
app.use('/api/auth/send-otp', authLimiter);
app.use('/api/auth/resend-otp', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);

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
// 8. Application API Routes (User & Admin Suites)
// ==========================================
// User & Customer Facing Routes - Dual-mounted at /api and root /
app.use('/api', userRouter);
app.use('/', userRouter);

// Admin Operations Suite - Dual-mounted at /api/admin and /admin
app.use('/api/admin', adminRouter);
app.use('/admin', adminRouter);

// Convenient Root Aliases for Admin Submodules
app.use('/api/inventory', inventoryRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/reports', reportRoutes);


// ==========================================
// 9. Health & Diagnostics Telemetry (Uptime & Monitoring)
// ==========================================
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Rove & Amber API is running",
    timestamp: new Date()
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
