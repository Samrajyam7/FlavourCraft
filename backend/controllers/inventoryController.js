const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const Ingredient = require('../models/Ingredient');

// Helper to calculate item status and expiry metadata
const enrichPantryItem = (item) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let daysUntilExpiry = null;
  let isExpiringSoon = false;
  let isExpired = false;
  let freshnessStatus = 'Fresh';

  if (item.expiryDate) {
    const exp = new Date(item.expiryDate);
    exp.setHours(0, 0, 0, 0);
    const diffTime = exp.getTime() - today.getTime();
    daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0 || daysUntilExpiry === 0) {
      isExpired = true;
      freshnessStatus = 'Expired';
    } else if (daysUntilExpiry <= 3) {
      isExpiringSoon = true;
      freshnessStatus = 'Expiring Soon';
    } else {
      freshnessStatus = 'Fresh';
    }
  }

  // Derive inventory status
  let status = item.status || 'Available';
  if (isExpired) {
    status = 'Expired';
  } else if (Number(item.quantity) <= 0) {
    status = 'Finished';
  } else if (Number(item.quantity) <= 1 && status !== 'Finished') {
    status = 'Low Stock';
  }

  // Generate friendly alert message
  let alertMessage = null;
  const ingName = item.ingredientId?.name || 'Ingredient';
  if (isExpired) {
    alertMessage = `🔴 ${ingName} expired`;
  } else if (daysUntilExpiry === 1) {
    alertMessage = `⚠️ ${ingName} expires tomorrow`;
  } else if (daysUntilExpiry === 2) {
    alertMessage = `⚠️ ${ingName} expires in 2 days`;
  } else if (daysUntilExpiry === 3) {
    alertMessage = `⚠️ ${ingName} expires in 3 days`;
  }

  return {
    ...item,
    daysUntilExpiry,
    isExpiringSoon,
    isExpired,
    freshnessStatus,
    status,
    alertMessage,
  };
};

// @desc    Get user's pantry inventory
// @route   GET /api/inventory or GET /api/pantry
const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({ userId: req.user._id })
      .populate('ingredientId', 'name icon category unit substitutes nutrition')
      .sort('expiryDate')
      .lean();

    const enriched = inventory.map(enrichPantryItem);

    // Summary stats
    const total = enriched.length;
    const freshCount = enriched.filter((i) => i.freshnessStatus === 'Fresh').length;
    const expiringSoonCount = enriched.filter((i) => i.isExpiringSoon).length;
    const expiredCount = enriched.filter((i) => i.isExpired).length;
    const lowStockCount = enriched.filter((i) => i.status === 'Low Stock').length;

    // Filtered alerts list for expiring/expired items
    const expiryAlerts = enriched.filter((i) => i.isExpired || i.isExpiringSoon);

    res.json({
      success: true,
      count: total,
      total,
      freshCount,
      expiringSoonCount,
      expiredCount,
      lowStockCount,
      inventory: enriched,
      items: enriched,
      pantry: enriched,
      expiryAlerts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add ingredient to pantry
// @route   POST /api/inventory or POST /api/pantry
const addToInventory = async (req, res) => {
  try {
    let ingredientId = req.body.ingredientId || req.body.ingredient;
    const { name, quantity, unit, expiryDate, purchaseDate, status, notes } = req.body;

    // If ingredientId is not provided but a name is provided, look up or create ingredient
    if (!ingredientId && name) {
      const cleanName = name.trim();
      let ing = await Ingredient.findOne({ name: { $regex: `^${cleanName}$`, $options: 'i' } });
      if (!ing) {
        ing = await Ingredient.create({
          name: cleanName,
          category: req.body.category || 'Pantry',
          unit: unit || 'piece',
          icon: '🥫',
        });
      }
      ingredientId = ing._id;
    }

    if (!ingredientId) {
      return res.status(400).json({ success: false, message: 'Please select or provide a valid ingredient.' });
    }

    if (!mongoose.Types.ObjectId.isValid(ingredientId)) {
      return res.status(400).json({ success: false, message: 'Invalid ingredient ID format.' });
    }

    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found in catalog.' });
    }

    const itemQuantity = Number(quantity) > 0 ? Number(quantity) : 1;
    const itemUnit = unit || ingredient.unit || 'piece';
    const itemPurchaseDate = purchaseDate ? new Date(purchaseDate) : new Date();
    const itemExpiryDate = expiryDate ? new Date(expiryDate) : null;
    const itemStatus = status || 'Available';

    // Upsert inventory item for the authenticated user
    const inventoryItem = await Inventory.findOneAndUpdate(
      { userId: req.user._id, ingredientId },
      {
        quantity: itemQuantity,
        unit: itemUnit,
        purchaseDate: itemPurchaseDate,
        expiryDate: itemExpiryDate,
        status: itemStatus,
        notes: notes || '',
      },
      { new: true, upsert: true, runValidators: true }
    ).populate('ingredientId', 'name icon category unit nutrition');

    const enriched = enrichPantryItem(inventoryItem.toObject());

    res.status(201).json({
      success: true,
      message: 'Pantry updated!',
      item: enriched,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update pantry item
// @route   PUT /api/inventory/:id or PUT /api/pantry/:id
const updateInventoryItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid pantry item ID.' });
    }

    const updateData = { ...req.body };
    if (updateData.quantity !== undefined) {
      updateData.quantity = Number(updateData.quantity);
      if (updateData.quantity <= 0 && !updateData.status) {
        updateData.status = 'Finished';
      }
    }

    const item = await Inventory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    ).populate('ingredientId', 'name icon category unit nutrition');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Pantry item not found.' });
    }

    const enriched = enrichPantryItem(item.toObject());

    res.json({ success: true, message: 'Pantry item updated!', item: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete pantry item
// @route   DELETE /api/inventory/:id or DELETE /api/pantry/:id
const deleteInventoryItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid pantry item ID.' });
    }

    const item = await Inventory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Pantry item not found.' });
    }

    res.json({ success: true, message: 'Item removed from pantry.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dedicated expiry alerts for notifications
// @route   GET /api/inventory/expiry-alerts or GET /api/pantry/expiry-alerts
const getExpiryAlerts = async (req, res) => {
  try {
    const inventory = await Inventory.find({ userId: req.user._id })
      .populate('ingredientId', 'name icon category unit')
      .sort('expiryDate')
      .lean();

    const enriched = inventory.map(enrichPantryItem);
    const alerts = enriched.filter((i) => i.isExpired || i.isExpiringSoon);

    res.json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInventory,
  addToInventory,
  updateInventoryItem,
  deleteInventoryItem,
  getExpiryAlerts,
};
