const Review = require('../models/Review');
const Recipe = require('../models/Recipe');

// @desc    Get reviews for a recipe
// @route   GET /api/recipes/:recipeId/reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ recipeId: req.params.recipeId })
      .populate('userId', 'name avatar')
      .sort('-createdAt')
      .lean();

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or update a review
// @route   POST /api/recipes/:recipeId/reviews
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    // Upsert review
    const review = await Review.findOneAndUpdate(
      { userId: req.user._id, recipeId: req.params.recipeId },
      { rating, comment },
      { new: true, upsert: true, runValidators: true }
    ).populate('userId', 'name avatar');

    // Recalculate average rating
    const stats = await Review.aggregate([
      { $match: { recipeId: recipe._id } },
      { $group: { _id: '$recipeId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      await Recipe.findByIdAndUpdate(req.params.recipeId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].count,
      });
    }

    res.status(201).json({ success: true, message: 'Review submitted!', review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Recalculate average rating after deletion
    const stats = await Review.aggregate([
      { $match: { recipeId: review.recipeId } },
      { $group: { _id: '$recipeId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      await Recipe.findByIdAndUpdate(review.recipeId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].count,
      });
    } else {
      await Recipe.findByIdAndUpdate(review.recipeId, { rating: 0, reviewCount: 0 });
    }

    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getReviews, createReview, deleteReview };
