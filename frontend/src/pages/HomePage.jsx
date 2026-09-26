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
} from 'lucide-react';
import { TextAnimationCollection, CharacterCarousel, LiquidMetalButton } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';

import { recipeService } from '../services/recipeService';
import { RecipeCard } from '../components/recipe/RecipeCard';
import CookingPotInteractive from '../components/ingredient/CookingPotInteractive';

export const HomePage = () => {
  const navigate = useNavigate();
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickSearch, setQuickSearch] = useState('');

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
    <div className="space-y-24 pb-20">
      {/* ============================================================
          HERO SECTION — THREEUI TEXT ANIMATION & EDITORIAL IDENTITY
          ============================================================ */}
      <section className="relative overflow-hidden pt-6 pb-16 border-b border-dark-border/40 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage/15 border border-sage/30 text-sage-300 text-xs font-bold uppercase tracking-widest animate-fade-in">
                <Sparkles className="w-3.5 h-3.5 text-sage-400" />
                <span>The Intelligent Digital Kitchen</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black tracking-tight text-white leading-[1.08]">
                Turn What You Have Into{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-300 via-warm to-accent">
                  What You Crave
                </span>
                .
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed">
                Choose your ingredients and discover recipes you can actually make right now. Exact percentage matching. Zero grocery stress. Zero food waste.
              </p>

              {/* Hero Action Area featuring ThreeUI LiquidMetalButton */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center min-w-[190px] h-[52px]">
                  <LiquidMetalButton
                    variant="pill"
                    text="START COOKING"
                    onClick={() => navigate('/matcher')}
                  />
                </div>

                <Link
                  to="/recipes"
                  className="btn-outline !py-3.5 !px-6 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 h-[52px]"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Explore Recipes</span>
                </Link>
              </div>

              {/* Instant Search Bar */}
              <form onSubmit={handleSearchSubmit} className="pt-2 max-w-lg">
                <div className="relative flex items-center shadow-card rounded-2xl bg-dark-card border border-dark-border p-1.5 focus-within:border-sage/50 focus-within:ring-2 focus-within:ring-sage/20 transition-all">
                  <Search className="w-4 h-4 text-text-muted ml-3" />
                  <input
                    type="text"
                    placeholder="Search dishes (e.g., Chicken Dum Biryani, Pasta)..."
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

            {/* Right Column: ThreeUI TextAnimationCollection Canvas */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full aspect-square max-w-[460px] rounded-3xl bg-dark-card border border-dark-border shadow-2xl overflow-hidden flex items-center justify-center">
                <TextAnimationCollection
                  variant="threeui-intro"
                  mode="dark"
                  hue={0}
                  saturation={1.0}
                  brightness={1.0}
                  className="w-full h-full"
                />

                {/* Floating Culinary Badges */}
                <div className="absolute top-4 left-4 p-2.5 rounded-2xl bg-dark-bg/90 backdrop-blur-md border border-white/10 shadow-lg text-left pointer-events-none z-20">
                  <p className="text-[10px] uppercase font-bold text-sage-400 tracking-wider">Live Matcher</p>
                  <p className="text-xs font-bold text-white">Classic Omelette</p>
                  <span className="text-[10px] font-bold text-emerald-400">100% Available</span>
                </div>

                <div className="absolute bottom-4 right-4 p-2.5 rounded-2xl bg-dark-bg/90 backdrop-blur-md border border-white/10 shadow-lg text-left pointer-events-none z-20">
                  <p className="text-[10px] uppercase font-bold text-warm tracking-wider">Chef's Special</p>
                  <p className="text-xs font-bold text-white">Butter Chicken</p>
                  <span className="text-[10px] font-medium text-text-secondary">⭐ 4.9 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SIGNATURE COOKING POT WORKSTATION SECTION
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Explanation */}
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

            {/* Quick Chips to tap */}
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

          {/* Right Column: Signature Interactive Cooking Pot */}
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
          EXPLORE FLAVORS / DISCOVER YOUR NEXT DISH (FILMSTRIP CAROUSEL)
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
              Browse signature dishes and chef-crafted culinary masterpieces from world cuisines — from slow-simmered curries to wood-fired classics.
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
          FEATURED & TRENDING RECIPES WITH AUTHENTIC FOOD IMAGERY
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
  );
};

export default HomePage;
