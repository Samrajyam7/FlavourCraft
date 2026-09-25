const Review = require('../models/Review');
const Recipe = require('../models/Recipe');

// @desc    Get reviews for a recipe
// @route   GET /api/reviews/recipe/:recipeId or GET /api/reviews/:recipeId
const getReviews = async (req, res) => {
  try {
    const recipeId = req.params.recipeId || req.params.id;
    const reviews = await Review.find({ recipeId })
      .populate('userId', 'name avatar')
      .sort('-createdAt')
      .lean();

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or update a review
// @route   POST /api/reviews or POST /api/reviews/recipe/:recipeId
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const recipeId = req.params.recipeId || req.body.recipeId;

    if (!recipeId) {
      return res.status(400).json({ success: false, message: 'Recipe ID is required.' });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    // Upsert review
    const review = await Review.findOneAndUpdate(
      { userId: req.user._id, recipeId },
      { rating: Number(rating) || 5, comment: comment || '' },
      { new: true, upsert: true, runValidators: true }
    ).populate('userId', 'name avatar');

    // Recalculate average rating
    const stats = await Review.aggregate([
      { $match: { recipeId: recipe._id } },
      { $group: { _id: '$recipeId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      await Recipe.findByIdAndUpdate(recipeId, {
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
