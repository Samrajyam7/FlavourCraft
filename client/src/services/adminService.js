import API from './api';

export const adminService = {
  async getDashboardStats() {
    const res = await API.get('/admin/stats');
    return res.data;
  },

  async getUsers(params = {}) {
    const res = await API.get('/admin/users', { params });
    return res.data;
  },

  async updateUserRole(userId, role) {
    const res = await API.put(`/admin/users/${userId}/role`, { role });
    return res.data;
  },

  async deleteUser(userId) {
    const res = await API.delete(`/admin/users/${userId}`);
    return res.data;
  },

  async deleteReviewAdmin(reviewId) {
    const res = await API.delete(`/admin/reviews/${reviewId}`);
    return res.data;
  },
};

export default adminService;
