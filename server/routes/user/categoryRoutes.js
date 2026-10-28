import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../controllers/user/categoryController.js';
import { protect, adminOnly } from '../../middlewares/authMiddleware.js';
import { upload } from '../../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public: All users can view categories
router.get('/', getCategories);

// Admin-only: Create, Update, Delete categories
router.post('/', protect, adminOnly, upload.single('image'), createCategory);
router.put('/:id', protect, adminOnly, upload.single('image'), updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
