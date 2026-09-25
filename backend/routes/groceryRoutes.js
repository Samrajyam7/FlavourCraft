const express = require('express');
const {
  getGroceryList,
  addToGroceryList,
  generateFromRecipe,
  updateGroceryItem,
  deleteGroceryItem,
  clearPurchased,
} = require('../controllers/groceryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getGroceryList);
router.post('/', addToGroceryList);
router.post('/from-recipe', generateFromRecipe);
router.delete('/clear-purchased', clearPurchased);
router.post('/clear-purchased', clearPurchased);
router.put('/:itemId', updateGroceryItem);
router.delete('/:itemId', deleteGroceryItem);

module.exports = router;
