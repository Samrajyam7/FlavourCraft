import API from './api';

export const ingredientService = {
  async getIngredients(params = {}) {
    const res = await API.get('/ingredients', { params });
    return res.data;
  },

  async searchIngredients(query) {
    const res = await API.get('/ingredients/search', { params: { q: query } });
    return res.data;
  },

  async getCategories() {
    const res = await API.get('/ingredients/categories');
    return res.data;
  },

  async getIngredientById(id) {
    const res = await API.get(`/ingredients/${id}`);
    return res.data;
  },

  async createIngredient(data) {
    const res = await API.post('/ingredients', data);
    return res.data;
  },

  async updateIngredient(id, data) {
    const res = await API.put(`/ingredients/${id}`, data);
    return res.data;
  },

  async deleteIngredient(id) {
    const res = await API.delete(`/ingredients/${id}`);
    return res.data;
  },
};

export default ingredientService;
