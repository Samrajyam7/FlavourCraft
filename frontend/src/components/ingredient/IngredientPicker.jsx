import React, { useState, useEffect } from 'react';
import { Search, X, Check, Sparkles, Refrigerator, Layers, Plus } from 'lucide-react';
import { ingredientService } from '../../services/ingredientService';
import { inventoryService } from '../../services/inventoryService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const IngredientPicker = ({
  selectedIngredients = [],
  onSelectIngredient,
  onRemoveIngredient,
  onClearAll,
  onBatchSelect,
}) => {
  const { isAuthenticated } = useAuth();
  const { success, warning, error: toastError } = useToast();

  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncingPantry, setSyncingPantry] = useState(false);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setLoading(true);
        const [ingData, catData] = await Promise.all([
          ingredientService.getIngredients({ limit: 200 }),
          ingredientService.getCategories(),
        ]);
        setIngredients(ingData.ingredients || ingData || []);
        setCategories(['All', ...(catData || [])]);
      } catch (err) {
        console.error('Failed to load ingredients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  const handlePantrySync = async () => {
    if (!isAuthenticated) {
      warning('Please sign in to load ingredients from your Pantry');
      return;
    }
    try {
      setSyncingPantry(true);
      const data = await inventoryService.getInventory();
      const pantryList = data.inventory || data.items || (Array.isArray(data) ? data : []);
      const pantryIngredients = pantryList
        .map((item) => item.ingredientId || item.ingredient || item)
        .filter((ing) => ing && (ing._id || ing.name));

      if (pantryIngredients.length === 0) {
        warning('Your pantry is empty! Add ingredients in "My Pantry" first, then sync.');
        return;
      }

      if (onBatchSelect) {
        onBatchSelect(pantryIngredients);
      } else {
        pantryIngredients.forEach((ing) => onSelectIngredient(ing));
      }
      success(`Imported ${pantryIngredients.length} ingredients from your pantry! ✨`);
    } catch (err) {
      console.error('Pantry sync error:', err);
      toastError(err.response?.data?.message || 'Failed to sync pantry ingredients');
    } finally {
      setSyncingPantry(false);
    }
  };

  const selectedIds = new Set(selectedIngredients.map((i) => (typeof i === 'object' ? i._id : i)));

  const filteredIngredients = ingredients.filter((ing) => {
    const matchesCategory = activeCategory === 'All' || ing.category === activeCategory;
    const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search ingredients (e.g., chicken, garlic, tomatoes)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input !pl-10 !py-2.5 text-sm w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sync Pantry Button */}
        {isAuthenticated && (
          <button
            onClick={handlePantrySync}
            disabled={syncingPantry}
            className="btn btn-outline text-xs !py-2.5 whitespace-nowrap border-primary/30 text-primary hover:bg-primary/10"
          >
            <Refrigerator className="w-4 h-4" />
            <span>{syncingPantry ? 'Syncing...' : 'Use My Pantry'}</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-hide text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-primary text-white shadow-glow-green font-semibold'
                : 'bg-dark-surface text-text-secondary hover:text-white hover:bg-dark-hover border border-dark-border/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Selected Ingredient Chips Tray */}
      {selectedIngredients.length > 0 && (
        <div className="p-4 rounded-2xl bg-dark-card border border-primary/30 shadow-card">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Your Chosen Ingredients ({selectedIngredients.length})
              </span>
            </div>
            {onClearAll && (
              <button
                onClick={onClearAll}
                className="text-xs text-text-muted hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
            {selectedIngredients.map((item) => {
              const ingName = typeof item === 'object' ? item.name : item;
              const ingId = typeof item === 'object' ? item._id : item;

              return (
                <span
                  key={ingId}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/15 text-primary border border-primary/30 text-xs font-semibold animate-fade-in"
                >
                  <span>{ingName}</span>
                  <button
                    onClick={() => onRemoveIngredient(typeof item === 'object' ? item : { _id: item, name: item })}
                    className="hover:text-white transition-colors p-0.5 rounded-full hover:bg-primary/20"
                    aria-label={`Remove ${ingName}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Ingredient Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 py-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-12 skeleton rounded-xl" />
          ))}
        </div>
      ) : filteredIngredients.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-dark-border rounded-2xl text-text-muted text-sm">
          No ingredients found matching "{searchQuery}".
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-80 overflow-y-auto p-1 pr-2">
          {filteredIngredients.map((ing) => {
            const isSelected = selectedIds.has(ing._id);
            return (
              <button
                key={ing._id}
                onClick={() => (isSelected ? onRemoveIngredient(ing) : onSelectIngredient(ing))}
                className={`flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-medium transition-all duration-150 border ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-glow-green scale-[1.02]'
                    : 'bg-dark-surface/90 hover:bg-dark-hover border-dark-border text-text-primary hover:border-text-muted/40'
                }`}
              >
                <span className="truncate pr-1 font-semibold">{ing.name}</span>
                <span
                  className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-dark-border/60 text-text-muted'
                  }`}
                >
                  {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : <Plus className="w-3 h-3" />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IngredientPicker;
