import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Utensils,
  ArrowRight,
  Refrigerator,
  Flame,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChefHat,
  Heart,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react';
import { recipeService } from '../services/recipeService';
import { RecipeCard } from '../components/recipe/RecipeCard';

export const HomePage = () => {
  const navigate = useNavigate();
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickSearch, setQuickSearch] = useState('');

  // Quick select ingredients for instant hero launcher
  const popularPantryItems = [
    'Chicken',
    'Eggs',
    'Garlic',
    'Tomato',
    'Pasta',
    'Rice',
    'Cheese',
    'Spinach',
    'Onion',
    'Olive Oil',
  ];
  const [selectedHeroPantry, setSelectedHeroPantry] = useState(['Chicken', 'Garlic', 'Olive Oil']);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const data = await recipeService.getRecipes({ limit: 6, sort: 'rating' });
        setFeaturedRecipes(data.recipes || data || []);
      } catch (err) {
        console.error('Failed to load featured recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleHeroIngredientToggle = (item) => {
    setSelectedHeroPantry((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleLaunchMatcher = () => {
    navigate('/matcher', { state: { initialIngredients: selectedHeroPantry } });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/recipes?search=${encodeURIComponent(quickSearch.trim())}`);
    }
  };

  const cuisines = [
    { name: 'Italian', icon: '🍝', count: '12+ recipes', desc: 'Classic pasta, risottos, and rustic breads' },
    { name: 'Asian', icon: '🥢', count: '18+ recipes', desc: 'Sizzling woks, noodles, and savory broths' },
    { name: 'Mexican', icon: '🌮', count: '10+ recipes', desc: 'Zesty salsas, tacos, and spiced meats' },
    { name: 'Mediterranean', icon: '🥗', count: '15+ recipes', desc: 'Heart-healthy oils, fresh greens, and herbs' },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="relative overflow-hidden hero-bg pt-12 pb-20 border-b border-dark-border/40">
        <div className="container-page relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold animate-fade-in">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>Intelligent Ingredient-Based Recipe Matcher</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black tracking-tight text-white leading-tight">
              Turn what's in your fridge into <span className="gradient-text">meals you'll love</span>.
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              No more random grocery runs or wasted food. Pick the ingredients you already have, and FlavorCraft will instantly curate delicious dishes with exact percentage match.
            </p>

            {/* Quick Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-2">
              <div className="relative flex items-center shadow-2xl rounded-2xl bg-dark-card border border-dark-border p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Search className="w-5 h-5 text-text-muted ml-3" />
                <input
                  type="text"
                  placeholder="Search 100+ gourmet dishes, cuisines, or diets (e.g. Creamy Tuscan Chicken)..."
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  className="bg-transparent border-none text-white text-sm sm:text-base px-3 py-2 flex-grow focus:outline-none placeholder-text-muted"
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm !py-2.5 !px-5 rounded-xl flex items-center gap-1.5 shadow-glow-green"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Interactive Hero Pantry Selector Box */}
            <div className="pt-6 max-w-3xl mx-auto">
              <div className="card p-5 sm:p-6 bg-dark-card/90 backdrop-blur-xl border border-primary/20 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 text-left">
                    <Refrigerator className="w-5 h-5 text-secondary" />
                    <div>
                      <h2 className="text-sm font-bold text-white">What's in your kitchen right now?</h2>
                      <p className="text-xs text-text-muted">Tap to select your available items</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLaunchMatcher}
                    className="btn btn-primary !py-2 !px-4 text-xs font-bold uppercase tracking-wider shadow-glow-green"
                  >
                    <span>Match Recipes ({selectedHeroPantry.length})</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Popular Pills */}
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {popularPantryItems.map((item) => {
                    const isSelected = selectedHeroPantry.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleHeroIngredientToggle(item)}
                        className={`ingredient-pill ${
                          isSelected
                            ? 'bg-primary text-white font-bold shadow-glow-green border border-primary'
                            : 'bg-dark-surface hover:bg-dark-hover text-text-secondary border border-dark-border/70 hover:text-white'
                        }`}
                      >
                        <span className="text-xs">{item}</span>
                        {isSelected ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <span className="text-text-muted text-xs">+</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS 3-STEP SECTION
          ============================================================ */}
      <section className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Simple & Smart</span>
          <h2 className="section-title">Cooking made effortless in 3 steps</h2>
          <p className="section-subtitle">
            From fridge contents to five-star dinner in under 30 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="card p-8 bg-dark-card border-dark-border relative group hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-6 group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 className="text-xl font-heading font-bold text-white mb-3">Add Your Ingredients</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Select what you have in your pantry or sync your stock with 1 click. No ingredient is left behind.
            </p>
          </div>

          {/* Step 2 */}
          <div className="card p-8 bg-dark-card border-dark-border relative group hover:border-secondary/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xl mb-6 group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 className="text-xl font-heading font-bold text-white mb-3">Instant AI Match</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Our algorithm calculates exact match percentages, highlights missing items, and suggests smart substitutions.
            </p>
          </div>

          {/* Step 3 */}
          <div className="card p-8 bg-dark-card border-dark-border relative group hover:border-amber-DEFAULT/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-DEFAULT/10 text-amber-DEFAULT flex items-center justify-center font-bold text-xl mb-6 group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 className="text-xl font-heading font-bold text-white mb-3">Cook in Focused Mode</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Follow step-by-step instructions with built-in voice timers, scalable serving portions, and dynamic grocery exports.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURED RECIPES SHOWCASE
          ============================================================ */}
      <section className="container-page">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary mb-2">
              <Flame className="w-4 h-4 text-secondary" />
              <span>Trending Now</span>
            </div>
            <h2 className="section-title">Chef's Handcrafted Picks</h2>
            <p className="section-subtitle mt-1">Discover popular dishes loved by our culinary community.</p>
          </div>
          <Link
            to="/recipes"
            className="btn btn-outline flex items-center gap-2 self-start sm:self-auto hover:border-primary hover:text-primary"
          >
            <span>Explore All Recipes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 skeleton rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRecipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}
      </section>

      {/* ============================================================
          POPULAR CUISINES EXPLORER
          ============================================================ */}
      <section className="container-page">
        <div className="card p-8 sm:p-12 bg-gradient-to-br from-dark-surface to-dark-card border-dark-border">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Global Flavors</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              Explore Cuisines Across The World
            </h2>
            <p className="text-sm text-text-secondary">
              From comforting rustic Italian pasta to spicy authentic Mexican street dishes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cuisines.map((c) => (
              <Link
                key={c.name}
                to={`/recipes?cuisine=${c.name}`}
                className="card p-6 bg-dark-card/60 hover:bg-dark-hover border-dark-border/80 hover:border-primary/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">
                    {c.icon}
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{c.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-dark-border/40 flex items-center justify-between text-xs text-text-muted">
                  <span>{c.count}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          BOTTOM CALL TO ACTION BANNER
          ============================================================ */}
      <section className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900/60 via-dark-card to-secondary-900/40 border border-primary/30 p-8 sm:p-16 text-center space-y-6 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
              Ready to create something delicious today?
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Join thousands of passionate home chefs saving money, eliminating food waste, and discovering incredible flavors every day.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link to="/matcher" className="btn btn-primary btn-lg shadow-glow-green w-full sm:w-auto">
                <Sparkles className="w-5 h-5" />
                <span>Launch Recipe Matcher</span>
              </Link>
              <Link to="/inventory" className="btn btn-outline btn-lg w-full sm:w-auto">
                <Refrigerator className="w-5 h-5" />
                <span>Setup My Pantry</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
