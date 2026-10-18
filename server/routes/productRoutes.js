import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public: View all products with category filter and search
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only: Create, Update (with image upload), Delete
router.post('/', protect, adminOnly, upload.any(), createProduct);
router.put('/:id', protect, adminOnly, upload.any(), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
