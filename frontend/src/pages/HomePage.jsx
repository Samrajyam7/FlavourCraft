import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  ArrowRight,
  Flame,
  BookOpen,
  UtensilsCrossed,
  Layers,
  ChefHat,
  Award,
  Refrigerator,
  ShoppingCart,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { CharacterCarousel } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';

import { recipeService } from '../services/recipeService';
import { inventoryService } from '../services/inventoryService';
import { mealPlanService } from '../services/mealPlanService';
import { groceryService } from '../services/groceryService';
import { RecipeCard } from '../components/recipe/RecipeCard';
import CookingPotInteractive from '../components/ingredient/CookingPotInteractive';
import heroVegetableBowl from '../assets/hero_vegetable_bowl.jpg';
import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickSearch, setQuickSearch] = useState('');

  // Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState({
    pantryCount: 0,
    expiringSoonCount: 0,
    groceryCount: 0,
    plannedMealsCount: 0,
    availableRecipesCount: 0,
  });
  const [expiringItems, setExpiringItems] = useState([]);
  const [weeklyPlanSummary, setWeeklyPlanSummary] = useState([]);
  const [grocerySummary, setGrocerySummary] = useState([]);

  // Popular quick ingredient picks for the signature cooking pot
  const popularPantryItems = [
    { _id: 'egg_hero', name: 'Egg' },
    { _id: 'cheese_hero', name: 'Cheese' },
    { _id: 'tomato_hero', name: 'Tomato' },
    { _id: 'chicken_hero', name: 'Chicken' },
    { _id: 'garlic_hero', name: 'Garlic' },
    { _id: 'onion_hero', name: 'Onion' },
    { _id: 'butter_hero', name: 'Butter' },
    { _id: 'pasta_hero', name: 'Pasta' },
    { _id: 'rice_hero', name: 'Rice' },
    { _id: 'paneer_hero', name: 'Paneer' },
  ];

  const [selectedHeroPantry, setSelectedHeroPantry] = useState([
    { _id: 'egg_hero', name: 'Egg' },
    { _id: 'cheese_hero', name: 'Cheese' },
    { _id: 'tomato_hero', name: 'Tomato' },
  ]);

  useEffect(() => {
    fetchInitialData();
  }, [isAuthenticated]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const [recData, recsRes] = await Promise.all([
        recipeService.getRecipes({ limit: 6, sort: 'rating' }),
        recipeService.getRecommendations(),
      ]);

      const featured = recData.recipes || recData || [];
      setFeaturedRecipes(featured);
      setRecommendedRecipes(recsRes?.recipes || []);

      // If user is authenticated, fetch live pantry, meal plan, and grocery stats
      if (isAuthenticated) {
        try {
          const [invData, planData, grocData] = await Promise.all([
            inventoryService.getInventory(),
            mealPlanService.getMealPlan(),
            groceryService.getGroceryList(),
          ]);

          const pList = invData.inventory || invData.items || [];
          const gList = grocData.items || grocData.list?.items || [];
          const alerts = invData.expiryAlerts || pList.filter((i) => i.isExpired || i.isExpiringSoon);

          // Count planned meals
          let plannedCount = 0;
          const scheduled = [];
          if (planData?.days) {
            planData.days.forEach((day) => {
              (day.slots || []).forEach((slot) => {
                if (slot.recipe) {
                  plannedCount++;
                  scheduled.push({
                    day: day.dayOfWeek,
                    mealType: slot.mealType,
                    recipe: slot.recipe,
                  });
                }
              });
            });
          }

          setDashboardStats({
            pantryCount: pList.length,
            expiringSoonCount: alerts.length,
            groceryCount: gList.length,
            plannedMealsCount: plannedCount,
            availableRecipesCount: featured.length,
          });

          setExpiringItems(alerts.slice(0, 3));
          setWeeklyPlanSummary(scheduled.slice(0, 4));
          setGrocerySummary(gList.slice(0, 4));
        } catch (e) {
          console.error('Failed to load user dashboard stats:', e);
        }
      } else {
        setDashboardStats({
          pantryCount: 12,
          expiringSoonCount: 2,
          groceryCount: 5,
          plannedMealsCount: 7,
          availableRecipesCount: featured.length,
        });
      }
    } catch (err) {
      console.error('Failed to load home page data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroIngredientToggle = (item) => {
    setSelectedHeroPantry((prev) => {
      const exists = prev.some((i) => (typeof i === 'object' ? i.name === item.name : i === item.name));
      if (exists) {
        return prev.filter((i) => (typeof i === 'object' ? i.name !== item.name : i !== item.name));
      }
      return [...prev, item];
    });
  };

  const handleLaunchMatcher = () => {
    const names = selectedHeroPantry.map((i) => (typeof i === 'object' ? i.name : i));
    navigate('/matcher', { state: { initialIngredients: names } });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/recipes?search=${encodeURIComponent(quickSearch.trim())}`);
    }
  };

  const cuisines = [
    { name: 'Italian', icon: '🍝', count: 'Classic Pasta, Risottos & Sauces', tag: 'Italian' },
    { name: 'Indian', icon: '🍛', count: 'Aromatic Curries & Biryanis', tag: 'Indian' },
    { name: 'Asian', icon: '🥢', count: 'Savory Woks & Fried Rice', tag: 'Asian' },
    { name: 'American', icon: '🥞', count: 'Fluffy Pancakes & Sandwiches', tag: 'American' },
  ];

  return (
    <div className="relative min-h-screen">
      {/* ============================================================
          FULL-SCREEN BACKGROUND VIDEO LAYER WITH FLAVORCRAFT BRANDING
          ============================================================ */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center scale-110"
          src="/background.mp4"
        />

        {/* Increased Visibility Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/75 via-dark-bg/55 to-dark-bg/85 backdrop-blur-[2px]" />

        {/* Large Visible FlavorCraft Watermark (pure seamless watermark text without black box) */}
        <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center z-[2] select-none text-center px-4 w-full">
          <span className="text-5xl sm:text-7xl md:text-8xl font-heading font-black tracking-tight text-white/55 drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
            Flavor<span className="text-sage-400/80">Craft</span>
          </span>
          <span className="text-sm sm:text-xl md:text-2xl font-sans font-extrabold tracking-[0.3em] text-white/40 drop-shadow-[0_2px_20px_rgba(0,0,0,0.95)] uppercase mt-1 sm:mt-2">
            by Digital Kitchen
          </span>
        </div>
      </div>

      {/* Main Content Layer (Z-Indexed above background video) */}
      <div className="relative z-10 space-y-16 sm:space-y-24 pb-20">
        {/* ============================================================
            HERO SECTION — THREEUI TEXT ANIMATION & EDITORIAL IDENTITY
            ============================================================ */}
        <section className="relative overflow-hidden pt-6 pb-12 border-b border-dark-border/40 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage/15 border border-sage/30 text-sage-300 text-xs font-bold uppercase tracking-widest animate-fade-in">
                <Sparkles className="w-3.5 h-3.5 text-sage-400" />
                <span>The Intelligent Digital Kitchen</span>
              </div>

              {/* Main Headline with dynamic animated text shimmer */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black tracking-tight text-white leading-[1.08]">
                Turn What You Have Into{' '}
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-sage-300 via-amber-300 via-warm to-accent animate-text-shimmer drop-shadow-[0_0_25px_rgba(154,179,166,0.35)]">
                  What You Crave
                </span>
                <span className="text-sage-400 inline-block animate-pulse">.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed">
                Choose your ingredients and discover recipes you can actually make right now. Exact percentage matching. Zero grocery stress. Zero food waste.
              </p>

              {/* Hero Action Area */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/matcher"
                  className="btn-primary !py-3.5 !px-6 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 h-[52px] shadow-glow-green"
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Start Cooking</span>
                </Link>

                <Link
                  to="/recipes"
                  className="btn-outline !py-3.5 !px-6 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 h-[52px]"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Explore Recipes</span>
                </Link>
              </div>

              {/* Inline Search Bar */}
              <form onSubmit={handleSearchSubmit} className="max-w-md pt-2">
                <div className="flex items-center bg-dark-surface border border-dark-border rounded-2xl p-1.5 focus-within:border-primary transition-colors">
                  <Search className="w-4 h-4 text-text-muted ml-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search dishes (e.g. Pasta, Butter Chicken, Curry)..."
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                    className="bg-transparent border-none text-white text-xs sm:text-sm px-3 py-2 flex-grow focus:outline-none placeholder-text-muted"
                  />
                  <button
                    type="submit"
                    className="btn-primary btn-sm !py-2 !px-4 rounded-xl flex items-center gap-1"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Hero Box with Animated Bowl of Fresh Vegetables */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full aspect-square max-w-[460px] rounded-3xl bg-dark-card border border-dark-border shadow-2xl overflow-hidden flex items-center justify-center group">
                <div className="absolute inset-0 pointer-events-none z-0">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-sage-500/15 blur-3xl animate-pulse-kitchen" />
                  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-warm/15 blur-2xl animate-pulse-kitchen" style={{ animationDelay: '1.5s' }} />
                </div>

                <div className="relative z-10 w-full h-full flex items-center justify-center p-3">
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl animate-float-slow">
                    <img
                      src={heroVegetableBowl}
                      alt="Fresh kitchen ingredients and vegetable bowl"
                      className="w-full h-full object-cover rounded-2xl filter brightness-105 contrast-105 transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-dark/30 pointer-events-none" />

                    <div className="absolute bottom-5 inset-x-5 text-center p-3 rounded-2xl bg-dark/85 backdrop-blur-md border border-white/10 shadow-2xl">
                      <h3 className="text-xl sm:text-2xl font-heading font-black tracking-widest uppercase text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                        FLAVOR<span className="text-sage-400">CRAFT</span>
                      </h3>
                      <p className="text-[11px] font-semibold text-text-secondary tracking-wide mt-0.5">
                        Fresh Ingredients • Smart Culinary Pot
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                  <span className="absolute top-6 right-8 text-2xl animate-float-slow opacity-90 select-none drop-shadow-md">🌿</span>
                  <span className="absolute bottom-20 left-6 text-xl animate-float-delayed opacity-85 select-none drop-shadow-md">🧄</span>
                  <span className="absolute top-20 left-8 text-xl animate-float-slow opacity-85 select-none drop-shadow-md" style={{ animationDelay: '0.8s' }}>🍅</span>
                  <span className="absolute top-36 right-6 text-xl animate-float-delayed opacity-90 select-none drop-shadow-md" style={{ animationDelay: '2.1s' }}>🌶️</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CHEF COMMAND HUB & DASHBOARD SUMMARY METRICS BAR
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border/40 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sage-400 mb-1">
              <ChefHat className="w-4 h-4 text-sage-400" />
              <span>Chef Command Center</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
              Live Kitchen Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/matcher"
              className="btn-primary !py-2 !px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-glow-green"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Match Ingredients</span>
            </Link>
            <Link
              to="/inventory"
              className="btn-outline !py-2 !px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-dark-surface/40 backdrop-blur-md"
            >
              <Refrigerator className="w-3.5 h-3.5" />
              <span>Manage Pantry</span>
            </Link>
          </div>
        </div>

        {/* 5 Real-Time Summary Cards with Glassmorphic Translucency */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <Link
            to="/inventory"
            className="card p-4 bg-dark-card/65 backdrop-blur-lg border-dark-border/80 hover:border-sage/50 transition-all flex items-center gap-3.5 group shadow-xl hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-xl bg-sage/20 text-sage-400 border border-sage/40 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
              🥕
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">Pantry Items</span>
              <span className="text-lg sm:text-xl font-heading font-black text-white">{dashboardStats.pantryCount}</span>
            </div>
          </Link>

          <Link
            to="/recipes"
            className="card p-4 bg-dark-card/65 backdrop-blur-lg border-dark-border/80 hover:border-warm/50 transition-all flex items-center gap-3.5 group shadow-xl hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-xl bg-warm/20 text-warm border border-warm/40 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
              🍳
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">Available Recipes</span>
              <span className="text-lg sm:text-xl font-heading font-black text-white">{dashboardStats.availableRecipesCount}</span>
            </div>
          </Link>

          <Link
            to="/grocery"
            className="card p-4 bg-dark-card/65 backdrop-blur-lg border-dark-border/80 hover:border-sky-500/50 transition-all flex items-center gap-3.5 group shadow-xl hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
              🛒
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">Grocery Items</span>
              <span className="text-lg sm:text-xl font-heading font-black text-white">{dashboardStats.groceryCount}</span>
            </div>
          </Link>

          <Link
            to="/meal-planner"
            className="card p-4 bg-dark-card/65 backdrop-blur-lg border-dark-border/80 hover:border-indigo-500/50 transition-all flex items-center gap-3.5 group shadow-xl hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
              📅
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">Planned Meals</span>
              <span className="text-lg sm:text-xl font-heading font-black text-white">{dashboardStats.plannedMealsCount}</span>
            </div>
          </Link>

          <Link
            to="/inventory"
            className="card p-4 bg-dark-card/65 backdrop-blur-lg border-dark-border/80 hover:border-rose-500/50 transition-all flex items-center gap-3.5 group col-span-2 sm:col-span-1 shadow-xl hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
              ⏰
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">Expiring Soon</span>
              <span className="text-lg sm:text-xl font-heading font-black text-rose-400">{dashboardStats.expiringSoonCount}</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ============================================================
          RECOMMENDED FOR YOU (TRANSPARENT PERSONALIZED RECOMMENDATIONS)
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sage-400 mb-1">
              <Sparkles className="w-4 h-4 text-sage-400" />
              <span>Smart Recommendation Engine</span>
            </div>
            <h2 className="text-3xl font-heading font-bold text-white tracking-tight">✨ Recommended For You</h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Transparently matched based on your active pantry ingredients, dietary preferences, and favorite dishes.
            </p>
          </div>
          <Link
            to="/recipes"
            className="btn-outline !py-2.5 !px-5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 skeleton rounded-2xl" />
            ))}
          </div>
        ) : recommendedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedRecipes.slice(0, 4).map((recipe) => (
              <div key={recipe._id || recipe.id} className="relative group">
                {recipe.recommendationReason && (
                  <div className="absolute top-3 left-3 right-3 z-20 bg-dark-surface/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-sage/30 text-[10px] font-semibold text-sage-300 shadow-lg flex items-center gap-1.5 pointer-events-none line-clamp-1">
                    <Sparkles className="w-3 h-3 text-sage-400 flex-shrink-0" />
                    <span className="truncate">{recipe.recommendationReason}</span>
                  </div>
                )}
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRecipes.slice(0, 4).map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}
      </section>

      {/* ============================================================
          DASHBOARD INSIGHTS: MEALS, GROCERIES, NUTRITION & EXPIRY
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: 📅 This Week's Planned Meals */}
          <div className="group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-b from-dark-card/95 via-dark-card/85 to-dark-surface/95 backdrop-blur-2xl border border-white/10 hover:border-sage-500/60 shadow-2xl hover:shadow-[0_20px_50px_rgba(45,106,79,0.3)] transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between">
            {/* Ambient Background Aura & Animated Light Streak */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-sage-500/15 rounded-full blur-3xl group-hover:bg-sage-500/30 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-sage-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="space-y-4 relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-sage-500/20 border border-sage-500/40 flex items-center justify-center text-sage-300 group-hover:scale-110 group-hover:bg-sage-500/30 transition-all duration-300 shadow-glow-green">
                    <Calendar className="w-4 h-4 text-sage-300" />
                  </div>
                  <div>
                    <span className="text-xs font-heading font-black text-white tracking-wider uppercase block">
                      This Week's Meals
                    </span>
                    <span className="text-[10px] text-sage-400 font-semibold tracking-wide flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse" />
                      7-Day Kitchen Schedule
                    </span>
                  </div>
                </div>
                <Link
                  to="/meal-planner"
                  className="text-[11px] font-bold text-sage-400 hover:text-white inline-flex items-center gap-1 group/link transition-colors bg-sage-500/10 hover:bg-sage-500/20 px-2.5 py-1 rounded-lg border border-sage-500/20"
                >
                  Plan <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* 7-Day Quick Visualizer Strip */}
              <div className="grid grid-cols-7 gap-1 p-1.5 rounded-xl bg-dark-bg/60 border border-white/5 text-center">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dIdx) => (
                  <div
                    key={dIdx}
                    className={`py-1 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-default ${
                      dIdx === 1 || dIdx === 3
                        ? 'bg-sage-500/25 text-sage-300 border border-sage-500/40 shadow-sm'
                        : 'text-text-muted hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{day}</span>
                    <span className={`block w-1 h-1 rounded-full mx-auto mt-0.5 ${dIdx === 1 || dIdx === 3 ? 'bg-sage-400' : 'bg-transparent'}`} />
                  </div>
                ))}
              </div>

              {/* Active Meals or Animated Empty State */}
              {weeklyPlanSummary.length > 0 ? (
                <div className="space-y-2">
                  {weeklyPlanSummary.map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-dark-surface/80 border border-white/5 hover:border-sage-500/50 hover:bg-dark-surface transition-all duration-200 text-xs flex items-center justify-between group/slot hover:shadow-lg hover:-translate-x-0.5"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-white block text-xs truncate group-hover/slot:text-sage-300 transition-colors">
                          {slot.recipe?.title || 'Scheduled Dish'}
                        </span>
                        <span className="text-[10px] text-text-muted font-medium">{slot.day} • {slot.mealType}</span>
                      </div>
                      <span className="text-[10px] text-sage-300 font-bold bg-sage-500/15 border border-sage-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 shrink-0 shadow-sm">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sage-400"></span>
                        </span>
                        Ready
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-3 px-3 rounded-2xl bg-dark-bg/40 border border-white/5 text-center space-y-1.5 group-hover:border-sage-500/20 transition-colors">
                  <div className="w-10 h-10 rounded-2xl bg-sage-500/10 border border-sage-500/20 flex items-center justify-center mx-auto text-sage-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-white/90">No meals scheduled yet</p>
                  <p className="text-[11px] text-text-muted leading-relaxed">Schedule your weekly breakfast, lunch & dinner with 1-click.</p>
                </div>
              )}
            </div>

            <Link
              to="/meal-planner"
              className="btn-secondary !py-2.5 text-xs w-full text-center block relative z-10 mt-5 group-hover:border-sage-500/50 group-hover:shadow-glow-green transition-all duration-300 font-bold tracking-wide uppercase"
            >
              Open Meal Planner →
            </Link>
          </div>

          {/* Card 2: ⏰ Expiring Soon Alerts */}
          <div className="group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-b from-dark-card/95 via-dark-card/85 to-dark-surface/95 backdrop-blur-2xl border border-white/10 hover:border-warm/60 shadow-2xl hover:shadow-[0_20px_50px_rgba(233,196,106,0.2)] transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between">
            {/* Ambient Background Aura & Animated Light Streak */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-warm/15 rounded-full blur-3xl group-hover:bg-warm/30 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-warm to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="space-y-4 relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-warm/20 border border-warm/40 flex items-center justify-center text-warm group-hover:scale-110 group-hover:bg-warm/30 transition-all duration-300 shadow-glow-gold">
                    <AlertTriangle className="w-4 h-4 text-warm animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-heading font-black text-warm tracking-wider uppercase block">
                      Expiring Soon
                    </span>
                    <span className="text-[10px] text-amber-300/80 font-semibold tracking-wide flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      Freshness & Expiry Alerts
                    </span>
                  </div>
                </div>
                <Link
                  to="/inventory"
                  className="text-[11px] font-bold text-warm hover:text-white inline-flex items-center gap-1 group/link transition-colors bg-warm/10 hover:bg-warm/20 px-2.5 py-1 rounded-lg border border-warm/20"
                >
                  View <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Status Visualizer */}
              {expiringItems.length > 0 ? (
                <div className="space-y-2">
                  {expiringItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-dark-surface/90 to-dark-surface/90 border border-amber-500/40 hover:border-amber-400 hover:shadow-lg transition-all duration-200 text-xs flex items-center justify-between group/item"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg group-hover/item:scale-125 transition-transform flex-shrink-0">{item.ingredientId?.icon || '🥫'}</span>
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate">{item.ingredientId?.name || 'Ingredient'}</span>
                          <span className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {item.alertMessage || (item.daysUntilExpiry ? `Expires in ${item.daysUntilExpiry}d` : 'Expiring')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/matcher', { state: { initialIngredients: [item.ingredientId?.name] } })}
                        className="text-[10px] btn-primary !py-1 !px-3 shadow-none font-bold shrink-0 hover:scale-105 active:scale-95 transition-all"
                      >
                        Cook
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 px-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/25 text-center space-y-2 group-hover:border-emerald-500/40 transition-colors">
                  {/* Glowing Radar Pulse Effect */}
                  <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                    <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
                    <span className="absolute inset-1 rounded-full bg-emerald-500/30 animate-pulse" />
                    <div className="relative w-9 h-9 rounded-full bg-emerald-500/40 border border-emerald-400 flex items-center justify-center shadow-glow-green">
                      <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-300">100% Pantry Fresh</p>
                    <p className="text-[11px] text-text-muted mt-0.5">Zero food waste detected in your digital kitchen.</p>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/inventory"
              className="btn-outline !py-2.5 text-xs w-full text-center block relative z-10 mt-5 group-hover:border-warm/60 group-hover:text-warm group-hover:shadow-glow-gold transition-all duration-300 font-bold tracking-wide uppercase"
            >
              Manage Pantry →
            </Link>
          </div>

          {/* Card 3: 🛒 Weekly Grocery Summary */}
          <div className="group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-b from-dark-card/95 via-dark-card/85 to-dark-surface/95 backdrop-blur-2xl border border-white/10 hover:border-sky-500/60 shadow-2xl hover:shadow-[0_20px_50px_rgba(56,189,248,0.25)] transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between">
            {/* Ambient Background Aura & Animated Light Streak */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/15 rounded-full blur-3xl group-hover:bg-sky-500/30 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="space-y-4 relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-300 group-hover:scale-110 group-hover:bg-sky-500/30 transition-all duration-300 shadow-lg">
                    <ShoppingCart className="w-4 h-4 text-sky-300" />
                  </div>
                  <div>
                    <span className="text-xs font-heading font-black text-white tracking-wider uppercase block">
                      Grocery Checklist
                    </span>
                    <span className="text-[10px] text-sky-400 font-semibold tracking-wide flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                      Smart Ingredient Cart
                    </span>
                  </div>
                </div>
                <Link
                  to="/grocery"
                  className="text-[11px] font-bold text-sky-400 hover:text-white inline-flex items-center gap-1 group/link transition-colors bg-sky-500/10 hover:bg-sky-500/20 px-2.5 py-1 rounded-lg border border-sky-500/20"
                >
                  List <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>

              {grocerySummary.length > 0 ? (
                <div className="space-y-2">
                  {grocerySummary.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl bg-dark-surface/80 border border-white/5 hover:border-sky-500/40 hover:bg-dark-surface transition-all duration-200 text-xs flex items-center justify-between group/groc hover:shadow-md"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <div className="w-4 h-4 rounded-md border border-sky-400/40 bg-sky-500/10 flex items-center justify-center text-[10px] text-sky-300">
                          ✓
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate group-hover/groc:text-sky-300 transition-colors">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-text-muted">{item.category}</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-sky-300 bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 rounded-lg shrink-0 shadow-sm">
                        {item.buyQuantity !== undefined && item.buyQuantity !== null ? item.buyQuantity : (item.quantity || 1)} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-3 px-3 rounded-2xl bg-dark-bg/40 border border-white/5 text-center space-y-1.5 group-hover:border-sky-500/20 transition-colors">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto text-sky-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-white/90">Grocery List In Sync</p>
                  <p className="text-[11px] text-text-muted leading-relaxed">Ingredients automatically populate as you plan meals.</p>
                </div>
              )}
            </div>

            <Link
              to="/grocery"
              className="btn-secondary !py-2.5 text-xs w-full text-center block relative z-10 mt-5 group-hover:border-sky-500/50 group-hover:shadow-lg transition-all duration-300 font-bold tracking-wide uppercase"
            >
              View Shopping List →
            </Link>
          </div>

          {/* Card 4: 📊 Nutrition Summary */}
          <div className="group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-b from-dark-card/95 via-dark-card/85 to-dark-surface/95 backdrop-blur-2xl border border-white/10 hover:border-emerald-500/60 shadow-2xl hover:shadow-[0_20px_50px_rgba(45,106,79,0.3)] transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between">
            {/* Ambient Background Aura & Animated Light Streak */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl group-hover:bg-emerald-500/30 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="space-y-4 relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 group-hover:scale-110 group-hover:bg-emerald-500/30 transition-all duration-300 shadow-glow-green">
                    <Flame className="w-4 h-4 text-emerald-300 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-heading font-black text-white tracking-wider uppercase block">
                      Nutrition Profile
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold tracking-wide flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Macro Balance Target
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-sage-300 bg-sage-500/15 px-2.5 py-1 rounded-lg border border-sage-500/30 shadow-sm">
                  Per Meal
                </span>
              </div>

              {/* 4 Interactive Macro Meter Tiles with Animated Percentage Bars */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {/* Calories */}
                <div className="p-3 rounded-2xl bg-dark-bg/60 border border-amber-500/20 hover:border-amber-400/50 hover:bg-dark-surface hover:-translate-y-0.5 transition-all duration-300 group/stat shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider group-hover/stat:text-amber-300 transition-colors">Calories</span>
                    <span className="text-[10px]">🔥</span>
                  </div>
                  <span className="text-base font-heading font-black text-amber-300 block">~420 <span className="text-[10px] font-normal text-text-muted">kcal</span></span>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-gradient-to-r from-amber-500 to-warm h-full rounded-full w-[70%] group-hover/stat:w-[85%] transition-all duration-500" />
                  </div>
                </div>

                {/* Protein */}
                <div className="p-3 rounded-2xl bg-dark-bg/60 border border-emerald-500/20 hover:border-emerald-400/50 hover:bg-dark-surface hover:-translate-y-0.5 transition-all duration-300 group/stat shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider group-hover/stat:text-emerald-300 transition-colors">Protein</span>
                    <span className="text-[10px]">💪</span>
                  </div>
                  <span className="text-base font-heading font-black text-emerald-400 block">~25 <span className="text-[10px] font-normal text-text-muted">g</span></span>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-gradient-to-r from-emerald-500 to-sage-300 h-full rounded-full w-[60%] group-hover/stat:w-[75%] transition-all duration-500" />
                  </div>
                </div>

                {/* Carbs */}
                <div className="p-3 rounded-2xl bg-dark-bg/60 border border-sky-500/20 hover:border-sky-400/50 hover:bg-dark-surface hover:-translate-y-0.5 transition-all duration-300 group/stat shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider group-hover/stat:text-sky-300 transition-colors">Carbs</span>
                    <span className="text-[10px]">🌾</span>
                  </div>
                  <span className="text-base font-heading font-black text-sky-400 block">~48 <span className="text-[10px] font-normal text-text-muted">g</span></span>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-gradient-to-r from-sky-500 to-sky-300 h-full rounded-full w-[80%] group-hover/stat:w-[90%] transition-all duration-500" />
                  </div>
                </div>

                {/* Fats */}
                <div className="p-3 rounded-2xl bg-dark-bg/60 border border-rose-500/20 hover:border-rose-400/50 hover:bg-dark-surface hover:-translate-y-0.5 transition-all duration-300 group/stat shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider group-hover/stat:text-rose-300 transition-colors">Fats</span>
                    <span className="text-[10px]">🥑</span>
                  </div>
                  <span className="text-base font-heading font-black text-rose-400 block">~15 <span className="text-[10px] font-normal text-text-muted">g</span></span>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-gradient-to-r from-rose-500 to-rose-300 h-full rounded-full w-[45%] group-hover/stat:w-[55%] transition-all duration-500" />
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/profile?tab=preferences"
              className="btn-outline !py-2.5 text-xs w-full text-center block relative z-10 mt-5 group-hover:border-emerald-500/60 group-hover:text-emerald-300 group-hover:shadow-glow-green transition-all duration-300 font-bold tracking-wide uppercase"
            >
              Edit Dietary Goals →
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          SIGNATURE COOKING POT WORKSTATION SECTION
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sage-400">
              <UtensilsCrossed className="w-4 h-4 text-sage-400" />
              <span>Interactive Digital Kitchen</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white leading-tight">
              Select what's in your pantry and let FlavorCraft cook.
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Tap any common ingredient below to drop it into your Cooking Pot. FlavorCraft instantly analyzes our culinary database to calculate exact match percentages and missing items.
            </p>

            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2.5">
                Quick Select Pantry Essentials:
              </p>
              <div className="flex flex-wrap gap-2">
                {popularPantryItems.map((item) => {
                  const isSelected = selectedHeroPantry.some((i) => i.name === item.name);
                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => handleHeroIngredientToggle(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-glow-green scale-105'
                          : 'bg-dark-surface hover:bg-dark-hover text-text-secondary border-dark-border hover:text-white'
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className="ml-1.5 opacity-75">{isSelected ? '✓' : '+'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <CookingPotInteractive
              selectedIngredients={selectedHeroPantry}
              onRemoveIngredient={handleHeroIngredientToggle}
              onClearAll={() => setSelectedHeroPantry([])}
              onFindMatches={handleLaunchMatcher}
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          EXPLORE FLAVORS / FILMSTRIP CAROUSEL
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sage-400 mb-1">
              <Sparkles className="w-4 h-4 text-sage-400" />
              <span>Culinary Discovery Showcase</span>
            </div>
            <h2 className="text-3xl font-heading font-bold text-white tracking-tight">EXPLORE FLAVORS & DISCOVER YOUR NEXT DISH</h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Browse signature dishes and chef-crafted culinary masterpieces from world cuisines.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-dark-border bg-dark-card overflow-hidden h-[340px] sm:h-[400px] shadow-2xl relative">
          <CharacterCarousel
            items={featuredRecipes && featuredRecipes.length > 0 ? featuredRecipes.slice(0, 8).map(r => ({
              name: r.title,
              role: `${r.cuisine || 'Culinary'} • ${r.difficulty || 'Popular'}`,
              image: r.imageUrl
            })) : undefined}
            variant="filmstrip"
            speed={1.0}
            scale={1.0}
            opacity={1.0}
            hue={0}
            saturation={1.0}
            brightness={1.0}
            className="w-full h-full"
          />
        </div>
      </section>

      {/* ============================================================
          FEATURED & TRENDING RECIPES
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-left">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-warm mb-1">
              <Flame className="w-4 h-4 text-warm" />
              <span>Trending Recipes</span>
            </div>
            <h2 className="text-3xl font-heading font-bold text-white">Chef's Handcrafted Picks</h2>
            <p className="text-xs text-text-secondary mt-1">Gourmet recipes rated highest by our culinary community.</p>
          </div>
          <Link
            to="/recipes"
            className="btn-outline !py-2.5 !px-5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto"
          >
            <span>View All Recipes</span>
            <ArrowRight className="w-3.5 h-3.5" />
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
          CUISINE DISCOVERY COLLECTIONS
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-sage-400">Global Flavors</span>
          <h2 className="text-3xl font-heading font-bold text-white mt-1">Explore by Cuisine</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cuisines.map((c) => (
            <Link
              key={c.name}
              to={`/recipes?cuisine=${c.tag}`}
              className="card p-6 bg-dark-card border-dark-border hover:border-sage/40 hover:-translate-y-1 transition-all text-left flex flex-col justify-between group"
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{c.icon}</div>
              <div>
                <h3 className="text-lg font-heading font-bold text-white group-hover:text-sage-300 transition-colors">
                  {c.name}
                </h3>
                <p className="text-xs text-text-secondary mt-1">{c.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
};

export default HomePage;
