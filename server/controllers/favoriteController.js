const Favorite = require('../models/Favorite');
const Recipe = require('../models/Recipe');

// @desc    Get user favorites
// @route   GET /api/favorites
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .populate({
        path: 'recipeId',
        populate: { path: 'ingredients.ingredientId', select: 'name icon' },
      })
      .sort('-createdAt')
      .lean();

    const recipes = favorites
      .filter((f) => f.recipeId)
      .map((f) => ({ ...f.recipeId, favoriteId: f._id, isFavorite: true }));

    res.json({ success: true, count: recipes.length, recipes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add recipe to favorites
// @route   POST /api/favorites/:recipeId
const addFavorite = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    const existing = await Favorite.findOne({
      userId: req.user._id,
      recipeId: req.params.recipeId,
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Recipe already in favorites.' });
    }

    const favorite = await Favorite.create({
      userId: req.user._id,
      recipeId: req.params.recipeId,
    });

    // Increment popularity
    await Recipe.findByIdAndUpdate(req.params.recipeId, { $inc: { popularity: 1 } });

    res.status(201).json({ success: true, message: 'Added to favorites!', favorite });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove recipe from favorites
// @route   DELETE /api/favorites/:recipeId
const removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      userId: req.user._id,
      recipeId: req.params.recipeId,
    });

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite not found.' });
    }

    res.json({ success: true, message: 'Removed from favorites.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if a recipe is favorited
// @route   GET /api/favorites/check/:recipeId
const checkFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      userId: req.user._id,
      recipeId: req.params.recipeId,
    });
    res.json({ success: true, isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite, checkFavorite };
