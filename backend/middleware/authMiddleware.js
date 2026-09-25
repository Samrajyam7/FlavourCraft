const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'flavorcraft_jwt_secret_key_2024_xK9mP2qR8nL5vW3jY7hT1';
    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token structure.' });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found. Token invalid.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
    }
    return res.status(401).json({ success: false, message: 'Not authorized. Invalid token.' });
  }
};

module.exports = { protect };
