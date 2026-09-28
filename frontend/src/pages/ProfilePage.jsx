import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  User,
  Heart,
  ChefHat,
  Settings,
  Lock,
  Plus,
  Trash2,
  Edit,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Sliders,
  Clock,
  Flame,
  Utensils,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { favoriteService } from '../services/favoriteService';
import { recipeService } from '../services/recipeService';
import { authService } from '../services/authService';
import { RecipeCard } from '../components/recipe/RecipeCard';

const DIETARY_OPTIONS = [
  { id: 'Vegetarian', label: '🥗 Vegetarian', desc: 'No meat or poultry' },
  { id: 'Vegan', label: '🌱 Vegan', desc: '100% plant-based' },
  { id: 'High Protein', label: '💪 High Protein', desc: '20g+ protein focus' },
  { id: 'Low Carb', label: '🥑 Low Carb', desc: 'Minimal carbohydrates' },
  { id: 'Low Calorie', label: '⚡ Low Calorie', desc: 'Under 450 kcal' },
  { id: 'Gluten Free', label: '🌾 Gluten Free', desc: 'No wheat / gluten' },
  { id: 'Dairy Free', label: '🥛 Dairy Free', desc: 'Lactose free' },
];

const TIME_OPTIONS = [
  { id: 'Under 15 min', label: '⚡ Under 15 min', desc: 'Lightning fast meals' },
  { id: '15-30 min', label: '⏱️ 15–30 min', desc: 'Standard weeknight dinner' },
  { id: '30-60 min', label: '🍳 30–60 min', desc: 'Medium simmer & bake' },
  { id: '60+ min', label: '🍲 60+ min', desc: 'Slow roasts & feasts' },
  { id: '', label: '✨ Any Time', desc: 'No time constraints' },
];

const CATEGORY_OPTIONS = [
  'Italian',
  'Mexican',
  'Asian',
  'Indian',
  'Mediterranean',
  'American',
  'Breakfast',
  'Dinner',
  'Soup',
  'Salad',
  'Dessert',
  'Healthy',
];

export const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'favorites';

  const { user, updateProfile, changePassword, isAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [favorites, setFavorites] = useState([]);
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Preferences State
  const [dietaryPreferences, setDietaryPreferences] = useState(user?.dietaryPreferences || []);
  const [preferredCookingTime, setPreferredCookingTime] = useState(user?.preferredCookingTime || '');
  const [favoriteCategories, setFavoriteCategories] = useState(user?.favoriteCategories || []);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [activeTab]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'favorites') {
        const favData = await favoriteService.getFavorites();
        const favList = favData.favorites || favData || [];
        setFavorites(favList.map((f) => f.recipe || f));
      } else if (activeTab === 'my-recipes') {
        const recData = await recipeService.getRecipes({ author: user?._id });
        setMyRecipes(recData.recipes || recData || []);
      } else if (activeTab === 'preferences') {
        const prefRes = await authService.getPreferences();
        if (prefRes?.data) {
          setDietaryPreferences(prefRes.data.dietaryPreferences || []);
          setPreferredCookingTime(prefRes.data.preferredCookingTime || '');
          setFavoriteCategories(prefRes.data.favoriteCategories || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ name, bio });
      success('Profile updated successfully! ✨');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toastError('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      success('Password changed successfully! 🔐');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      await authService.updatePreferences({
        dietaryPreferences,
        preferredCookingTime,
        favoriteCategories,
      });
      success('Kitchen preferences saved! Recipe recommendations updated ✨');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const toggleDietaryPreference = (pref) => {
    setDietaryPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const toggleCategory = (cat) => {
    setFavoriteCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleDeleteRecipe = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      await recipeService.deleteRecipe(id);
      setMyRecipes((prev) => prev.filter((r) => r._id !== id));
      success('Recipe deleted');
    } catch (err) {
      toastError('Failed to delete recipe');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Profile Header Card */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-primary-900/40 via-dark-card to-dark-surface border-sage/30">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-primary to-sage-600 flex items-center justify-center text-white text-3xl font-heading font-black shadow-glow-green flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'C'}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">{user?.name}</h1>
              {isAdmin && (
                <span className="px-2.5 py-0.5 rounded-lg bg-accent/20 text-accent border border-accent/30 text-xs font-bold self-center sm:self-auto flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Administrator
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-text-secondary">{user?.email}</p>
            {user?.bio && <p className="text-xs text-text-muted italic max-w-lg">{user.bio}</p>}

            {/* Quick badges of user dietary prefs */}
            {user?.dietaryPreferences?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 justify-center sm:justify-start">
                {user.dietaryPreferences.map((p) => (
                  <span key={p} className="px-2 py-0.5 rounded-md bg-sage/15 border border-sage/30 text-sage-300 text-[10px] font-bold">
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Link to="/recipes/new" className="btn-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-glow-green">
            <Plus className="w-4 h-4" />
            <span>Craft New Recipe</span>
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-dark-border pb-3 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => {
            setActiveTab('favorites');
            setSearchParams({ tab: 'favorites' });
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'favorites'
              ? 'bg-primary text-white shadow-glow-green'
              : 'text-text-secondary hover:text-white hover:bg-dark-hover'
          }`}
        >
          <Heart className="w-4 h-4 text-accent" />
          <span>Saved Favorites ({favorites.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('my-recipes');
            setSearchParams({ tab: 'my-recipes' });
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'my-recipes'
              ? 'bg-primary text-white shadow-glow-green'
              : 'text-text-secondary hover:text-white hover:bg-dark-hover'
          }`}
        >
          <ChefHat className="w-4 h-4 text-warm" />
          <span>My Published Recipes</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('preferences');
            setSearchParams({ tab: 'preferences' });
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'bg-primary text-white shadow-glow-green'
              : 'text-text-secondary hover:text-white hover:bg-dark-hover'
          }`}
        >
          <Sliders className="w-4 h-4 text-sage-400" />
          <span>Dietary & Kitchen Preferences</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('settings');
            setSearchParams({ tab: 'settings' });
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-primary text-white shadow-glow-green'
              : 'text-text-secondary hover:text-white hover:bg-dark-hover'
          }`}
        >
          <Settings className="w-4 h-4 text-text-muted" />
          <span>Account Settings</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'favorites' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-80 skeleton rounded-2xl" />
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <div className="card p-12 text-center bg-dark-card border-dark-border space-y-4 max-w-lg mx-auto">
                <Heart className="w-12 h-12 text-text-muted mx-auto" />
                <h3 className="text-base font-bold text-white">No Saved Favorites Yet</h3>
                <p className="text-xs text-text-secondary">
                  Click the heart icon on any recipe to save it here for quick cooking anytime!
                </p>
                <Link to="/recipes" className="btn-primary text-xs !py-2 !px-4">
                  Browse Recipes
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    isFavorite={true}
                    onFavoriteChange={() => fetchUserData()}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-recipes' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-80 skeleton rounded-2xl" />
                ))}
              </div>
            ) : myRecipes.length === 0 ? (
              <div className="card p-12 text-center bg-dark-card border-dark-border space-y-4 max-w-lg mx-auto">
                <ChefHat className="w-12 h-12 text-text-muted mx-auto" />
                <h3 className="text-base font-bold text-white">No Recipes Created Yet</h3>
                <p className="text-xs text-text-secondary">
                  Share your own secret marinades, desserts, or dinners with the FlavorCraft kitchen!
                </p>
                <Link to="/recipes/new" className="btn-primary text-xs !py-2 !px-4">
                  + Create First Recipe
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myRecipes.map((recipe) => (
                  <div key={recipe._id} className="flex flex-col justify-between">
                    <RecipeCard recipe={recipe} />
                    <div className="mt-2.5 flex items-center justify-end gap-2">
                      <Link
                        to={`/recipes/${recipe._id}/edit`}
                        className="btn-outline text-xs !py-1.5 flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteRecipe(recipe._id)}
                        className="btn-danger text-xs !py-1.5 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="card p-6 sm:p-8 bg-dark-card border-dark-border space-y-8 max-w-3xl">
            <div className="border-b border-dark-border pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sage-400" />
                <span>Personalized Kitchen & Dietary Preferences</span>
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Customize your nutrition goals, dietary tags, and cooking pace. These transparently fuel our smart recipe recommendations.
              </p>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-8">
              {/* Dietary Preferences Multi-Select */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-warm" /> Dietary Preferences (Multi-Select)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DIETARY_OPTIONS.map((opt) => {
                    const selected = dietaryPreferences.includes(opt.id);
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => toggleDietaryPreference(opt.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between ${
                          selected
                            ? 'bg-primary/20 border-sage text-white shadow-glow-green'
                            : 'bg-dark-surface/50 border-dark-border text-text-secondary hover:border-sage/40 hover:text-white'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-white">{opt.label}</div>
                          <div className="text-[11px] text-text-muted mt-0.5">{opt.desc}</div>
                        </div>
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                            selected ? 'bg-primary text-white' : 'border border-dark-border'
                          }`}
                        >
                          {selected ? '✓' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Cooking Time */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sage-400" /> Preferred Cooking Time
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {TIME_OPTIONS.map((opt) => {
                    const selected = preferredCookingTime === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setPreferredCookingTime(opt.id)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          selected
                            ? 'bg-primary/25 border-sage text-white shadow-glow-green font-bold'
                            : 'bg-dark-surface/50 border-dark-border text-text-secondary hover:border-sage/40 hover:text-white'
                        }`}
                      >
                        <div className="text-xs">{opt.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Favorite Categories */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-accent-400" /> Favorite Cuisines & Meal Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const selected = favoriteCategories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          selected
                            ? 'bg-accent/20 border-accent text-accent-300'
                            : 'bg-dark-surface/50 border-dark-border text-text-secondary hover:text-white hover:border-dark-border/80'
                        }`}
                      >
                        {selected ? `✓ ${cat}` : cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-dark-border flex items-center justify-end gap-4">
                <button
                  type="submit"
                  disabled={savingPrefs}
                  className="btn-primary text-xs font-bold uppercase tracking-wider !py-3 !px-6 shadow-glow-green"
                >
                  {savingPrefs ? 'Saving Preferences...' : 'Save Kitchen Preferences'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Profile Info */}
            <div className="card p-6 bg-dark-card border-dark-border space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-dark-border pb-3">
                <User className="w-4 h-4 text-sage-400" /> Chef Profile Information
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="input-label">Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="input-label">Culinary Bio / Specialities</label>
                  <textarea
                    rows="3"
                    placeholder="e.g., Home cook passionate about Italian pasta and Indian spices..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="input resize-none text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary text-xs font-semibold shadow-glow-green"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="card p-6 bg-dark-card border-dark-border space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-dark-border pb-3">
                <Lock className="w-4 h-4 text-warm" /> Change Password
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="input-label">Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="input-label">New Password (min 6 chars)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="input-label">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="btn-primary text-xs font-semibold shadow-glow-green"
                >
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
