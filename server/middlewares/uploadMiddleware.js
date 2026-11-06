import 'dotenv/config';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads');

// Ensure local uploads folder exists for permanent or fallback storage
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Configure Cloudinary dynamically from environment variables
 */
export const configureCloudinary = () => {
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });
    return true;
  }

  if (process.env.CLOUDINARY_URL) {
    try {
      const parsed = new URL(process.env.CLOUDINARY_URL.trim());
      cloudinary.config({
        cloud_name: parsed.hostname,
        api_key: parsed.username,
        api_secret: parsed.password,
        secure: true
      });
      return true;
    } catch {
      return false;
    }
  }

  return false;
};

// Initialize Cloudinary config immediately
configureCloudinary();

// High-speed reliable local disk storage
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `image-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const isExt = allowed.test(path.extname(file.originalname).toLowerCase());
  const isMime = allowed.test(file.mimetype);

  if (isExt && isMime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, webp, gif) are allowed!'));
  }
};

const baseMulter = multer({
  storage: diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

/**
 * Attempts to upload stored disk files to Cloudinary CDN.
 * If Cloudinary encounters a permission error or network issue,
 * it catches the exception, logs a warning, and cleanly falls back
 * to local storage (/uploads/...) without failing the HTTP request.
 */
const syncUploadedFilesToCloudinary = async (req) => {
  const isConfigured = configureCloudinary();
  if (!isConfigured) {
    console.warn('[Upload Middleware] Cloudinary is not configured. Retaining local storage path.');
    return;
  }

  const files = [];
  if (req.file) files.push(req.file);
  if (Array.isArray(req.files)) {
    files.push(...req.files);
  } else if (req.files && typeof req.files === 'object') {
    Object.values(req.files).forEach((arr) => {
      if (Array.isArray(arr)) files.push(...arr);
    });
  }

  for (const file of files) {
    if (!file || !file.path) continue;
    try {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: 'roveandamber_uploads',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      });
      if (uploadResult && uploadResult.secure_url) {
        file.cloudinaryUrl = uploadResult.secure_url;
        file.path = uploadResult.secure_url;
        console.log(`[Cloudinary Success] Uploaded ${file.filename} -> ${uploadResult.secure_url}`);
      }
    } catch (cldErr) {
      console.warn(
        `[Upload Warning] Cloudinary upload bypassed (${cldErr.message}). Seamlessly preserved on local storage: /uploads/${file.filename}`
      );
    }
  }
};

const wrapMulter = (multerMiddleware) => {
  return (req, res, next) => {
    multerMiddleware(req, res, async (err) => {
      if (err) return next(err);
      try {
        await syncUploadedFilesToCloudinary(req);
        next();
      } catch (syncErr) {
        console.warn('[Upload Middleware] Error during Cloudinary sync:', syncErr.message);
        next();
      }
    });
  };
};

export const upload = {
  any: () => wrapMulter(baseMulter.any()),
  single: (field) => wrapMulter(baseMulter.single(field)),
  array: (field, max) => wrapMulter(baseMulter.array(field, max)),
  fields: (fields) => wrapMulter(baseMulter.fields(fields)),
  none: () => baseMulter.none()
};

/**
 * Returns permanent Cloudinary URL if available, otherwise local /uploads/filename
 */
export const getUploadedFileUrl = (file) => {
  if (!file) return null;
  if (file.cloudinaryUrl) return file.cloudinaryUrl;
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path;
  }
  return `/uploads/${file.filename}`;
};

export default upload;
