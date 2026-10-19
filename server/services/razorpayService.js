import crypto from 'crypto';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

// Helper to check if live Razorpay credentials are provided
export const isRazorpayConfigured = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return Boolean(keyId && keySecret && keyId.trim() && keySecret.trim());
};

// Initialize Razorpay instance lazily from environment variables (Zero hardcoding)
export const getRazorpayInstance = () => {
  if (!isRazorpayConfigured()) return null;

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID.trim(),
    key_secret: process.env.RAZORPAY_KEY_SECRET.trim()
  });
};

export const razorpayService = {
  // 1. Create a Razorpay Order for online checkout
  createOrder: async ({ amount, currency = 'INR', receipt, notes = {} }) => {
    const finalCurrency = process.env.RAZORPAY_CURRENCY || currency || 'INR';
    const amountInPaise = Math.round(Number(amount) * 100);

    // If live credentials are provided in .env, use official Razorpay API
    if (isRazorpayConfigured()) {
      try {
        const instance = getRazorpayInstance();
        const razorpayOrder = await instance.orders.create({
          amount: amountInPaise,
          currency: finalCurrency,
          receipt: receipt || `rcpt_${Date.now()}`,
          notes
        });

        return {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt,
          status: razorpayOrder.status,
          keyId: process.env.RAZORPAY_KEY_ID,
          isMock: false
        };
      } catch (error) {
        console.error('Razorpay live order creation error:', error);
        throw new Error(`Razorpay gateway error: ${error.message || 'Failed to initialize order.'}`);
      }
    }

    // Safe simulated order creation (Keys to be provided later by user)
    console.warn('⚠️ [Razorpay Gateway]: RAZORPAY_KEY_ID / SECRET not yet configured in .env. Running in simulated development mode.');
    const mockOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      id: mockOrderId,
      amount: amountInPaise,
      currency: finalCurrency,
      receipt: receipt || `rcpt_${Date.now()}`,
      status: 'created',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      isMock: true,
      notice: 'Simulated Razorpay order. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env when ready.'
    };
  },

  // 2. Cryptographic HMAC-SHA256 Backend Signature Verification
  verifySignature: ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
    if (!razorpay_order_id || !razorpay_payment_id) {
      return false;
    }

    // In simulated mode without keys configured:
    if (!isRazorpayConfigured()) {
      return (
        razorpay_signature === 'mock_signature' ||
        razorpay_signature === 'simulation_valid' ||
        String(razorpay_order_id).startsWith('order_sim_')
      );
    }

    try {
      const secret = process.env.RAZORPAY_KEY_SECRET.trim();
      const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      // Constant-time buffer comparison to prevent timing attacks
      const expectedBuffer = Buffer.from(generatedSignature, 'utf-8');
      const receivedBuffer = Buffer.from(razorpay_signature || '', 'utf-8');

      if (expectedBuffer.length !== receivedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    } catch (error) {
      console.error('Cryptographic signature verification error:', error);
      return false;
    }
  }
};

export default razorpayService;
