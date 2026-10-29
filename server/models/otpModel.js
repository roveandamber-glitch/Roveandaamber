import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true
    },
    otp: {
      type: String,
      required: [true, 'OTP code is required'],
      trim: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // MongoDB TTL index: document expires and gets removed when expiresAt timestamp is reached
    },
    attempts: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export const Otp = mongoose.models.Otp || mongoose.model('Otp', otpSchema);

export const OtpModel = {
  /**
   * Generates and stores a new OTP for an email address
   */
  createOrUpdateOtp: async (email, otp, validMinutes = 10) => {
    const normalizedEmail = email.toLowerCase().trim();
    const expiresAt = new Date(Date.now() + validMinutes * 60 * 1000);

    // Remove any previous pending OTP for this email
    await Otp.deleteMany({ email: normalizedEmail });

    const newRecord = await Otp.create({
      email: normalizedEmail,
      otp: otp.trim(),
      expiresAt,
      attempts: 0
    });

    return newRecord;
  },

  /**
   * Validates a candidate OTP against stored code
   */
  verifyOtp: async (email, candidateOtp) => {
    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = String(candidateOtp || '').trim();

    const record = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

    if (!record) {
      return {
        isValid: false,
        message: 'Verification code not found or has expired. Please request a new code.'
      };
    }

    if (new Date() > new Date(record.expiresAt)) {
      await Otp.deleteOne({ _id: record._id });
      return {
        isValid: false,
        message: 'Verification code has expired. Please request a new code.'
      };
    }

    if (record.attempts >= 5) {
      await Otp.deleteOne({ _id: record._id });
      return {
        isValid: false,
        message: 'Maximum verification attempts exceeded. Please request a new code.'
      };
    }

    if (record.otp !== cleanOtp) {
      record.attempts += 1;
      await record.save();
      const remaining = 5 - record.attempts;
      return {
        isValid: false,
        message: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Please request a new code.'}`
      };
    }

    // Code is valid - clean up record
    await Otp.deleteOne({ _id: record._id });
    return {
      isValid: true,
      message: 'Code verified successfully.'
    };
  }
};

export default OtpModel;

