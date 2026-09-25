import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  SlidersHorizontal,
  ShoppingCart,
  RefreshCw,
  ChefHat,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Filter,
  Flame,
} from 'lucide-react';
import { recipeService } from '../services/recipeService';
import { ingredientService } from '../services/ingredientService';
import { groceryService } from '../services/groceryService';
import { IngredientPicker } from '../components/ingredient/IngredientPicker';
import { RecipeCard } from '../components/recipe/RecipeCard';
import CookingPotInteractive from '../components/ingredient/CookingPotInteractive';
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
  const requestIdRef = useRef(0);

  // Filters
  const [minMatchPercentage, setMinMatchPercentage] = useState(0);
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

  const triggerMatch = async (
    customIngredients = null,
    customMinPct = minMatchPercentage,
    overrides = {}
  ) => {
    const listToMatch = customIngredients !== null ? customIngredients : selectedIngredients;
    if (!listToMatch || listToMatch.length === 0) {
      setMatchedRecipes([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    const currentReqId = ++requestIdRef.current;
    const currentMealType = overrides.mealType !== undefined ? overrides.mealType : mealType;
    const currentCuisine = overrides.cuisine !== undefined ? overrides.cuisine : cuisine;
    const currentDietary = overrides.dietary !== undefined ? overrides.dietary : dietary;

    setLoading(true);
    setSearched(true);
    try {
      const ids = listToMatch
        .map((i) => (typeof i === 'object' ? i._id || i.id : i))
        .filter(Boolean);
      const filters = {
        minMatchPercentage: Number(customMinPct || 0),
        mealType: currentMealType || undefined,
        cuisine: currentCuisine || undefined,
        dietary: currentDietary || undefined,
        maxReadyTime: maxReadyTime ? Number(maxReadyTime) : undefined,
      };

      const res = await recipeService.matchRecipes(ids, filters);

      // If a newer request was dispatched in the meantime, ignore this stale response
      if (currentReqId !== requestIdRef.current) {
        return;
      }

      const list = res?.results || res?.matches || res?.recipes || (Array.isArray(res) ? res : []);

      let filtered = Array.isArray(list) ? list : [];
      if (customMinPct > 0) {
        filtered = filtered.filter((r) => {
          const score = r.matchPercentage !== undefined ? r.matchPercentage : r.recipe?.matchPercentage;
          return (score ?? 0) >= Number(customMinPct);
        });
      }
      if (currentMealType) {
        filtered = filtered.filter((r) => {
          const type = r.mealType || r.recipe?.mealType;
          return type && type.toLowerCase() === currentMealType.toLowerCase();
        });
      }
      if (currentCuisine) {
        filtered = filtered.filter((r) => {
          const c = r.cuisine || r.recipe?.cuisine;
          return c && c.toLowerCase() === currentCuisine.toLowerCase();
        });
      }
      if (currentDietary) {
        filtered = filtered.filter((r) => {
          const tags = r.dietaryTags || r.recipe?.dietaryTags || [];
          return tags.some((t) => t.toLowerCase() === currentDietary.toLowerCase());
        });
      }

      setMatchedRecipes(filtered);
    } catch (err) {
      if (currentReqId === requestIdRef.current) {
        console.error('Match error:', err);
        toastError(err.response?.data?.message || 'Failed to match recipes');
      }
    } finally {
      if (currentReqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSelectIngredient = (ing) => {
    const exists = selectedIngredients.some((item) => (item._id || item) === (ing._id || ing));
    if (exists) return;
    const updated = [...selectedIngredients, ing];
    setSelectedIngredients(updated);
    triggerMatch(updated);
  };

  const handleRemoveIngredient = (ing) => {
    const updated = selectedIngredients.filter(
      (item) => (item._id || item) !== (ing._id || ing)
    );
    setSelectedIngredients(updated);
    if (updated.length > 0) {
      triggerMatch(updated);
    } else {
      setMatchedRecipes([]);
      setSearched(false);
    }
  };

  const handleClearAll = () => {
    requestIdRef.current++;
    setSelectedIngredients([]);
    setMatchedRecipes([]);
    setSearched(false);
    setLoading(false);
  };

  const handleAddAllMissingToGrocery = async (recipe) => {
    if (!isAuthenticated) {
      warning('Please sign in to add missing ingredients to your grocery list');
      navigate('/login');
      return;
    }

    try {
      const missing = recipe.missingIngredients || [];
      if (missing.length === 0) {
        warning('No missing ingredients to add!');
        return;
      }

      const itemsToAdd = missing.map((i) => ({
        name: i.name || (typeof i === 'string' ? i : 'Ingredient'),
        quantity: i.amount || '1',
        unit: i.unit || 'unit',
        category: i.category || 'Produce',
        ingredientId: i.id || i._id,
      }));

      await groceryService.addGroceryItem({ items: itemsToAdd });
      success(`Added ${itemsToAdd.length} missing items for "${recipe.title}" to your grocery list! 🛒`);
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to add items to grocery list');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-primary-900/50 via-dark-card to-dark-surface border-sage/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/15 text-sage-300 text-xs font-bold uppercase tracking-widest border border-sage/30">
              <Sparkles className="w-3.5 h-3.5 text-sage-400" />
              <span>Smart Match Engine</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black text-white">
              What can I make with my kitchen ingredients?
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Select what is currently in your fridge or pantry. FlavorCraft computes recipe matches in real-time, highlights missing elements, and suggests what you can cook right now.
            </p>
          </div>

          <button
            onClick={() => triggerMatch()}
            disabled={loading || selectedIngredients.length === 0}
            className="btn-primary btn-lg shadow-glow-green self-start md:self-center flex items-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Find Recipes ({selectedIngredients.length})</span>
          </button>
        </div>
      </div>

      {/* Grid: Ingredient Picker (Left) & Controls/Filters (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ingredient Picker Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 bg-dark-card border-dark-border text-left">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-sage-400" />
              <span>Step 1: Pick Available Kitchen Ingredients</span>
            </h2>

            <IngredientPicker
              selectedIngredients={selectedIngredients}
              onSelectIngredient={handleSelectIngredient}
              onRemoveIngredient={handleRemoveIngredient}
              onClearAll={handleClearAll}
              onBatchSelect={(ings) => {
                setSelectedIngredients(ings);
                triggerMatch(ings);
              }}
            />
          </div>
        </div>

        {/* Filter & Matching Criteria */}
        <div className="space-y-6">
          <div className="card p-6 bg-dark-card border-dark-border space-y-5 text-left">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-dark-border pb-3">
              <SlidersHorizontal className="w-4 h-4 text-warm" />
              <span>Step 2: Match Threshold & Filters</span>
            </h2>

            {/* Min Match % Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-text-secondary">Minimum Match Percentage</span>
                <span className="text-sage-300 font-mono font-bold text-sm">{minMatchPercentage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minMatchPercentage}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMinMatchPercentage(val);
                  if (selectedIngredients.length > 0) {
                    triggerMatch(selectedIngredients, val);
                  }
                }}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-text-muted mt-1">
                <span>Any (0%)</span>
                <span>Balanced (50%)</span>
                <span>Exact (100%)</span>
              </div>
            </div>

            {/* Meal Type */}
            <div>
              <label className="input-label">Meal Type</label>
              <select
                value={mealType}
                onChange={(e) => {
                  const val = e.target.value;
                  setMealType(val);
                  if (selectedIngredients.length > 0) {
                    triggerMatch(selectedIngredients, minMatchPercentage, { mealType: val });
                  }
                }}
                className="select text-xs"
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
                onChange={(e) => {
                  const val = e.target.value;
                  setCuisine(val);
                  if (selectedIngredients.length > 0) {
                    triggerMatch(selectedIngredients, minMatchPercentage, { cuisine: val });
                  }
                }}
                className="select text-xs"
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
                onChange={(e) => {
                  const val = e.target.value;
                  setDietary(val);
                  if (selectedIngredients.length > 0) {
                    triggerMatch(selectedIngredients, minMatchPercentage, { dietary: val });
                  }
                }}
                className="select text-xs"
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
              className="btn-primary w-full py-3 text-xs font-bold uppercase tracking-wider shadow-glow-green"
            >
              Apply & Match Recipes
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6 pt-4 text-left">
        <div className="flex items-center justify-between border-b border-dark-border pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-white flex items-center gap-2">
              <span>Matching Recipe Results</span>
              {searched && (
                <span className="text-xs font-bold text-sage-300 bg-sage/15 px-2.5 py-0.5 rounded-full border border-sage/30">
                  {matchedRecipes.length} found
                </span>
              )}
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Ranked deterministically by highest match score, fewest missing required items, and fastest prep time.
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
            <div className="w-14 h-14 rounded-2xl bg-amber-950/40 text-warm flex items-center justify-center mx-auto border border-warm/30">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No Direct Matches Found</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Try selecting a few more staple ingredients (like olive oil, garlic, salt, or pasta) or lowering the match threshold slider.
            </p>
            <button
              onClick={() => {
                setMinMatchPercentage(20);
                triggerMatch(selectedIngredients, 20);
              }}
              className="btn-outline text-xs !py-2 !px-4"
            >
              Lower Match Threshold to 20%
            </button>
          </div>
        ) : !searched ? (
          <div className="card p-12 text-center max-w-lg mx-auto bg-dark-card border-dashed border-dark-border space-y-3">
            <Sparkles className="w-10 h-10 text-sage-400 mx-auto opacity-70 animate-pulse" />
            <h3 className="text-base font-bold text-white">Select Ingredients to Begin Simmering</h3>
            <p className="text-xs text-text-secondary">
              Pick ingredients from the categories above or tap "Use My Pantry" to discover matching dishes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedRecipes.map((match, idx) => {
              const recipe = match.recipe || match;
              const recipeId = recipe._id || recipe.recipeId || recipe.id || `match-${idx}`;
              const matchPercent =
                match.matchPercentage !== undefined ? match.matchPercentage : recipe.matchPercentage ?? 0;
              const missingList = match.missingIngredients || recipe.missingIngredients || [];
              const missingCount =
                match.missingCount !== undefined ? match.missingCount : missingList.length;
              const matchedCount =
                match.matchedCount !== undefined
                  ? match.matchedCount
                  : match.matchedIngredients?.length || recipe.matchedCount || 0;

              return (
                <div key={recipeId} className="flex flex-col justify-between">
                  <RecipeCard
                    recipe={{
                      ...recipe,
                      _id: recipeId,
                      matchPercentage: matchPercent,
                      missingCount,
                      matchedCount,
                      missingIngredients: missingList,
                    }}
                    showMatchDetails={true}
                  />

                  {missingCount > 0 && (
                    <button
                      onClick={() =>
                        handleAddAllMissingToGrocery({
                          ...recipe,
                          missingIngredients: missingList,
                        })
                      }
                      className="mt-2.5 btn-secondary !py-2 text-xs flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add {missingCount} Missing Items to Grocery List</span>
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
