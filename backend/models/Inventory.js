const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      default: 'piece',
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent duplicate ingredient entries per user
inventorySchema.index({ userId: 1, ingredientId: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
