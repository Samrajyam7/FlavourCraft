const mongoose = require('mongoose');

const mealSlotSchema = new mongoose.Schema(
  {
    breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
    lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
    dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
  },
  { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    weekStart: {
      type: Date,
      default: Date.now,
    },
    meals: {
      monday: { type: mealSlotSchema, default: () => ({}) },
      tuesday: { type: mealSlotSchema, default: () => ({}) },
      wednesday: { type: mealSlotSchema, default: () => ({}) },
      thursday: { type: mealSlotSchema, default: () => ({}) },
      friday: { type: mealSlotSchema, default: () => ({}) },
      saturday: { type: mealSlotSchema, default: () => ({}) },
      sunday: { type: mealSlotSchema, default: () => ({}) },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MealPlan', mealPlanSchema);
