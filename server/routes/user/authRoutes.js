import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword 
} from '../../controllers/user/authController.js';
import { protect } from '../../middlewares/authMiddleware.js';
import {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange
} from '../../validators/userValidator.js';

const router = express.Router();

// Public auth endpoints with input validation middlewares
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected profile endpoints with input validation middlewares
router.get('/me', protect, getProfile);
router.put('/profile', protect, validateProfileUpdate, updateProfile);
router.put('/change-password', protect, validatePasswordChange, changePassword);

export default router;
