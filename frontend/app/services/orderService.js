import { request } from './api';

export const orderService = {
  async createOrder(orderPayload) {
    return await request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  },

  async getMyOrders() {
    return await request('/orders/my-orders');
  },

  async getOrderById(orderId) {
    return await request(`/orders/${orderId}`);
  },

  async cancelOrder(orderId, reason) {
    return await request(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async getAllOrders(params = {}) {
    const searchParams = new URLSearchParams(params);
    const query = searchParams.toString();
    return await request(`/orders${query ? `?${query}` : ''}`);
  },

  async updateOrderStatus(orderId, status, note) {
    return await request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  },
};
