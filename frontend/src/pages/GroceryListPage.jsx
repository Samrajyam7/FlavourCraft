import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  Printer,
  Sparkles,
  Layers,
  RotateCcw,
  Search,
  Edit2,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Refrigerator,
  Package,
  Calendar,
} from 'lucide-react';
import { groceryService } from '../services/groceryService';
import { useToast } from '../context/ToastContext';

export const GroceryListPage = () => {
  const { success, error: toastError, info } = useToast();
  const [groceryItems, setGroceryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Manual Add Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('piece');
  const [category, setCategory] = useState('Produce');
  const [type, setType] = useState('Ingredient');
  const [adding, setAdding] = useState(false);

  // Edit Item Modal/State
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('1');
  const [editUnit, setEditUnit] = useState('');
  const [editCategory, setEditCategory] = useState('Produce');
  const [savingEdit, setSavingEdit] = useState(false);

  const categories = [
    { label: 'All', value: 'All', icon: '🛒' },
    { label: 'Produce', value: 'Produce', icon: '🥬' },
    { label: 'Dairy', value: 'Dairy', icon: '🥛' },
    { label: 'Protein', value: 'Protein', icon: '🥩' },
    { label: 'Grains', value: 'Grains', icon: '🌾' },
    { label: 'Spices', value: 'Spices', icon: '🌶️' },
    { label: 'Pantry', value: 'Pantry', icon: '🥫' },
  ];

  useEffect(() => {
    fetchGroceryList();
  }, []);

  const fetchGroceryList = async () => {
    try {
      setLoading(true);
      setFetchError(false);
      const data = await groceryService.getGroceryList();
      const items = data?.items || data?.list?.items || data?.groceries || (Array.isArray(data) ? data : []);
      setGroceryItems(items);
    } catch (err) {
      console.error('Failed to load grocery list:', err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWeekly = async (regenerate = false) => {
    setGenerating(true);
    try {
      const res = await groceryService.generateWeeklyGrocery(regenerate);
      const items = res?.items || res?.list?.items || [];
      setGroceryItems(items);
      success(
        res.message ||
          (regenerate
            ? 'Regenerated grocery list with current pantry subtractions! 🔄'
            : 'Generated weekly grocery list from your planned meals! 🛒')
      );
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to generate weekly grocery list');
    } finally {
      setGenerating(false);
    }
  };

  const handleTogglePurchased = async (item) => {
    if (!item || !item._id) return;
    const nextPurchased = !item.purchased;
    try {
      await groceryService.updateGroceryItem(item._id, { purchased: nextPurchased });
      setGroceryItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, purchased: nextPurchased } : i))
      );
    } catch (err) {
      toastError('Failed to update item status');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!id) return;
    try {
      await groceryService.deleteGroceryItem(id);
      setGroceryItems((prev) => prev.filter((i) => i._id !== id));
      success('Item removed from grocery list');
    } catch (err) {
      toastError('Failed to remove item');
    }
  };

  const handleClearPurchased = async () => {
    try {
      await groceryService.clearPurchased();
      setGroceryItems((prev) => prev.filter((i) => !i.purchased));
      success('Cleared all purchased items! 🧹');
    } catch (err) {
      toastError('Failed to clear purchased items');
    }
  };

  const handleManualAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setAdding(true);
    try {
      const res = await groceryService.addGroceryItem({
        name: name.trim(),
        amount: String(quantity).trim() || '1',
        quantity: String(quantity).trim() || '1',
        unit: unit.trim() || 'piece',
        category: category || 'Produce',
        type: type || 'Ingredient',
        purchased: false,
      });
      success(`Added "${name.trim()}" to grocery list!`);
      setName('');
      setQuantity('1');
      setUnit('piece');
      setShowAddForm(false);

      const updatedItems = res?.items || res?.list?.items || res?.groceries;
      if (updatedItems) {
        setGroceryItems(updatedItems);
      } else {
        fetchGroceryList();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to add item');
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (item, e) => {
    if (e) e.stopPropagation();
    setEditingItem(item);
    setEditName(item.name || item.ingredientId?.name || '');
    setEditQuantity(String(item.buyQuantity !== undefined && item.buyQuantity !== null ? item.buyQuantity : (item.quantity || item.amount || '1')));
    setEditUnit(item.unit || item.ingredientId?.unit || 'piece');
    setEditCategory(item.category || item.ingredientId?.category || 'Produce');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem || !editingItem._id) return;

    setSavingEdit(true);
    try {
      const numQty = parseFloat(editQuantity) || 1;
      const updatedPayload = {
        name: editName.trim() || editingItem.name,
        amount: String(editQuantity).trim() || '1',
        quantity: String(editQuantity).trim() || '1',
        buyQuantity: numQty,
        unit: editUnit.trim(),
        category: editCategory,
      };

      const res = await groceryService.updateGroceryItem(editingItem._id, updatedPayload);
      success('Grocery item updated successfully!');
      setEditingItem(null);

      const updatedItems = res?.items || res?.list?.items;
      if (updatedItems) {
        setGroceryItems(updatedItems);
      } else {
        setGroceryItems((prev) =>
          prev.map((i) => (i._id === editingItem._id ? { ...i, ...updatedPayload } : i))
        );
      }
    } catch (err) {
      toastError('Failed to update grocery item');
    } finally {
      setSavingEdit(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter items
  const filteredItems = groceryItems.filter((item) => {
    const itemName = (item.name || item.ingredientId?.name || '').toLowerCase();
    const itemCat = (item.category || item.ingredientId?.category || 'Pantry').toLowerCase();
    const matchesSearch = !searchQuery.trim() || itemName.includes(searchQuery.trim().toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' ||
      itemCat === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    let cat = (item.category || item.ingredientId?.category || 'Pantry').trim();
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const totalCount = groceryItems.length;
  const purchasedCount = groceryItems.filter((i) => i.purchased).length;
  const progressPercent = totalCount > 0 ? (purchasedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-4">
        <div className="flex items-center justify-center gap-3 text-sage-300">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-sm font-semibold">Loading your smart grocery list...</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-950/40 text-warm flex items-center justify-center mx-auto border border-warm/30">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">Unable to generate grocery list</h3>
        <p className="text-xs text-text-secondary">Please check your connection and try again.</p>
        <button
          onClick={fetchGroceryList}
          className="btn-primary text-xs !py-2 !px-4 shadow-glow-green"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Editorial Header Banner */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-primary-950/40 via-dark-card to-dark-surface border-sage/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/15 text-sage-300 text-xs font-bold uppercase tracking-widest border border-sage/30">
              <ShoppingCart className="w-3.5 h-3.5 text-sage-400" />
              <span>Pantry-Optimized Grocery Checklist</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black text-white">
              My Smart Grocery List
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Categorized by supermarket aisles with automatic pantry quantity deductions. Ingredients you already have in stock are deducted so you only buy what you need.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleGenerateWeekly(false)}
              disabled={generating}
              className="btn-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-glow-green"
            >
              {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
              <span>🛒 Generate Weekly Grocery List</span>
            </button>
            <button
              onClick={() => handleGenerateWeekly(true)}
              disabled={generating}
              className="btn-secondary text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sage-400 ${generating ? 'animate-spin' : ''}`} />
              <span>🔄 Regenerate List</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-outline text-xs !py-2.5 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Item</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl text-text-secondary hover:text-white hover:bg-dark-hover border border-dark-border transition-colors"
              title="Print Shopping List"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Summary Stats */}
        {totalCount > 0 && (
          <div className="mt-6 pt-6 border-t border-dark-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
              <span>Shopping Progress</span>
              <span className="text-sage-300 font-bold">
                {purchasedCount} of {totalCount} items completed ({Math.round(progressPercent)}%)
              </span>
            </div>
            <div className="w-full bg-dark-surface h-2 rounded-full overflow-hidden border border-dark-border">
              <div
                className="bg-gradient-to-r from-primary-dark via-primary to-primary-light h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Category Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-xs">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 text-xs ${
                selectedCategory === cat.value
                  ? 'bg-primary text-white shadow-glow-green'
                  : 'bg-dark-card text-text-secondary hover:text-white border border-dark-border hover:bg-dark-hover'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input !pl-9 !py-2 text-xs"
          />
        </div>
      </div>

      {/* Grocery Items Section */}
      {filteredItems.length === 0 ? (
        <div className="card p-12 text-center bg-dark-card border-dark-border space-y-4">
          <ShoppingCart className="w-12 h-12 text-text-muted mx-auto" />
          <h3 className="text-lg font-bold text-white">No Grocery Items</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            {searchQuery
              ? `No items match "${searchQuery}".`
              : 'Your grocery checklist is empty. Plan meals in the Meal Planner and generate your weekly list or add custom items!'}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => handleGenerateWeekly(false)}
              className="btn-primary text-xs !py-2 !px-4 shadow-glow-green"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Generate from Meal Plan</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-outline text-xs !py-2 !px-4"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Item</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([catName, items]) => {
            const catIcons = {
              Produce: '🥬',
              Dairy: '🥛',
              Protein: '🥩',
              Grains: '🌾',
              Spices: '🌶️',
              Pantry: '🥫',
            };
            const icon = catIcons[catName] || '🛒';

            return (
              <div key={catName} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-dark-border/60 pb-2">
                  <span className="text-lg">{icon}</span>
                  <span>{catName}</span>
                  <span className="text-xs text-text-muted font-normal">({items.length} items)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((item) => {
                    const isBought = Boolean(item.purchased);
                    const req = item.requiredQuantity;
                    const avail = item.availableQuantity;
                    const buy = item.buyQuantity !== undefined && item.buyQuantity !== null ? item.buyQuantity : item.quantity;

                    return (
                      <div
                        key={item._id}
                        className={`card p-4 border transition-all text-xs flex flex-col justify-between gap-3 ${
                          isBought
                            ? 'bg-dark-card/50 border-dark-border/50 opacity-75'
                            : 'bg-dark-card border-dark-border hover:border-sage/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleTogglePurchased(item)}
                              className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                isBought
                                  ? 'bg-primary border-primary text-white shadow-glow-green'
                                  : 'bg-dark-surface border-dark-border hover:border-primary text-transparent'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>

                            <div>
                              <span
                                className={`font-bold text-sm block leading-snug ${
                                  isBought ? 'line-through text-text-muted' : 'text-white'
                                }`}
                              >
                                {item.name || item.ingredientId?.name || 'Ingredient'}
                              </span>
                              <span className="text-[10px] text-text-muted font-semibold uppercase">
                                {item.category || 'Pantry'}
                              </span>
                            </div>
                          </div>

                          {/* Buy Badge */}
                          <div className="text-right">
                            <span className="font-mono text-xs font-bold text-sage-300 bg-sage/15 px-2.5 py-1 rounded-lg border border-sage/30 block">
                              Buy: {buy} {item.unit || 'pcs'}
                            </span>
                          </div>
                        </div>

                        {/* Optimization Breakdown: Required vs Available vs Buy */}
                        {(req !== undefined && req !== null) || (avail !== undefined && avail !== null) ? (
                          <div className="grid grid-cols-3 gap-1 bg-dark-surface/90 p-2 rounded-xl border border-dark-border text-[10px] text-center font-mono">
                            <div>
                              <span className="text-text-muted block text-[9px] uppercase">Required</span>
                              <span className="font-bold text-text-secondary">{req ?? buy}</span>
                            </div>
                            <div>
                              <span className="text-text-muted block text-[9px] uppercase">In Pantry</span>
                              <span className="font-bold text-emerald-400">{avail ?? 0}</span>
                            </div>
                            <div>
                              <span className="text-text-muted block text-[9px] uppercase">To Buy</span>
                              <span className="font-bold text-warm">{buy}</span>
                            </div>
                          </div>
                        ) : null}

                        {item.addedFromRecipe && (
                          <span className="text-[10px] text-text-muted italic line-clamp-1">
                            From: {item.addedFromRecipe}
                          </span>
                        )}

                        {/* Item Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-dark-border/60">
                          <span className="text-[10px] text-text-muted">
                            {isBought ? '✅ Marked as purchased' : 'Pending market purchase'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => handleStartEdit(item, e)}
                              title="Edit item quantity"
                              className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-dark-hover"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              title="Remove item"
                              className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-dark-hover"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Add Custom Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 bg-dark-card border-dark-border space-y-4 text-left animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-sage-400" />
                <span>Add Custom Grocery Item</span>
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1.5 text-text-muted hover:text-white rounded-lg hover:bg-dark-hover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-4 text-xs">
              <div>
                <label className="input-label">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Fresh Basil Leaves"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Quantity</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="select"
                  >
                    <option value="piece">piece(s)</option>
                    <option value="gram">grams (g)</option>
                    <option value="kg">kilograms (kg)</option>
                    <option value="ml">milliliters (ml)</option>
                    <option value="L">liters (L)</option>
                    <option value="cup">cup(s)</option>
                    <option value="tbsp">tablespoon(s)</option>
                    <option value="tsp">teaspoon(s)</option>
                    <option value="bunch">bunch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="select"
                >
                  <option value="Produce">🥬 Produce</option>
                  <option value="Dairy">🥛 Dairy</option>
                  <option value="Protein">🥩 Protein</option>
                  <option value="Grains">🌾 Grains</option>
                  <option value="Spices">🌶️ Spices</option>
                  <option value="Pantry">🥫 Pantry</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-dark-border">
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
                  className="btn-primary text-xs font-bold uppercase tracking-wider"
                >
                  {adding ? 'Adding...' : 'Add to List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 bg-dark-card border-dark-border space-y-4 text-left animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-sage-400" />
                <span>Edit Grocery Item</span>
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 text-text-muted hover:text-white rounded-lg hover:bg-dark-hover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="input-label">Item Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Purchase Quantity (Buy)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Unit</label>
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="select"
                  >
                    <option value="piece">piece(s)</option>
                    <option value="gram">grams (g)</option>
                    <option value="kg">kilograms (kg)</option>
                    <option value="ml">milliliters (ml)</option>
                    <option value="L">liters (L)</option>
                    <option value="cup">cup(s)</option>
                    <option value="tbsp">tablespoon(s)</option>
                    <option value="tsp">teaspoon(s)</option>
                    <option value="bunch">bunch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="select"
                >
                  <option value="Produce">🥬 Produce</option>
                  <option value="Dairy">🥛 Dairy</option>
                  <option value="Protein">🥩 Protein</option>
                  <option value="Grains">🌾 Grains</option>
                  <option value="Spices">🌶️ Spices</option>
                  <option value="Pantry">🥫 Pantry</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-dark-border">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="btn-primary text-xs font-bold uppercase tracking-wider"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroceryListPage;
