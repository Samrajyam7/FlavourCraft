import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  ChefHat,
  Users,
  Flame,
  Star,
  Heart,
  Calendar,
  ShoppingCart,
  Play,
  Share2,
  Trash2,
  Edit,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { recipeService } from '../services/recipeService';
import { favoriteService } from '../services/favoriteService';
import { groceryService } from '../services/groceryService';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CookingModeModal } from '../components/recipe/CookingModeModal';
import { AddToMealPlanModal } from '../components/mealplan/AddToMealPlanModal';

export const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [baseServings, setBaseServings] = useState(2);

  // Modals
  const [cookingModeOpen, setCookingModeOpen] = useState(false);
  const [mealPlanOpen, setMealPlanOpen] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchRecipeData();
  }, [id]);

  const fetchRecipeData = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getRecipeById(id);
      setRecipe(data);
      const servings = data.servings || 2;
      setBaseServings(servings);
      setServingMultiplier(1);

      if (isAuthenticated) {
        try {
          const favCheck = await favoriteService.checkFavorite(id);
          setIsFav(favCheck.isFavorite);
        } catch (e) {
          // ignore
        }
      }

      // Fetch reviews
      try {
        const revData = await reviewService.getRecipeReviews(id);
        setReviews(revData.reviews || revData || []);
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error('Failed to load recipe detail:', err);
      toastError('Could not find requested recipe');
      navigate('/recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      info('Please sign in to favorite this recipe');
      navigate('/login');
      return;
    }

    try {
      if (isFav) {
        await favoriteService.removeFavorite(id);
        setIsFav(false);
        success('Removed from favorites');
      } else {
        await favoriteService.addFavorite(id);
        setIsFav(true);
        success('Saved to favorites! ❤️');
      }
    } catch (err) {
      toastError('Failed to update favorite');
    }
  };

  const handleAddAllToGrocery = async () => {
    if (!isAuthenticated) {
      info('Please sign in to add items to your grocery list');
      navigate('/login');
      return;
    }

    try {
      await groceryService.generateFromRecipe(id, []);
      success(`Added all ingredients for "${recipe.title}" to your grocery list! 🛒`);
    } catch (err) {
      toastError('Failed to add ingredients to grocery list');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      info('Please sign in to leave a review');
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      const newReview = await reviewService.addOrUpdateReview(id, {
        rating: ratingInput,
        comment: commentInput,
      });
      success('Review submitted successfully! ⭐');
      setCommentInput('');
      // refresh reviews
      const revData = await reviewService.getRecipeReviews(id);
      setReviews(revData.reviews || revData || []);
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to post review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewService.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      success('Review deleted');
    } catch (err) {
      toastError('Failed to delete review');
    }
  };

  if (loading || !recipe) {
    return (
      <div className="container-page py-12">
        <div className="h-96 skeleton rounded-3xl" />
      </div>
    );
  }

  const isAuthor = user && recipe.author && (user._id === recipe.author._id || user._id === recipe.author);
  const currentServings = Math.round(baseServings * servingMultiplier);
  const defaultImage = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="container-page py-8 space-y-10">
      {/* Back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost text-xs flex items-center gap-2 text-text-secondary hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {isAuthor && (
            <Link
              to={`/recipes/${recipe._id}/edit`}
              className="btn btn-outline text-xs flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Recipe</span>
            </Link>
          )}
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: recipe.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                info('Link copied to clipboard!');
              }
            }}
            className="btn btn-icon btn-ghost"
            title="Share recipe"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Header & Media */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Image */}
        <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-2xl relative bg-dark-surface border border-dark-border h-80 sm:h-[420px]">
          <img
            src={recipe.imageUrl || defaultImage}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent" />

          {/* Quick interactive action buttons over image */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleFavoriteToggle}
              className={`p-3 rounded-full backdrop-blur-md transition-all shadow-xl ${
                isFav ? 'bg-red-500 text-white' : 'bg-dark/80 text-white hover:bg-dark'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap gap-2 mb-2">
              {recipe.cuisine && <span className="badge badge-green">{recipe.cuisine}</span>}
              {recipe.mealType && <span className="badge badge-orange">{recipe.mealType}</span>}
              {recipe.difficulty && <span className="badge badge-amber">{recipe.difficulty}</span>}
              {recipe.dietaryTags?.map((tag) => (
                <span key={tag} className="badge badge-blue">{tag}</span>
              ))}
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black text-white leading-tight drop-shadow-md">
              {recipe.title}
            </h1>
          </div>
        </div>

        {/* Recipe Overview & Action Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6 bg-dark-card border-dark-border space-y-6">
            <p className="text-sm text-text-secondary leading-relaxed">
              {recipe.description || 'A flavorful and nourishing home-cooked dish.'}
            </p>

            {/* Cooking Key Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-dark-surface border border-dark-border/60">
                <span className="text-[11px] text-text-muted uppercase font-bold flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-primary" /> Prep Time
                </span>
                <span className="text-lg font-bold text-white">{recipe.prepTime || 0} mins</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-dark-surface border border-dark-border/60">
                <span className="text-[11px] text-text-muted uppercase font-bold flex items-center gap-1 mb-1">
                  <Flame className="w-3.5 h-3.5 text-secondary" /> Cook Time
                </span>
                <span className="text-lg font-bold text-white">{recipe.cookTime || 0} mins</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-dark-surface border border-dark-border/60">
                <span className="text-[11px] text-text-muted uppercase font-bold flex items-center gap-1 mb-1">
                  <Users className="w-3.5 h-3.5 text-amber-DEFAULT" /> Base Servings
                </span>
                <span className="text-lg font-bold text-white">{recipe.servings || 2} persons</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-dark-surface border border-dark-border/60">
                <span className="text-[11px] text-text-muted uppercase font-bold flex items-center gap-1 mb-1">
                  <Star className="w-3.5 h-3.5 text-amber-DEFAULT" /> Rating
                </span>
                <span className="text-lg font-bold text-white">
                  {recipe.averageRating ? recipe.averageRating.toFixed(1) : 'New'} ⭐
                </span>
              </div>
            </div>

            {/* Big Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setCookingModeOpen(true)}
                className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2 shadow-glow-green"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Interactive Cooking Mode</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMealPlanOpen(true)}
                  className="btn btn-outline text-xs !py-3 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Meal Planner</span>
                </button>

                <button
                  onClick={handleAddAllToGrocery}
                  className="btn btn-outline text-xs !py-3 flex items-center justify-center gap-2 text-secondary border-secondary/40 hover:bg-secondary/10"
                >
                  <ShoppingCart className="w-4 h-4 text-secondary" />
                  <span>To Grocery List</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details: Ingredients (Left) vs Instructions & Nutrition (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ingredients Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6 bg-dark-card border-dark-border space-y-5">
            <div className="flex items-center justify-between border-b border-dark-border pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-primary" />
                <span>Ingredients</span>
              </h2>

              {/* Dynamic Servings Scaler */}
              <div className="flex items-center gap-2 bg-dark-surface px-3 py-1.5 rounded-xl border border-dark-border">
                <span className="text-xs text-text-muted">Servings:</span>
                <button
                  onClick={() => setServingMultiplier((prev) => Math.max(0.5, prev - 0.5))}
                  className="w-5 h-5 rounded-md bg-dark-border flex items-center justify-center text-xs font-bold hover:bg-primary hover:text-white"
                >
                  -
                </button>
                <span className="text-xs font-bold text-white min-w-[20px] text-center">
                  {currentServings}
                </span>
                <button
                  onClick={() => setServingMultiplier((prev) => prev + 0.5)}
                  className="w-5 h-5 rounded-md bg-dark-border flex items-center justify-center text-xs font-bold hover:bg-primary hover:text-white"
                >
                  +
                </button>
              </div>
            </div>

            {/* Scaled Ingredients List */}
            <ul className="space-y-3">
              {recipe.ingredients?.map((item, index) => {
                const scaledAmount = item.amount ? Number((item.amount * servingMultiplier).toFixed(2)) : null;
                const ingName = item.ingredient?.name || item.name;

                return (
                  <li
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-dark-surface/60 border border-dark-border/40 text-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <span className="font-semibold text-white">{ingName}</span>
                      {item.notes && <span className="text-xs text-text-muted italic">({item.notes})</span>}
                    </div>

                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                      {scaledAmount ? `${scaledAmount} ` : ''}
                      {item.unit || ''}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Nutrition Info if available */}
          {recipe.caloriesPerServing && (
            <div className="card p-6 bg-dark-card border-dark-border">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4 text-secondary" /> Estimated Nutrition (Per Serving)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-dark-surface rounded-xl border border-dark-border/60">
                  <span className="text-xs text-text-muted block">Calories</span>
                  <span className="text-lg font-bold text-white">{recipe.caloriesPerServing} kcal</span>
                </div>
                <div className="p-3 bg-dark-surface rounded-xl border border-dark-border/60">
                  <span className="text-xs text-text-muted block">Cook Difficulty</span>
                  <span className="text-lg font-bold text-white">{recipe.difficulty || 'Easy'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step-by-Step Instructions Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card p-6 sm:p-8 bg-dark-card border-dark-border space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-dark-border pb-4">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <span>Step-by-Step Instructions</span>
            </h2>

            <div className="space-y-6">
              {recipe.instructions?.map((step, idx) => {
                const stepText = typeof step === 'string' ? step : step.instruction;
                return (
                  <div key={idx} className="flex gap-4 group">
                    <div className="w-9 h-9 rounded-2xl bg-dark-surface border border-dark-border text-primary font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                      {idx + 1}
                    </div>
                    <div className="space-y-1 pt-1">
                      <p className="text-base text-text-primary leading-relaxed">{stepText}</p>
                      {step.timerMinutes && (
                        <span className="inline-flex items-center gap-1 text-xs text-secondary font-medium mt-1">
                          <Clock className="w-3.5 h-3.5" /> Timer: {step.timerMinutes} minutes
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Community Reviews & Ratings */}
          <div className="card p-6 sm:p-8 bg-dark-card border-dark-border space-y-6">
            <div className="flex items-center justify-between border-b border-dark-border pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-DEFAULT" />
                <span>Community Reviews ({reviews.length})</span>
              </h2>
            </div>

            {/* Leave Review Form */}
            <form onSubmit={handleReviewSubmit} className="p-4 rounded-2xl bg-dark-surface border border-dark-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Leave a Rating</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingInput(star)}
                      className="p-1 text-amber-DEFAULT hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= ratingInput ? 'fill-amber-DEFAULT' : 'text-text-muted opacity-40'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Share your culinary results, ingredient tweaks, or tips..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                rows="2"
                required
                className="input resize-none text-xs"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary btn-sm !px-4 shadow-glow-green"
                >
                  {submittingReview ? 'Posting...' : 'Submit Review'}
                </button>
              </div>
            </form>

            {/* Reviews List */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {reviews.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-6">
                  No reviews yet. Be the first to cook and review this dish!
                </p>
              ) : (
                reviews.map((rev) => {
                  const canDelete = user && (user._id === rev.user?._id || user._id === rev.user || user.role === 'admin');
                  return (
                    <div
                      key={rev._id}
                      className="p-4 rounded-xl bg-dark-surface/70 border border-dark-border/60 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                            {rev.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white">{rev.user?.name || 'Chef'}</span>
                            <span className="text-[10px] text-text-muted block">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-DEFAULT text-amber-DEFAULT" />
                            ))}
                          </div>
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteReview(rev._id)}
                              className="text-text-muted hover:text-red-400 p-1"
                              title="Delete review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed pl-9">{rev.comment}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cooking Mode Fullscreen Modal */}
      <CookingModeModal
        recipe={recipe}
        isOpen={cookingModeOpen}
        onClose={() => setCookingModeOpen(false)}
      />

      {/* Add To Meal Plan Modal */}
      <AddToMealPlanModal
        recipe={recipe}
        isOpen={mealPlanOpen}
        onClose={() => setMealPlanOpen(false)}
      />
    </div>
  );
};

export default RecipeDetailPage;
