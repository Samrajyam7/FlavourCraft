const express = require('express');
const { getPreferences, updatePreferences } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getPreferences);
router.put('/', updatePreferences);

module.exports = router;
