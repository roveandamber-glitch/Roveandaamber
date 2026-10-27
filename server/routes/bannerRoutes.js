import express from 'express';
import { getPublicBanners } from '../controllers/adminController.js';

const router = express.Router();

// GET /api/banners - Public endpoint for active homepage promotional banners
router.get('/', getPublicBanners);

export default router;
