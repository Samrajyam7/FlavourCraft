const Ingredient = require('../models/Ingredient');

// @desc    Get all ingredients
// @route   GET /api/ingredients
const getIngredients = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 100 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Ingredient.countDocuments(query);
    const ingredients = await Ingredient.find(query)
      .sort({ category: 1, name: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      count: ingredients.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      ingredients,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all distinct categories
// @route   GET /api/ingredients/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Ingredient.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get ingredient by ID
// @route   GET /api/ingredients/:id
const getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id).lean();
    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found.' });
    }
    res.json({ success: true, ingredient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create ingredient (Admin)
// @route   POST /api/ingredients
const createIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.create(req.body);
    res.status(201).json({ success: true, message: 'Ingredient created!', ingredient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ingredient (Admin)
// @route   PUT /api/ingredients/:id
const updateIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found.' });
    }
    res.json({ success: true, message: 'Ingredient updated!', ingredient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete ingredient (Admin)
// @route   DELETE /api/ingredients/:id
const deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found.' });
    }
    res.json({ success: true, message: 'Ingredient deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getIngredients, getCategories, getIngredientById, createIngredient, updateIngredient, deleteIngredient };
