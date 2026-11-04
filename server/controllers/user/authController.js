import { OAuth2Client } from 'google-auth-library';
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

    let welcomeBonusPoints = 100;
    try {
      const { RewardRule } = await import('../../models/rewardModel.js');
      const rules = await RewardRule.getRules();
      welcomeBonusPoints = rules.welcomeBonus || 100;
    } catch (e) {}

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
      rewardPoints: welcomeBonusPoints
    });

    try {
      const { RewardTransaction } = await import('../../models/rewardModel.js');
      await RewardTransaction.record({
        userId: user.id || user._id,
        customerName: user.name,
        customerEmail: user.email,
        type: 'Welcome Bonus',
        points: welcomeBonusPoints,
        orderId: 'SIGNUP-WELCOME',
        description: 'Privilege Welcome Bonus for new patron'
      });
    } catch (e) {}

    const token = generateToken(user.id, user.role);

    return res.status(201).json({
      success: true,
      message: 'Account verified and created successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        rewardPoints: user.rewardPoints || welcomeBonusPoints
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

    // Check if account is blocked by administration
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        isBlocked: true,
        message: 'Your account has been blocked. Please contact admin for support.'
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
        rewardPoints: user.rewardPoints || 0,
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

    const userId = req.user?.id || req.user?._id;
    let user = await UserModel.findWithPasswordById(userId);
    if (!user && req.user?.role === 'admin') {
      const adminDoc = await UserModel.findAdmin();
      if (adminDoc) {
        user = await UserModel.findWithPasswordById(adminDoc.id || adminDoc._id);
      }
    }

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
    await UserModel.updatePassword(user.id || user._id, hashedNewPassword);

    return res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};

/**
 * 6. Forgot Password - Send OTP to user email
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'Email address is required.'
      });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        field: 'email',
        message: 'No user account found with this email address.'
      });
    }

    // Generate secure 6-digit OTP
    const otp = String(crypto.randomInt(100000, 1000000));

    // Store in Otp collection
    await OtpModel.createOrUpdateOtp(email, otp, 10);

    // High visibility log in Render logs for instant administrative access
    console.log(`🔑 [RECOVERY CODE GENERATED]: ${otp} for customer: ${email}`);

    // Send reset email
    await emailService.sendPasswordResetOtp(email, otp, user.name);

    return res.json({
      success: true,
      message: `A 6-digit reset code has been sent to ${email}.`
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send password reset code. Please try again.'
    });
  }
};

/**
 * 7. Reset Password with OTP Verification
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, verification code, and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.'
      });
    }

    // Verify OTP
    const verification = await OtpModel.verifyOtp(email, otp);
    if (!verification.isValid) {
      return res.status(400).json({
        success: false,
        field: 'otp',
        message: verification.message
      });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found.'
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.updatePassword(user.id || user._id, hashedNewPassword);

    return res.json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again.'
    });
  }
};


/**
 * 8. Google OAuth Authentication (Login or Register)
 * Accepts either Google ID credential (JWT) or access token, verifies with Google,
 * and creates or retrieves customer account.
 */
export const googleAuth = async (req, res) => {
  try {
    const { credential, accessToken } = req.body;

    if (!credential && !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Google authorization credential or access token is required.'
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || '482109442440-7p41koh4gnvt9586dksii7l5shrje7t1.apps.googleusercontent.com';
    let email, name, googleId, picture;

    if (credential) {
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(400).json({
          success: false,
          message: 'Unable to retrieve email from Google credential.'
        });
      }
      email = payload.email.toLowerCase().trim();
      name = payload.name || payload.given_name || 'Customer';
      googleId = payload.sub;
      picture = payload.picture || '';
    } else if (accessToken) {
      let info = null;
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(8000)
        });
        if (userInfoRes.ok) {
          info = await userInfoRes.json();
        }
      } catch (err) {
        console.warn('Google v3 userinfo fetch failed or timed out:', err.message);
      }

      if (!info || !info.email) {
        try {
          const fallbackRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: AbortSignal.timeout(8000)
          });
          if (fallbackRes.ok) {
            info = await fallbackRes.json();
          }
        } catch (err) {
          console.warn('Google v2 userinfo fetch failed:', err.message);
        }
      }

      if (!info || !info.email) {
        return res.status(401).json({
          success: false,
          message: 'Failed to verify Google access token. Please re-authenticate.'
        });
      }
      email = info.email.toLowerCase().trim();
      name = info.name || info.given_name || 'Customer';
      googleId = info.sub || info.id;
      picture = info.picture || '';
    }

    // Check if user already exists in database
    let user = await UserModel.findByEmail(email);

    if (user && user.isBlocked) {
      return res.status(403).json({
        success: false,
        isBlocked: true,
        message: 'Your account has been blocked. Please contact admin for support.'
      });
    }

    if (!user) {
      // Auto-create new user with secure random password and welcome bonus points
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      let welcomeBonusPoints = 100;
      try {
        const { RewardRule } = await import('../../models/rewardModel.js');
        const rules = await RewardRule.getRules();
        welcomeBonusPoints = rules.welcomeBonus || 100;
      } catch (e) {}

      user = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        role: 'user',
        phone: '',
        address: '',
        rewardPoints: welcomeBonusPoints
      });

      try {
        const { RewardTransaction } = await import('../../models/rewardModel.js');
        await RewardTransaction.record({
          userId: user.id || user._id,
          customerName: user.name,
          customerEmail: user.email,
          type: 'Welcome Bonus',
          points: welcomeBonusPoints,
          orderId: 'GOOGLE-SIGNUP',
          description: 'Privilege Welcome Bonus for new patron'
        });
      } catch (e) {}
    }

    const token = generateToken(user.id || user._id, user.role);

    return res.json({
      success: true,
      message: 'Google authentication successful.',
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rewardPoints: user.rewardPoints || 100,
        avatar: picture || user.avatar || null,
        phone: user.phone || null,
        address: user.address || null
      }
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to authenticate with Google. Please try again.'
    });
  }
};
