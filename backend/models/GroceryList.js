const mongoose = require('mongoose');

const groceryItemSchema = new mongoose.Schema(
  {
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: String,
      default: '1',
    },
    unit: {
      type: String,
      default: 'piece',
    },
    purchased: {
      type: Boolean,
      default: false,
    },
    addedFromRecipe: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const groceryListSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [groceryItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('GroceryList', groceryListSchema);
