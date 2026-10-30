import api from './api';

const paymentService = {
  // Initialize Razorpay order on backend
  createPaymentOrder: async (data) => {
    const res = await api.post('/payment/create-order', data);
    return res.data;
  },

  // Verify HMAC-SHA256 signature upon checkout completion
  verifyPayment: async (data) => {
    const res = await api.post('/payment/verify', data);
    return res.data;
  },

  // Record failure if user closes modal or transaction fails
  recordPaymentFailure: async (data) => {
    const res = await api.post('/payment/failure', data);
    return res.data;
  },

  // Check payment status of an order
  getPaymentStatus: async (orderId) => {
    const res = await api.get(`/payment/status/${orderId}`);
    return res.data;
  }
};

export default paymentService;

