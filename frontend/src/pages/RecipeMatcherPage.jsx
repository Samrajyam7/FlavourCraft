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
  Clock,
  Zap,
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
  const [cookingTime, setCookingTime] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const dietaryOptions = [
    { label: 'All Diets', value: '' },
    { label: '🥗 Vegetarian', value: 'Vegetarian' },
    { label: '🌱 Vegan', value: 'Vegan' },
    { label: '💪 High Protein', value: 'High Protein' },
    { label: '🥑 Low Carb', value: 'Low Carb' },
    { label: '⚡ Low Calorie', value: 'Low Calorie' },
    { label: '🌾 Gluten Free', value: 'Gluten Free' },
    { label: '🥛 Dairy Free', value: 'Dairy Free' },
  ];

  const cookingTimeOptions = [
    { label: 'All Times', value: '' },
    { label: '⚡ Under 15 min', value: 'under-15' },
    { label: '⏱️ 15–30 min', value: '15-30' },
    { label: '🍳 30–60 min', value: '30-60' },
    { label: '🍲 60+ min', value: '60-plus' },
  ];

  // Handle initial ingredients passed via navigation (e.g. from Hero or Expiry Alerts)
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
    const currentTime = overrides.cookingTime !== undefined ? overrides.cookingTime : cookingTime;
    const currentDifficulty = overrides.difficulty !== undefined ? overrides.difficulty : difficulty;

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
        cookingTime: currentTime || undefined,
        difficulty: currentDifficulty || undefined,
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
        const dTarget = currentDietary.toLowerCase();
        filtered = filtered.filter((r) => {
          const tags = (r.dietaryTags || r.recipe?.dietaryTags || []).map((t) => t.toLowerCase());
          if (dTarget === 'vegetarian') return tags.includes('vegetarian') || tags.includes('vegan');
          if (dTarget === 'vegan') return tags.includes('vegan');
          if (dTarget === 'high protein') return (r.nutrition?.protein || 0) >= 20 || tags.includes('high protein') || tags.includes('high-protein');
          if (dTarget === 'low carb') return (r.nutrition?.carbs || 0) <= 20 || tags.includes('low carb') || tags.includes('low-carb') || tags.includes('keto');
          if (dTarget === 'low calorie') return (r.nutrition?.calories || 0) <= 400 || tags.includes('low calorie') || tags.includes('low-calorie');
          if (dTarget === 'gluten free') return tags.includes('gluten-free') || tags.includes('gluten free');
          if (dTarget === 'dairy free') return tags.includes('dairy-free') || tags.includes('dairy free');
          return tags.includes(dTarget);
        });
      }
      if (currentTime) {
        filtered = filtered.filter((r) => {
          const total = (r.prepTimeMinutes || r.prepTime || 0) + (r.cookTimeMinutes || r.cookTime || 0);
          if (currentTime === 'under-15') return total <= 15;
          if (currentTime === '15-30') return total >= 15 && total <= 30;
          if (currentTime === '30-60') return total >= 30 && total <= 60;
          if (currentTime === '60-plus') return total >= 60;
          return true;
        });
      }
      if (currentDifficulty) {
        filtered = filtered.filter((r) => {
          const diff = r.difficulty || r.recipe?.difficulty;
          return diff && diff.toLowerCase() === currentDifficulty.toLowerCase();
        });
      }

      setMatchedRecipes(filtered);
    } catch (err) {
      if (currentReqId === requestIdRef.current) {
        console.error('Match failed:', err);
        toastError('Failed to match recipes. Please try again.');
      }
    } finally {
      if (currentReqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleClearAll = () => {
    setSelectedIngredients([]);
    setMatchedRecipes([]);
    setSearched(false);
    setMinMatchPercentage(0);
    setMealType('');
    setCuisine('');
    setDietary('');
    setCookingTime('');
    setDifficulty('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-dark-border pb-6 text-left">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/15 text-sage-300 text-xs font-bold uppercase tracking-widest border border-sage/30">
            <Sparkles className="w-3.5 h-3.5 text-sage-400" />
            <span>Intelligent Recipe Matcher</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-white">
            What's In Your Kitchen?
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
            Select what you have in your fridge or pantry. Combine with dietary preferences and cooking time to instantly discover dishes you can cook right now.
          </p>
        </div>

        {selectedIngredients.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearAll}
              className="btn-outline text-xs !py-2.5 flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Ingredients</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive Cooking Pot Preview */}
      <div className="py-2">
        <CookingPotInteractive
          selectedIngredients={selectedIngredients}
          onRemoveIngredient={(item) => {
            const next = selectedIngredients.filter(
              (i) => (i._id || i.id || i.name) !== (item._id || item.id || item.name)
            );
            setSelectedIngredients(next);
            triggerMatch(next);
          }}
          onFindRecipes={() => triggerMatch()}
        />
      </div>

      {/* Main Ingredient Picking & Filtering Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Ingredient Picker Column (Left) */}
        <div className="lg:col-span-2 space-y-6 text-left">
          <div className="card p-6 sm:p-8 bg-dark-card border-dark-border space-y-6">
            <div className="flex items-center justify-between border-b border-dark-border pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-sage-400" />
                <span>Step 1: Choose Available Ingredients</span>
              </h2>
              <span className="text-xs font-semibold text-text-muted">
                {selectedIngredients.length} Selected
              </span>
            </div>

            <IngredientPicker
              selectedIngredients={selectedIngredients}
              onChange={(ings) => {
                setSelectedIngredients(ings);
                triggerMatch(ings);
              }}
            />
          </div>
        </div>

        {/* Filter & Matching Criteria (Right) */}
        <div className="space-y-6">
          <div className="card p-6 bg-dark-card border-dark-border space-y-5 text-left sticky top-24">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-dark-border pb-3">
              <SlidersHorizontal className="w-4 h-4 text-warm" />
              <span>Step 2: Preference Filters</span>
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

            {/* Dietary Preference */}
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
                {dietaryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cooking Time */}
            <div>
              <label className="input-label">Cooking Time</label>
              <select
                value={cookingTime}
                onChange={(e) => {
                  const val = e.target.value;
                  setCookingTime(val);
                  if (selectedIngredients.length > 0) {
                    triggerMatch(selectedIngredients, minMatchPercentage, { cookingTime: val });
                  }
                }}
                className="select text-xs"
              >
                {cookingTimeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="input-label">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => {
                  const val = e.target.value;
                  setDifficulty(val);
                  if (selectedIngredients.length > 0) {
                    triggerMatch(selectedIngredients, minMatchPercentage, { difficulty: val });
                  }
                }}
                className="select text-xs"
              >
                <option value="">Any Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard / Advanced</option>
              </select>
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
                <option value="Chinese">Chinese</option>
                <option value="Mediterranean">Mediterranean</option>
                <option value="Indian">Indian</option>
                <option value="American">American</option>
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
              Try selecting a few more staple ingredients (like olive oil, garlic, salt, or pasta) or adjusting your dietary/cooking time filters.
            </p>
            <button
              onClick={() => {
                setMinMatchPercentage(0);
                setDietary('');
                setCookingTime('');
                triggerMatch(selectedIngredients, 0, { dietary: '', cookingTime: '' });
              }}
              className="btn-primary text-xs !py-2.5 !px-5 shadow-glow-green"
            >
              Reset Filters & Try Again
            </button>
          </div>
        ) : matchedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedRecipes.map((recipe) => (
              <RecipeCard key={recipe._id || recipe.id} recipe={recipe} showMatchDetails={true} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RecipeMatcherPage;
