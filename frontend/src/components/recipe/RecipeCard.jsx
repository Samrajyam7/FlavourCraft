import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, ChefHat, Star, Heart, Flame, Sparkles } from 'lucide-react';
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

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

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

  // Match percentage styling
  const matchPercent = recipe.matchPercentage !== undefined ? Math.round(recipe.matchPercentage) : null;
  let matchBadgeColor = 'bg-primary/20 text-primary border-primary/40';
  if (matchPercent !== null) {
    if (matchPercent >= 80) matchBadgeColor = 'bg-primary text-white shadow-glow-green';
    else if (matchPercent >= 50) matchBadgeColor = 'bg-amber-DEFAULT text-dark font-bold shadow-glow-orange';
    else matchBadgeColor = 'bg-secondary/30 text-secondary border-secondary/40';
  }

  // Difficulty color
  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'badge-green';
      case 'medium':
        return 'badge-amber';
      case 'hard':
        return 'badge-red';
      default:
        return 'badge-gray';
    }
  };

  const defaultImage = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="card-hover group flex flex-col overflow-hidden relative">
      {/* Recipe Image & Top Overlays */}
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

        {/* Gradient shadow for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center z-10">
          {recipe.cuisine && (
            <span className="badge bg-dark/80 backdrop-blur-md text-text-primary border border-white/10 text-xs font-semibold">
              {recipe.cuisine}
            </span>
          )}
          {recipe.mealType && (
            <span className="badge bg-dark/80 backdrop-blur-md text-text-secondary border border-white/10 text-xs">
              {recipe.mealType}
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={favLoading}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 z-20 ${
            isFav
              ? 'bg-red-500/90 text-white shadow-lg scale-105 hover:bg-red-600'
              : 'bg-dark/70 text-white/80 hover:text-white hover:bg-dark hover:scale-110'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Match Percentage Badge (if in match mode) */}
        {matchPercent !== null && (
          <div className="absolute bottom-3 right-3 z-10">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold shadow-lg ${matchBadgeColor}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{matchPercent}% Match</span>
            </div>
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-grow justify-between gap-4">
        <div className="space-y-2">
          {/* Title */}
          <Link to={`/recipes/${recipe._id}`}>
            <h3 className="text-lg font-heading font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
              {recipe.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
            {recipe.description || 'Delicious home-crafted recipe packed with fresh flavor.'}
          </p>
        </div>

        {/* Missing / Available Ingredients info if in match mode */}
        {showMatchDetails && recipe.missingCount !== undefined && (
          <div className="p-2.5 rounded-xl bg-dark-surface/80 border border-dark-border/60 text-xs flex items-center justify-between">
            <span className="text-primary font-medium flex items-center gap-1">
              ✓ {recipe.matchedCount || 0} in pantry
            </span>
            <span className={`font-medium ${recipe.missingCount > 0 ? 'text-secondary' : 'text-text-muted'}`}>
              {recipe.missingCount > 0 ? `+ ${recipe.missingCount} missing` : 'All ingredients ready!'}
            </span>
          </div>
        )}

        {/* Meta Stats: Time, Difficulty, Calories, Rating */}
        <div className="pt-3 border-t border-dark-border/60 flex items-center justify-between text-xs text-text-secondary">
          <div className="flex items-center gap-3.5">
            {totalTime > 0 && (
              <span className="flex items-center gap-1 hover:text-white transition-colors" title={`Prep: ${recipe.prepTime}m, Cook: ${recipe.cookTime}m`}>
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>{totalTime}m</span>
              </span>
            )}

            {recipe.difficulty && (
              <span className={`badge ${getDifficultyColor(recipe.difficulty)} !py-0.5 !px-2`}>
                {recipe.difficulty}
              </span>
            )}

            {recipe.caloriesPerServing && (
              <span className="hidden sm:flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-secondary" />
                <span>{recipe.caloriesPerServing} kcal</span>
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 font-semibold text-white">
            <Star className="w-3.5 h-3.5 text-amber-DEFAULT fill-amber-DEFAULT" />
            <span>{recipe.averageRating ? recipe.averageRating.toFixed(1) : 'New'}</span>
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
