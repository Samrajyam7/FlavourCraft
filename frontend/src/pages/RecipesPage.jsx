import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, RefreshCw, ChefHat, Filter, Sparkles, Flame, Clock } from 'lucide-react';
import { recipeService } from '../services/recipeService';
import { RecipeCard } from '../components/recipe/RecipeCard';

export const RecipesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') || searchParams.get('q') || '';
  const initialCuisine = searchParams.get('cuisine') || '';
  const initialDiet = searchParams.get('diet') || '';

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [cuisine, setCuisine] = useState(initialCuisine);
  const [dietary, setDietary] = useState(initialDiet);
  const [mealType, setMealType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Universe-style quick discovery filter pills
  const discoveryChips = [
    { label: 'All Recipes', action: () => handleResetFilters() },
    { label: 'Quick Meals (<30m)', action: () => { setDifficulty('Easy'); setSortBy('quickest'); } },
    { label: 'Breakfast', action: () => setMealType('Breakfast') },
    { label: 'Lunch', action: () => setMealType('Lunch') },
    { label: 'Dinner', action: () => setMealType('Dinner') },
    { label: 'Vegetarian', action: () => setDietary('Vegetarian') },
    { label: 'Indian Flavors', action: () => setCuisine('Indian') },
    { label: 'Italian Pasta', action: () => setCuisine('Italian') },
  ];

  useEffect(() => {
    fetchRecipes();
  }, [cuisine, dietary, mealType, difficulty, sortBy]);

  const fetchRecipes = async (query = searchQuery) => {
    try {
      setLoading(true);
      const params = {
        search: query ? query.trim() : undefined,
        cuisine: cuisine || undefined,
        dietaryTags: dietary || undefined,
        mealType: mealType || undefined,
        difficulty: difficulty || undefined,
        sort: sortBy,
      };

      const data = await recipeService.getRecipes(params);
      setRecipes(data.recipes || data || []);
    } catch (err) {
      console.error('Failed to load recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecipes(searchQuery);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCuisine('');
    setDietary('');
    setMealType('');
    setDifficulty('');
    setSortBy('rating');
    setSearchParams({});
    fetchRecipes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Editorial Discovery Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-dark-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/15 text-sage-300 text-xs font-bold uppercase tracking-widest border border-sage/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sage-400" />
            <span>Culinary Discovery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-white">
            Explore Handcrafted Recipes
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Browse our full catalog of authentic, chef-curated dishes from around the world.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search recipes, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input !pl-10 !py-2.5 text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  fetchRecipes('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Universe-style Discovery Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide text-xs">
        {discoveryChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={chip.action}
            className="px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap bg-dark-card hover:bg-dark-hover text-text-secondary hover:text-white border border-dark-border hover:border-sage/40 active:scale-95"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Mobile filter toggle */}
      <div className="lg:hidden flex items-center justify-between">
        <button
          onClick={() => setShowMobileFilters((prev) => !prev)}
          className="btn-outline text-xs flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          <span>{showMobileFilters ? 'Hide Filters' : 'Filter & Sort'}</span>
        </button>
        <span className="text-xs text-text-secondary">{recipes.length} recipes</span>
      </div>

      {/* Layout: Filters Sidebar (Left) & Recipe Grid (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar */}
        <div className={`space-y-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="card p-6 bg-dark-card border-dark-border space-y-5 sticky top-24">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-sage-400" /> Filter Recipes
              </h2>
              <button
                onClick={handleResetFilters}
                className="text-xs text-text-muted hover:text-sage-300 transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Sort Order */}
            <div>
              <label className="input-label">Sort Order</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select text-xs"
              >
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
                <option value="quickest">Quickest Total Time</option>
                <option value="newest">Newest Added</option>
              </select>
            </div>

            {/* Meal Type */}
            <div>
              <label className="input-label">Meal Type</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
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
                onChange={(e) => setCuisine(e.target.value)}
                className="select text-xs"
              >
                <option value="">All Cuisines</option>
                <option value="Italian">Italian</option>
                <option value="Asian">Asian</option>
                <option value="Mexican">Mexican</option>
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
                className="select text-xs"
              >
                <option value="">Any Diet</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Gluten-Free">Gluten-Free</option>
                <option value="Dairy-Free">Dairy-Free</option>
                <option value="Keto">Keto / Low-Carb</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="input-label">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="select text-xs"
              >
                <option value="">Any Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard / Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recipes Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="hidden lg:flex items-center justify-between text-xs text-text-secondary pb-2">
            <span>Showing <strong className="text-white">{recipes.length}</strong> recipes</span>
            {searchQuery && <span>Search results for "{searchQuery}"</span>}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 skeleton rounded-2xl" />
              ))}
            </div>
          ) : recipes.length === 0 ? (
            <div className="card p-12 text-center bg-dark-card border-dark-border space-y-4">
              <ChefHat className="w-12 h-12 text-text-muted mx-auto" />
              <h3 className="text-lg font-bold text-white">No Recipes Match Your Filters</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                We couldn't find any recipes matching your chosen filters. Try resetting the filters or searching a different keyword.
              </p>
              <button onClick={handleResetFilters} className="btn-primary text-xs !py-2 !px-4">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipesPage;
