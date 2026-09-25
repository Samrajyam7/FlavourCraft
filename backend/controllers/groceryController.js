const mongoose = require('mongoose');
const GroceryList = require('../models/GroceryList');
const Recipe = require('../models/Recipe');

// @desc    Get user's grocery list
// @route   GET /api/grocery
const getGroceryList = async (req, res) => {
  try {
    let list = await GroceryList.findOne({ userId: req.user._id })
      .populate('items.ingredientId', 'name icon category unit')
      .lean();

    if (!list) {
      list = { userId: req.user._id, items: [] };
    }

    const items = list.items || [];
    res.json({
      success: true,
      list,
      items,
      groceries: items,
    });
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

    // Add or update items (avoid duplicates by name/ingredientId)
    for (const rawItem of items) {
      const name = (rawItem.name || '').trim();
      if (!name) continue;

      const rawAmount = rawItem.amount || rawItem.quantity || '1';
      const unit = (rawItem.unit || '').trim();
      const category = (rawItem.category || 'Pantry').trim();
      const type = (rawItem.type || 'Ingredient').trim();
      const ingredientId =
        rawItem.ingredientId && mongoose.Types.ObjectId.isValid(rawItem.ingredientId)
          ? rawItem.ingredientId
          : undefined;
      const addedFromRecipe = (rawItem.addedFromRecipe || '').trim();
      const purchased = Boolean(rawItem.purchased);

      const existingIdx = list.items.findIndex(
        (i) =>
          (i.name && i.name.toLowerCase() === name.toLowerCase()) ||
          (ingredientId && i.ingredientId && i.ingredientId.toString() === ingredientId.toString())
      );

      if (existingIdx >= 0) {
        const existingItem = list.items[existingIdx];
        const existingVal = parseFloat(existingItem.amount || existingItem.quantity);
        const newVal = parseFloat(rawAmount);

        if (!isNaN(existingVal) && !isNaN(newVal) && (!existingItem.unit || !unit || existingItem.unit === unit)) {
          const combined = existingVal + newVal;
          existingItem.amount = String(combined);
          existingItem.quantity = String(combined);
        } else if (existingItem.amount !== rawAmount) {
          existingItem.amount = `${existingItem.amount || existingItem.quantity}, ${rawAmount}`;
          existingItem.quantity = existingItem.amount;
        }

        if (category && category !== 'Pantry') {
          existingItem.category = category;
        }
        if (type && type !== 'Ingredient') {
          existingItem.type = type;
        }
        if (unit && !existingItem.unit) {
          existingItem.unit = unit;
        }
      } else {
        list.items.push({
          ingredientId,
          name,
          amount: String(rawAmount),
          quantity: String(rawAmount),
          unit: unit || 'piece',
          category: category || 'Pantry',
          type: type || 'Ingredient',
          purchased,
          addedFromRecipe,
        });
      }
    }

    await list.save();
    await list.populate('items.ingredientId', 'name icon category unit');

    res.json({
      success: true,
      message: 'Grocery list updated!',
      list,
      items: list.items,
      groceries: list.items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add ingredients from a recipe to grocery list
// @route   POST /api/grocery/from-recipe
const generateFromRecipe = async (req, res) => {
  try {
    const { recipeId, missingIngredientIds = [] } = req.body;
    if (!recipeId) {
      return res.status(400).json({ success: false, message: 'Recipe ID is required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ success: false, message: 'Invalid recipe ID format.' });
    }

    const recipe = await Recipe.findById(recipeId).populate('ingredients.ingredientId');
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    const missingSet = new Set((missingIngredientIds || []).map((id) => id.toString()));
    const itemsToAdd = [];

    for (const item of recipe.ingredients || []) {
      const ingDoc = item.ingredientId;
      const ingIdStr = ingDoc?._id?.toString() || item.ingredient?.toString() || '';

      // If missingIngredientIds was specified, filter by it; otherwise add all
      if (missingSet.size > 0 && !missingSet.has(ingIdStr)) {
        continue;
      }

      const ingName = ingDoc?.name || item.name || 'Ingredient';
      const ingCategory = ingDoc?.category || item.category || 'Pantry';
      const ingUnit = item.unit || ingDoc?.unit || '';
      const ingAmount = item.amount || '1';

      itemsToAdd.push({
        ingredientId: ingDoc?._id || undefined,
        name: ingName,
        amount: String(ingAmount),
        quantity: String(ingAmount),
        unit: ingUnit,
        category: ingCategory,
        type: 'Ingredient',
        purchased: false,
        addedFromRecipe: recipe.title || '',
      });
    }

    req.body.items = itemsToAdd;
    return addToGroceryList(req, res);
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

    if (req.body.quantity !== undefined && req.body.amount === undefined) {
      req.body.amount = String(req.body.quantity);
    } else if (req.body.amount !== undefined && req.body.quantity === undefined) {
      req.body.quantity = String(req.body.amount);
    }

    Object.assign(item, req.body);
    await list.save();
    await list.populate('items.ingredientId', 'name icon category unit');

    res.json({ success: true, message: 'Item updated!', list, items: list.items });
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

    res.json({ success: true, message: 'Item removed.', list, items: list.items });
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

    res.json({ success: true, message: 'Purchased items cleared.', list, items: list.items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getGroceryList,
  addToGroceryList,
  generateFromRecipe,
  updateGroceryItem,
  deleteGroceryItem,
  clearPurchased,
};
