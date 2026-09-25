import API from './api';

export const mealPlanService = {
  async getMealPlan() {
    const res = await API.get('/mealplan');
    return res.data;
  },

  async addMealSlot(slotData) {
    const res = await API.post('/mealplan/slot', slotData);
    return res.data;
  },

  async removeMealSlot(slotData) {
    const res = await API.delete('/mealplan/slot', { data: slotData });
    return res.data;
  },

  async clearMealPlan() {
    const res = await API.delete('/mealplan/clear');
    return res.data;
  },

  async generateGrocery() {
    const res = await API.post('/mealplan/generate-grocery');
    return res.data;
  },
};

export default mealPlanService;
