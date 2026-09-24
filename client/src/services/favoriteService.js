import API from './api';

export const favoriteService = {
  async getFavorites() {
    const res = await API.get('/favorites');
    return res.data;
  },

  async addFavorite(recipeId) {
    const res = await API.post(`/favorites/${recipeId}`);
    return res.data;
  },

  async removeFavorite(recipeId) {
    const res = await API.delete(`/favorites/${recipeId}`);
    return res.data;
  },

  async checkFavorite(recipeId) {
    const res = await API.get(`/favorites/check/${recipeId}`);
    return res.data;
  },
};

export default favoriteService;
