const Recipe = require('../models/Recipe');
const Inventory = require('../models/Inventory');
const Favorite = require('../models/Favorite');
const CookingHistory = require('../models/CookingHistory');
const User = require('../models/User');

/**
 * Transparent scoring-based recommendation engine
 * @param {Object} user - User document or userId
 * @param {Object} options - { limit: 10 }
 * @returns {Array} List of recommended recipes with recommendationScore & recommendationReason
 */
async function generateRecommendations(userId, options = {}) {
  const limit = options.limit || 8;

  // 1. Fetch user profile & preferences
  let user = null;
  if (userId) {
    user = await User.findById(userId).lean();
  }

  const userDietary = (user?.dietaryPreferences || []).map((d) => d.toLowerCase().trim());
  const userCookingTime = (user?.preferredCookingTime || '').toLowerCase().trim();
  const userFavCategories = (user?.favoriteCategories || []).map((c) => c.toLowerCase().trim());

  // 2. Fetch user's pantry ingredients
  let pantryIngredientIds = new Set();
  let pantryIngredientNames = new Set();
  if (userId) {
    const pantryItems = await Inventory.find({
      userId,
      status: { $ne: 'Finished' },
    })
      .populate('ingredientId', 'name')
      .lean();

    pantryItems.forEach((item) => {
      if (item.ingredientId?._id) {
        pantryIngredientIds.add(item.ingredientId._id.toString());
      }
      if (item.ingredientId?.name) {
        pantryIngredientNames.add(item.ingredientId.name.toLowerCase().trim());
      }
    });
  }

  // 3. Fetch user's favorite recipes
  let favoriteRecipeIds = new Set();
  let favoriteCuisines = new Set();
  if (userId) {
    const favorites = await Favorite.find({ userId }).populate('recipeId', 'cuisine mealType').lean();
    favorites.forEach((fav) => {
      if (fav.recipeId?._id) {
        favoriteRecipeIds.add(fav.recipeId._id.toString());
        if (fav.recipeId.cuisine) favoriteCuisines.add(fav.recipeId.cuisine.toLowerCase());
      }
    });
  }

  // 4. Fetch user's cooking history
  let cookedRecipeIds = new Set();
  if (userId) {
    const history = await CookingHistory.find({ userId }).lean();
    history.forEach((h) => {
      if (h.recipeId) cookedRecipeIds.add(h.recipeId.toString());
    });
  }

  // 5. Fetch all candidate recipes
  const allRecipes = await Recipe.find({})
    .populate('ingredients.ingredientId', 'name icon category unit')
    .lean();

  if (!allRecipes || allRecipes.length === 0) {
    return [];
  }

  // Helper to check cooking time match
  const matchesCookingTime = (totalTime, prefTime) => {
    if (!prefTime || prefTime === 'any') return true;
    if (prefTime.includes('15') && (prefTime.includes('under') || prefTime.includes('<'))) {
      return totalTime <= 15;
    }
    if (prefTime.includes('15-30') || prefTime.includes('15–30') || prefTime.includes('30')) {
      return totalTime >= 15 && totalTime <= 30;
    }
    if (prefTime.includes('30-60') || prefTime.includes('30–60')) {
      return totalTime >= 30 && totalTime <= 60;
    }
    if (prefTime.includes('60') || prefTime.includes('plus')) {
      return totalTime >= 60;
    }
    return true;
  };

  // 6. Score each recipe
  const scoredRecipes = allRecipes.map((recipe) => {
    let score = 0;
    const reasons = [];

    const totalTime =
      (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

    const recipeTags = (recipe.dietaryTags || []).map((t) => t.toLowerCase().trim());
    const recipeCuisine = (recipe.cuisine || '').toLowerCase().trim();
    const recipeCategory = (recipe.category || recipe.mealType || '').toLowerCase().trim();

    // +30 if recipe matches user's dietary preference
    if (userDietary.length > 0) {
      const matchesDiet = userDietary.some((diet) => {
        if (diet === 'no preference') return true;
        if (diet === 'vegetarian' && (recipeTags.includes('vegetarian') || recipeTags.includes('vegan'))) return true;
        if (diet === 'vegan' && recipeTags.includes('vegan')) return true;
        if (diet === 'high protein' && ((recipe.nutrition?.protein || 0) >= 20 || recipeTags.includes('high protein') || recipeTags.includes('high-protein'))) return true;
        if (diet === 'low carb' && ((recipe.nutrition?.carbs || 0) <= 20 || recipeTags.includes('low carb') || recipeTags.includes('low-carb') || recipeTags.includes('keto'))) return true;
        if (diet === 'low calorie' && ((recipe.nutrition?.calories || 0) <= 400 || recipeTags.includes('low calorie') || recipeTags.includes('low-calorie'))) return true;
        if (diet === 'gluten free' && (recipeTags.includes('gluten-free') || recipeTags.includes('gluten free'))) return true;
        if (diet === 'dairy free' && (recipeTags.includes('dairy-free') || recipeTags.includes('dairy free'))) return true;
        return recipeTags.includes(diet);
      });

      if (matchesDiet) {
        score += 30;
        const matchedName = userDietary.find((d) => d !== 'no preference') || 'dietary';
        reasons.push(`Matches your ${matchedName} preference`);
      }
    }

    // +25 if recipe uses available pantry ingredients
    let matchedPantryCount = 0;
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach((ri) => {
        const idStr = ri.ingredientId?._id?.toString() || ri.ingredientId?.toString();
        const nameStr = (ri.ingredientId?.name || ri.name || '').toLowerCase().trim();
        if ((idStr && pantryIngredientIds.has(idStr)) || (nameStr && pantryIngredientNames.has(nameStr))) {
          matchedPantryCount++;
        }
      });
    }

    if (matchedPantryCount > 0) {
      const ratio = matchedPantryCount / recipe.ingredients.length;
      const pantryBonus = Math.round(25 * ratio);
      score += pantryBonus;
      if (ratio >= 0.5) {
        reasons.push(`You already have ${matchedPantryCount} of ${recipe.ingredients.length} ingredients in your pantry`);
      } else {
        reasons.push(`Uses ingredients from your pantry`);
      }
    }

    // +20 if similar to favorite recipes or user favorites
    if (favoriteRecipeIds.has(recipe._id.toString())) {
      score += 20;
      reasons.push('One of your saved favorites');
    } else if (favoriteCuisines.has(recipeCuisine)) {
      score += 15;
      reasons.push(`Matches your favorite ${recipe.cuisine} cuisine`);
    }

    // +15 if cooking time matches preference
    if (userCookingTime && userCookingTime !== 'any') {
      if (matchesCookingTime(totalTime, userCookingTime)) {
        score += 15;
        reasons.push(`Quick ${totalTime}m cooking time matches your schedule`);
      }
    } else if (totalTime <= 30) {
      score += 10;
      reasons.push(`Quick 30-minute meal`);
    }

    // +10 if recipe category matches previous activity or user favorite categories
    if (userFavCategories.length > 0 && (userFavCategories.includes(recipeCategory) || userFavCategories.includes(recipeCuisine))) {
      score += 10;
      reasons.push(`Based on your interest in ${recipe.category || recipe.cuisine}`);
    } else if (cookedRecipeIds.has(recipe._id.toString())) {
      score += 10;
      reasons.push('Cooked by you previously');
    }

    // Base score from rating / popularity
    const baseScore = Math.min(Math.round((recipe.rating || 4.5) * 4), 20);
    score += baseScore;

    // Fallback reason if none triggered
    if (reasons.length === 0) {
      if (recipe.rating >= 4.5) {
        reasons.push('Highly rated by the FlavorCraft chef community');
      } else {
        reasons.push('Popular trending recipe');
      }
    }

    return {
      ...recipe,
      recommendationScore: score,
      recommendationReason: reasons[0] || 'Recommended for you',
      allReasons: reasons,
    };
  });

  // Sort descending by recommendationScore
  scoredRecipes.sort((a, b) => b.recommendationScore - a.recommendationScore);

  return scoredRecipes.slice(0, limit);
}

module.exports = { generateRecommendations };
