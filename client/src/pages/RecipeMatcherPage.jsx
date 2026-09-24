import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Sparkles, SlidersHorizontal, ShoppingCart, RefreshCw, ChefHat, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { recipeService } from '../services/recipeService';
import { ingredientService } from '../services/ingredientService';
import { groceryService } from '../services/groceryService';
import { IngredientPicker } from '../components/ingredient/IngredientPicker';
import { RecipeCard } from '../components/recipe/RecipeCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RecipeMatcherPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { success, warning, error: toastError } = useToast();

  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [matchedRecipes, setMatchedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Filters
  const [minMatchPercentage, setMinMatchPercentage] = useState(30);
  const [mealType, setMealType] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [dietary, setDietary] = useState('');
  const [maxReadyTime, setMaxReadyTime] = useState('');

  // Handle initial ingredients passed via navigation (e.g. from Hero)
  useEffect(() => {
    const handleInitial = async () => {
      if (location.state?.initialIngredients?.length > 0) {
        const names = location.state.initialIngredients;
        try {
          const res = await ingredientService.getIngredients({ limit: 200 });
          const allIngs = res.ingredients || res || [];
          const matched = allIngs.filter((i) =>
            names.some((name) => name.toLowerCase() === i.name.toLowerCase())
          );
          if (matched.length > 0) {
            setSelectedIngredients(matched);
            triggerMatch(matched);
          }
        } catch (e) {
          console.error('Initial ingredients error', e);
        }
      }
    };
    handleInitial();
  }, [location.state]);

  const triggerMatch = async (ingredientsToMatch = selectedIngredients) => {
    if (ingredientsToMatch.length === 0) {
      warning('Please pick at least one ingredient to match recipes!');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const ids = ingredientsToMatch.map((i) => (typeof i === 'object' ? i._id : i));
      const filters = {
        minMatchPercentage: Number(minMatchPercentage),
        mealType: mealType || undefined,
        cuisine: cuisine || undefined,
        dietary: dietary || undefined,
        maxReadyTime: maxReadyTime ? Number(maxReadyTime) : undefined,
      };

      const res = await recipeService.matchRecipes(ids, filters);
      setMatchedRecipes(res.matches || res.recipes || res || []);
    } catch (err) {
      console.error('Match error:', err);
      toastError(err.response?.data?.message || 'Failed to match recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIngredient = (ing) => {
    setSelectedIngredients((prev) => {
      if (prev.some((item) => (item._id || item) === (ing._id || ing))) return prev;
      return [...prev, ing];
    });
  };

  const handleRemoveIngredient = (ing) => {
    setSelectedIngredients((prev) =>
      prev.filter((item) => (item._id || item) !== (ing._id || ing))
    );
  };

  const handleClearAll = () => {
    setSelectedIngredients([]);
    setMatchedRecipes([]);
    setSearched(false);
  };

  const handleAddAllMissingToGrocery = async (recipe) => {
    if (!isAuthenticated) {
      warning('Please sign in to add missing ingredients to your grocery list');
      navigate('/login');
      return;
    }

    try {
      const missingIds = recipe.missingIngredients?.map((i) => i._id || i.ingredient?._id || i.ingredient) || [];
      await groceryService.generateFromRecipe(recipe._id, missingIds);
      success(`Added ${missingIds.length || 'missing'} items for "${recipe.title}" to your grocery list! 🛒`);
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to add items to grocery list');
    }
  };

  return (
    <div className="container-page py-8 space-y-8">
      {/* Header Banner */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-primary-900/40 via-dark-card to-dark-surface border-primary/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Pantry Matcher</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black text-white">
              What can I make with my ingredients?
            </h1>
            <p className="text-sm text-text-secondary max-w-xl">
              Select what is currently in your fridge or pantry. FlavorCraft computes recipe matches in real-time, highlights missing elements, and suggests dishes you can cook now.
            </p>
          </div>

          <button
            onClick={() => triggerMatch()}
            disabled={loading || selectedIngredients.length === 0}
            className="btn btn-primary btn-lg shadow-glow-green self-start md:self-center flex items-center gap-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            <span>Find Matching Recipes ({selectedIngredients.length})</span>
          </button>
        </div>
      </div>

      {/* Grid: Ingredient Picker (Left) & Controls/Filters (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ingredient Picker Area (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 bg-dark-card border-dark-border">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              <span>Step 1: Pick Available Kitchen Ingredients</span>
            </h2>

            <IngredientPicker
              selectedIngredients={selectedIngredients}
              onSelectIngredient={handleSelectIngredient}
              onRemoveIngredient={handleRemoveIngredient}
              onClearAll={handleClearAll}
              onBatchSelect={(ings) => setSelectedIngredients(ings)}
            />
          </div>
        </div>

        {/* Filter & Matching Criteria (1 col) */}
        <div className="space-y-6">
          <div className="card p-6 bg-dark-card border-dark-border space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-dark-border pb-3">
              <SlidersHorizontal className="w-4 h-4 text-secondary" />
              <span>Step 2: Match Threshold & Filters</span>
            </h2>

            {/* Min Match % Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-text-secondary">Minimum Match</span>
                <span className="text-primary font-mono font-bold text-sm">{minMatchPercentage}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={minMatchPercentage}
                onChange={(e) => setMinMatchPercentage(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-text-muted mt-1">
                <span>Any (10%)</span>
                <span>Balanced (50%)</span>
                <span>Exact (100%)</span>
              </div>
            </div>

            {/* Meal Type */}
            <div>
              <label className="input-label">Meal Type</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="input text-xs"
              >
                <option value="">All Meal Types</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
                <option value="Dessert">Dessert</option>
              </select>
            </div>

            {/* Cuisine */}
            <div>
              <label className="input-label">Cuisine</label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="input text-xs"
              >
                <option value="">All Cuisines</option>
                <option value="Italian">Italian</option>
                <option value="Mexican">Mexican</option>
                <option value="Asian">Asian</option>
                <option value="Mediterranean">Mediterranean</option>
                <option value="Indian">Indian</option>
                <option value="American">American</option>
              </select>
            </div>

            {/* Dietary */}
            <div>
              <label className="input-label">Dietary Preference</label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                className="input text-xs"
              >
                <option value="">No Dietary Restriction</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Gluten-Free">Gluten-Free</option>
                <option value="Dairy-Free">Dairy-Free</option>
                <option value="Keto">Keto / Low-Carb</option>
              </select>
            </div>

            <button
              onClick={() => triggerMatch()}
              disabled={loading || selectedIngredients.length === 0}
              className="btn btn-primary w-full py-3 shadow-glow-green"
            >
              Apply & Find Recipes
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-dark-border pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-white flex items-center gap-2">
              <span>Matching Recipe Results</span>
              {searched && (
                <span className="text-sm font-normal text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                  {matchedRecipes.length} found
                </span>
              )}
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Sorted by highest percentage match with your selected pantry items.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 skeleton rounded-2xl" />
            ))}
          </div>
        ) : searched && matchedRecipes.length === 0 ? (
          <div className="card p-12 text-center max-w-lg mx-auto bg-dark-card border-dark-border space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-DEFAULT/10 text-amber-DEFAULT flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No Direct Matches Found</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Try selecting a few more common ingredients (like olive oil, garlic, salt, or pasta) or lowering the match threshold slider to 20%.
            </p>
            <button
              onClick={() => {
                setMinMatchPercentage(20);
                triggerMatch();
              }}
              className="btn btn-outline text-xs !py-2 !px-4"
            >
              Lower Match Threshold to 20%
            </button>
          </div>
        ) : !searched ? (
          <div className="card p-12 text-center max-w-lg mx-auto bg-dark-card border-dashed border-dark-border space-y-3">
            <Sparkles className="w-10 h-10 text-primary mx-auto opacity-70 animate-pulse-slow" />
            <h3 className="text-base font-bold text-white">Select Ingredients to Begin</h3>
            <p className="text-xs text-text-secondary">
              Pick ingredients from the box above or tap "Use My Pantry" and click "Find Matching Recipes".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedRecipes.map((match) => {
              const recipe = match.recipe || match;
              const matchPercent = match.matchPercentage !== undefined ? match.matchPercentage : recipe.matchPercentage;
              const missingCount = match.missingCount !== undefined ? match.missingCount : recipe.missingCount;
              const matchedCount = match.matchedCount !== undefined ? match.matchedCount : recipe.matchedCount;

              return (
                <div key={recipe._id} className="flex flex-col justify-between">
                  <RecipeCard
                    recipe={{
                      ...recipe,
                      matchPercentage: matchPercent,
                      missingCount,
                      matchedCount,
                    }}
                    showMatchDetails={true}
                  />

                  {missingCount > 0 && (
                    <button
                      onClick={() => handleAddAllMissingToGrocery(recipe)}
                      className="mt-2 btn btn-outline !py-2 text-xs flex items-center justify-center gap-1.5 border-secondary/40 text-secondary hover:bg-secondary/10"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add {missingCount} Missing Items to Grocery</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeMatcherPage;
