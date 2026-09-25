import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Refrigerator,
  Plus,
  Trash2,
  Sparkles,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Search,
  PackageCheck,
  RefreshCw,
  Clock,
  Layers,
  ChefHat,
  UtensilsCrossed,
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { ingredientService } from '../services/ingredientService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const InventoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, warning, error: toastError } = useToast();

  const [inventoryItems, setInventoryItems] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');

  // Add Item Modal State
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [customName, setCustomName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [expiryDate, setExpiryDate] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchPantryData();
  }, []);

  const fetchPantryData = async () => {
    try {
      setLoading(true);
      const [invData, ingData] = await Promise.all([
        inventoryService.getInventory(),
        ingredientService.getIngredients({ limit: 300 }),
      ]);
      const list = invData.inventory || invData.items || (Array.isArray(invData) ? invData : []);
      setInventoryItems(list);
      const allIngs = ingData.ingredients || (Array.isArray(ingData) ? ingData : []);
      setAvailableIngredients(allIngs);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      toastError('Failed to load your kitchen pantry');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedIngredientId && !customName.trim()) {
      warning('Please choose an ingredient');
      return;
    }

    setAdding(true);
    try {
      await inventoryService.addInventoryItem({
        ingredientId: selectedIngredientId || undefined,
        quantity: Number(quantity) || 1,
        unit: unit || 'pcs',
        expiryDate: expiryDate || undefined,
      });

      success('Ingredient added to your kitchen! 🍏');
      setShowAddForm(false);
      setSelectedIngredientId('');
      setCustomName('');
      setQuantity(1);
      setExpiryDate('');
      fetchPantryData();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to add item');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await inventoryService.deleteInventoryItem(id);
      setInventoryItems((prev) => prev.filter((i) => i._id !== id));
      success('Item removed from pantry');
    } catch (err) {
      toastError('Failed to remove item');
    }
  };

  const handleUpdateQuantity = async (item, delta) => {
    const newQty = Math.max(0, (item.quantity || 1) + delta);
    if (newQty === 0) {
      handleDeleteItem(item._id);
      return;
    }

    try {
      await inventoryService.updateInventoryItem(item._id, { quantity: newQty });
      setInventoryItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, quantity: newQty } : i))
      );
    } catch (err) {
      toastError('Failed to update quantity');
    }
  };

  const handleLaunchMatcherWithPantry = () => {
    const names = inventoryItems
      .map((item) => item.ingredientId?.name || item.ingredient?.name || item.customName)
      .filter(Boolean);

    if (names.length === 0) {
      warning('Your pantry is empty! Add ingredients first.');
      return;
    }

    navigate('/matcher', { state: { initialIngredients: names } });
  };

  // Expiry status checker
  const getExpiryStatus = (dateStr) => {
    if (!dateStr) return null;
    const exp = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Expired', color: 'bg-accent/20 text-accent border border-accent/40', icon: AlertTriangle };
    }
    if (diffDays <= 3) {
      return { label: `Use Soon (${diffDays}d left)`, color: 'bg-warm/20 text-warm border border-warm/40', icon: Clock };
    }
    return { label: `Fresh (${diffDays}d left)`, color: 'bg-sage/20 text-sage-300 border border-sage/40', icon: CheckCircle2 };
  };

  const categories = ['All', 'Protein', 'Dairy', 'Vegetables', 'Grains', 'Spices', 'Fruits', 'Pantry'];

  const filteredItems = inventoryItems.filter((item) => {
    const ingObj = item.ingredientId || item.ingredient || {};
    const ingName = ingObj.name || item.customName || '';
    const cat = ingObj.category || 'Pantry';
    const matchesCat = activeCategory === 'All' || cat.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = ingName.toLowerCase().includes(searchFilter.toLowerCase().trim());
    return matchesCat && matchesSearch;
  });

  // Expiring soon items count
  const expiringSoonCount = inventoryItems.filter((item) => {
    if (!item.expiryDate) return false;
    const exp = new Date(item.expiryDate);
    const today = new Date();
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Top Banner & Welcome */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-primary-900/40 via-dark-card to-dark-surface border-sage/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/15 text-sage-300 text-xs font-bold uppercase tracking-widest border border-sage/30">
              <Refrigerator className="w-3.5 h-3.5 text-sage-400" />
              <span>Digital Kitchen Shelf</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black text-white">
              Good day, {user?.name || 'Chef'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Track ingredients in your fridge and pantry. Keep stock fresh, eliminate food waste, and simmer recipes instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-glow-green"
            >
              <Plus className="w-4 h-4" />
              <span>Add Ingredient</span>
            </button>

            <button
              onClick={handleLaunchMatcherWithPantry}
              disabled={inventoryItems.length === 0}
              className="btn-secondary text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-warm" />
              <span>Match From Pantry ({inventoryItems.length})</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Badges */}
        <div className="mt-6 pt-4 border-t border-dark-border/60 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-dark-surface/80 rounded-xl border border-dark-border flex items-center gap-3">
            <PackageCheck className="w-5 h-5 text-sage-400" />
            <div>
              <span className="text-[10px] text-text-muted uppercase font-bold block">Pantry Items</span>
              <span className="text-sm font-bold text-white">{inventoryItems.length} stocked</span>
            </div>
          </div>

          <div className="p-3 bg-dark-surface/80 rounded-xl border border-dark-border flex items-center gap-3">
            <Clock className="w-5 h-5 text-warm" />
            <div>
              <span className="text-[10px] text-text-muted uppercase font-bold block">Use Soon</span>
              <span className="text-sm font-bold text-white">{expiringSoonCount} expiring soon</span>
            </div>
          </div>

          <div className="p-3 bg-dark-surface/80 rounded-xl border border-dark-border flex items-center gap-3 col-span-2 sm:col-span-1">
            <UtensilsCrossed className="w-5 h-5 text-accent" />
            <div>
              <span className="text-[10px] text-text-muted uppercase font-bold block">Pantry Value</span>
              <span className="text-sm font-bold text-white">100% Cookable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="card max-w-lg w-full p-6 bg-dark-card border-dark-border relative shadow-2xl animate-slide-up text-left">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-sage-400" /> Add Item to Pantry Shelf
            </h3>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="input-label">Select from Catalog</label>
                <select
                  value={selectedIngredientId}
                  onChange={(e) => {
                    setSelectedIngredientId(e.target.value);
                    if (e.target.value) setCustomName('');
                  }}
                  className="select text-xs"
                >
                  <option value="">-- Choose from standard ingredients --</option>
                  {availableIngredients.map((ing) => (
                    <option key={ing._id} value={ing._id}>
                      {ing.name} ({ing.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Or Custom Name</label>
                <input
                  type="text"
                  placeholder="e.g., Organic Greek yogurt"
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value);
                    if (e.target.value) setSelectedIngredientId('');
                  }}
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Quantity</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="input-label">Unit</label>
                  <input
                    type="text"
                    placeholder="pcs, grams, cups, tbsp"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Estimated Expiry Date (optional)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="btn-primary text-xs font-semibold shadow-glow-green"
                >
                  {adding ? 'Adding...' : 'Save to Pantry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-glow-green'
                  : 'bg-dark-surface text-text-secondary hover:text-white border border-dark-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search pantry items..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="input !pl-9 !py-2 text-xs"
          />
        </div>
      </div>

      {/* Inventory Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 skeleton rounded-2xl" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card p-12 text-center bg-dark-card border-dark-border space-y-4 max-w-lg mx-auto">
          <Refrigerator className="w-12 h-12 text-text-muted mx-auto" />
          <h3 className="text-base font-bold text-white">No Pantry Items Found</h3>
          <p className="text-xs text-text-secondary">
            {searchFilter
              ? `No ingredients matched "${searchFilter}".`
              : 'Your pantry is currently empty. Start adding ingredients to discover custom recipes!'}
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary text-xs !py-2 !px-4 shadow-glow-green"
          >
            + Add First Ingredient
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const ingObj = item.ingredientId || item.ingredient || {};
            const ingName = ingObj.name || item.customName || 'Ingredient';
            const expStatus = getExpiryStatus(item.expiryDate);

            return (
              <div
                key={item._id}
                className="card p-4 bg-dark-card hover:border-sage/40 border-dark-border transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-sage-300 transition-colors">
                      {ingName}
                    </h3>
                    <span className="text-[11px] text-text-muted">
                      {ingObj.category || 'Pantry'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="text-text-muted hover:text-accent p-1 opacity-60 hover:opacity-100 transition-opacity"
                    title="Remove from pantry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Expiry Status */}
                {expStatus && (
                  <div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 w-max ${expStatus.color}`}>
                      <expStatus.icon className="w-3 h-3" />
                      {expStatus.label}
                    </span>
                  </div>
                )}

                {/* Quantity Controls */}
                <div className="pt-2 border-t border-dark-border/60 flex items-center justify-between text-xs">
                  <span className="text-text-muted">Stock:</span>
                  <div className="flex items-center gap-2 bg-dark-surface px-2 py-1 rounded-lg border border-dark-border">
                    <button
                      onClick={() => handleUpdateQuantity(item, -1)}
                      className="w-4 h-4 rounded bg-dark-card flex items-center justify-center font-bold text-xs hover:bg-accent hover:text-white"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-white">
                      {item.quantity} {item.unit || 'unit'}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item, 1)}
                      className="w-4 h-4 rounded bg-dark-card flex items-center justify-center font-bold text-xs hover:bg-primary hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
