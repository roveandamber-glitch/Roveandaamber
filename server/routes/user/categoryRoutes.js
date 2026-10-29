import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  toggleCategoryStatus
} from '../../controllers/user/categoryController.js';
import { protect, adminOnly } from '../../middlewares/authMiddleware.js';
import { upload } from '../../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public: All users can view categories
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin-only: Image upload endpoint
router.post('/upload', protect, adminOnly, upload.single('image'), uploadCategoryImage);

// Admin-only: Status toggle endpoint
router.patch('/:id/status', protect, adminOnly, toggleCategoryStatus);

// Admin-only: Create, Update, Delete categories (supporting file upload via multipart/form-data or json)
router.post('/', protect, adminOnly, upload.single('image'), createCategory);
router.put('/:id', protect, adminOnly, upload.single('image'), updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
