import API from './api';

export const inventoryService = {
  async getInventory() {
    const res = await API.get('/inventory');
    return res.data;
  },

  async addInventoryItem(itemData) {
    const res = await API.post('/inventory', itemData);
    return res.data;
  },

  async updateInventoryItem(id, itemData) {
    const res = await API.put(`/inventory/${id}`, itemData);
    return res.data;
  },

  async deleteInventoryItem(id) {
    const res = await API.delete(`/inventory/${id}`);
    return res.data;
  },
};

export default inventoryService;
