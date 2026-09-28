const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');
const GroceryList = require('../models/GroceryList');

const formatMealPlanResponse = (plan) => {
  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const days = daysList.map((day) => {
    const dayKey = day.toLowerCase();
    const dayData = plan?.meals?.[dayKey] || {};
    return {
      dayOfWeek: day,
      slots: [
        { mealType: 'Breakfast', recipe: dayData.breakfast || null },
        { mealType: 'Lunch', recipe: dayData.lunch || null },
        { mealType: 'Dinner', recipe: dayData.dinner || null },
        { mealType: 'Snack', recipe: dayData.snack || null },
      ],
    };
  });

  return { plan, days };
};

// @desc    Get meal plan
// @route   GET /api/mealplan
const getMealPlan = async (req, res) => {
  try {
    let plan = await MealPlan.findOne({ userId: req.user._id })
      .populate('meals.monday.breakfast meals.monday.lunch meals.monday.dinner meals.monday.snack', 'title imageUrl prepTimeMinutes cookTimeMinutes difficulty nutrition')
      .populate('meals.tuesday.breakfast meals.tuesday.lunch meals.tuesday.dinner meals.tuesday.snack', 'title imageUrl prepTimeMinutes cookTimeMinutes difficulty nutrition')
      .populate('meals.wednesday.breakfast meals.wednesday.lunch meals.wednesday.dinner meals.wednesday.snack', 'title imageUrl prepTimeMinutes cookTimeMinutes difficulty nutrition')
      .populate('meals.thursday.breakfast meals.thursday.lunch meals.thursday.dinner meals.thursday.snack', 'title imageUrl prepTimeMinutes cookTimeMinutes difficulty nutrition')
      .populate('meals.friday.breakfast meals.friday.lunch meals.friday.dinner meals.friday.snack', 'title imageUrl prepTimeMinutes cookTimeMinutes difficulty nutrition')
      .populate('meals.saturday.breakfast meals.saturday.lunch meals.saturday.dinner meals.saturday.snack', 'title imageUrl prepTimeMinutes cookTimeMinutes difficulty nutrition')
      .populate('meals.sunday.breakfast meals.sunday.lunch meals.sunday.dinner meals.sunday.snack', 'title imageUrl prepTimeMinutes cookTimeMinutes difficulty nutrition')
      .lean();

    if (!plan) {
      plan = { userId: req.user._id, meals: {} };
    }

    const { days } = formatMealPlanResponse(plan);
    res.json({ success: true, plan, days });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update or add meal plan slot
// @route   POST /api/mealplan/slot or PUT /api/mealplan/:day/:mealType
const updateMealSlot = async (req, res) => {
  try {
    const day = (req.params.day || req.body.dayOfWeek || req.body.day || '').toLowerCase();
    const mealType = (req.params.mealType || req.body.mealType || '').toLowerCase();
    const recipeId = req.body.recipeId || req.body.recipe?._id;

    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

    if (!validDays.includes(day) || !validMealTypes.includes(mealType)) {
      return res.status(400).json({ success: false, message: `Invalid day (${day}) or meal type (${mealType}).` });
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
// @route   DELETE /api/mealplan/slot or DELETE /api/mealplan/:day/:mealType
const clearMealSlot = async (req, res) => {
  try {
    const day = (req.params.day || req.body.dayOfWeek || req.body.day || '').toLowerCase();
    const mealType = (req.params.mealType || req.body.mealType || '').toLowerCase();

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

// @desc    Clear entire weekly meal plan
// @route   DELETE /api/mealplan/clear
const clearEntireMealPlan = async (req, res) => {
  try {
    const plan = await MealPlan.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          meals: {
            monday: {},
            tuesday: {},
            wednesday: {},
            thursday: {},
            friday: {},
            saturday: {},
            sunday: {},
          },
        },
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Weekly meal plan cleared.', plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate grocery list from weekly meal plan with pantry deductions
// @route   POST /api/mealplan/generate-grocery
const generateGroceryFromPlan = async (req, res) => {
  try {
    const { generateOptimizedWeeklyGrocery } = require('../utils/groceryOptimizer');
    const result = await generateOptimizedWeeklyGrocery(req.user._id, {
      replaceAll: Boolean(req.body.regenerate),
    });

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMealPlan,
  updateMealSlot,
  clearMealSlot,
  clearEntireMealPlan,
  generateGroceryFromPlan,
};
