const mongoose = require('mongoose');

const cookingHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
    cookedAt: {
      type: Date,
      default: Date.now,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

cookingHistorySchema.index({ userId: 1, cookedAt: -1 });

module.exports = mongoose.model('CookingHistory', cookingHistorySchema);
