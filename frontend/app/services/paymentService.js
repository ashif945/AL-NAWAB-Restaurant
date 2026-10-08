import { request } from './api';

export const paymentService = {
  async createPaymentOrder(orderId) {
    return await request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  },

  async verifyPayment(paymentDetails) {
    return await request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(paymentDetails),
    });
  },

  async getPaymentHistory() {
    return await request('/payments/history');
  },
};
