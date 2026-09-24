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
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { ingredientService } from '../services/ingredientService';
import { useToast } from '../context/ToastContext';

export const InventoryPage = () => {
  const navigate = useNavigate();
  const { success, warning, error: toastError } = useToast();

  const [inventoryItems, setInventoryItems] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');

  // Add Item Modal / Inline Form State
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
      setInventoryItems(invData.items || invData || []);
      setAvailableIngredients(ingData.ingredients || ingData || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      toastError('Failed to load your pantry');
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
        customName: !selectedIngredientId ? customName : undefined,
        quantity: Number(quantity) || 1,
        unit: unit || 'pcs',
        expiryDate: expiryDate || undefined,
      });

      success('Ingredient added to your pantry! 🍏');
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
      .map((item) => item.ingredient?.name || item.customName)
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
      return { label: 'Expired', color: 'badge-red', icon: AlertTriangle };
    }
    if (diffDays <= 3) {
      return { label: `Expires in ${diffDays}d`, color: 'badge-orange', icon: AlertTriangle };
    }
    return { label: `Fresh (${diffDays}d left)`, color: 'badge-green', icon: CheckCircle2 };
  };

  const categories = ['All', 'Produce', 'Dairy', 'Meat', 'Pantry', 'Grains & Pasta', 'Herbs & Spices', 'Condiments'];

  const filteredItems = inventoryItems.filter((item) => {
    const ingName = item.ingredient?.name || item.customName || '';
    const cat = item.ingredient?.category || 'Pantry';
    const matchesCat = activeCategory === 'All' || cat === activeCategory;
    const matchesSearch = ingName.toLowerCase().includes(searchFilter.toLowerCase().trim());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="container-page py-8 space-y-8">
      {/* Top Banner */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-primary-900/40 via-dark-card to-dark-surface border-primary/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">
              <Refrigerator className="w-3.5 h-3.5" />
              <span>Zero-Waste Smart Pantry</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black text-white">
              My Kitchen Pantry & Fridge
            </h1>
            <p className="text-sm text-text-secondary max-w-xl">
              Keep track of what ingredients you currently have on hand. Never let food expire and cook with what you already bought!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary flex items-center gap-2 shadow-glow-green"
            >
              <Plus className="w-4 h-4" />
              <span>Add Ingredient</span>
            </button>

            <button
              onClick={handleLaunchMatcherWithPantry}
              disabled={inventoryItems.length === 0}
              className="btn btn-secondary flex items-center gap-2 shadow-glow-orange"
            >
              <Sparkles className="w-4 h-4" />
              <span>Find Matching Recipes ({inventoryItems.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="card max-w-lg w-full p-6 bg-dark-card border-dark-border relative shadow-2xl animate-slide-up">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Add Item to Pantry
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
                  className="input text-xs"
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
                  placeholder="e.g. Grandma's special paprika"
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
                  className="btn btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="btn btn-primary text-xs shadow-glow-green"
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
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-glow-green font-semibold'
                  : 'bg-dark-surface text-text-secondary hover:text-white border border-dark-border/60'
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
            className="btn btn-primary text-xs !py-2 !px-4 shadow-glow-green"
          >
            + Add First Ingredient
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const ingName = item.ingredient?.name || item.customName;
            const expStatus = getExpiryStatus(item.expiryDate);

            return (
              <div
                key={item._id}
                className="card p-4 bg-dark-card hover:border-primary/40 border-dark-border transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                      {ingName}
                    </h3>
                    <span className="text-[11px] text-text-muted">
                      {item.ingredient?.category || 'Pantry'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="text-text-muted hover:text-red-400 p-1 opacity-60 hover:opacity-100 transition-opacity"
                    title="Remove from pantry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Expiry Badge */}
                {expStatus && (
                  <div>
                    <span className={`badge ${expStatus.color} text-[10px]`}>
                      <expStatus.icon className="w-3 h-3" />
                      {expStatus.label}
                    </span>
                  </div>
                )}

                {/* Quantity Controls */}
                <div className="pt-2 border-t border-dark-border/60 flex items-center justify-between text-xs">
                  <span className="text-text-muted">Stock:</span>
                  <div className="flex items-center gap-2 bg-dark-surface px-2 py-1 rounded-lg border border-dark-border/60">
                    <button
                      onClick={() => handleUpdateQuantity(item, -1)}
                      className="w-4 h-4 rounded bg-dark-border flex items-center justify-center font-bold text-xs hover:bg-red-500 hover:text-white"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-white">
                      {item.quantity} {item.unit || 'unit'}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item, 1)}
                      className="w-4 h-4 rounded bg-dark-border flex items-center justify-center font-bold text-xs hover:bg-primary hover:text-white"
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
