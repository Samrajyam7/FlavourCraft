const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');
const Inventory = require('../models/Inventory');
const GroceryList = require('../models/GroceryList');
const Ingredient = require('../models/Ingredient');

/**
 * Standardize category names to official design groups:
 * Produce, Dairy, Protein, Grains, Spices, Pantry
 */
function standardizeCategory(rawCat = '') {
  const cat = (rawCat || '').toLowerCase().trim();
  if (cat.includes('produce') || cat.includes('veg') || cat.includes('fruit') || cat.includes('herb')) {
    return 'Produce';
  }
  if (cat.includes('dairy') || cat.includes('milk') || cat.includes('cheese')) {
    return 'Dairy';
  }
  if (cat.includes('protein') || cat.includes('meat') || cat.includes('chicken') || cat.includes('egg') || cat.includes('fish') || cat.includes('tofu') || cat.includes('paneer') || cat.includes('legume')) {
    return 'Protein';
  }
  if (cat.includes('grain') || cat.includes('rice') || cat.includes('pasta') || cat.includes('flour') || cat.includes('bread') || cat.includes('noodle') || cat.includes('dal') || cat.includes('lentil')) {
    return 'Grains';
  }
  if (cat.includes('spice') || cat.includes('seasoning') || cat.includes('pepper') || cat.includes('salt') || cat.includes('masala')) {
    return 'Spices';
  }
  return 'Pantry';
}

/**
 * Parses numeric amount from a recipe amount string (e.g. "2 cups", "300g", "1/2 tsp", "3 eggs", "to taste")
 */
function parseAmount(amountStr = '') {
  if (typeof amountStr === 'number') return amountStr;
  const str = String(amountStr).trim();
  if (!str || str.toLowerCase().includes('taste') || str.toLowerCase().includes('pinch')) {
    return 1;
  }

  // Handle fractions like "1/2" or "3/4"
  const fractionMatch = str.match(/^(\d+)\/(\d+)/);
  if (fractionMatch) {
    return Number(fractionMatch[1]) / Number(fractionMatch[2]);
  }

  // Handle mixed fractions like "1 1/2"
  const mixedMatch = str.match(/^(\d+)\s+(\d+)\/(\d+)/);
  if (mixedMatch) {
    return Number(mixedMatch[1]) + Number(mixedMatch[2]) / Number(mixedMatch[3]);
  }

  // Extract leading float/int
  const numMatch = str.match(/^([\d.]+)/);
  if (numMatch) {
    const parsed = parseFloat(numMatch[1]);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  return 1;
}

/**
 * Optimizes weekly meal plan ingredients against pantry inventory
 * @param {ObjectId} userId
 * @param {Object} options - { replaceAll: Boolean }
 * @returns {Object} { groceryList, items, summary }
 */
async function generateOptimizedWeeklyGrocery(userId, options = {}) {
  // 1. Fetch user's weekly meal plan
  const plan = await MealPlan.findOne({ userId }).lean();
  if (!plan || !plan.meals) {
    return { success: false, message: 'Meal plan is empty. Please schedule recipes first.' };
  }

  // 2. Gather recipe IDs across all scheduled meal slots
  const recipeIds = new Set();
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  for (const day of days) {
    const daySlots = plan.meals[day] || {};
    for (const slot of ['breakfast', 'lunch', 'dinner', 'snack']) {
      if (daySlots[slot]) {
        recipeIds.add(daySlots[slot].toString());
      }
    }
  }

  if (recipeIds.size === 0) {
    return { success: false, message: 'No recipes found in your weekly meal plan.' };
  }

  // 3. Fetch full recipe definitions
  const recipes = await Recipe.find({ _id: { $in: Array.from(recipeIds) } })
    .populate('ingredients.ingredientId')
    .lean();

  // 4. Fetch user's current pantry items
  const pantryItems = await Inventory.find({
    userId,
    status: { $ne: 'Finished' },
  })
    .populate('ingredientId')
    .lean();

  // Map pantry inventory by ingredientId and name
  const pantryMap = new Map();
  for (const p of pantryItems) {
    const ingId = p.ingredientId?._id?.toString() || p.ingredientId?.toString();
    const ingName = (p.ingredientId?.name || '').toLowerCase().trim();
    const qty = Number(p.quantity) || 0;
    if (ingId) pantryMap.set(ingId, qty);
    if (ingName) pantryMap.set(ingName, qty);
  }

  // 5. Aggregate recipe ingredient demands
  const aggregatedMap = new Map(); // key -> { name, requiredQuantity, unit, category, ingredientId, recipes: Set }

  for (const recipe of recipes) {
    if (!recipe.ingredients) continue;
    for (const ri of recipe.ingredients) {
      const ingDoc = ri.ingredientId;
      const ingIdStr = ingDoc?._id?.toString() || ri.ingredient?.toString() || '';
      const ingName = (ingDoc?.name || ri.name || 'Ingredient').trim();
      const key = ingIdStr || ingName.toLowerCase();

      const unit = ri.unit || ingDoc?.unit || 'piece';
      const category = standardizeCategory(ingDoc?.category || ri.category);
      const parsedQty = parseAmount(ri.amount);

      if (aggregatedMap.has(key)) {
        const existing = aggregatedMap.get(key);
        existing.requiredQuantity += parsedQty;
        existing.recipes.add(recipe.title);
      } else {
        aggregatedMap.set(key, {
          ingredientId: ingDoc?._id || undefined,
          name: ingName,
          requiredQuantity: parsedQty,
          unit,
          category,
          recipes: new Set([recipe.title]),
        });
      }
    }
  }

  // 6. Subtract pantry available quantities
  const optimizedItems = [];
  let totalSavedFromPantry = 0;

  for (const [key, item] of aggregatedMap.entries()) {
    const pantryAvailable =
      pantryMap.get(item.ingredientId?.toString()) ??
      pantryMap.get(item.name.toLowerCase()) ??
      0;

    const reqQty = Math.round(item.requiredQuantity * 10) / 10;
    const availQty = Math.round(pantryAvailable * 10) / 10;
    const buyQty = Math.max(0, Math.round((reqQty - availQty) * 10) / 10);

    if (availQty > 0) {
      totalSavedFromPantry += Math.min(reqQty, availQty);
    }

    optimizedItems.push({
      ingredientId: item.ingredientId,
      name: item.name,
      amount: buyQty > 0 ? `${buyQty} ${item.unit}`.trim() : '0',
      quantity: String(buyQty),
      requiredQuantity: reqQty,
      availableQuantity: availQty,
      buyQuantity: buyQty,
      unit: item.unit,
      category: item.category,
      type: 'Ingredient',
      purchased: buyQty === 0, // Auto-mark as completed if fully in pantry!
      addedFromRecipe: Array.from(item.recipes).join(', '),
    });
  }

  // Sort items by category order then name
  const categoryOrder = { Produce: 1, Dairy: 2, Protein: 3, Grains: 4, Spices: 5, Pantry: 6 };
  optimizedItems.sort((a, b) => {
    const orderA = categoryOrder[a.category] || 99;
    const orderB = categoryOrder[b.category] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });

  // 7. Save to user's GroceryList
  let groceryList = await GroceryList.findOne({ userId });
  if (!groceryList) {
    groceryList = new GroceryList({ userId, items: [] });
  }

  if (options.replaceAll) {
    groceryList.items = optimizedItems;
  } else {
    // Merge or replace planned items
    groceryList.items = optimizedItems;
  }

  await groceryList.save();
  await groceryList.populate('items.ingredientId', 'name icon category unit');

  return {
    success: true,
    message: `Generated smart grocery list: ${optimizedItems.length} ingredients analyzed, pantry subtractions applied.`,
    list: groceryList,
    items: groceryList.items,
    groceries: groceryList.items,
    summary: {
      totalIngredientsRequired: optimizedItems.length,
      itemsToBuy: optimizedItems.filter((i) => i.buyQuantity > 0).length,
      itemsCoveredByPantry: optimizedItems.filter((i) => i.availableQuantity > 0).length,
    },
  };
}

module.exports = {
  generateOptimizedWeeklyGrocery,
  standardizeCategory,
  parseAmount,
};
