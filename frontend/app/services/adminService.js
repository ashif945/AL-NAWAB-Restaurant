import { request } from './api';

export const adminService = {
  async getDashboardStats() {
    return await request('/admin/dashboard');
  },

  async getStaffList() {
    return await request('/admin/staff');
  },

  async createStaff(staffData) {
    return await request('/admin/staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  },

  async updateStaff(id, staffData) {
    return await request(`/admin/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    });
  },

  async getSettings() {
    return await request('/admin/settings');
  },

  async updateSettings(settingsData) {
    return await request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  },

  async getInventory() {
    return await request('/inventory');
  },

  async addInventoryItem(itemData) {
    return await request('/inventory', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  async updateInventoryStock(id, quantity) {
    return await request(`/inventory/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  },

  async deleteInventoryItem(id) {
    return await request(`/inventory/${id}`, {
      method: 'DELETE',
    });
  },

  async getKitchenOrders() {
    return await request('/kitchen/active-orders');
  },

  async advanceKitchenOrder(id) {
    return await request(`/kitchen/orders/${id}/advance`, {
      method: 'PATCH',
    });
  },

  async getLoyaltyBalance() {
    return await request('/loyalty/balance');
  },
};
