const mongoose = require('mongoose');

const recipeIngredientSchema = new mongoose.Schema(
  {
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    isOptional: {
      type: Boolean,
      default: false,
    },
    importance: {
      type: Number,
      default: 2,
      min: 0.5,
      max: 3,
    },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Recipe title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800',
    },
    prepTimeMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    cookTimeMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    cuisine: {
      type: String,
      default: 'International',
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Any'],
      default: 'Any',
    },
    servings: {
      type: Number,
      default: 2,
      min: 1,
    },
    ingredients: [recipeIngredientSchema],
    instructions: [
      {
        step: Number,
        description: String,
      },
    ],
    dietaryTags: {
      type: [String],
      enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'non-vegetarian', 'egg-free'],
      default: [],
    },
    nutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    popularity: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Index for fast search
recipeSchema.index({ title: 'text', description: 'text' });
recipeSchema.index({ 'ingredients.ingredientId': 1 });
recipeSchema.index({ cuisine: 1, mealType: 1, difficulty: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);
