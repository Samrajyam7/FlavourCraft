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
} from 'lucide-react';
import { groceryService } from '../services/groceryService';
import { useToast } from '../context/ToastContext';

export const GroceryListPage = () => {
  const { success, error: toastError } = useToast();
  const [groceryItems, setGroceryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual Add Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('unit');
  const [category, setCategory] = useState('Produce');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchGroceryList();
  }, []);

  const fetchGroceryList = async () => {
    try {
      setLoading(true);
      const data = await groceryService.getGroceryList();
      setGroceryItems(data.items || data || []);
    } catch (err) {
      console.error('Failed to load grocery list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePurchased = async (item) => {
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
      await groceryService.addGroceryItem({
        name: name.trim(),
        quantity: Number(quantity) || 1,
        unit: unit || 'unit',
        category: category || 'Pantry',
      });
      success(`Added "${name}" to shopping list!`);
      setName('');
      setQuantity(1);
      setShowAddForm(false);
      fetchGroceryList();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to add item');
    } finally {
      setAdding(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Group items by category
  const groupedItems = groceryItems.reduce((acc, item) => {
    const cat = item.category || item.ingredient?.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const totalCount = groceryItems.length;
  const purchasedCount = groceryItems.filter((i) => i.purchased).length;
  const progressPercent = totalCount > 0 ? (purchasedCount / totalCount) * 100 : 0;

  return (
    <div className="container-page py-8 space-y-8">
      {/* Header Banner */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-primary-900/40 via-dark-card to-dark-surface border-primary/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Smart Shopping Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black text-white">
              My Grocery Shopping List
            </h1>
            <p className="text-sm text-text-secondary max-w-xl">
              Check off ingredients while at the supermarket or aisle by aisle. Items generated from missing recipe ingredients appear here automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary flex items-center gap-2 shadow-glow-green"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Item</span>
            </button>
            {purchasedCount > 0 && (
              <button
                onClick={handleClearPurchased}
                className="btn btn-outline text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Checked ({purchasedCount})</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="btn btn-icon btn-ghost border border-dark-border"
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
              <span className="text-primary font-bold">
                {purchasedCount} of {totalCount} items bought ({Math.round(progressPercent)}%)
              </span>
            </div>
            <div className="w-full bg-dark-surface h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Manual Add Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="card max-w-md w-full p-6 bg-dark-card border-dark-border relative shadow-2xl animate-slide-up">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Add Item to Shopping List
            </h3>

            <form onSubmit={handleManualAdd} className="space-y-4">
              <div>
                <label className="input-label">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Greek Yogurt or Extra Virgin Olive Oil"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                    placeholder="pcs, bottle, g"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Aisle / Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input text-xs"
                >
                  <option value="Produce">Produce & Fresh Vegetables</option>
                  <option value="Dairy">Dairy & Eggs</option>
                  <option value="Meat">Meat & Seafood</option>
                  <option value="Pantry">Pantry Staples</option>
                  <option value="Grains & Pasta">Grains & Pasta</option>
                  <option value="Herbs & Spices">Herbs & Spices</option>
                  <option value="Condiments">Condiments & Oils</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
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
                  {adding ? 'Adding...' : 'Add to List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categorized List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-2xl" />
          ))}
        </div>
      ) : totalCount === 0 ? (
        <div className="card p-12 text-center bg-dark-card border-dark-border space-y-4 max-w-lg mx-auto">
          <ShoppingCart className="w-12 h-12 text-text-muted mx-auto" />
          <h3 className="text-base font-bold text-white">Your Shopping List is Empty</h3>
          <p className="text-xs text-text-secondary">
            Match recipes to add missing ingredients with 1 click, or add custom grocery items above.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary text-xs !py-2 !px-4 shadow-glow-green"
          >
            + Add First Grocery Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {Object.entries(groupedItems).map(([catName, items]) => (
            <div key={catName} className="card p-6 bg-dark-card border-dark-border space-y-4">
              <div className="flex items-center justify-between border-b border-dark-border pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" /> {catName}
                </h3>
                <span className="text-xs text-text-muted">
                  {items.filter((i) => i.purchased).length}/{items.length}
                </span>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleTogglePurchased(item)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      item.purchased
                        ? 'bg-dark-surface/40 border-dark-border/40 opacity-50 line-through text-text-muted'
                        : 'bg-dark-surface border-dark-border/80 text-white hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.purchased ? (
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-text-muted flex-shrink-0" />
                      )}
                      <span className="text-xs sm:text-sm font-semibold">
                        {item.name || item.ingredient?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {item.quantity} {item.unit || ''}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="text-text-muted hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroceryListPage;
