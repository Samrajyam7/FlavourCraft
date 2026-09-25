const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const Favorite = require('../models/Favorite');
const { matchRecipes } = require('../utils/recipeMatcher');

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
      maxTime,
      minMatch,
      page = 1,
      limit = 12,
      sort = '-popularity',
    } = req.query;

    const query = {};
    if (search) query.$text = { $search: search };
    if (cuisine) query.cuisine = cuisine;
    if (mealType) query.mealType = mealType;
    if (difficulty) query.difficulty = difficulty;
    if (dietaryTags) {
      const tags = dietaryTags.split(',').map((t) => t.trim());
      query.dietaryTags = { $in: tags };
    }
    if (maxTime) {
      query.$expr = {
        $lte: [{ $add: ['$prepTimeMinutes', '$cookTimeMinutes'] }, Number(maxTime)],
      };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Recipe.countDocuments(query);
    const recipes = await Recipe.find(query)
      .populate('ingredients.ingredientId', 'name icon category unit substitutes')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

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
        message: 'Please provide at least one ingredient ID.',
      });
    }

    // Validate and fetch user ingredients
    const userIngredients = await Ingredient.find({
      _id: { $in: userIngredientIds },
    }).lean();

    if (userIngredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid ingredients found. Please select ingredients first.',
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
        message: 'No recipes found for the selected ingredients.',
      });
    }

    const results = matchRecipes(recipes, userIngredients);

    // Get favorites for the authenticated user if logged in
    let userFavorites = new Set();
    if (req.user) {
      const favs = await Favorite.find({ userId: req.user._id }).lean();
      userFavorites = new Set(favs.map((f) => f.recipeId.toString()));
    }

    const formattedResults = results.map((r) => ({
      _id: r.recipe._id,
      recipeId: r.recipe._id,
      id: r.recipe._id,
      title: r.recipe.title,
      description: r.recipe.description,
      imageUrl: r.recipe.imageUrl,
      prepTime: r.recipe.prepTimeMinutes || r.recipe.prepTime || 0,
      cookTime: r.recipe.cookTimeMinutes || r.recipe.cookTime || 0,
      prepTimeMinutes: r.recipe.prepTimeMinutes,
      cookTimeMinutes: r.recipe.cookTimeMinutes,
      difficulty: r.recipe.difficulty,
      cuisine: r.recipe.cuisine,
      mealType: r.recipe.mealType,
      servings: r.recipe.servings,
      dietaryTags: r.recipe.dietaryTags,
      rating: r.recipe.rating,
      nutrition: r.recipe.nutrition,
      matchPercentage: r.matchPercentage,
      matchedIngredients: r.matchedIngredients,
      missingIngredients: r.missingIngredients,
      matchedCount: r.matchedIngredients?.length || 0,
      missingCount: r.missingIngredients?.length || 0,
      substitutions: r.substitutions,
      isFavorite: userFavorites.has(r.recipe._id.toString()),
    }));

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

    const recipes = await Recipe.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { cuisine: { $regex: q, $options: 'i' } },
      ],
    })
      .populate('ingredients.ingredientId', 'name icon')
      .limit(20)
      .lean();

    res.json({ success: true, count: recipes.length, recipes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create recipe (Admin)
// @route   POST /api/recipes
const createRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Recipe created!', recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update recipe (Admin)
// @route   PUT /api/recipes/:id
const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }
    res.json({ success: true, message: 'Recipe updated!', recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete recipe (Admin)
// @route   DELETE /api/recipes/:id
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }
    res.json({ success: true, message: 'Recipe deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recommended recipes based on user data
// @route   GET /api/recipes/recommendations
const getRecommendations = async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .sort('-popularity -rating')
      .limit(6)
      .populate('ingredients.ingredientId', 'name icon')
      .lean();
    res.json({ success: true, recipes });
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
};
