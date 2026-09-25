import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Trash2,
  Plus,
  ShoppingCart,
  Sparkles,
  Clock,
  RotateCcw,
  Utensils,
  ChevronRight,
  ChefHat,
} from 'lucide-react';
import { mealPlanService } from '../services/mealPlanService';
import { groceryService } from '../services/groceryService';
import { useToast } from '../context/ToastContext';

export const MealPlannerPage = () => {
  const { success, error: toastError, info } = useToast();
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  useEffect(() => {
    fetchMealPlan();
  }, []);

  const fetchMealPlan = async () => {
    try {
      setLoading(true);
      const data = await mealPlanService.getMealPlan();
      setMealPlan(data);
    } catch (err) {
      console.error('Failed to load meal plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSlot = async (dayOfWeek, mealType, slotId) => {
    try {
      await mealPlanService.removeMealSlot({ dayOfWeek, mealType, slotId });
      success(`Removed recipe from ${dayOfWeek} ${mealType}`);
      fetchMealPlan();
    } catch (err) {
      toastError('Failed to remove meal slot');
    }
  };

  const handleClearWeek = async () => {
    if (!window.confirm('Are you sure you want to clear your entire weekly meal plan?')) return;
    try {
      await mealPlanService.clearMealPlan();
      success('Weekly meal plan cleared');
      fetchMealPlan();
    } catch (err) {
      toastError('Failed to clear meal plan');
    }
  };

  const handleGenerateWeeklyGroceries = async () => {
    try {
      const res = await mealPlanService.generateGrocery();
      success(res.message || 'Generated groceries for all scheduled meals! Check your Grocery List 🛒');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to generate weekly grocery list');
    }
  };

  const getSlot = (day, type) => {
    const dayObj = mealPlan?.days?.find((d) => d.dayOfWeek === day);
    return dayObj?.slots?.find((s) => s.mealType === type);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header Banner */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-primary-900/40 via-dark-card to-dark-surface border-sage/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/15 text-sage-300 text-xs font-bold uppercase tracking-widest border border-sage/30">
              <Calendar className="w-3.5 h-3.5 text-sage-400" />
              <span>Weekly Menu & Kitchen Schedule</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black text-white">
              7-Day Digital Meal Planner
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Organize your weekly culinary itinerary across Breakfast, Lunch, Dinner, and Snacks. Export required ingredients to your Grocery Checklist with 1 single click.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerateWeeklyGroceries}
              className="btn-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-glow-green"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Sync Week to Grocery List</span>
            </button>
            <button
              onClick={handleClearWeek}
              className="btn-outline text-xs flex items-center gap-1.5 border-accent/30 text-accent hover:bg-accent/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Week</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7-Day Grid Calendar */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-96 skeleton rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-start">
          {daysOfWeek.map((day) => {
            const dayObj = mealPlan?.days?.find((d) => d.dayOfWeek === day);
            const totalScheduled = dayObj?.slots?.length || 0;

            return (
              <div
                key={day}
                className="card bg-dark-card border-dark-border overflow-hidden flex flex-col justify-between"
              >
                {/* Day Header */}
                <div className="p-3 bg-dark-surface border-b border-dark-border flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-white">{day}</span>
                  {totalScheduled > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage/20 text-sage-300 border border-sage/30">
                      {totalScheduled} meals
                    </span>
                  )}
                </div>

                {/* Slots List for this day */}
                <div className="p-3 space-y-2.5">
                  {mealTypes.map((type) => {
                    const slot = getSlot(day, type);

                    return (
                      <div
                        key={type}
                        className="p-2.5 rounded-xl bg-dark-surface border border-dark-border hover:border-sage/30 transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-text-muted uppercase tracking-wider">{type}</span>
                          {slot && (
                            <button
                              onClick={() => handleRemoveSlot(day, type, slot._id)}
                              className="text-text-muted hover:text-accent p-0.5"
                              title="Remove slot"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {slot?.recipe ? (
                          <Link
                            to={`/recipes/${slot.recipe._id}`}
                            className="block group/link space-y-0.5"
                          >
                            <p className="text-xs font-bold text-white group-hover/link:text-sage-300 transition-colors line-clamp-2">
                              {slot.recipe.title}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                              <span>{slot.servings || 2} serv</span>
                              {(slot.recipe.cookTimeMinutes ?? slot.recipe.cookTime) && (
                                <span>• {slot.recipe.cookTimeMinutes ?? slot.recipe.cookTime}m</span>
                              )}
                            </div>
                          </Link>
                        ) : (
                          <Link
                            to="/recipes"
                            className="flex items-center justify-center py-2 text-[10px] text-text-muted hover:text-sage-300 hover:bg-sage/5 rounded-lg border border-dashed border-dark-border transition-colors gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Recipe</span>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MealPlannerPage;
