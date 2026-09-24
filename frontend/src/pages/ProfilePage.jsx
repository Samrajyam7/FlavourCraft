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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { favoriteService } from '../services/favoriteService';
import { recipeService } from '../services/recipeService';
import { RecipeCard } from '../components/recipe/RecipeCard';

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
    <div className="container-page py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-primary-900/40 via-dark-card to-dark-surface border-primary/30">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-3xl font-heading font-black shadow-glow-green flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'C'}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">{user?.name}</h1>
              {isAdmin && (
                <span className="badge badge-orange self-center sm:self-auto">
                  <ShieldCheck className="w-3.5 h-3.5" /> Administrator
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary">{user?.email}</p>
            {user?.bio && <p className="text-xs text-text-muted italic max-w-lg">{user.bio}</p>}
          </div>

          <Link to="/recipes/new" className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-glow-green">
            <Plus className="w-4 h-4" />
            <span>Craft New Recipe</span>
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-dark-border pb-3">
        <button
          onClick={() => {
            setActiveTab('favorites');
            setSearchParams({ tab: 'favorites' });
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'favorites'
              ? 'bg-primary text-white shadow-glow-green'
              : 'text-text-secondary hover:text-white hover:bg-dark-hover'
          }`}
        >
          <Heart className="w-4 h-4 text-red-400" />
          <span>Saved Favorites</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('my-recipes');
            setSearchParams({ tab: 'my-recipes' });
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'my-recipes'
              ? 'bg-primary text-white shadow-glow-green'
              : 'text-text-secondary hover:text-white hover:bg-dark-hover'
          }`}
        >
          <ChefHat className="w-4 h-4 text-amber-DEFAULT" />
          <span>My Published Recipes</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('settings');
            setSearchParams({ tab: 'settings' });
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
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
                <Link to="/recipes" className="btn btn-primary text-xs !py-2 !px-4">
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
                <Link to="/recipes/new" className="btn btn-primary text-xs !py-2 !px-4">
                  + Create First Recipe
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myRecipes.map((recipe) => (
                  <div key={recipe._id} className="flex flex-col justify-between">
                    <RecipeCard recipe={recipe} />
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <Link
                        to={`/recipes/${recipe._id}/edit`}
                        className="btn btn-outline !py-1.5 text-xs flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteRecipe(recipe._id)}
                        className="btn btn-outline !py-1.5 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            {/* Profile Info Form */}
            <div className="card p-6 sm:p-8 bg-dark-card border-dark-border space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-dark-border pb-3">
                <User className="w-4 h-4 text-primary" /> Profile Information
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="input-label">Bio / Culinary Style</label>
                  <textarea
                    rows="3"
                    placeholder="Tell other foodies about your cooking tastes..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="input text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn btn-primary text-xs !py-2.5 shadow-glow-green"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>

            {/* Password Change Form */}
            <div className="card p-6 sm:p-8 bg-dark-card border-dark-border space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-dark-border pb-3">
                <Lock className="w-4 h-4 text-secondary" /> Change Password
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="input-label">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="input-label">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="btn btn-secondary text-xs !py-2.5 shadow-glow-orange"
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
