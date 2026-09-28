const express = require('express');
const {
  getInventory,
  addToInventory,
  updateInventoryItem,
  deleteInventoryItem,
  getExpiryAlerts,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/expiry-alerts', getExpiryAlerts);
router.get('/', getInventory);
router.post('/', addToInventory);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

module.exports = router;
