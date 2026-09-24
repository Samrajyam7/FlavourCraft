const express = require('express');
const {
  getIngredients,
  getCategories,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} = require('../controllers/ingredientController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', getIngredients);
router.get('/categories', getCategories);
router.get('/:id', getIngredientById);
router.post('/', protect, adminOnly, createIngredient);
router.put('/:id', protect, adminOnly, updateIngredient);
router.delete('/:id', protect, adminOnly, deleteIngredient);

module.exports = router;
