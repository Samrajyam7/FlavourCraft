import API from './api';

export const recipeService = {
  async getRecipes(params = {}) {
    const res = await API.get('/recipes', { params });
    return res.data;
  },

  async searchRecipes(query, params = {}) {
    const res = await API.get('/recipes/search', { params: { q: query, ...params } });
    return res.data;
  },

  async getRecommendations() {
    const res = await API.get('/recipes/recommendations');
    return res.data;
  },

  async matchRecipes(userIngredientIds, filters = {}) {
    const res = await API.post('/recipes/match', { userIngredientIds, ...filters });
    return res.data;
  },

  async getRecipeById(id) {
    const res = await API.get(`/recipes/${id}`);
    return res.data;
  },

  async createRecipe(recipeData) {
    const res = await API.post('/recipes', recipeData);
    return res.data;
  },

  async updateRecipe(id, recipeData) {
    const res = await API.put(`/recipes/${id}`, recipeData);
    return res.data;
  },

  async deleteRecipe(id) {
    const res = await API.delete(`/recipes/${id}`);
    return res.data;
  },
};

export default recipeService;
