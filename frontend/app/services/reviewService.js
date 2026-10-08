import { request } from './api';

export const reviewService = {
  async getReviews(menuItemId) {
    return await request(`/reviews${menuItemId ? `?menuItemId=${menuItemId}` : ''}`);
  },

  async createReview(reviewData) {
    return await request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  async getAdminReviews() {
    return await request('/reviews/admin');
  },

  async toggleReviewApproval(id) {
    return await request(`/reviews/${id}/approve`, {
      method: 'PATCH',
    });
  },

  async replyToReview(id, reply) {
    return await request(`/reviews/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply }),
    });
  },
};
