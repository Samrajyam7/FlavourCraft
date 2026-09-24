const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');
const GroceryList = require('../models/GroceryList');

// @desc    Get meal plan
// @route   GET /api/mealplan
const getMealPlan = async (req, res) => {
  try {
    let plan = await MealPlan.findOne({ userId: req.user._id })
      .populate('meals.monday.breakfast meals.monday.lunch meals.monday.dinner', 'title imageUrl prepTimeMinutes cookTimeMinutes difficulty')
      .populate('meals.tuesday.breakfast meals.tuesday.lunch meals.tuesday.dinner', 'title imageUrl prepTimeMinutes cookTimeMinutes difficulty')
      .populate('meals.wednesday.breakfast meals.wednesday.lunch meals.wednesday.dinner', 'title imageUrl prepTimeMinutes cookTimeMinutes difficulty')
      .populate('meals.thursday.breakfast meals.thursday.lunch meals.thursday.dinner', 'title imageUrl prepTimeMinutes cookTimeMinutes difficulty')
      .populate('meals.friday.breakfast meals.friday.lunch meals.friday.dinner', 'title imageUrl prepTimeMinutes cookTimeMinutes difficulty')
      .populate('meals.saturday.breakfast meals.saturday.lunch meals.saturday.dinner', 'title imageUrl prepTimeMinutes cookTimeMinutes difficulty')
      .populate('meals.sunday.breakfast meals.sunday.lunch meals.sunday.dinner', 'title imageUrl prepTimeMinutes cookTimeMinutes difficulty')
      .lean();

    if (!plan) {
      plan = { userId: req.user._id, meals: {} };
    }

    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update meal plan slot
// @route   PUT /api/mealplan/:day/:mealType
const updateMealSlot = async (req, res) => {
  try {
    const { day, mealType } = req.params;
    const { recipeId } = req.body;

    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const validMealTypes = ['breakfast', 'lunch', 'dinner'];

    if (!validDays.includes(day) || !validMealTypes.includes(mealType)) {
      return res.status(400).json({ success: false, message: 'Invalid day or meal type.' });
    }

    if (recipeId) {
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({ success: false, message: 'Recipe not found.' });
      }
    }

    const updatePath = `meals.${day}.${mealType}`;
    const plan = await MealPlan.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { [updatePath]: recipeId || null } },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Meal plan updated!', plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear a meal slot
// @route   DELETE /api/mealplan/:day/:mealType
const clearMealSlot = async (req, res) => {
  try {
    const { day, mealType } = req.params;
    const updatePath = `meals.${day}.${mealType}`;

    const plan = await MealPlan.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { [updatePath]: null } },
      { new: true }
    );

    res.json({ success: true, message: 'Meal slot cleared.', plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMealPlan, updateMealSlot, clearMealSlot };
