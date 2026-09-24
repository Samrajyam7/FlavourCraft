const express = require('express');
const { getMealPlan, updateMealSlot, clearMealSlot } = require('../controllers/mealPlanController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getMealPlan);
router.put('/:day/:mealType', updateMealSlot);
router.delete('/:day/:mealType', clearMealSlot);

module.exports = router;
