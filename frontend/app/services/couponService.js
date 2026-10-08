import { request } from './api';

export const couponService = {
  async validateCoupon(code, subtotal) {
    return await request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
  },

  async getCoupons() {
    return await request('/coupons');
  },

  async createCoupon(couponData) {
    return await request('/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
  },

  async updateCoupon(id, couponData) {
    return await request(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(couponData),
    });
  },

  async deleteCoupon(id) {
    return await request(`/coupons/${id}`, {
      method: 'DELETE',
    });
  },
};
