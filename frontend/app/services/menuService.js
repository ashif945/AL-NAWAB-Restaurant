import { request } from './api';

export const menuService = {
  async getMenuItems(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== 'All') searchParams.append('category', params.category);
    if (params.search) searchParams.append('search', params.search);
    if (params.isVeg !== undefined && params.isVeg !== '') searchParams.append('isVeg', params.isVeg);
    if (params.sort) searchParams.append('sort', params.sort);
    if (params.spiceLevel) searchParams.append('spiceLevel', params.spiceLevel);
    if (params.isPopular) searchParams.append('isPopular', 'true');
    if (params.isFeatured) searchParams.append('isFeatured', 'true');

    const query = searchParams.toString();
    return await request(`/menu${query ? `?${query}` : ''}`);
  },

  async getCategories() {
    return await request('/menu/categories');
  },

  async getMenuItemById(id) {
    return await request(`/menu/${id}`);
  },

  async createMenuItem(itemData) {
    return await request('/menu', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  async updateMenuItem(id, itemData) {
    return await request(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  },

  async toggleAvailability(id, isAvailable) {
    return await request(`/menu/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    });
  },

  async deleteMenuItem(id) {
    return await request(`/menu/${id}`, {
      method: 'DELETE',
    });
  },
};
