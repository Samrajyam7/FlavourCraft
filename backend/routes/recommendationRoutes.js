const express = require('express');
const { getRecommendations } = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Support recommendations for both authenticated users and guests (with fallback)
router.get('/', (req, res, next) => {
  // Try protect middleware optionally
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
}, getRecommendations);

module.exports = router;
