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

  // Helper to find slot data
  const getSlot = (day, type) => {
    const dayObj = mealPlan?.days?.find((d) => d.dayOfWeek === day);
    return dayObj?.slots?.find((s) => s.mealType === type);
  };

  return (
    <div className="container-page py-8 space-y-8">
      {/* Header Banner */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-primary-900/40 via-dark-card to-dark-surface border-primary/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Weekly Menu & Meal Prep</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black text-white">
              7-Day Smart Meal Planner
            </h1>
            <p className="text-sm text-text-secondary max-w-xl">
              Organize your breakfast, lunch, dinner, and snacks for the entire week. Generate your complete weekly shopping list with 1 single click.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerateWeeklyGroceries}
              className="btn btn-primary flex items-center gap-2 shadow-glow-green"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Export Week to Grocery List</span>
            </button>
            <button
              onClick={handleClearWeek}
              className="btn btn-outline text-xs flex items-center gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10"
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
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      {totalScheduled} meals
                    </span>
                  )}
                </div>

                {/* Slots List for this day */}
                <div className="p-3 space-y-3">
                  {mealTypes.map((type) => {
                    const slot = getSlot(day, type);

                    return (
                      <div
                        key={type}
                        className="p-2.5 rounded-xl bg-dark-surface/60 border border-dark-border/60 hover:border-primary/30 transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-text-muted uppercase tracking-wider">{type}</span>
                          {slot && (
                            <button
                              onClick={() => handleRemoveSlot(day, type, slot._id)}
                              className="text-text-muted hover:text-red-400 p-0.5"
                              title="Remove slot"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {slot?.recipe ? (
                          <Link
                            to={`/recipes/${slot.recipe._id}`}
                            className="block group/link space-y-1"
                          >
                            <p className="text-xs font-bold text-white group-hover/link:text-primary transition-colors line-clamp-2">
                              {slot.recipe.title}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-text-muted">
                              <span>{slot.servings || 2} serv</span>
                              {slot.recipe.cookTime && <span>• {slot.recipe.cookTime}m</span>}
                            </div>
                          </Link>
                        ) : (
                          <Link
                            to="/recipes"
                            className="flex items-center justify-center py-2 text-[11px] text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg border border-dashed border-dark-border transition-colors gap-1"
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
