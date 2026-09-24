const express = require('express');
const {
  getRecipes,
  getRecipeById,
  matchRecipesHandler,
  searchRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecommendations,
} = require('../controllers/recipeController');
const { getReviews, createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const router = express.Router();

// IMPORTANT: specific routes must come before parameterized routes
router.get('/search', searchRecipes);
router.get('/recommendations', getRecommendations);
router.post('/match', protect, matchRecipesHandler);

router.get('/', getRecipes);
router.get('/:id', protect, getRecipeById);

// Admin routes
router.post('/', protect, adminOnly, createRecipe);
router.put('/:id', protect, adminOnly, updateRecipe);
router.delete('/:id', protect, adminOnly, deleteRecipe);

// Recipe reviews (nested)
router.get('/:recipeId/reviews', getReviews);
router.post('/:recipeId/reviews', protect, createReview);

module.exports = router;
