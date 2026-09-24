const GroceryList = require('../models/GroceryList');

// @desc    Get user's grocery list
// @route   GET /api/grocery
const getGroceryList = async (req, res) => {
  try {
    let list = await GroceryList.findOne({ userId: req.user._id })
      .populate('items.ingredientId', 'name icon unit')
      .lean();

    if (!list) {
      list = { userId: req.user._id, items: [] };
    }

    res.json({ success: true, list, items: list.items || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add item(s) to grocery list
// @route   POST /api/grocery
const addToGroceryList = async (req, res) => {
  try {
    let items = req.body.items;
    if (!items) {
      if (req.body.name) {
        items = [req.body];
      } else {
        return res.status(400).json({ success: false, message: 'No items provided.' });
      }
    }
    if (!Array.isArray(items)) items = [items];

    let list = await GroceryList.findOne({ userId: req.user._id });

    if (!list) {
      list = new GroceryList({ userId: req.user._id, items: [] });
    }

    // Add or update items (avoid duplicates by name)
    for (const newItem of items) {
      const existingIdx = list.items.findIndex(
        (i) => i.name && newItem.name && i.name.toLowerCase() === newItem.name.toLowerCase()
      );
      if (existingIdx >= 0) {
        const existingQty = parseFloat(list.items[existingIdx].quantity) || 0;
        const newQty = parseFloat(newItem.quantity) || 0;
        if (existingQty > 0 && newQty > 0) {
          list.items[existingIdx].quantity = String(existingQty + newQty);
        }
      } else {
        list.items.push(newItem);
      }
    }

    await list.save();
    await list.populate('items.ingredientId', 'name icon unit');

    res.json({ success: true, message: 'Grocery list updated!', list, items: list.items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a grocery item
// @route   PUT /api/grocery/:itemId
const updateGroceryItem = async (req, res) => {
  try {
    const list = await GroceryList.findOne({ userId: req.user._id });
    if (!list) return res.status(404).json({ success: false, message: 'Grocery list not found.' });

    const item = list.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    Object.assign(item, req.body);
    await list.save();

    res.json({ success: true, message: 'Item updated!', list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a grocery item
// @route   DELETE /api/grocery/:itemId
const deleteGroceryItem = async (req, res) => {
  try {
    const list = await GroceryList.findOne({ userId: req.user._id });
    if (!list) return res.status(404).json({ success: false, message: 'Grocery list not found.' });

    list.items = list.items.filter((i) => i._id.toString() !== req.params.itemId);
    await list.save();

    res.json({ success: true, message: 'Item removed.', list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear purchased items
// @route   DELETE /api/grocery/clear-purchased
const clearPurchased = async (req, res) => {
  try {
    const list = await GroceryList.findOne({ userId: req.user._id });
    if (!list) return res.status(404).json({ success: false, message: 'Grocery list not found.' });

    list.items = list.items.filter((i) => !i.purchased);
    await list.save();

    res.json({ success: true, message: 'Purchased items cleared.', list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getGroceryList, addToGroceryList, updateGroceryItem, deleteGroceryItem, clearPurchased };
