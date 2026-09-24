import API from './api';

export const authService = {
  async register(userData) {
    const res = await API.post('/auth/register', userData);
    return res.data;
  },

  async login(credentials) {
    const res = await API.post('/auth/login', credentials);
    return res.data;
  },

  async getMe() {
    const res = await API.get('/auth/me');
    return res.data;
  },

  async updateProfile(profileData) {
    const res = await API.put('/auth/profile', profileData);
    return res.data;
  },

  async changePassword(passwordData) {
    const res = await API.put('/auth/change-password', passwordData);
    return res.data;
  },
};

export default authService;
