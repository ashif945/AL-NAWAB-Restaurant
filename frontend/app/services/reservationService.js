import { request } from './api';

export const reservationService = {
  async createReservation(reservationData) {
    return await request('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  },

  async getMyReservations() {
    return await request('/reservations/my-reservations');
  },

  async getAllReservations(params = {}) {
    const searchParams = new URLSearchParams(params);
    const query = searchParams.toString();
    return await request(`/reservations${query ? `?${query}` : ''}`);
  },

  async updateReservationStatus(id, status, tableNumber, adminNotes) {
    return await request(`/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, tableNumber, adminNotes }),
    });
  },

  async cancelReservation(id) {
    return await request(`/reservations/${id}`, {
      method: 'DELETE',
    });
  },
};
