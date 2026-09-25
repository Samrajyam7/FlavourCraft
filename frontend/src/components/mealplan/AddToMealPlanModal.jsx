import React, { useState } from 'react';
import { X, Calendar, Clock, Check, Utensils } from 'lucide-react';
import { mealPlanService } from '../../services/mealPlanService';
import { useToast } from '../../context/ToastContext';

export const AddToMealPlanModal = ({ recipe, isOpen = true, onClose, onSuccess }) => {
  const { success, error: toastError } = useToast();
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [mealType, setMealType] = useState('Dinner');
  const [servings, setServings] = useState(recipe?.servings || 2);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !recipe) return null;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await mealPlanService.addMealSlot({
        recipeId: recipe._id,
        dayOfWeek,
        mealType,
        servings: Number(servings),
        notes,
      });
      success(`Added "${recipe.title}" to ${dayOfWeek}'s ${mealType}! 📅`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to add recipe to meal plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in text-left">
      <div className="card max-w-md w-full p-6 bg-dark-card border-dark-border relative shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between pb-4 border-b border-dark-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sage/15 text-sage-300 flex items-center justify-center border border-sage/30">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Schedule in Meal Planner</h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-white p-1 rounded-lg hover:bg-dark-hover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="p-3 rounded-xl bg-dark-surface border border-dark-border">
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-0.5">Selected Dish</p>
            <p className="text-sm font-semibold text-white truncate">{recipe.title}</p>
          </div>

          {/* Day Selection */}
          <div>
            <label className="input-label">Select Day of Week</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {days.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDayOfWeek(d)}
                  className={`py-2 px-1 text-xs font-semibold rounded-xl transition-all ${
                    dayOfWeek === d
                      ? 'bg-primary text-white shadow-glow-green'
                      : 'bg-dark-surface text-text-secondary hover:text-white hover:bg-dark-hover border border-dark-border'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Slot Selection */}
          <div>
            <label className="input-label">Meal Slot</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {mealTypes.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMealType(m)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl transition-all ${
                    mealType === m
                      ? 'bg-sage-600 text-white shadow-sm border border-sage-400'
                      : 'bg-dark-surface text-text-secondary hover:text-white hover:bg-dark-hover border border-dark-border'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Servings */}
          <div>
            <label className="input-label">Portion Servings</label>
            <input
              type="number"
              min="1"
              max="20"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              className="input text-xs"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="input-label">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Prep chicken marinade night before"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs font-semibold shadow-glow-green"
            >
              {loading ? 'Scheduling...' : 'Save to Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToMealPlanModal;
