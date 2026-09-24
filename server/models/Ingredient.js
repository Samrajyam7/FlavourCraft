const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ingredient name is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Produce', 'Dairy', 'Protein', 'Pantry', 'Spices', 'Grains', 'Fruits', 'Vegetables'],
    },
    icon: {
      type: String,
      default: '🥗',
    },
    unit: {
      type: String,
      default: 'piece',
    },
    substitutes: {
      type: [String],
      default: [],
    },
    nutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Index for fast text search
ingredientSchema.index({ name: 'text', category: 1 });

module.exports = mongoose.model('Ingredient', ingredientSchema);
