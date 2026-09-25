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
} from 'lucide-react';
import { groceryService } from '../services/groceryService';
import { useToast } from '../context/ToastContext';

export const GroceryListPage = () => {
  const { success, error: toastError } = useToast();
  const [groceryItems, setGroceryItems] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [editType, setEditType] = useState('Ingredient');
  const [savingEdit, setSavingEdit] = useState(false);

  const categories = ['All', 'Produce', 'Dairy', 'Protein', 'Pantry', 'Grains', 'Spices', 'Other'];

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

  const handleTogglePurchased = async (item) => {
    if (!item || !item._id) return;
    const nextPurchased = !item.purchased;
    try {
      await groceryService.updateGroceryItem(item._id, { purchased: nextPurchased });
      setGroceryItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, purchased: nextPurchased } : i))
      );
    } catch (err) {
      toastError('Failed to update item');
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
      success('Cleared all completed items! 🧹');
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
      success(`Added "${name.trim()}" to shopping list!`);
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
    e.stopPropagation();
    setEditingItem(item);
    setEditName(item.name || item.ingredientId?.name || '');
    setEditQuantity(String(item.amount || item.quantity || '1'));
    setEditUnit(item.unit || item.ingredientId?.unit || '');
    setEditCategory(item.category || item.ingredientId?.category || 'Produce');
    setEditType(item.type || 'Ingredient');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem || !editingItem._id) return;

    setSavingEdit(true);
    try {
      const updatedPayload = {
        name: editName.trim() || editingItem.name,
        amount: String(editQuantity).trim() || '1',
        quantity: String(editQuantity).trim() || '1',
        unit: editUnit.trim(),
        category: editCategory,
        type: editType,
      };

      const res = await groceryService.updateGroceryItem(editingItem._id, updatedPayload);
      success('Item updated successfully!');
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

  // Safe category & search filtering
  const filteredItems = groceryItems.filter((item) => {
    const itemName = (item.name || item.ingredientId?.name || item.ingredient?.name || '').toLowerCase();
    const itemCat = (item.category || item.ingredientId?.category || item.ingredient?.category || 'Other').toLowerCase();
    
    const matchesSearch = !searchQuery.trim() || itemName.includes(searchQuery.trim().toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' ||
      itemCat === selectedCategory.toLowerCase() ||
      (selectedCategory === 'Other' && !['produce', 'dairy', 'protein', 'pantry', 'grains', 'spices'].includes(itemCat));

    return matchesSearch && matchesCategory;
  });

  // Group filtered items by category with safe fallbacks
  const groupedItems = filteredItems.reduce((acc, item) => {
    let cat = (item.category || item.ingredientId?.category || item.ingredient?.category || 'Other').trim();
    if (!cat) cat = 'Other';
    // Capitalize first letter
    const formattedCat = cat.charAt(0).toUpperCase() + cat.slice(1);
    if (!acc[formattedCat]) acc[formattedCat] = [];
    acc[formattedCat].push(item);
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
          <span className="text-sm font-semibold">Loading grocery list...</span>
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
        <h3 className="text-lg font-bold text-white">Unable to load your grocery list</h3>
        <p className="text-xs text-text-secondary">Please try again.</p>
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
      {/* Header Banner */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-primary-900/40 via-dark-card to-dark-surface border-sage/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/15 text-sage-300 text-xs font-bold uppercase tracking-widest border border-sage/30">
              <ShoppingCart className="w-3.5 h-3.5 text-sage-400" />
              <span>Smart Shopping Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black text-white">
              My Grocery Shopping Checklist
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Check off ingredients while at the market aisle by aisle. Items generated from missing recipe ingredients sync here automatically with exact amounts preserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-glow-green"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Item</span>
            </button>
            {purchasedCount > 0 && (
              <button
                onClick={handleClearPurchased}
                className="btn-outline text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Checked ({purchasedCount})</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl text-text-secondary hover:text-white hover:bg-dark-hover border border-dark-border transition-colors"
              title="Print Shopping List"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="mt-6 pt-6 border-t border-dark-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
              <span>Shopping Progress</span>
              <span className="text-sage-300 font-bold">
                {purchasedCount} of {totalCount} items bought ({Math.round(progressPercent)}%)
              </span>
            </div>
            <div className="w-full bg-dark-surface h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-sage to-primary h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search shopping list (e.g. Tomato)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input !pl-10 text-xs w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-glow-green'
                  : 'bg-dark-surface text-text-muted hover:text-white border border-dark-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Add Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="card max-w-md w-full p-6 bg-dark-card border-dark-border relative shadow-2xl animate-slide-up text-left">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-sage-400" /> Add Item to Shopping Checklist
            </h3>

            <form onSubmit={handleManualAdd} className="space-y-4">
              <div>
                <label className="input-label">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Tomato, Cheese, Olive Oil"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Quantity / Amount</label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 2, 100g, 1 cup"
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="input-label">Unit (optional)</label>
                  <input
                    type="text"
                    placeholder="pcs, g, ml, tbsp"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Aisle / Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="select text-xs"
                  >
                    <option value="Produce">Produce</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Protein">Protein</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Grains">Grains</option>
                    <option value="Spices">Spices</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Food Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="select text-xs"
                  >
                    <option value="Ingredient">Ingredient</option>
                    <option value="Staple">Staple</option>
                    <option value="Fresh Food">Fresh Food</option>
                    <option value="Packaged Food">Packaged Food</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
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
                  {adding ? 'Adding...' : 'Add to List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="card max-w-md w-full p-6 bg-dark-card border-dark-border relative shadow-2xl animate-slide-up text-left">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-sage-400" /> Edit Grocery Item
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="input-label">Item Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Quantity / Amount</label>
                  <input
                    type="text"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="input-label">Unit</label>
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Aisle / Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="select text-xs"
                  >
                    <option value="Produce">Produce</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Protein">Protein</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Grains">Grains</option>
                    <option value="Spices">Spices</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Food Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="select text-xs"
                  >
                    <option value="Ingredient">Ingredient</option>
                    <option value="Staple">Staple</option>
                    <option value="Fresh Food">Fresh Food</option>
                    <option value="Packaged Food">Packaged Food</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
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
                  className="btn-primary text-xs font-semibold shadow-glow-green"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categorized List */}
      {totalCount === 0 ? (
        <div className="card p-12 text-center bg-dark-card border-dark-border space-y-4 max-w-lg mx-auto">
          <ShoppingCart className="w-12 h-12 text-text-muted mx-auto" />
          <h3 className="text-base font-bold text-white">Your Shopping List is Empty</h3>
          <p className="text-xs text-text-secondary">
            Match recipes to add missing ingredients with 1 click, or add custom grocery items above.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary text-xs !py-2 !px-4 shadow-glow-green"
          >
            + Add First Grocery Item
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card p-12 text-center bg-dark-card border-dark-border space-y-4 max-w-lg mx-auto">
          <Search className="w-12 h-12 text-text-muted mx-auto" />
          <h3 className="text-base font-bold text-white">No Matching Items Found</h3>
          <p className="text-xs text-text-secondary">
            No grocery items match "{searchQuery}" in category "{selectedCategory}".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="btn-outline text-xs !py-2 !px-4"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {Object.entries(groupedItems).map(([catName, items]) => (
            <div key={catName} className="card p-6 bg-dark-card border-dark-border space-y-4">
              <div className="flex items-center justify-between border-b border-dark-border pb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sage-400" /> {catName}
                </h3>
                <span className="text-xs text-text-muted">
                  {items.filter((i) => i.purchased).length}/{items.length} completed
                </span>
              </div>

              <div className="space-y-2">
                {items.map((item) => {
                  const displayAmount = item.amount || item.quantity || '1';
                  const displayUnit = item.unit || item.ingredientId?.unit || '';
                  const displayName = item.name || item.ingredientId?.name || item.ingredient?.name || 'Item';
                  const displayType = item.type || 'Ingredient';

                  return (
                    <div
                      key={item._id}
                      onClick={() => handleTogglePurchased(item)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        item.purchased
                          ? 'bg-dark-surface/40 border-dark-border/40 opacity-50 line-through text-text-muted'
                          : 'bg-dark-surface border-dark-border text-white hover:border-sage/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.purchased ? (
                          <CheckCircle2 className="w-4 h-4 text-sage-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-text-muted flex-shrink-0" />
                        )}
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm font-semibold">
                            {displayName}
                          </span>
                          {item.addedFromRecipe && (
                            <span className="text-[10px] text-text-muted">
                              from: {item.addedFromRecipe}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="font-mono text-xs text-sage-300 bg-sage/15 px-2 py-0.5 rounded-md border border-sage/30">
                          {displayAmount} {displayUnit}
                        </span>
                        <button
                          onClick={(e) => handleStartEdit(item, e)}
                          className="text-text-muted hover:text-white p-1 rounded-lg hover:bg-dark-card transition-colors"
                          title="Edit quantity / item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="text-text-muted hover:text-accent p-1 rounded-lg hover:bg-dark-card transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroceryListPage;
