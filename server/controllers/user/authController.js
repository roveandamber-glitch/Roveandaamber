import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserModel } from '../../models/userModel.js';
import { OtpModel } from '../../models/otpModel.js';
import emailService from '../../services/emailService.js';
import { JWT_SECRET } from '../../middlewares/authMiddleware.js';

// Helper to generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * 1. Send OTP for User Registration
 * Validates email availability, generates a 6-digit OTP, and sends via email
 */
export const sendRegistrationOtp = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'Email address is required.'
      });
    }

    // Check if email already registered
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'An account with this email address already exists. Please sign in instead.'
      });
    }

    // Generate secure 6-digit cryptographic OTP (100000 - 999999)
    const otp = String(crypto.randomInt(100000, 1000000));

    // Save OTP with 10 minutes expiry in MongoDB
    await OtpModel.createOrUpdateOtp(email, otp, 10);

    // Dispatch luxury branded email
    await emailService.sendRegistrationOtp(email, otp, name);

    return res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${email}.`
    });
  } catch (error) {
    console.error('Send Registration OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send verification code. Please check your email address and try again.'
    });
  }
};

/**
 * 2. Standalone OTP verification endpoint
 */
export const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit verification code are required.'
      });
    }

    const verification = await OtpModel.verifyOtp(email, otp);
    if (!verification.isValid) {
      return res.status(400).json({
        success: false,
        field: 'otp',
        message: verification.message
      });
    }

    return res.json({
      success: true,
      message: 'Verification code verified successfully.'
    });
  } catch (error) {
    console.error('Verify Registration OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP code.'
    });
  }
};

/**
 * 3. User Registration with OTP Verification
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, otp } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        field: 'otp',
        message: 'Verification code is required to complete registration.'
      });
    }

    // Verify OTP code first
    const verification = await OtpModel.verifyOtp(email, otp);
    if (!verification.isValid) {
      return res.status(400).json({
        success: false,
        field: 'otp',
        message: verification.message
      });
    }

    // Check if email already registered
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'A user with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === 'admin' ? 'admin' : 'user';

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole
    });

    const token = generateToken(user.id, user.role);

    return res.status(201).json({
      success: true,
      message: 'Account verified and created successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        field: 'email',
        message: 'Incorrect email. No account found with this email address.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        field: 'password',
        message: 'Incorrect password. Please check your password and try again.'
      });
    }

    const token = generateToken(user.id, user.role);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || null,
        address: user.address || null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
    }

    const updatedUser = await UserModel.updateProfile(req.user.id, {
      name: name.trim(),
      phone: phone ? phone.trim() : null,
      address: address ? address.trim() : null
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.'
      });
    }

    const user = await UserModel.findWithPasswordById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.'
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.updatePassword(req.user.id, hashedNewPassword);

    return res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};
