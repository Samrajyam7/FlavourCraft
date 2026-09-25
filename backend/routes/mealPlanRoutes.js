const express = require('express');
const {
  getMealPlan,
  updateMealSlot,
  clearMealSlot,
  clearEntireMealPlan,
  generateGroceryFromPlan,
} = require('../controllers/mealPlanController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getMealPlan);

// Slot updates via body or params
router.post('/slot', updateMealSlot);
router.delete('/slot', clearMealSlot);
router.put('/:day/:mealType', updateMealSlot);
router.delete('/:day/:mealType', clearMealSlot);

// Clear entire meal plan
router.delete('/clear', clearEntireMealPlan);

// Generate groceries from meal plan
router.post('/generate-grocery', generateGroceryFromPlan);

module.exports = router;
