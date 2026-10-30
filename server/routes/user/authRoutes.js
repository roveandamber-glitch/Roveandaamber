import express from 'express';
import { 
  sendRegistrationOtp,
  verifyRegistrationOtp,
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword,
  forgotPassword,
  resetPassword
} from '../../controllers/user/authController.js';
import { protect } from '../../middlewares/authMiddleware.js';
import {
  validateSendOtp,
  validateVerifyOtp,
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange
} from '../../validators/userValidator.js';

const router = express.Router();

// Public OTP & Registration endpoints
router.post('/send-otp', validateSendOtp, sendRegistrationOtp);
router.post('/resend-otp', validateSendOtp, sendRegistrationOtp);
router.post('/verify-otp', validateVerifyOtp, verifyRegistrationOtp);
router.post('/register', validateRegister, register);

// Public login endpoint
router.post('/login', validateLogin, login);

// Password recovery endpoints
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected profile endpoints with input validation middlewares
router.get('/me', protect, getProfile);
router.put('/profile', protect, validateProfileUpdate, updateProfile);
router.put('/change-password', protect, validatePasswordChange, changePassword);

export default router;
