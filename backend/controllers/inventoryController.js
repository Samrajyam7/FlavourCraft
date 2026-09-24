const Inventory = require('../models/Inventory');
const Ingredient = require('../models/Ingredient');

// @desc    Get user's inventory
// @route   GET /api/inventory
const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({ userId: req.user._id })
      .populate('ingredientId', 'name icon category unit substitutes nutrition')
      .sort('expiryDate')
      .lean();

    // Flag items expiring within 3 days
    const today = new Date();
    const enriched = inventory.map((item) => {
      let daysUntilExpiry = null;
      let isExpiringSoon = false;
      let isExpired = false;

      if (item.expiryDate) {
        const diff = new Date(item.expiryDate) - today;
        daysUntilExpiry = Math.ceil(diff / (1000 * 60 * 60 * 24));
        isExpiringSoon = daysUntilExpiry <= 3 && daysUntilExpiry > 0;
        isExpired = daysUntilExpiry <= 0;
      }

      return { ...item, daysUntilExpiry, isExpiringSoon, isExpired };
    });

    res.json({ success: true, count: inventory.length, inventory: enriched, items: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add ingredient to inventory
// @route   POST /api/inventory
const addToInventory = async (req, res) => {
  try {
    const ingredientId = req.body.ingredientId || req.body.ingredient;
    const { quantity, unit, expiryDate, notes } = req.body;

    if (!ingredientId) {
      return res.status(400).json({ success: false, message: 'Please select a valid ingredient.' });
    }

    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found in catalog.' });
    }

    // Upsert inventory item
    const inventoryItem = await Inventory.findOneAndUpdate(
      { userId: req.user._id, ingredientId },
      { quantity: quantity || 1, unit: unit || ingredient.unit, expiryDate: expiryDate || null, notes },
      { new: true, upsert: true, runValidators: true }
    ).populate('ingredientId', 'name icon category unit');

    res.status(201).json({
      success: true,
      message: 'Inventory updated!',
      item: inventoryItem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
const updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('ingredientId', 'name icon category unit');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found.' });
    }

    res.json({ success: true, message: 'Inventory item updated!', item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
const deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found.' });
    }

    res.json({ success: true, message: 'Item removed from inventory.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getInventory, addToInventory, updateInventoryItem, deleteInventoryItem };
