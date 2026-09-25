/**
 * FlavorCraft Recipe Matching Engine
 *
 * Weighted Matching Algorithm:
 * - Each recipe ingredient has an 'importance' score (0.5 to 3.0)
 * - Optional ingredients do not penalize the match score
 * - Score = (sum of matched required ingredient importance / sum of all required ingredient importance) * 100
 * - Bonus: up to 5% added for matched optional ingredients
 * - Final score capped at 100%
 */

const Ingredient = require('../models/Ingredient');
const { getSubstitutes } = require('./substitutions');

const getIngredientIdStr = (ingredientId) => {
  if (!ingredientId) return '';
  if (typeof ingredientId === 'object' && ingredientId._id) {
    return ingredientId._id.toString();
  }
  return ingredientId.toString();
};

/**
 * Calculate match percentage for a single recipe
 * @param {Array} recipeIngredients - Array of recipe ingredient objects
 * @param {Set} userIngredientSet - Set of user ingredient IDs (strings)
 * @returns {Object} matchResult with score, matched, missing, substitutions
 */
function calculateRecipeMatch(recipeIngredients, userIngredientSet) {
  const required = recipeIngredients.filter((ri) => !ri.isOptional);
  const optional = recipeIngredients.filter((ri) => ri.isOptional);

  const totalRequiredWeight = required.reduce((sum, ri) => sum + (ri.importance || 2), 0);

  let matchedRequiredWeight = 0;
  const matchedIngredients = [];
  const missingIngredients = [];

  // Check required ingredients
  for (const ri of required) {
    const riId = getIngredientIdStr(ri.ingredientId);
    if (userIngredientSet.has(riId)) {
      matchedRequiredWeight += ri.importance || 2;
      matchedIngredients.push(ri);
    } else {
      missingIngredients.push(ri);
    }
  }

  // Check optional ingredients for bonus
  let optionalMatchCount = 0;
  for (const ri of optional) {
    const riId = getIngredientIdStr(ri.ingredientId);
    if (userIngredientSet.has(riId)) {
      optionalMatchCount++;
      matchedIngredients.push(ri);
    }
  }

  // Calculate score strictly from required ingredients (Rule 3, 4, 5)
  let matchPercentage = 0;
  if (totalRequiredWeight > 0) {
    matchPercentage = Math.min(Math.max(Math.round((matchedRequiredWeight / totalRequiredWeight) * 100), 0), 100);
  } else if (recipeIngredients.length > 0) {
    // If a recipe has only optional ingredients, base on matched optional count
    matchPercentage = Math.min(Math.max(Math.round((optionalMatchCount / optional.length) * 100), 0), 100);
  }

  return {
    matchPercentage,
    matchedIngredients,
    missingIngredients,
    matchedCount: matchedIngredients.length,
    totalCount: recipeIngredients.length,
  };
}

/**
 * Find substitutions for missing ingredients
 * @param {Array} missingIngredients - Array of missing recipe ingredient objects
 * @param {Map} ingredientMap - Map of ingredient ID -> ingredient object
 * @param {Set} userIngredientSet - Set of user ingredient IDs
 * @param {Map} ingredientNameMap - Map of ingredient name (lowercase) -> ingredient object
 * @returns {Array} substitution suggestions
 */
function findSubstitutions(missingIngredients, ingredientMap, userIngredientSet, ingredientNameMap) {
  const substitutions = [];

  for (const ri of missingIngredients) {
    const idStr = getIngredientIdStr(ri.ingredientId);
    const ingredient = (ri.ingredientId && ri.ingredientId.name) ? ri.ingredientId : ingredientMap.get(idStr);
    if (!ingredient) continue;

    const subs = getSubstitutes(ingredient.name);
    const availableSubs = subs.filter((subName) => {
      const subIng = ingredientNameMap.get(subName.toLowerCase());
      return subIng && userIngredientSet.has(subIng._id.toString());
    });

    if (availableSubs.length > 0) {
      substitutions.push({
        ingredient: ingredient.name,
        ingredientId: ingredient._id,
        availableSubstitutes: availableSubs,
        allSubstitutes: subs,
      });
    } else if (subs.length > 0) {
      substitutions.push({
        ingredient: ingredient.name,
        ingredientId: ingredient._id,
        availableSubstitutes: [],
        allSubstitutes: subs,
      });
    }
  }

  return substitutions;
}

/**
 * Match recipes against user's available ingredients
 * @param {Array} recipes - Array of populated Recipe documents
 * @param {Array} userIngredients - Array of Ingredient documents the user has
 * @returns {Array} Sorted array of recipe match results
 */
function matchRecipes(recipes, userIngredients) {
  const userIngredientSet = new Set(userIngredients.map((i) => i._id.toString()));

  // Build ingredient maps for fast lookup
  const ingredientMap = new Map();
  const ingredientNameMap = new Map();
  for (const ing of userIngredients) {
    ingredientMap.set(ing._id.toString(), ing);
    ingredientNameMap.set(ing.name.toLowerCase(), ing);
  }

  const results = [];

  for (const recipe of recipes) {
    if (!recipe.ingredients || recipe.ingredients.length === 0) continue;

    // Only include recipes with at least one matching ingredient
    const hasAnyMatch = recipe.ingredients.some((ri) => {
      const riId = getIngredientIdStr(ri.ingredientId);
      return userIngredientSet.has(riId);
    });

    if (!hasAnyMatch) continue;

    const { matchPercentage, matchedIngredients, missingIngredients } = calculateRecipeMatch(
      recipe.ingredients,
      userIngredientSet
    );

    // Build ingredient details maps from the populated recipe
    const recipeIngMap = new Map();
    if (recipe.ingredients) {
      for (const ri of recipe.ingredients) {
        if (ri.ingredientId && ri.ingredientId._id) {
          recipeIngMap.set(ri.ingredientId._id.toString(), ri.ingredientId);
        } else if (ri.ingredientId) {
          // ingredientId is just an ID, not populated
        }
      }
    }

    // Find substitutions for missing required ingredients
    const missingRequired = missingIngredients.filter((ri) => !ri.isOptional);

    // Build a combined ingredient map from recipe's populated ingredients
    const combinedIngMap = new Map();
    const combinedNameMap = new Map();
    for (const ri of recipe.ingredients) {
      if (ri.ingredientId && typeof ri.ingredientId === 'object') {
        combinedIngMap.set(ri.ingredientId._id.toString(), ri.ingredientId);
        combinedNameMap.set(ri.ingredientId.name.toLowerCase(), ri.ingredientId);
      }
    }

    // Merge with user ingredient maps
    for (const [k, v] of ingredientMap) combinedIngMap.set(k, v);
    for (const [k, v] of ingredientNameMap) combinedNameMap.set(k, v);

    const substitutions = findSubstitutions(
      missingIngredients,
      combinedIngMap,
      userIngredientSet,
      combinedNameMap
    );

    results.push({
      recipe,
      matchPercentage,
      matchedIngredients: matchedIngredients.map((ri) => ({
        id: ri.ingredientId?._id || ri.ingredientId,
        name: ri.ingredientId?.name || 'Unknown',
        icon: ri.ingredientId?.icon || '🥗',
        amount: ri.amount,
        isOptional: ri.isOptional,
      })),
      missingIngredients: missingIngredients.map((ri) => ({
        id: ri.ingredientId?._id || ri.ingredientId,
        name: ri.ingredientId?.name || 'Unknown',
        icon: ri.ingredientId?.icon || '🥗',
        amount: ri.amount,
        isOptional: ri.isOptional,
      })),
      substitutions,
    });
  }

  // Sort by match percentage (highest first), then by popularity
  results.sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    return (b.recipe.popularity || 0) - (a.recipe.popularity || 0);
  });

  return results;
}

module.exports = { matchRecipes, calculateRecipeMatch };
