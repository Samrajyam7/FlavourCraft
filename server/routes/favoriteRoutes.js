const express = require('express');
const { getFavorites, addFavorite, removeFavorite, checkFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getFavorites);
router.get('/check/:recipeId', checkFavorite);
router.post('/:recipeId', addFavorite);
router.delete('/:recipeId', removeFavorite);

module.exports = router;
