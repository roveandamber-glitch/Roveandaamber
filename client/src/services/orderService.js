import api from './api';

const orderService = {
  createOrder: async (data) => (await api.post('/orders', data)).data,
  getAllOrders: async () => (await api.get('/orders/all')).data,
  getMyOrders: async () => (await api.get('/orders/my')).data,
  updateOrderStatus: async (id, status) => (await api.patch(`/orders/${id}/status`, { status })).data,
};

export default orderService;
