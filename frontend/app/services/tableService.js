import { request } from './api';

export const tableService = {
  async getTables() {
    return await request('/tables');
  },

  async getTableByNumber(tableNumber) {
    return await request(`/tables/number/${tableNumber}`);
  },

  async generateQR(tableId) {
    return await request(`/tables/${tableId}/qr`);
  },

  async createTable(tableData) {
    return await request('/tables', {
      method: 'POST',
      body: JSON.stringify(tableData),
    });
  },

  async updateTableStatus(tableId, status) {
    return await request(`/tables/${tableId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteTable(tableId) {
    return await request(`/tables/${tableId}`, {
      method: 'DELETE',
    });
  },
};
