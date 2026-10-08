import { request, setAuthToken } from './api';

export const authService = {
  async register(userData) {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  async login(credentials) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  logout() {
    setAuthToken(null);
  },

  async getMe() {
    return await request('/auth/me');
  },

  async updateProfile(profileData) {
    return await request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async changePassword(passwordData) {
    return await request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },

  async addAddress(addressData) {
    return await request('/auth/address', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  },

  async deleteAddress(addressId) {
    return await request(`/auth/address/${addressId}`, {
      method: 'DELETE',
    });
  },

  async toggleFavorite(dishId) {
    return await request(`/auth/favorites/${dishId}`, {
      method: 'POST',
    });
  },
};
