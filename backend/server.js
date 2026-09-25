const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const groceryRoutes = require('./routes/groceryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mealPlanRoutes = require('./routes/mealPlanRoutes');

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Dynamic CORS configuration for local development and all cloud deployments (Vercel, Render, Netlify, Railway, etc.)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

if (process.env.CLIENT_URL) {
  const configured = process.env.CLIENT_URL.split(',').map((url) => url.trim());
  allowedOrigins.push(...configured);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests or same-origin requests (e.g., Postman, mobile, curl)
    if (!origin) return callback(null, true);

    // Allow wildcard if configured
    if (process.env.CLIENT_URL === '*' || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // Check against configured allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Automatically allow preview and production subdomains on popular hosting providers
    if (
      /\.vercel\.app$/.test(origin) ||
      /\.netlify\.app$/.test(origin) ||
      /\.onrender\.com$/.test(origin) ||
      /\.railway\.app$/.test(origin)
    ) {
      return callback(null, true);
    }

    // In development mode, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '🍳 FlavorCraft API is running!',
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/grocery', groceryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mealplan', mealPlanRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🍳 FlavorCraft server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
