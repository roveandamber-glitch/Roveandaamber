import api from './api';

const orderService = {
  createOrder: async (data) => (await api.post('/orders', data)).data,
  getAllOrders: async () => (await api.get('/orders/all')).data,
  getMyOrders: async () => (await api.get('/orders/my')).data,
  getOrderById: async (id) => (await api.get(`/orders/${id}`)).data,
  getTracking: async (id) => (await api.get(`/orders/${id}/track`)).data,
  getInvoice: async (id) => (await api.get(`/orders/${id}/invoice`)).data,
  updateOrderStatus: async (id, status) => (await api.patch(`/orders/${id}/status`, { status })).data,
};

export default orderService;
