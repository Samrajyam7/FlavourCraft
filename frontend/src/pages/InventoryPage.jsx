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
  ShoppingCart,
  Check,
  Edit2,
  X,
  AlertCircle,
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { ingredientService } from '../services/ingredientService';
import { groceryService } from '../services/groceryService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const InventoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, warning, error: toastError, info } = useToast();

  const [inventoryItems, setInventoryItems] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Fresh', 'Expiring Soon', 'Expired', 'Low Stock'
  const [searchFilter, setSearchFilter] = useState('');

  // Add/Edit Item Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [customName, setCustomName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('piece');
  const [category, setCategory] = useState('Produce');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [status, setStatus] = useState('Available');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      const list = invData.inventory || invData.items || invData.pantry || (Array.isArray(invData) ? invData : []);
      setInventoryItems(list);
      setExpiryAlerts(invData.expiryAlerts || list.filter((i) => i.isExpired || i.isExpiringSoon));

      const allIngs = ingData.ingredients || (Array.isArray(ingData) ? ingData : []);
      setAvailableIngredients(allIngs);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      toastError('Failed to load your pantry inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItemId(null);
    setSelectedIngredientId('');
    setCustomName('');
    setQuantity(1);
    setUnit('piece');
    setCategory('Produce');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setExpiryDate('');
    setStatus('Available');
    setNotes('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItemId(item._id);
    setSelectedIngredientId(item.ingredientId?._id || item.ingredientId || '');
    setCustomName(item.ingredientId?.name || '');
    setQuantity(item.quantity || 1);
    setUnit(item.unit || item.ingredientId?.unit || 'piece');
    setCategory(item.ingredientId?.category || 'Produce');
    setPurchaseDate(item.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : '');
    setExpiryDate(item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '');
    setStatus(item.status || 'Available');
    setNotes(item.notes || '');
    setShowAddModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!selectedIngredientId && !customName.trim()) {
      warning('Please choose or enter an ingredient');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItemId) {
        await inventoryService.updateInventoryItem(editingItemId, {
          quantity: Number(quantity) || 1,
          unit: unit || 'piece',
          purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          status,
          notes,
        });
        success('Pantry item updated!');
      } else {
        await inventoryService.addInventoryItem({
          ingredientId: selectedIngredientId || undefined,
          name: customName || undefined,
          quantity: Number(quantity) || 1,
          unit: unit || 'piece',
          category,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
          expiryDate: expiryDate ? new Date(expiryDate) : undefined,
          status,
          notes,
        });
        success('Ingredient added to pantry! 🍏');
      }

      setShowAddModal(false);
      fetchPantryData();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await inventoryService.deleteInventoryItem(id);
      setInventoryItems((prev) => prev.filter((i) => i._id !== id));
      setExpiryAlerts((prev) => prev.filter((i) => i._id !== id));
      success('Item removed from pantry');
    } catch (err) {
      toastError('Failed to delete pantry item');
    }
  };

  const handleMarkAsUsed = async (item) => {
    try {
      await inventoryService.updateInventoryItem(item._id, {
        quantity: 0,
        status: 'Finished',
      });
      success(`Marked ${item.ingredientId?.name || 'item'} as finished!`);
      fetchPantryData();
    } catch (err) {
      toastError('Failed to update status');
    }
  };

  const handleAddReplacementToGrocery = async (item) => {
    try {
      const ingName = item.ingredientId?.name || 'Ingredient';
      await groceryService.addGroceryItem({
        ingredientId: item.ingredientId?._id || item.ingredientId,
        name: ingName,
        quantity: String(item.quantity || 1),
        unit: item.unit || 'piece',
        category: item.ingredientId?.category || 'Produce',
        type: 'Ingredient',
        addedFromRecipe: 'Pantry Replacement',
      });
      success(`Added replacement ${ingName} to your grocery list! 🛒`);
    } catch (err) {
      toastError('Failed to add replacement to grocery list');
    }
  };

  const handleFindRecipes = (item) => {
    const ingName = item.ingredientId?.name;
    if (ingName) {
      navigate('/matcher', { state: { initialIngredients: [ingName] } });
    } else {
      navigate('/matcher');
    }
  };

  // Filter items by search & tab
  const filteredItems = inventoryItems.filter((item) => {
    const ingName = item.ingredientId?.name || '';
    const matchesSearch = ingName.toLowerCase().includes(searchFilter.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'Fresh') return item.freshnessStatus === 'Fresh' && item.status !== 'Finished';
    if (activeTab === 'Expiring Soon') return item.isExpiringSoon && item.status !== 'Finished';
    if (activeTab === 'Expired') return item.isExpired || item.status === 'Expired';
    if (activeTab === 'Low Stock') return item.status === 'Low Stock';
    return true;
  });

  const freshCount = inventoryItems.filter((i) => i.freshnessStatus === 'Fresh' && i.status !== 'Finished').length;
  const expiringCount = inventoryItems.filter((i) => i.isExpiringSoon && i.status !== 'Finished').length;
  const expiredCount = inventoryItems.filter((i) => i.isExpired || i.status === 'Expired').length;
  const lowStockCount = inventoryItems.filter((i) => i.status === 'Low Stock').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Editorial Header Banner */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-primary-950/40 via-dark-card to-dark-surface border-sage/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/15 text-sage-300 text-xs font-bold uppercase tracking-widest border border-sage/30">
              <Refrigerator className="w-3.5 h-3.5 text-sage-400" />
              <span>Smart Kitchen Storage</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black text-white">
              Pantry & Inventory Tracker
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Track stock levels, monitor freshness with automated expiration reminders, and generate recipe recommendations directly from your available ingredients.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="btn-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-glow-green"
            >
              <Plus className="w-4 h-4" />
              <span>Add Ingredient</span>
            </button>
            <Link
              to="/matcher"
              className="btn-outline text-xs !py-2.5 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-warm" />
              <span>Match All in Pantry</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Expiry Alerts Section */}
      {expiryAlerts.length > 0 && (
        <div className="card p-6 bg-dark-card border-warm/40 shadow-glow-accent/10 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-border pb-3">
            <div className="flex items-center gap-2 text-warm font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-warm fill-warm/20" />
              <span>⏰ Ingredient Expiry Reminders ({expiryAlerts.length})</span>
            </div>
            <span className="text-[11px] text-text-muted">Use them up to reduce food waste</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expiryAlerts.map((item) => {
              const ingName = item.ingredientId?.name || 'Ingredient';
              const isExp = item.isExpired || item.status === 'Expired';
              return (
                <div
                  key={item._id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 text-xs ${
                    isExp
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                      : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{item.ingredientId?.icon || '🥫'}</span>
                      <div>
                        <span className="font-bold text-white text-sm block">{ingName}</span>
                        <span className="text-[11px] opacity-80">
                          {item.alertMessage || (isExp ? '🔴 Expired' : '⚠️ Expires soon')}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold bg-dark-bg/60 px-2 py-0.5 rounded border border-white/10">
                      {item.quantity} {item.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => handleFindRecipes(item)}
                      className="btn-primary !py-1 !px-2.5 text-[11px] font-bold flex items-center gap-1 shadow-none"
                    >
                      <ChefHat className="w-3 h-3" />
                      <span>Find Recipes</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAddReplacementToGrocery(item)}
                        title="Add replacement to grocery list"
                        className="p-1.5 rounded-lg bg-dark-surface text-text-secondary hover:text-white hover:bg-dark-hover border border-dark-border"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMarkAsUsed(item)}
                        title="Mark as used / finished"
                        className="p-1.5 rounded-lg bg-dark-surface text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/30"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        title="Remove item"
                        className="p-1.5 rounded-lg bg-dark-surface text-rose-400 hover:bg-rose-950/40 border border-rose-500/30"
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
      )}

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-xs">
          {[
            { label: '📦 All Items', value: 'All', count: inventoryItems.length },
            { label: '🟢 Fresh', value: 'Fresh', count: freshCount },
            { label: '🟠 Expiring Soon', value: 'Expiring Soon', count: expiringCount },
            { label: '🔴 Expired', value: 'Expired', count: expiredCount },
            { label: '⚠️ Low Stock', value: 'Low Stock', count: lowStockCount },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 text-xs ${
                activeTab === tab.value
                  ? 'bg-primary text-white shadow-glow-green'
                  : 'bg-dark-card text-text-secondary hover:text-white border border-dark-border hover:bg-dark-hover'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-dark-surface text-text-muted'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search pantry items..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="input !pl-9 !py-2 text-xs"
          />
        </div>
      </div>

      {/* Pantry Inventory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-44 skeleton rounded-2xl" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card p-12 text-center bg-dark-card border-dark-border space-y-4">
          <Refrigerator className="w-12 h-12 text-text-muted mx-auto" />
          <h3 className="text-lg font-bold text-white">No Pantry Items Found</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            {searchFilter
              ? `No items match "${searchFilter}". Try a different keyword.`
              : activeTab !== 'All'
              ? `No items in "${activeTab}" status right now.`
              : 'Your digital pantry is currently empty. Start adding ingredients you keep in your kitchen!'}
          </p>
          <button onClick={handleOpenAdd} className="btn-primary text-xs !py-2 !px-4">
            <Plus className="w-4 h-4" /> Add Item to Pantry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const ingName = item.ingredientId?.name || 'Ingredient';
            const ingIcon = item.ingredientId?.icon || '🥫';
            const ingCat = item.ingredientId?.category || 'Pantry';

            let badgeClass = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
            if (item.isExpired || item.status === 'Expired') {
              badgeClass = 'bg-rose-950/80 text-rose-300 border-rose-500/40';
            } else if (item.isExpiringSoon) {
              badgeClass = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
            } else if (item.status === 'Low Stock') {
              badgeClass = 'bg-orange-950/80 text-orange-300 border-orange-500/40';
            } else if (item.status === 'Finished') {
              badgeClass = 'bg-stone-900 text-stone-400 border-stone-700';
            }

            return (
              <div
                key={item._id}
                className="card p-4 bg-dark-card border-dark-border hover:border-sage/40 transition-all flex flex-col justify-between gap-3 text-xs group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{ingIcon}</span>
                      <div>
                        <h3 className="font-bold text-white text-sm leading-snug">{ingName}</h3>
                        <span className="text-[10px] text-text-muted uppercase font-semibold">{ingCat}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${badgeClass}`}>
                      {item.isExpired
                        ? 'Expired'
                        : item.isExpiringSoon
                        ? 'Expiring'
                        : item.status}
                    </span>
                  </div>

                  {/* Quantity & Expiry info */}
                  <div className="mt-3 grid grid-cols-2 gap-2 bg-dark-surface/90 p-2.5 rounded-xl border border-dark-border text-[11px]">
                    <div>
                      <span className="text-text-muted block text-[10px]">In Stock</span>
                      <span className="font-mono font-bold text-white">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px]">Expiry</span>
                      <span className="font-mono font-semibold text-text-secondary">
                        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'No expiry'}
                      </span>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-text-muted mt-2 italic line-clamp-1">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-dark-border">
                  <button
                    onClick={() => handleFindRecipes(item)}
                    className="btn-secondary !py-1 !px-2.5 text-[11px] flex items-center gap-1 font-semibold"
                  >
                    <ChefHat className="w-3 h-3 text-sage-400" />
                    <span>Find Recipes</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Edit item"
                      className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-dark-hover"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMarkAsUsed(item)}
                      title="Mark as finished"
                      className="p-1.5 rounded-lg text-text-muted hover:text-emerald-400 hover:bg-dark-hover"
                    >
                      <Check className="w-3.5 h-3.5" />
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
      )}

      {/* Add / Edit Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 bg-dark-card border-dark-border space-y-4 text-left animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Refrigerator className="w-4 h-4 text-sage-400" />
                <span>{editingItemId ? 'Edit Pantry Item' : 'Add Ingredient to Pantry'}</span>
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-text-muted hover:text-white rounded-lg hover:bg-dark-hover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              {/* Ingredient select */}
              <div>
                <label className="input-label">Select Catalog Ingredient</label>
                <select
                  value={selectedIngredientId}
                  onChange={(e) => {
                    setSelectedIngredientId(e.target.value);
                    const chosen = availableIngredients.find((i) => i._id === e.target.value);
                    if (chosen) {
                      setUnit(chosen.unit || 'piece');
                      setCategory(chosen.category || 'Produce');
                    }
                  }}
                  className="select"
                >
                  <option value="">-- Choose from Catalog or Type Custom --</option>
                  {availableIngredients.map((ing) => (
                    <option key={ing._id} value={ing._id}>
                      {ing.icon} {ing.name} ({ing.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom name if not in catalog */}
              {!selectedIngredientId && (
                <div>
                  <label className="input-label">Custom Ingredient Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Greek Feta Cheese"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="input"
                  />
                </div>
              )}

              {/* Quantity & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Quantity</label>
                  <input
                    type="number"
                    min="0"
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
                    <option value="clove">clove(s)</option>
                    <option value="bunch">bunch</option>
                  </select>
                </div>
              </div>

              {/* Purchase Date & Expiry Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Purchase Date</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="input-label">Stock Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="select"
                >
                  <option value="Available">🟢 Available</option>
                  <option value="Low Stock">⚠️ Low Stock</option>
                  <option value="Finished">⚪ Finished / Used</option>
                  <option value="Expired">🔴 Expired</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="input-label">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Organic, stored in crisper drawer"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-dark-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs font-bold uppercase tracking-wider"
                >
                  {submitting ? 'Saving...' : editingItemId ? 'Save Changes' : 'Add to Pantry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
