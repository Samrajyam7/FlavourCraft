import API from './api';

export const groceryService = {
  async getGroceryList() {
    const res = await API.get('/grocery');
    return res.data;
  },

  async addGroceryItem(itemData) {
    const res = await API.post('/grocery', itemData);
    return res.data;
  },

  async updateGroceryItem(id, itemData) {
    const res = await API.put(`/grocery/${id}`, itemData);
    return res.data;
  },

  async deleteGroceryItem(id) {
    const res = await API.delete(`/grocery/${id}`);
    return res.data;
  },

  async generateFromRecipe(recipeId, missingIngredientIds = []) {
    const res = await API.post('/grocery/from-recipe', { recipeId, missingIngredientIds });
    return res.data;
  },

  async clearPurchased() {
    const res = await API.post('/grocery/clear-purchased');
    return res.data;
  },
};

export default groceryService;
