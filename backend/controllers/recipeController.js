const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const Favorite = require('../models/Favorite');
const { matchRecipes } = require('../utils/recipeMatcher');
const { generateRecommendations } = require('../utils/recommendationEngine');
const CookingHistory = require('../models/CookingHistory');

// Helper to ensure nutrition object has all fields with sensible defaults
const formatRecipeNutrition = (recipe) => {
  if (!recipe) return recipe;
  const n = recipe.nutrition || {};
  const cals = n.calories ?? recipe.caloriesPerServing ?? 350;
  const protein = n.protein ?? 15;
  const carbs = n.carbs ?? n.carbohydrates ?? 35;
  const fat = n.fat ?? n.fats ?? 12;
  const fiber = n.fiber ?? 4;
  const sugar = n.sugar ?? 3;
  const servingSize = n.servingSize ?? recipe.servings ?? 1;

  const nutrition = {
    calories: cals,
    protein,
    carbohydrates: carbs,
    carbs,
    fats: fat,
    fat,
    fiber,
    sugar,
    servingSize,
  };

  const prep = recipe.prepTimeMinutes ?? recipe.prepTime ?? 10;
  const cook = recipe.cookTimeMinutes ?? recipe.cookTime ?? 15;
  const totalTimeMinutes = recipe.totalTimeMinutes || (prep + cook);

  return {
    ...recipe,
    prepTimeMinutes: prep,
    cookTimeMinutes: cook,
    totalTimeMinutes,
    nutrition,
  };
};

// @desc    Get all recipes with filtering/pagination
// @route   GET /api/recipes
const getRecipes = async (req, res) => {
  try {
    const {
      search,
      cuisine,
      mealType,
      difficulty,
      dietaryTags,
      dietary,
      diet,
      maxTime,
      cookingTime,
      timeRange,
      author,
      createdBy,
      page = 1,
      limit = 12,
      sort = '-popularity',
    } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { cuisine: { $regex: search, $options: 'i' } },
      ];
    }
    if (cuisine) query.cuisine = { $regex: `^${cuisine}$`, $options: 'i' };
    if (mealType && mealType !== 'Any') query.mealType = { $regex: `^${mealType}$`, $options: 'i' };
    if (difficulty && difficulty !== 'All') query.difficulty = { $regex: `^${difficulty}$`, $options: 'i' };

    if (author || createdBy) {
      const authId = author || createdBy;
      if (mongoose.Types.ObjectId.isValid(authId)) {
        query.createdBy = authId;
      }
    }

    // Dietary filtering (support comma-separated or single values, case-insensitive)
    const rawDiet = dietaryTags || dietary || diet;
    if (rawDiet && rawDiet !== 'All' && rawDiet !== 'No Preference') {
      const tags = rawDiet.split(',').map((t) => t.trim()).filter(Boolean);
      if (tags.length > 0) {
        const regexList = tags.map((t) => new RegExp(`^${t.replace('-', '[- ]?')}$`, 'i'));
        query.dietaryTags = { $in: regexList };
      }
    }

    // Cooking time filtering
    const timeFilter = cookingTime || timeRange;
    if (timeFilter) {
      if (timeFilter === 'under-15' || timeFilter === 'under15' || timeFilter === '15') {
        query.$expr = { $lte: [{ $add: ['$prepTimeMinutes', '$cookTimeMinutes'] }, 15] };
      } else if (timeFilter === '15-30' || timeFilter === '15_30') {
        query.$expr = {
          $and: [
            { $gt: [{ $add: ['$prepTimeMinutes', '$cookTimeMinutes'] }, 15] },
            { $lte: [{ $add: ['$prepTimeMinutes', '$cookTimeMinutes'] }, 30] },
          ],
        };
      } else if (timeFilter === '30-60' || timeFilter === '30_60') {
        query.$expr = {
          $and: [
            { $gt: [{ $add: ['$prepTimeMinutes', '$cookTimeMinutes'] }, 30] },
            { $lte: [{ $add: ['$prepTimeMinutes', '$cookTimeMinutes'] }, 60] },
          ],
        };
      } else if (timeFilter === '60-plus' || timeFilter === '60plus' || timeFilter === '60+') {
        query.$expr = { $gt: [{ $add: ['$prepTimeMinutes', '$cookTimeMinutes'] }, 60] };
      }
    } else if (maxTime) {
      query.$expr = {
        $lte: [{ $add: ['$prepTimeMinutes', '$cookTimeMinutes'] }, Number(maxTime)],
      };
    }

    // Map UI sort keys explicitly
    let sortOption = '-popularity';
    if (sort === 'rating' || sort === '-rating' || sort === 'highest-rated') {
      sortOption = '-rating';
    } else if (sort === 'popularity' || sort === '-popularity' || sort === 'popular') {
      sortOption = '-popularity';
    } else if (sort === 'newest' || sort === '-createdAt') {
      sortOption = '-createdAt';
    } else if (sort === 'quickest' || sort === 'time') {
      sortOption = 'prepTimeMinutes cookTimeMinutes';
    } else if (sort) {
      sortOption = sort;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Recipe.countDocuments(query);
    const rawRecipes = await Recipe.find(query)
      .populate('ingredients.ingredientId', 'name icon category unit substitutes')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const recipes = rawRecipes.map(formatRecipeNutrition);

    res.json({
      success: true,
      count: recipes.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      recipes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single recipe by ID
// @route   GET /api/recipes/:id
const getRecipeById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid recipe ID format.' });
    }

    const recipe = await Recipe.findById(req.params.id)
      .populate('ingredients.ingredientId', 'name icon category unit substitutes nutrition')
      .lean();

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    // Check if user has favorited this recipe
    let isFavorite = false;
    if (req.user) {
      const fav = await Favorite.findOne({ userId: req.user._id, recipeId: recipe._id });
      isFavorite = !!fav;
    }

    res.json({ success: true, recipe: { ...recipe, isFavorite } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Recipe matching engine
// @route   POST /api/recipes/match
const matchRecipesHandler = async (req, res) => {
  try {
    const { userIngredientIds } = req.body;

    if (!userIngredientIds || !Array.isArray(userIngredientIds) || userIngredientIds.length === 0) {
      return res.status(400).json({
        success: false,
        results: [],
        message: 'Please select at least one ingredient.',
      });
    }

    // Validate that every ingredient ID is a valid ObjectId format
    for (const id of userIngredientIds) {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          results: [],
          message: `Invalid ingredient ID format: ${id}`,
        });
      }
    }

    // Deduplicate IDs
    const uniqueIds = Array.from(new Set(userIngredientIds.map((id) => id.toString())));

    // Validate and fetch user ingredients from database
    const userIngredients = await Ingredient.find({
      _id: { $in: uniqueIds },
    }).lean();

    if (userIngredients.length === 0) {
      return res.json({
        success: true,
        results: [],
        message: 'No matching recipes found.',
      });
    }

    const userIngredientIdSet = new Set(userIngredients.map((i) => i._id.toString()));

    // Find recipes that contain at least one of the user's ingredients
    const recipes = await Recipe.find({
      'ingredients.ingredientId': { $in: Array.from(userIngredientIdSet) },
    })
      .populate('ingredients.ingredientId', 'name icon category unit substitutes')
      .lean();

    if (recipes.length === 0) {
      return res.json({
        success: true,
        results: [],
        message: 'No matching recipes found.',
      });
    }

    const results = matchRecipes(recipes, userIngredients);

    // Get favorites for the authenticated user if logged in
    let userFavorites = new Set();
    if (req.user) {
      const favs = await Favorite.find({ userId: req.user._id }).lean();
      userFavorites = new Set(favs.map((f) => f.recipeId.toString()));
    }

    // Apply optional dietary & cooking-time filters if provided
    const dietaryFilter = req.body.dietaryTags || req.body.dietary || req.body.diet || req.query.dietaryTags || req.query.dietary;
    const cookingTimeFilter = req.body.cookingTime || req.body.timeRange || req.query.cookingTime;
    const maxTimeFilter = req.body.maxReadyTime || req.body.maxTime || req.query.maxTime;
    const cuisineFilter = req.body.cuisine || req.query.cuisine;
    const mealTypeFilter = req.body.mealType || req.query.mealType;
    const difficultyFilter = req.body.difficulty || req.query.difficulty;

    let filteredResults = results;

    if (dietaryFilter && dietaryFilter !== 'All' && dietaryFilter !== 'No Preference') {
      const diets = (Array.isArray(dietaryFilter) ? dietaryFilter : dietaryFilter.split(',')).map((d) => d.trim().toLowerCase());
      filteredResults = filteredResults.filter((r) => {
        const tags = (r.recipe.dietaryTags || []).map((t) => t.toLowerCase());
        return diets.some((d) => {
          if (d === 'vegetarian') return tags.includes('vegetarian') || tags.includes('vegan');
          if (d === 'vegan') return tags.includes('vegan');
          if (d === 'high protein') return (r.recipe.nutrition?.protein || 0) >= 20 || tags.includes('high protein') || tags.includes('high-protein');
          if (d === 'low carb') return (r.recipe.nutrition?.carbs || 0) <= 20 || tags.includes('low carb') || tags.includes('low-carb') || tags.includes('keto');
          if (d === 'low calorie') return (r.recipe.nutrition?.calories || 0) <= 400 || tags.includes('low calorie') || tags.includes('low-calorie');
          if (d === 'gluten free') return tags.includes('gluten-free') || tags.includes('gluten free');
          if (d === 'dairy free') return tags.includes('dairy-free') || tags.includes('dairy free');
          return tags.includes(d);
        });
      });
    }

    if (cookingTimeFilter && cookingTimeFilter !== 'all') {
      filteredResults = filteredResults.filter((r) => {
        const total = (r.recipe.prepTimeMinutes || 0) + (r.recipe.cookTimeMinutes || 0);
        if (cookingTimeFilter === 'under-15' || cookingTimeFilter === '15') return total <= 15;
        if (cookingTimeFilter === '15-30') return total >= 15 && total <= 30;
        if (cookingTimeFilter === '30-60') return total >= 30 && total <= 60;
        if (cookingTimeFilter === '60-plus' || cookingTimeFilter === '60+') return total >= 60;
        return true;
      });
    } else if (maxTimeFilter) {
      filteredResults = filteredResults.filter((r) => {
        const total = (r.recipe.prepTimeMinutes || 0) + (r.recipe.cookTimeMinutes || 0);
        return total <= Number(maxTimeFilter);
      });
    }

    if (cuisineFilter && cuisineFilter !== 'All') {
      filteredResults = filteredResults.filter((r) => r.recipe.cuisine?.toLowerCase() === cuisineFilter.toLowerCase());
    }

    if (mealTypeFilter && mealTypeFilter !== 'Any' && mealTypeFilter !== 'All') {
      filteredResults = filteredResults.filter((r) => r.recipe.mealType?.toLowerCase() === mealTypeFilter.toLowerCase());
    }

    if (difficultyFilter && difficultyFilter !== 'All') {
      filteredResults = filteredResults.filter((r) => r.recipe.difficulty?.toLowerCase() === difficultyFilter.toLowerCase());
    }

    const formattedResults = filteredResults.map((r) => {
      const formatted = formatRecipeNutrition(r.recipe);
      return {
        _id: r.recipe._id,
        recipeId: r.recipe._id,
        id: r.recipe._id,
        title: r.recipe.title,
        description: r.recipe.description,
        imageUrl: r.recipe.imageUrl,
        prepTime: formatted.prepTimeMinutes,
        cookTime: formatted.cookTimeMinutes,
        prepTimeMinutes: formatted.prepTimeMinutes,
        cookTimeMinutes: formatted.cookTimeMinutes,
        totalTimeMinutes: formatted.totalTimeMinutes,
        difficulty: r.recipe.difficulty,
        cuisine: r.recipe.cuisine,
        mealType: r.recipe.mealType,
        servings: r.recipe.servings,
        dietaryTags: r.recipe.dietaryTags,
        rating: r.recipe.rating,
        nutrition: formatted.nutrition,
        matchPercentage: r.matchPercentage,
        matchedIngredients: r.matchedIngredients,
        missingIngredients: r.missingIngredients,
        matchedCount: r.matchedIngredients?.length || 0,
        missingCount: r.missingIngredients?.length || 0,
        substitutions: r.substitutions,
        isFavorite: userFavorites.has(r.recipe._id.toString()),
      };
    });

    res.json({
      success: true,
      count: formattedResults.length,
      results: formattedResults,
      matches: formattedResults,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search recipes
// @route   GET /api/recipes/search
const searchRecipes = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required.' });
    }

    const rawRecipes = await Recipe.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { cuisine: { $regex: q, $options: 'i' } },
      ],
    })
      .populate('ingredients.ingredientId', 'name icon')
      .limit(20)
      .lean();

    const recipes = rawRecipes.map(formatRecipeNutrition);

    res.json({ success: true, count: recipes.length, recipes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create recipe (Authenticated user or Admin)
// @route   POST /api/recipes
const createRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Recipe created!', recipe: formatRecipeNutrition(recipe.toObject()) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update recipe (Author or Admin)
// @route   PUT /api/recipes/:id
const updateRecipe = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid recipe ID format.' });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    if (recipe.createdBy && recipe.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this recipe.' });
    }

    Object.assign(recipe, req.body);
    await recipe.save();

    res.json({ success: true, message: 'Recipe updated!', recipe: formatRecipeNutrition(recipe.toObject()) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete recipe (Author or Admin)
// @route   DELETE /api/recipes/:id
const deleteRecipe = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid recipe ID format.' });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    if (recipe.createdBy && recipe.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this recipe.' });
    }

    await recipe.deleteOne();
    res.json({ success: true, message: 'Recipe deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recommended recipes based on user preferences, pantry, and favorites
// @route   GET /api/recipes/recommendations or GET /api/recommendations
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user?._id;
    const limit = Number(req.query.limit) || 8;
    const recipes = await generateRecommendations(userId, { limit });
    const formatted = recipes.map(formatRecipeNutrition);
    res.json({ success: true, count: formatted.length, recipes: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record that a user finished cooking a recipe
// @route   POST /api/recipes/:id/cook
const recordCooking = async (req, res) => {
  try {
    const recipeId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ success: false, message: 'Invalid recipe ID.' });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    const history = await CookingHistory.create({
      userId: req.user._id,
      recipeId,
      cookedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Cooking completion recorded! 👨‍🍳✨',
      history,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRecipes,
  getRecipeById,
  matchRecipesHandler,
  searchRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecommendations,
  recordCooking,
};
