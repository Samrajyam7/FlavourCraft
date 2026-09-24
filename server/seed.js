require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const Ingredient = require('./models/Ingredient');
const Recipe = require('./models/Recipe');
const User = require('./models/User');

const ingredientData = [
  { name: 'Egg', category: 'Protein', icon: '🥚', unit: 'piece', substitutes: ['Flax Egg', 'Banana', 'Yogurt'], nutrition: { calories: 78, protein: 6, carbs: 0.6, fat: 5 } },
  { name: 'Milk', category: 'Dairy', icon: '🥛', unit: 'ml', substitutes: ['Soy Milk', 'Almond Milk', 'Coconut Milk'], nutrition: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 } },
  { name: 'Cheese', category: 'Dairy', icon: '🧀', unit: 'gram', substitutes: ['Paneer', 'Tofu', 'Yogurt'], nutrition: { calories: 402, protein: 25, carbs: 1.3, fat: 33 } },
  { name: 'Tomato', category: 'Vegetables', icon: '🍅', unit: 'piece', substitutes: ['Tomato Paste', 'Capsicum', 'Sun-dried Tomato'], nutrition: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 } },
  { name: 'Onion', category: 'Vegetables', icon: '🧅', unit: 'piece', substitutes: ['Shallots', 'Leek', 'Spring Onion'], nutrition: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 } },
  { name: 'Garlic', category: 'Vegetables', icon: '🧄', unit: 'clove', substitutes: ['Garlic Powder', 'Ginger', 'Shallots'], nutrition: { calories: 149, protein: 6.4, carbs: 33, fat: 0.5 } },
  { name: 'Chicken', category: 'Protein', icon: '🍗', unit: 'gram', substitutes: ['Tofu', 'Paneer', 'Mushroom'], nutrition: { calories: 239, protein: 27, carbs: 0, fat: 14 } },
  { name: 'Rice', category: 'Grains', icon: '🍚', unit: 'cup', substitutes: ['Quinoa', 'Pasta', 'Cauliflower Rice'], nutrition: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 } },
  { name: 'Pasta', category: 'Grains', icon: '🍝', unit: 'gram', substitutes: ['Rice', 'Noodles', 'Zucchini Noodles'], nutrition: { calories: 131, protein: 5, carbs: 25, fat: 1.1 } },
  { name: 'Potato', category: 'Vegetables', icon: '🥔', unit: 'piece', substitutes: ['Sweet Potato', 'Cauliflower', 'Turnip'], nutrition: { calories: 87, protein: 1.9, carbs: 20, fat: 0.1 } },
  { name: 'Carrot', category: 'Vegetables', icon: '🥕', unit: 'piece', substitutes: ['Pumpkin', 'Sweet Potato', 'Parsnip'], nutrition: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 } },
  { name: 'Spinach', category: 'Vegetables', icon: '🥬', unit: 'cup', substitutes: ['Kale', 'Swiss Chard', 'Coriander'], nutrition: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 } },
  { name: 'Butter', category: 'Dairy', icon: '🧈', unit: 'gram', substitutes: ['Olive Oil', 'Ghee', 'Coconut Oil'], nutrition: { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 } },
  { name: 'Olive Oil', category: 'Pantry', icon: '🫒', unit: 'tbsp', substitutes: ['Vegetable Oil', 'Butter', 'Coconut Oil'], nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100 } },
  { name: 'Salt', category: 'Spices', icon: '🧂', unit: 'tsp', substitutes: ['Soy Sauce', 'Sea Salt', 'Himalayan Salt'], nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
  { name: 'Pepper', category: 'Spices', icon: '🌶️', unit: 'tsp', substitutes: ['Chilli Flakes', 'Paprika', 'White Pepper'], nutrition: { calories: 251, protein: 10, carbs: 64, fat: 3.3 } },
  { name: 'Bread', category: 'Grains', icon: '🍞', unit: 'slice', substitutes: ['Tortilla', 'Wrap', 'Rice Cakes'], nutrition: { calories: 265, protein: 9, carbs: 49, fat: 3.2 } },
  { name: 'Flour', category: 'Grains', icon: '🌾', unit: 'cup', substitutes: ['Almond Flour', 'Rice Flour', 'Oat Flour'], nutrition: { calories: 364, protein: 10, carbs: 76, fat: 1 } },
  { name: 'Sugar', category: 'Pantry', icon: '🍬', unit: 'tsp', substitutes: ['Honey', 'Maple Syrup', 'Jaggery'], nutrition: { calories: 387, protein: 0, carbs: 100, fat: 0 } },
  { name: 'Lemon', category: 'Fruits', icon: '🍋', unit: 'piece', substitutes: ['Vinegar', 'Lime', 'Yogurt'], nutrition: { calories: 29, protein: 1.1, carbs: 9.3, fat: 0.3 } },
  { name: 'Capsicum', category: 'Vegetables', icon: '🫑', unit: 'piece', substitutes: ['Carrot', 'Zucchini', 'Tomato'], nutrition: { calories: 31, protein: 1, carbs: 6, fat: 0.3 } },
  { name: 'Green Peas', category: 'Vegetables', icon: '🫛', unit: 'cup', substitutes: ['Edamame', 'Corn', 'Broad Beans'], nutrition: { calories: 81, protein: 5.4, carbs: 14, fat: 0.4 } },
  { name: 'Paneer', category: 'Dairy', icon: '🧊', unit: 'gram', substitutes: ['Tofu', 'Chicken', 'Cheese'], nutrition: { calories: 321, protein: 21, carbs: 1.2, fat: 25 } },
  { name: 'Yogurt', category: 'Dairy', icon: '🥣', unit: 'cup', substitutes: ['Sour Cream', 'Buttermilk', 'Milk'], nutrition: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 } },
  { name: 'Ginger', category: 'Spices', icon: '🫚', unit: 'inch', substitutes: ['Garlic', 'Ginger Powder', 'Turmeric'], nutrition: { calories: 80, protein: 1.8, carbs: 18, fat: 0.8 } },
  { name: 'Coriander', category: 'Spices', icon: '🌿', unit: 'tbsp', substitutes: ['Parsley', 'Basil', 'Mint'], nutrition: { calories: 23, protein: 2.1, carbs: 3.7, fat: 0.5 } },
  { name: 'Chilli', category: 'Spices', icon: '🌶️', unit: 'piece', substitutes: ['Chilli Powder', 'Cayenne Pepper', 'Paprika'], nutrition: { calories: 40, protein: 1.9, carbs: 8.8, fat: 0.4 } },
  { name: 'Mushroom', category: 'Vegetables', icon: '🍄', unit: 'gram', substitutes: ['Eggplant', 'Tofu', 'Zucchini'], nutrition: { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 } },
  { name: 'Corn', category: 'Vegetables', icon: '🌽', unit: 'cup', substitutes: ['Peas', 'Edamame', 'Chickpeas'], nutrition: { calories: 86, protein: 3.2, carbs: 19, fat: 1.2 } },
  { name: 'Tofu', category: 'Protein', icon: '🫘', unit: 'gram', substitutes: ['Paneer', 'Chicken', 'Mushroom'], nutrition: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8 } },
];

const buildRecipes = (ingMap) => [
  {
    title: 'Classic Omelette',
    description: 'A fluffy, golden omelette filled with melted cheese, fresh tomatoes, and caramelized onions. Perfect for a quick and satisfying breakfast or brunch.',
    imageUrl: 'https://images.unsplash.com/photo-1612240498936-65f5101365d2?w=800&q=80',
    prepTimeMinutes: 5, cookTimeMinutes: 10, difficulty: 'Easy',
    cuisine: 'French', mealType: 'Breakfast', servings: 2,
    dietaryTags: ['vegetarian'],
    nutrition: { calories: 320, protein: 22, carbs: 8, fat: 22, fiber: 1 },
    popularity: 95,
    ingredients: [
      { ingredientId: ingMap['egg'], amount: '3 eggs', isOptional: false, importance: 3 },
      { ingredientId: ingMap['cheese'], amount: '50g shredded', isOptional: false, importance: 2 },
      { ingredientId: ingMap['butter'], amount: '1 tbsp', isOptional: false, importance: 2 },
      { ingredientId: ingMap['onion'], amount: '½ onion, diced', isOptional: false, importance: 1.5 },
      { ingredientId: ingMap['tomato'], amount: '1 tomato, chopped', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['salt'], amount: 'to taste', isOptional: false, importance: 1 },
      { ingredientId: ingMap['pepper'], amount: 'to taste', isOptional: true, importance: 1 },
    ],
    instructions: [
      { step: 1, description: 'Crack eggs into a bowl, season with salt and pepper, and whisk until smooth.' },
      { step: 2, description: 'Melt butter in a non-stick pan over medium heat.' },
      { step: 3, description: 'Sauté diced onion for 2 minutes until soft.' },
      { step: 4, description: 'Pour in the egg mixture. When edges start to set, add cheese and tomato.' },
      { step: 5, description: 'Fold the omelette in half and cook for 1 more minute. Serve hot.' },
    ],
  },
  {
    title: 'Vegetable Fried Rice',
    description: 'Vibrant fried rice loaded with colorful vegetables, scrambled egg, and aromatic garlic. A wholesome one-pan meal ready in under 20 minutes.',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80',
    prepTimeMinutes: 10, cookTimeMinutes: 15, difficulty: 'Easy',
    cuisine: 'Chinese', mealType: 'Lunch', servings: 3,
    dietaryTags: ['vegetarian'],
    nutrition: { calories: 380, protein: 12, carbs: 62, fat: 10, fiber: 4 },
    popularity: 88,
    ingredients: [
      { ingredientId: ingMap['rice'], amount: '2 cups cooked', isOptional: false, importance: 3 },
      { ingredientId: ingMap['egg'], amount: '2 eggs', isOptional: true, importance: 2 },
      { ingredientId: ingMap['carrot'], amount: '1 carrot, diced', isOptional: false, importance: 2 },
      { ingredientId: ingMap['capsicum'], amount: '1 capsicum, diced', isOptional: false, importance: 2 },
      { ingredientId: ingMap['green peas'], amount: '½ cup', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['onion'], amount: '1 onion, sliced', isOptional: false, importance: 2 },
      { ingredientId: ingMap['garlic'], amount: '3 cloves, minced', isOptional: false, importance: 2 },
      { ingredientId: ingMap['olive oil'], amount: '2 tbsp', isOptional: false, importance: 1.5 },
      { ingredientId: ingMap['salt'], amount: 'to taste', isOptional: false, importance: 1 },
      { ingredientId: ingMap['pepper'], amount: 'to taste', isOptional: true, importance: 1 },
    ],
    instructions: [
      { step: 1, description: 'Heat oil in a wok or large pan over high heat.' },
      { step: 2, description: 'Sauté garlic and onion for 1 minute until fragrant.' },
      { step: 3, description: 'Add carrots and capsicum, stir-fry for 3 minutes.' },
      { step: 4, description: 'Push vegetables to the side, scramble the eggs in the center.' },
      { step: 5, description: 'Add cooked rice and green peas, toss everything together.' },
      { step: 6, description: 'Season with salt and pepper. Serve hot.' },
    ],
  },
  {
    title: 'Chicken Fried Rice',
    description: 'Restaurant-style chicken fried rice with tender marinated chicken, aromatic ginger, and smoky wok-tossed rice. Better than takeout!',
    imageUrl: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=800&q=80',
    prepTimeMinutes: 15, cookTimeMinutes: 20, difficulty: 'Medium',
    cuisine: 'Chinese', mealType: 'Dinner', servings: 4,
    dietaryTags: ['non-vegetarian'],
    nutrition: { calories: 450, protein: 28, carbs: 58, fat: 12, fiber: 2 },
    popularity: 90,
    ingredients: [
      { ingredientId: ingMap['rice'], amount: '2 cups cooked', isOptional: false, importance: 3 },
      { ingredientId: ingMap['chicken'], amount: '300g, cubed', isOptional: false, importance: 3 },
      { ingredientId: ingMap['egg'], amount: '2 eggs', isOptional: true, importance: 2 },
      { ingredientId: ingMap['onion'], amount: '1 onion, sliced', isOptional: false, importance: 2 },
      { ingredientId: ingMap['garlic'], amount: '4 cloves, minced', isOptional: false, importance: 2 },
      { ingredientId: ingMap['ginger'], amount: '1 inch piece', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['capsicum'], amount: '1 capsicum, diced', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['olive oil'], amount: '2 tbsp', isOptional: false, importance: 1.5 },
      { ingredientId: ingMap['salt'], amount: 'to taste', isOptional: false, importance: 1 },
      { ingredientId: ingMap['pepper'], amount: 'to taste', isOptional: true, importance: 1 },
    ],
    instructions: [
      { step: 1, description: 'Marinate chicken with salt, pepper, and half the garlic for 10 minutes.' },
      { step: 2, description: 'Heat oil in wok, cook chicken until golden. Set aside.' },
      { step: 3, description: 'In same wok, sauté garlic, ginger, and onion.' },
      { step: 4, description: 'Scramble eggs, then add rice and vegetables.' },
      { step: 5, description: 'Return chicken to wok, toss everything. Season and serve.' },
    ],
  },
  {
    title: 'Pasta Carbonara',
    description: 'A silky, rich Italian classic made with eggs, aged cheese, and black pepper. No cream needed — the magic is in the egg and cheese emulsion.',
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80',
    prepTimeMinutes: 10, cookTimeMinutes: 15, difficulty: 'Medium',
    cuisine: 'Italian', mealType: 'Dinner', servings: 2,
    dietaryTags: ['vegetarian'],
    nutrition: { calories: 520, protein: 24, carbs: 62, fat: 20, fiber: 2 },
    popularity: 85,
    ingredients: [
      { ingredientId: ingMap['pasta'], amount: '200g spaghetti', isOptional: false, importance: 3 },
      { ingredientId: ingMap['egg'], amount: '3 eggs (+ 1 yolk)', isOptional: false, importance: 3 },
      { ingredientId: ingMap['cheese'], amount: '80g Parmesan/Pecorino', isOptional: false, importance: 2.5 },
      { ingredientId: ingMap['butter'], amount: '1 tbsp', isOptional: false, importance: 2 },
      { ingredientId: ingMap['garlic'], amount: '2 cloves', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['pepper'], amount: '1 tsp freshly ground', isOptional: false, importance: 1.5 },
      { ingredientId: ingMap['salt'], amount: 'to taste', isOptional: false, importance: 1 },
    ],
    instructions: [
      { step: 1, description: 'Cook pasta in salted boiling water until al dente. Reserve 1 cup pasta water.' },
      { step: 2, description: 'Whisk eggs, egg yolk, and cheese together in a bowl.' },
      { step: 3, description: 'Sauté garlic in butter, then remove from heat.' },
      { step: 4, description: 'Add hot pasta to the pan. Pour egg mixture over, tossing quickly.' },
      { step: 5, description: 'Add pasta water as needed for creaminess. Season generously with black pepper.' },
    ],
  },
  {
    title: 'Tomato Pasta',
    description: 'A vibrant Italian tomato pasta with garlic-infused olive oil sauce, fresh tomatoes, and a sprinkle of cheese. Simple, delicious, and ready in 20 minutes.',
    imageUrl: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80',
    prepTimeMinutes: 5, cookTimeMinutes: 20, difficulty: 'Easy',
    cuisine: 'Italian', mealType: 'Dinner', servings: 2,
    dietaryTags: ['vegetarian'],
    nutrition: { calories: 420, protein: 14, carbs: 68, fat: 11, fiber: 5 },
    popularity: 78,
    ingredients: [
      { ingredientId: ingMap['pasta'], amount: '200g', isOptional: false, importance: 3 },
      { ingredientId: ingMap['tomato'], amount: '4 tomatoes, chopped', isOptional: false, importance: 3 },
      { ingredientId: ingMap['garlic'], amount: '4 cloves, minced', isOptional: false, importance: 2 },
      { ingredientId: ingMap['onion'], amount: '1 onion, diced', isOptional: false, importance: 2 },
      { ingredientId: ingMap['olive oil'], amount: '3 tbsp', isOptional: false, importance: 2 },
      { ingredientId: ingMap['cheese'], amount: '30g grated', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['salt'], amount: 'to taste', isOptional: false, importance: 1 },
      { ingredientId: ingMap['pepper'], amount: 'to taste', isOptional: true, importance: 1 },
    ],
    instructions: [
      { step: 1, description: 'Cook pasta in salted boiling water until al dente.' },
      { step: 2, description: 'Heat olive oil, sauté garlic and onion until golden.' },
      { step: 3, description: 'Add tomatoes, cook for 10 minutes until sauce forms.' },
      { step: 4, description: 'Toss pasta with sauce. Top with cheese and serve.' },
    ],
  },
  {
    title: 'Tomato Soup',
    description: 'A warming, velvety tomato soup with a touch of cream, perfect for chilly days. Pairs beautifully with crusty garlic bread.',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
    prepTimeMinutes: 10, cookTimeMinutes: 25, difficulty: 'Easy',
    cuisine: 'American', mealType: 'Lunch', servings: 4,
    dietaryTags: ['vegetarian'],
    nutrition: { calories: 180, protein: 4, carbs: 24, fat: 9, fiber: 4 },
    popularity: 72,
    ingredients: [
      { ingredientId: ingMap['tomato'], amount: '6 tomatoes, halved', isOptional: false, importance: 3 },
      { ingredientId: ingMap['onion'], amount: '1 onion, quartered', isOptional: false, importance: 2 },
      { ingredientId: ingMap['garlic'], amount: '4 cloves', isOptional: false, importance: 2 },
      { ingredientId: ingMap['butter'], amount: '2 tbsp', isOptional: false, importance: 1.5 },
      { ingredientId: ingMap['milk'], amount: '½ cup', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['salt'], amount: 'to taste', isOptional: false, importance: 1 },
      { ingredientId: ingMap['pepper'], amount: 'to taste', isOptional: true, importance: 1 },
    ],
    instructions: [
      { step: 1, description: 'Roast tomatoes, onion, and garlic at 200°C for 20 minutes.' },
      { step: 2, description: 'Blend roasted vegetables until smooth.' },
      { step: 3, description: 'Pour into pot, add butter and milk. Simmer 5 minutes.' },
      { step: 4, description: 'Season with salt and pepper. Serve hot with crusty bread.' },
    ],
  },
  {
    title: 'Garlic Butter Chicken',
    description: 'Succulent pan-seared chicken bathed in golden garlic butter with a squeeze of lemon. An impressive yet easy dinner that feels restaurant-worthy.',
    imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=800&q=80',
    prepTimeMinutes: 10, cookTimeMinutes: 20, difficulty: 'Medium',
    cuisine: 'American', mealType: 'Dinner', servings: 2,
    dietaryTags: ['non-vegetarian', 'gluten-free'],
    nutrition: { calories: 480, protein: 42, carbs: 5, fat: 32, fiber: 0 },
    popularity: 92,
    ingredients: [
      { ingredientId: ingMap['chicken'], amount: '400g breast/thigh', isOptional: false, importance: 3 },
      { ingredientId: ingMap['garlic'], amount: '6 cloves, minced', isOptional: false, importance: 3 },
      { ingredientId: ingMap['butter'], amount: '3 tbsp', isOptional: false, importance: 2.5 },
      { ingredientId: ingMap['lemon'], amount: '1 lemon', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['coriander'], amount: '2 tbsp fresh', isOptional: true, importance: 1 },
      { ingredientId: ingMap['salt'], amount: 'to taste', isOptional: false, importance: 1 },
      { ingredientId: ingMap['pepper'], amount: 'to taste', isOptional: true, importance: 1 },
    ],
    instructions: [
      { step: 1, description: 'Season chicken with salt and pepper.' },
      { step: 2, description: 'Melt 1 tbsp butter in skillet over high heat. Sear chicken 5 min per side until golden.' },
      { step: 3, description: 'Reduce heat, add remaining butter and garlic. Baste chicken for 3 minutes.' },
      { step: 4, description: 'Squeeze lemon juice over chicken. Garnish with coriander and serve.' },
    ],
  },
  {
    title: 'Vegetable Pasta',
    description: 'A garden-fresh pasta loaded with colorful vegetables, spinach, and a light garlic olive oil sauce. Healthy, vibrant, and ready in 25 minutes.',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    prepTimeMinutes: 10, cookTimeMinutes: 20, difficulty: 'Easy',
    cuisine: 'Italian', mealType: 'Dinner', servings: 3,
    dietaryTags: ['vegetarian', 'vegan'],
    nutrition: { calories: 380, protein: 12, carbs: 66, fat: 9, fiber: 6 },
    popularity: 76,
    ingredients: [
      { ingredientId: ingMap['pasta'], amount: '250g', isOptional: false, importance: 3 },
      { ingredientId: ingMap['tomato'], amount: '2 tomatoes', isOptional: false, importance: 2 },
      { ingredientId: ingMap['capsicum'], amount: '1 capsicum', isOptional: false, importance: 2 },
      { ingredientId: ingMap['spinach'], amount: '2 cups', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['onion'], amount: '1 onion', isOptional: false, importance: 2 },
      { ingredientId: ingMap['garlic'], amount: '3 cloves', isOptional: false, importance: 2 },
      { ingredientId: ingMap['olive oil'], amount: '3 tbsp', isOptional: false, importance: 2 },
      { ingredientId: ingMap['cheese'], amount: '30g grated', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['salt'], amount: 'to taste', isOptional: false, importance: 1 },
    ],
    instructions: [
      { step: 1, description: 'Cook pasta until al dente. Reserve pasta water.' },
      { step: 2, description: 'Sauté garlic and onion in olive oil until golden.' },
      { step: 3, description: 'Add capsicum and tomatoes, cook 5 minutes.' },
      { step: 4, description: 'Toss in spinach until wilted. Add pasta and toss.' },
      { step: 5, description: 'Add a splash of pasta water, top with cheese and serve.' },
    ],
  },
  {
    title: 'Paneer Curry',
    description: 'Tender cubes of paneer simmered in a rich, spiced tomato-onion gravy. This classic North Indian curry is aromatic, creamy, and absolutely soul-warming.',
    imageUrl: 'https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=800&q=80',
    prepTimeMinutes: 15, cookTimeMinutes: 25, difficulty: 'Medium',
    cuisine: 'Indian', mealType: 'Dinner', servings: 4,
    dietaryTags: ['vegetarian'],
    nutrition: { calories: 380, protein: 18, carbs: 18, fat: 26, fiber: 4 },
    popularity: 89,
    ingredients: [
      { ingredientId: ingMap['paneer'], amount: '250g, cubed', isOptional: false, importance: 3 },
      { ingredientId: ingMap['tomato'], amount: '3 tomatoes, pureed', isOptional: false, importance: 3 },
      { ingredientId: ingMap['onion'], amount: '2 onions, sliced', isOptional: false, importance: 2.5 },
      { ingredientId: ingMap['garlic'], amount: '4 cloves', isOptional: false, importance: 2 },
      { ingredientId: ingMap['ginger'], amount: '1 inch piece', isOptional: false, importance: 2 },
      { ingredientId: ingMap['yogurt'], amount: '2 tbsp', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['chilli'], amount: '1-2 green chilli', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['coriander'], amount: '2 tbsp fresh', isOptional: true, importance: 1 },
      { ingredientId: ingMap['olive oil'], amount: '2 tbsp', isOptional: false, importance: 1.5 },
      { ingredientId: ingMap['salt'], amount: 'to taste', isOptional: false, importance: 1 },
    ],
    instructions: [
      { step: 1, description: 'Heat oil, fry onions until deep golden brown.' },
      { step: 2, description: 'Add garlic and ginger paste, sauté 2 minutes.' },
      { step: 3, description: 'Add tomato puree, cook until oil separates.' },
      { step: 4, description: 'Add paneer cubes, yogurt, and chilli. Simmer 10 minutes.' },
      { step: 5, description: 'Garnish with coriander. Serve with rice or bread.' },
    ],
  },
  {
    title: 'Paneer Fried Rice',
    description: 'A fusion delight — crispy paneer cubes tossed with fragrant basmati rice, colorful capsicum, and aromatic spices. A crowd-pleaser!',
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    prepTimeMinutes: 15, cookTimeMinutes: 20, difficulty: 'Medium',
    cuisine: 'Indo-Chinese', mealType: 'Lunch', servings: 3,
    dietaryTags: ['vegetarian'],
    nutrition: { calories: 420, protein: 18, carbs: 55, fat: 16, fiber: 3 },
    popularity: 80,
    ingredients: [
      { ingredientId: ingMap['rice'], amount: '2 cups cooked', isOptional: false, importance: 3 },
      { ingredientId: ingMap['paneer'], amount: '200g, cubed', isOptional: false, importance: 3 },
      { ingredientId: ingMap['capsicum'], amount: '1 capsicum', isOptional: false, importance: 2 },
      { ingredientId: ingMap['onion'], amount: '1 onion', isOptional: false, importance: 2 },
      { ingredientId: ingMap['garlic'], amount: '3 cloves', isOptional: false, importance: 1.5 },
      { ingredientId: ingMap['ginger'], amount: '½ inch piece', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['olive oil'], amount: '2 tbsp', isOptional: false, importance: 1.5 },
      { ingredientId: ingMap['salt'], amount: 'to taste', isOptional: false, importance: 1 },
      { ingredientId: ingMap['pepper'], amount: 'to taste', isOptional: true, importance: 1 },
    ],
    instructions: [
      { step: 1, description: 'Pan-fry paneer cubes until golden. Set aside.' },
      { step: 2, description: 'Sauté garlic, ginger, and onion in oil until fragrant.' },
      { step: 3, description: 'Add capsicum, stir-fry 3 minutes.' },
      { step: 4, description: 'Add rice and paneer, toss well. Season and serve.' },
    ],
  },
  {
    title: 'Egg Curry',
    description: 'Hard-boiled eggs simmered in a bold, spiced tomato-onion masala. This Indian egg curry is hearty, flavorful, and pairs perfectly with rice or roti.',
    imageUrl: 'https://images.unsplash.com/photo-1613844237701-8f3664fc2eff?w=800&q=80',
    prepTimeMinutes: 10, cookTimeMinutes: 25, difficulty: 'Medium',
    cuisine: 'Indian', mealType: 'Dinner', servings: 3,
    dietaryTags: ['non-vegetarian'],
    nutrition: { calories: 280, protein: 18, carbs: 16, fat: 17, fiber: 3 },
    popularity: 82,
    ingredients: [
      { ingredientId: ingMap['egg'], amount: '6 eggs, hard-boiled', isOptional: false, importance: 3 },
      { ingredientId: ingMap['tomato'], amount: '3 tomatoes, pureed', isOptional: false, importance: 3 },
      { ingredientId: ingMap['onion'], amount: '2 onions, finely chopped', isOptional: false, importance: 2.5 },
      { ingredientId: ingMap['garlic'], amount: '4 cloves, minced', isOptional: false, importance: 2 },
      { ingredientId: ingMap['ginger'], amount: '1 inch piece', isOptional: false, importance: 2 },
      { ingredientId: ingMap['chilli'], amount: '1-2 green chilli', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['coriander'], amount: '2 tbsp fresh', isOptional: true, importance: 1 },
      { ingredientId: ingMap['olive oil'], amount: '2 tbsp', isOptional: false, importance: 1.5 },
      { ingredientId: ingMap['salt'], amount: 'to taste', isOptional: false, importance: 1 },
    ],
    instructions: [
      { step: 1, description: 'Hard-boil eggs, peel and score with fork.' },
      { step: 2, description: 'Fry onions until golden, add garlic and ginger.' },
      { step: 3, description: 'Add tomato puree and chilli, cook until oil separates.' },
      { step: 4, description: 'Add eggs, coat with masala. Simmer 10 minutes.' },
      { step: 5, description: 'Garnish with coriander. Serve with rice.' },
    ],
  },
  {
    title: 'Cheese & Veggie Sandwich',
    description: 'A toasted sandwich packed with fresh vegetables, melted cheese, and a golden butter crust. Quick, satisfying, and endlessly customizable.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    prepTimeMinutes: 5, cookTimeMinutes: 5, difficulty: 'Easy',
    cuisine: 'American', mealType: 'Snack', servings: 1,
    dietaryTags: ['vegetarian'],
    nutrition: { calories: 340, protein: 14, carbs: 38, fat: 15, fiber: 3 },
    popularity: 70,
    ingredients: [
      { ingredientId: ingMap['bread'], amount: '2 slices', isOptional: false, importance: 3 },
      { ingredientId: ingMap['cheese'], amount: '40g, sliced', isOptional: true, importance: 2 },
      { ingredientId: ingMap['tomato'], amount: '1 tomato, sliced', isOptional: false, importance: 2 },
      { ingredientId: ingMap['butter'], amount: '1 tbsp', isOptional: false, importance: 1.5 },
      { ingredientId: ingMap['onion'], amount: '½ onion, sliced', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['capsicum'], amount: '¼ capsicum', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['salt'], amount: 'to taste', isOptional: false, importance: 1 },
    ],
    instructions: [
      { step: 1, description: 'Butter one side of each bread slice.' },
      { step: 2, description: 'Layer tomato, onion, capsicum, and cheese on unbuttered side.' },
      { step: 3, description: 'Grill in pan until golden and cheese melts. Serve hot.' },
    ],
  },
  {
    title: 'Garlic Bread',
    description: 'Crispy on the outside, soft on the inside — this classic garlic bread with herb butter is the perfect side dish or snack. Ready in just 10 minutes!',
    imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=800&q=80',
    prepTimeMinutes: 5, cookTimeMinutes: 10, difficulty: 'Easy',
    cuisine: 'Italian', mealType: 'Snack', servings: 2,
    dietaryTags: ['vegetarian'],
    nutrition: { calories: 280, protein: 6, carbs: 32, fat: 15, fiber: 1 },
    popularity: 75,
    ingredients: [
      { ingredientId: ingMap['bread'], amount: '1 baguette or 4 slices', isOptional: false, importance: 3 },
      { ingredientId: ingMap['garlic'], amount: '4 cloves, minced', isOptional: false, importance: 3 },
      { ingredientId: ingMap['butter'], amount: '50g softened', isOptional: false, importance: 2.5 },
      { ingredientId: ingMap['coriander'], amount: '1 tbsp fresh', isOptional: true, importance: 1 },
      { ingredientId: ingMap['salt'], amount: 'pinch', isOptional: true, importance: 0.5 },
    ],
    instructions: [
      { step: 1, description: 'Mix softened butter with garlic, coriander, and salt.' },
      { step: 2, description: 'Spread garlic butter generously on bread slices.' },
      { step: 3, description: 'Bake at 180°C for 8-10 minutes until golden and crispy.' },
    ],
  },
  {
    title: 'Fluffy Pancakes',
    description: 'Light, airy pancakes with a golden exterior and pillowy soft interior. Stack them high and serve with honey or fresh fruit for a weekend breakfast treat.',
    imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
    prepTimeMinutes: 10, cookTimeMinutes: 15, difficulty: 'Easy',
    cuisine: 'American', mealType: 'Breakfast', servings: 4,
    dietaryTags: ['vegetarian'],
    nutrition: { calories: 320, protein: 9, carbs: 48, fat: 11, fiber: 1 },
    popularity: 88,
    ingredients: [
      { ingredientId: ingMap['flour'], amount: '1½ cups', isOptional: false, importance: 3 },
      { ingredientId: ingMap['egg'], amount: '2 eggs', isOptional: false, importance: 2.5 },
      { ingredientId: ingMap['milk'], amount: '1 cup', isOptional: false, importance: 2.5 },
      { ingredientId: ingMap['butter'], amount: '2 tbsp melted', isOptional: false, importance: 2 },
      { ingredientId: ingMap['sugar'], amount: '2 tbsp', isOptional: false, importance: 2 },
      { ingredientId: ingMap['salt'], amount: 'pinch', isOptional: true, importance: 0.5 },
    ],
    instructions: [
      { step: 1, description: 'Mix flour, sugar, and salt. Whisk in eggs, milk, and melted butter until smooth.' },
      { step: 2, description: 'Heat a non-stick pan over medium heat, lightly grease.' },
      { step: 3, description: 'Pour ¼ cup batter per pancake. Cook until bubbles form, then flip.' },
      { step: 4, description: 'Cook 1 minute more until golden. Serve with honey or fruit.' },
    ],
  },
  {
    title: 'French Toast',
    description: 'Thick bread slices soaked in a vanilla-egg custard and pan-fried to golden perfection. Dust with sugar for an indulgent morning treat.',
    imageUrl: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80',
    prepTimeMinutes: 5, cookTimeMinutes: 10, difficulty: 'Easy',
    cuisine: 'French', mealType: 'Breakfast', servings: 2,
    dietaryTags: ['vegetarian'],
    nutrition: { calories: 380, protein: 14, carbs: 46, fat: 17, fiber: 2 },
    popularity: 84,
    ingredients: [
      { ingredientId: ingMap['bread'], amount: '4 thick slices', isOptional: false, importance: 3 },
      { ingredientId: ingMap['egg'], amount: '3 eggs', isOptional: false, importance: 3 },
      { ingredientId: ingMap['milk'], amount: '½ cup', isOptional: false, importance: 2 },
      { ingredientId: ingMap['butter'], amount: '2 tbsp', isOptional: false, importance: 2 },
      { ingredientId: ingMap['sugar'], amount: '2 tbsp for dusting', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['salt'], amount: 'pinch', isOptional: true, importance: 0.5 },
    ],
    instructions: [
      { step: 1, description: 'Whisk eggs, milk, and a pinch of salt in a shallow bowl.' },
      { step: 2, description: 'Dip bread slices in egg mixture, coating both sides.' },
      { step: 3, description: 'Fry in butter over medium heat until golden on each side.' },
      { step: 4, description: 'Dust with sugar and serve immediately.' },
    ],
  },
  {
    title: 'Mushroom Pasta',
    description: 'Earthy mushrooms sautéed in garlic butter tossed with al dente pasta. A simple yet deeply satisfying Italian pasta dish with umami richness.',
    imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80',
    prepTimeMinutes: 10, cookTimeMinutes: 20, difficulty: 'Easy',
    cuisine: 'Italian', mealType: 'Dinner', servings: 2,
    dietaryTags: ['vegetarian'],
    nutrition: { calories: 440, protein: 16, carbs: 58, fat: 17, fiber: 5 },
    popularity: 83,
    ingredients: [
      { ingredientId: ingMap['pasta'], amount: '200g', isOptional: false, importance: 3 },
      { ingredientId: ingMap['mushroom'], amount: '250g, sliced', isOptional: false, importance: 3 },
      { ingredientId: ingMap['garlic'], amount: '4 cloves, minced', isOptional: false, importance: 2 },
      { ingredientId: ingMap['butter'], amount: '2 tbsp', isOptional: false, importance: 2 },
      { ingredientId: ingMap['olive oil'], amount: '2 tbsp', isOptional: false, importance: 1.5 },
      { ingredientId: ingMap['cheese'], amount: '30g Parmesan', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['salt'], amount: 'to taste', isOptional: false, importance: 1 },
      { ingredientId: ingMap['pepper'], amount: 'to taste', isOptional: true, importance: 1 },
    ],
    instructions: [
      { step: 1, description: 'Cook pasta until al dente. Reserve pasta water.' },
      { step: 2, description: 'Heat butter and olive oil, sauté garlic 1 minute.' },
      { step: 3, description: 'Add mushrooms, cook until golden and liquid evaporates.' },
      { step: 4, description: 'Toss mushrooms with pasta and a splash of pasta water. Top with cheese.' },
    ],
  },
  {
    title: 'Chicken Pasta',
    description: 'Juicy grilled chicken pieces tossed with pasta in a garlicky tomato sauce. A complete, protein-packed meal that comes together in under 30 minutes.',
    imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80',
    prepTimeMinutes: 10, cookTimeMinutes: 25, difficulty: 'Medium',
    cuisine: 'Italian', mealType: 'Dinner', servings: 3,
    dietaryTags: ['non-vegetarian'],
    nutrition: { calories: 520, protein: 32, carbs: 58, fat: 16, fiber: 4 },
    popularity: 87,
    ingredients: [
      { ingredientId: ingMap['pasta'], amount: '250g', isOptional: false, importance: 3 },
      { ingredientId: ingMap['chicken'], amount: '300g, sliced', isOptional: false, importance: 3 },
      { ingredientId: ingMap['tomato'], amount: '2 tomatoes, chopped', isOptional: true, importance: 2 },
      { ingredientId: ingMap['garlic'], amount: '4 cloves', isOptional: false, importance: 2 },
      { ingredientId: ingMap['onion'], amount: '1 onion', isOptional: false, importance: 2 },
      { ingredientId: ingMap['olive oil'], amount: '2 tbsp', isOptional: false, importance: 1.5 },
      { ingredientId: ingMap['cheese'], amount: '40g Parmesan', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['salt'], amount: 'to taste', isOptional: false, importance: 1 },
      { ingredientId: ingMap['pepper'], amount: 'to taste', isOptional: true, importance: 1 },
    ],
    instructions: [
      { step: 1, description: 'Season and cook chicken until golden. Slice and set aside.' },
      { step: 2, description: 'Cook pasta. In same pan, sauté garlic and onion.' },
      { step: 3, description: 'Add tomatoes, cook 5 minutes. Add pasta and chicken.' },
      { step: 4, description: 'Toss well, top with Parmesan and serve.' },
    ],
  },
  {
    title: 'Classic Fried Rice',
    description: 'The ultimate comfort food — fluffy rice stir-fried with eggs, vegetables, and seasoning. A quick and satisfying meal using leftover rice.',
    imageUrl: 'https://images.unsplash.com/photo-1645696301019-35adcc18cbb3?w=800&q=80',
    prepTimeMinutes: 5, cookTimeMinutes: 15, difficulty: 'Easy',
    cuisine: 'Asian', mealType: 'Lunch', servings: 2,
    dietaryTags: ['vegetarian'],
    nutrition: { calories: 350, protein: 10, carbs: 62, fat: 9, fiber: 2 },
    popularity: 86,
    ingredients: [
      { ingredientId: ingMap['rice'], amount: '2 cups cooked', isOptional: false, importance: 3 },
      { ingredientId: ingMap['egg'], amount: '2 eggs', isOptional: false, importance: 2.5 },
      { ingredientId: ingMap['onion'], amount: '1 onion, sliced', isOptional: false, importance: 2 },
      { ingredientId: ingMap['garlic'], amount: '3 cloves, minced', isOptional: false, importance: 2 },
      { ingredientId: ingMap['carrot'], amount: '1 carrot, diced', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['olive oil'], amount: '2 tbsp', isOptional: false, importance: 1.5 },
      { ingredientId: ingMap['salt'], amount: 'to taste', isOptional: false, importance: 1 },
      { ingredientId: ingMap['pepper'], amount: 'to taste', isOptional: true, importance: 1 },
    ],
    instructions: [
      { step: 1, description: 'Heat oil in wok or large pan over high heat.' },
      { step: 2, description: 'Sauté garlic and onion until golden.' },
      { step: 3, description: 'Add carrot, stir-fry 2 minutes. Push to side.' },
      { step: 4, description: 'Scramble eggs in center, then mix with vegetables.' },
      { step: 5, description: 'Add rice, toss well. Season and serve.' },
    ],
  },
  {
    title: 'Vegetable Soup',
    description: 'A comforting, chunky vegetable soup with root vegetables, spinach, and aromatic herbs. Light, nutritious, and perfect for a cold evening.',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
    prepTimeMinutes: 15, cookTimeMinutes: 30, difficulty: 'Easy',
    cuisine: 'International', mealType: 'Lunch', servings: 4,
    dietaryTags: ['vegetarian', 'vegan', 'gluten-free'],
    nutrition: { calories: 160, protein: 5, carbs: 32, fat: 3, fiber: 8 },
    popularity: 71,
    ingredients: [
      { ingredientId: ingMap['carrot'], amount: '2 carrots, diced', isOptional: false, importance: 2.5 },
      { ingredientId: ingMap['potato'], amount: '2 potatoes, cubed', isOptional: false, importance: 2.5 },
      { ingredientId: ingMap['onion'], amount: '1 onion, chopped', isOptional: false, importance: 2 },
      { ingredientId: ingMap['tomato'], amount: '2 tomatoes, chopped', isOptional: false, importance: 2 },
      { ingredientId: ingMap['garlic'], amount: '3 cloves', isOptional: false, importance: 2 },
      { ingredientId: ingMap['spinach'], amount: '1 cup', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['olive oil'], amount: '1 tbsp', isOptional: false, importance: 1 },
      { ingredientId: ingMap['salt'], amount: 'to taste', isOptional: false, importance: 1 },
      { ingredientId: ingMap['pepper'], amount: 'to taste', isOptional: true, importance: 1 },
    ],
    instructions: [
      { step: 1, description: 'Heat oil in large pot, sauté onion and garlic.' },
      { step: 2, description: 'Add carrots, potatoes, and tomatoes. Stir 2 minutes.' },
      { step: 3, description: 'Cover with water (4 cups), bring to boil. Simmer 20 minutes.' },
      { step: 4, description: 'Add spinach in last 2 minutes. Season and serve.' },
    ],
  },
  {
    title: 'Potato Curry',
    description: 'Soft potatoes in a fragrant, spiced tomato gravy — a simple yet deeply satisfying Indian curry. Comfort food at its finest, best served with warm roti.',
    imageUrl: 'https://images.unsplash.com/photo-1571197119733-a7e93f04c9b1?w=800&q=80',
    prepTimeMinutes: 10, cookTimeMinutes: 25, difficulty: 'Easy',
    cuisine: 'Indian', mealType: 'Dinner', servings: 3,
    dietaryTags: ['vegetarian', 'vegan', 'gluten-free'],
    nutrition: { calories: 220, protein: 5, carbs: 38, fat: 8, fiber: 5 },
    popularity: 74,
    ingredients: [
      { ingredientId: ingMap['potato'], amount: '4 potatoes, cubed', isOptional: false, importance: 3 },
      { ingredientId: ingMap['tomato'], amount: '3 tomatoes, pureed', isOptional: false, importance: 2.5 },
      { ingredientId: ingMap['onion'], amount: '2 onions, chopped', isOptional: false, importance: 2.5 },
      { ingredientId: ingMap['garlic'], amount: '4 cloves', isOptional: false, importance: 2 },
      { ingredientId: ingMap['ginger'], amount: '1 inch piece', isOptional: true, importance: 2 },
      { ingredientId: ingMap['chilli'], amount: '1-2 green chilli', isOptional: true, importance: 1.5 },
      { ingredientId: ingMap['coriander'], amount: '2 tbsp fresh', isOptional: true, importance: 1 },
      { ingredientId: ingMap['olive oil'], amount: '2 tbsp', isOptional: false, importance: 1.5 },
      { ingredientId: ingMap['salt'], amount: 'to taste', isOptional: false, importance: 1 },
    ],
    instructions: [
      { step: 1, description: 'Boil potatoes until just tender. Drain and set aside.' },
      { step: 2, description: 'Heat oil, fry onions until golden.' },
      { step: 3, description: 'Add garlic, ginger, and chilli. Sauté 2 minutes.' },
      { step: 4, description: 'Add tomato puree, cook until oil separates.' },
      { step: 5, description: 'Add potatoes, simmer 10 minutes. Garnish with coriander.' },
    ],
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting FlavorCraft seed process...\n');

    // Clear existing data
    await Ingredient.deleteMany({});
    await Recipe.deleteMany({});
    console.log('🗑️  Cleared existing ingredients and recipes.');

    // Seed ingredients
    const createdIngredients = await Ingredient.insertMany(ingredientData);
    console.log(`✅ Created ${createdIngredients.length} ingredients.`);

    // Build ingredient name -> ID map
    const ingMap = {};
    createdIngredients.forEach((ing) => {
      ingMap[ing.name.toLowerCase()] = ing._id;
    });

    // Seed recipes
    const recipes = buildRecipes(ingMap);
    const createdRecipes = await Recipe.insertMany(recipes);
    console.log(`✅ Created ${createdRecipes.length} recipes.`);

    // Create admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@flavorcraft.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@flavorcraft.com',
        password: 'admin123456',
        role: 'admin',
      });
      console.log('✅ Created admin user: admin@flavorcraft.com / admin123456');
    } else {
      console.log('ℹ️  Admin user already exists.');
    }

    console.log('\n🎉 FlavorCraft database seeded successfully!\n');
    console.log('📋 Summary:');
    console.log(`   - ${createdIngredients.length} ingredients`);
    console.log(`   - ${createdRecipes.length} recipes`);
    console.log('   - 1 admin user (admin@flavorcraft.com)');
    console.log('\n🔐 Admin credentials:');
    console.log('   Email: admin@flavorcraft.com');
    console.log('   Password: admin123456');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    if (error.errors) {
      Object.entries(error.errors).forEach(([key, val]) => {
        console.error(`   - ${key}: ${val.message}`);
      });
    }
    process.exit(1);
  }
};

seedDatabase();
