const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const Review = require('../models/Review');
const Inventory = require('../models/Inventory');
const Favorite = require('../models/Favorite');

// @desc    Get admin statistics
// @route   GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalRecipes, totalIngredients, totalReviews, totalFavorites] =
      await Promise.all([
        User.countDocuments(),
        Recipe.countDocuments(),
        Ingredient.countDocuments(),
        Review.countDocuments(),
        Favorite.countDocuments(),
      ]);

    const recentUsers = await User.find().sort('-createdAt').limit(5).lean();
    const topRecipes = await Recipe.find().sort('-popularity -rating').limit(5).lean();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalRecipes,
        totalIngredients,
        totalReviews,
        totalFavorites,
      },
      recentUsers,
      topRecipes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt').lean();
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role (Admin)
// @route   PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, message: 'User role updated.', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/admin/reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name email')
      .populate('recipeId', 'title')
      .sort('-createdAt')
      .lean();
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete any review (Admin)
// @route   DELETE /api/admin/reviews/:id
const deleteAnyReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStats, getUsers, updateUserRole, deleteUser, getAllReviews, deleteAnyReview };
