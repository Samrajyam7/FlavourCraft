const express = require('express');
const { getReviews, createReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public review reading
router.get('/recipe/:recipeId', getReviews);
router.get('/:recipeId', getReviews);

// Authenticated review creation & deletion
router.post('/recipe/:recipeId', protect, createReview);
router.post('/:recipeId', protect, createReview);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
