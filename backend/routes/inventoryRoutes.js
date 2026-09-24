const express = require('express');
const { getInventory, addToInventory, updateInventoryItem, deleteInventoryItem } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getInventory);
router.post('/', addToInventory);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

module.exports = router;
