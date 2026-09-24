/**
 * FlavorCraft Substitution Engine
 * Maps ingredients to their known substitutes
 */

const SUBSTITUTION_MAP = {
  butter: ['Olive Oil', 'Ghee', 'Coconut Oil', 'Vegetable Oil'],
  milk: ['Soy Milk', 'Almond Milk', 'Coconut Milk', 'Oat Milk', 'Yogurt'],
  chicken: ['Tofu', 'Paneer', 'Mushroom', 'Chickpeas'],
  tofu: ['Paneer', 'Chicken', 'Mushroom'],
  paneer: ['Tofu', 'Chicken', 'Cheese'],
  lemon: ['Vinegar', 'Lime', 'Yogurt'],
  spinach: ['Kale', 'Swiss Chard', 'Coriander'],
  pasta: ['Rice', 'Noodles'],
  flour: ['Almond Flour', 'Rice Flour', 'Oat Flour'],
  cheese: ['Paneer', 'Tofu', 'Yogurt'],
  yogurt: ['Sour Cream', 'Buttermilk', 'Milk'],
  egg: ['Flax Egg', 'Banana', 'Yogurt'],
  rice: ['Quinoa', 'Pasta', 'Cauliflower Rice'],
  onion: ['Shallots', 'Leek', 'Spring Onion'],
  garlic: ['Garlic Powder', 'Ginger', 'Shallots'],
  sugar: ['Honey', 'Maple Syrup', 'Jaggery'],
  'olive oil': ['Vegetable Oil', 'Butter', 'Coconut Oil'],
  ginger: ['Garlic', 'Ginger Powder', 'Turmeric'],
  tomato: ['Tomato Paste', 'Capsicum', 'Sun-dried Tomato'],
  capsicum: ['Carrot', 'Zucchini', 'Tomato'],
  carrot: ['Pumpkin', 'Sweet Potato', 'Parsnip'],
  potato: ['Sweet Potato', 'Cauliflower', 'Turnip'],
  mushroom: ['Eggplant', 'Tofu', 'Zucchini'],
  corn: ['Peas', 'Edamame', 'Chickpeas'],
  'green peas': ['Edamame', 'Corn', 'Broad Beans'],
  coriander: ['Parsley', 'Basil', 'Mint'],
  chilli: ['Chilli Powder', 'Cayenne Pepper', 'Paprika'],
  bread: ['Tortilla', 'Wrap', 'Rice Cakes'],
  pepper: ['Chilli Flakes', 'Paprika', 'White Pepper'],
  salt: ['Soy Sauce', 'Sea Salt', 'Himalayan Salt'],
};

/**
 * Get substitutes for an ingredient by name
 * @param {string} ingredientName
 * @returns {string[]} Array of substitute names
 */
function getSubstitutes(ingredientName) {
  if (!ingredientName) return [];
  const key = ingredientName.toLowerCase().trim();
  return SUBSTITUTION_MAP[key] || [];
}

/**
 * Get all ingredients that can substitute for a given ingredient
 * @param {string} ingredientName
 * @returns {Object} { ingredient, substitutes }
 */
function getSubstitutionInfo(ingredientName) {
  const subs = getSubstitutes(ingredientName);
  return {
    ingredient: ingredientName,
    substitutes: subs,
    hasSubstitutes: subs.length > 0,
  };
}

module.exports = { getSubstitutes, getSubstitutionInfo, SUBSTITUTION_MAP };
