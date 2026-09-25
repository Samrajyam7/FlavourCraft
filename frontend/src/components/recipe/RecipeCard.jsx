import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Star, Heart, Flame, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { favoriteService } from '../../services/favoriteService';

export const RecipeCard = ({
  recipe,
  isFavorite: initialIsFavorite = false,
  onFavoriteChange,
  showMatchDetails = false,
}) => {
  const { isAuthenticated } = useAuth();
  const { success, error: toastError, info } = useToast();
  const navigate = useNavigate();

  const [isFav, setIsFav] = useState(initialIsFavorite || recipe.isFavorite || false);
  const [favLoading, setFavLoading] = useState(false);

  const prepTime = recipe.prepTimeMinutes ?? recipe.prepTime ?? 0;
  const cookTime = recipe.cookTimeMinutes ?? recipe.cookTime ?? 0;
  const totalTime = prepTime + cookTime;
  const calories = recipe.nutrition?.calories ?? recipe.caloriesPerServing ?? 0;
  const displayRating = recipe.rating ?? recipe.averageRating ?? 0;

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      info('Please sign in to save recipes to your favorites');
      navigate('/login');
      return;
    }

    setFavLoading(true);
    try {
      if (isFav) {
        await favoriteService.removeFavorite(recipe._id);
        setIsFav(false);
        success('Removed from favorites');
      } else {
        await favoriteService.addFavorite(recipe._id);
        setIsFav(true);
        success('Saved to favorites! ❤️');
      }
      if (onFavoriteChange) {
        onFavoriteChange(recipe._id, !isFav);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update favorite status');
    } finally {
      setFavLoading(false);
    }
  };

  // Match percentage styling & visual confidence
  const matchPercent = recipe.matchPercentage !== undefined ? Math.round(recipe.matchPercentage) : null;
  let matchBadgeClass = 'badge-match-low';
  if (matchPercent !== null) {
    if (matchPercent >= 90) matchBadgeClass = 'badge-match-high';
    else if (matchPercent >= 70) matchBadgeClass = 'bg-sage-950/80 text-sage-300 border border-sage-500/40 font-bold px-2.5 py-1 rounded-full text-xs flex items-center gap-1 shadow-sm';
    else if (matchPercent >= 40) matchBadgeClass = 'badge-match-med';
  }

  // Difficulty badge colors
  const getDifficultyClass = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/30';
      case 'medium':
        return 'bg-amber-950/60 text-amber-300 border border-amber-600/30';
      case 'hard':
        return 'bg-rose-950/60 text-rose-300 border border-rose-600/30';
      default:
        return 'bg-dark-surface text-text-secondary border border-dark-border';
    }
  };

  const defaultImage = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="card-hover group flex flex-col overflow-hidden relative bg-dark-card border border-dark-border rounded-2xl">
      {/* Recipe Image with Top Overlays */}
      <Link to={`/recipes/${recipe._id}`} className="relative h-52 sm:h-56 w-full overflow-hidden bg-dark-surface block">
        <img
          src={recipe.imageUrl || defaultImage}
          alt={recipe.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultImage;
          }}
          loading="lazy"
        />

        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-black/10 to-black/40" />

        {/* Top Badges (Cuisine & Meal Type) */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center z-10">
          {recipe.cuisine && (
            <span className="px-2.5 py-0.5 rounded-lg bg-dark-bg/80 backdrop-blur-md text-sage-200 border border-white/10 text-[11px] font-semibold tracking-wide uppercase">
              {recipe.cuisine}
            </span>
          )}
          {recipe.mealType && (
            <span className="px-2 py-0.5 rounded-lg bg-dark-bg/80 backdrop-blur-md text-text-secondary border border-white/10 text-[11px] font-medium">
              {recipe.mealType}
            </span>
          )}
        </div>

        {/* Tactile Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={favLoading}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all duration-200 z-20 ${
            isFav
              ? 'bg-accent text-white shadow-glow-accent scale-105 hover:bg-accent-600'
              : 'bg-dark-bg/70 text-white/80 hover:text-white hover:bg-dark-bg hover:scale-110 border border-white/10'
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Match Percentage Badge */}
        {matchPercent !== null && (
          <div className="absolute bottom-3 right-3 z-10">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black shadow-lg backdrop-blur-md ${matchBadgeClass}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{matchPercent}% Match</span>
            </div>
          </div>
        )}
      </Link>

      {/* Content Body */}
      <div className="p-5 flex flex-col flex-grow justify-between gap-3.5">
        <div className="space-y-1.5">
          {/* Title */}
          <Link to={`/recipes/${recipe._id}`} className="block focus:outline-none">
            <h3 className="text-base sm:text-lg font-heading font-bold text-white group-hover:text-sage-300 transition-colors line-clamp-1">
              {recipe.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
            {recipe.description || 'Delicious culinary creation crafted with fresh ingredients.'}
          </p>
        </div>

        {/* Match Breakdown Banner */}
        {showMatchDetails && (
          <div className="p-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs flex items-center justify-between">
            <span className="text-sage-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {recipe.matchedCount || 0} in kitchen
            </span>
            <span className={`font-medium flex items-center gap-1 ${recipe.missingCount > 0 ? 'text-warm' : 'text-sage-300'}`}>
              {recipe.missingCount > 0 ? (
                <>
                  <AlertCircle className="w-3 h-3 text-warm" />
                  <span>+{recipe.missingCount} needed</span>
                </>
              ) : (
                'All ready!'
              )}
            </span>
          </div>
        )}

        {/* Metadata Footer */}
        <div className="pt-3 border-t border-dark-border/80 flex items-center justify-between text-xs text-text-secondary">
          <div className="flex items-center gap-3">
            {totalTime > 0 && (
              <span className="flex items-center gap-1 hover:text-white transition-colors" title={`Prep: ${prepTime}m, Cook: ${cookTime}m`}>
                <Clock className="w-3.5 h-3.5 text-sage-400" />
                <span className="font-medium text-white">{totalTime}m</span>
              </span>
            )}

            {recipe.difficulty && (
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${getDifficultyClass(recipe.difficulty)}`}>
                {recipe.difficulty}
              </span>
            )}

            {calories > 0 && (
              <span className="hidden sm:flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-warm" />
                <span>{calories} kcal</span>
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 font-bold text-white">
            <Star className="w-3.5 h-3.5 text-warm fill-warm" />
            <span>{displayRating > 0 ? Number(displayRating).toFixed(1) : 'New'}</span>
            {recipe.reviewCount > 0 && (
              <span className="text-text-muted font-normal text-[11px]">({recipe.reviewCount})</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
