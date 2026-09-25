const express = require('express');
const {
  getGroceryList,
  addToGroceryList,
  updateGroceryItem,
  deleteGroceryItem,
  clearPurchased,
} = require('../controllers/groceryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getGroceryList);
router.post('/', addToGroceryList);
router.delete('/clear-purchased', clearPurchased);
router.post('/clear-purchased', clearPurchased);
router.put('/:itemId', updateGroceryItem);
router.delete('/:itemId', deleteGroceryItem);

module.exports = router;
