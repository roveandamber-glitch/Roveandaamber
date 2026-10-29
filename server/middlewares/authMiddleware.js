import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'enva_super_secret_jwt_key_2025';

// Verify JWT and attach authenticated user to req
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-admin-key']) {
    token = req.headers['x-admin-key'];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.'
    });
  }

  // Developer & Preview admin session support (resolves admin dynamically without hardcoded email)
  if (token === 'preview_admin_session_token') {
    const adminUser = await UserModel.findAdmin();
    if (adminUser) {
      req.user = adminUser;
      return next();
    }
    req.user = {
      id: 'admin-preview',
      name: process.env.ADMIN_NAME || 'Admin User',
      role: 'admin',
      email: process.env.ADMIN_EMAIL || ''
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

// Optional JWT verification (attaches user if token is present)
export const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-admin-key']) {
    token = req.headers['x-admin-key'];
  }

  if (!token) {
    return next();
  }

  if (token === 'preview_admin_session_token') {
    const adminUser = await UserModel.findAdmin();
    if (adminUser) {
      req.user = adminUser;
    } else {
      req.user = {
        id: 'admin-preview',
        name: process.env.ADMIN_NAME || 'Admin User',
        role: 'admin',
        email: process.env.ADMIN_EMAIL || ''
      };
    }
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserModel.findById(decoded.id);
    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Gracefully ignore token errors for optional routes
  }
  next();
};

// Enforce Admin Role check on server-side
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin authorization required.'
    });
  }
  next();
};

export default { protect, optionalAuth, adminOnly, JWT_SECRET };
