import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  ChefHat,
  Sparkles,
  MessageSquare,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { ingredientService } from '../services/ingredientService';
import { useToast } from '../context/ToastContext';

export const AdminPage = () => {
  const { success, error: toastError } = useToast();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAdminTab, setActiveAdminTab] = useState('overview');

  // New Ingredient Modal State
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [ingName, setIngName] = useState('');
  const [ingCategory, setIngCategory] = useState('Produce');
  const [ingDescription, setIngDescription] = useState('');
  const [savingIng, setSavingIng] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, ingData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getUsers(),
        ingredientService.getIngredients({ limit: 300 }),
      ]);
      setStats(statsData);
      setUsers(usersData.users || usersData || []);
      setIngredients(ingData.ingredients || ingData || []);
    } catch (err) {
      console.error('Failed to load admin portal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      success(`Updated user role to ${newRole}`);
    } catch (err) {
      toastError('Failed to change user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await adminService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      success('User deleted');
    } catch (err) {
      toastError('Failed to delete user');
    }
  };

  const handleCreateIngredient = async (e) => {
    e.preventDefault();
    if (!ingName.trim()) return;

    setSavingIng(true);
    try {
      const created = await ingredientService.createIngredient({
        name: ingName.trim(),
        category: ingCategory,
        description: ingDescription,
      });
      success(`Added ingredient "${ingName}"!`);
      setIngName('');
      setIngDescription('');
      setShowAddIngredientModal(false);
      setIngredients((prev) => [created, ...prev]);
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create ingredient');
    } finally {
      setSavingIng(false);
    }
  };

  const handleDeleteIngredient = async (id) => {
    if (!window.confirm('Delete this ingredient from global catalog?')) return;
    try {
      await ingredientService.deleteIngredient(id);
      setIngredients((prev) => prev.filter((i) => i._id !== id));
      success('Ingredient deleted');
    } catch (err) {
      toastError('Failed to delete ingredient');
    }
  };

  return (
    <div className="container-page py-8 space-y-8">
      {/* Header */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-secondary-900/40 via-dark-card to-dark-surface border-secondary/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administration Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black text-white">
              FlavorCraft Admin Portal
            </h1>
            <p className="text-sm text-text-secondary max-w-xl">
              Manage platform catalog, oversee registered culinary creators, add new ingredients, and monitor system analytics.
            </p>
          </div>

          <button
            onClick={() => setShowAddIngredientModal(true)}
            className="btn btn-secondary flex items-center gap-2 shadow-glow-orange self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Master Ingredient</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <span className="text-2xl sm:text-3xl font-heading font-black text-white">
            {stats?.totalUsers || users.length || 0}
          </span>
        </div>

        <div className="card p-5 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Recipes</span>
            <ChefHat className="w-4 h-4 text-secondary" />
          </div>
          <span className="text-2xl sm:text-3xl font-heading font-black text-white">
            {stats?.totalRecipes || 0}
          </span>
        </div>

        <div className="card p-5 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Ingredients</span>
            <Sparkles className="w-4 h-4 text-amber-DEFAULT" />
          </div>
          <span className="text-2xl sm:text-3xl font-heading font-black text-white">
            {stats?.totalIngredients || ingredients.length || 0}
          </span>
        </div>

        <div className="card p-5 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Reviews</span>
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-heading font-black text-white">
            {stats?.totalReviews || 0}
          </span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-dark-border pb-3">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeAdminTab === 'overview'
              ? 'bg-secondary text-white shadow-glow-orange'
              : 'text-text-secondary hover:text-white hover:bg-dark-hover'
          }`}
        >
          Master Ingredients ({ingredients.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeAdminTab === 'users'
              ? 'bg-secondary text-white shadow-glow-orange'
              : 'text-text-secondary hover:text-white hover:bg-dark-hover'
          }`}
        >
          User Accounts ({users.length})
        </button>
      </div>

      {/* Add Ingredient Modal */}
      {showAddIngredientModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="card max-w-md w-full p-6 bg-dark-card border-dark-border relative shadow-2xl animate-slide-up">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-secondary" /> Add New Master Ingredient
            </h3>

            <form onSubmit={handleCreateIngredient} className="space-y-4">
              <div>
                <label className="input-label">Ingredient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saffron"
                  value={ingName}
                  onChange={(e) => setIngName(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="input-label">Category</label>
                <select
                  value={ingCategory}
                  onChange={(e) => setIngCategory(e.target.value)}
                  className="input text-xs"
                >
                  <option value="Produce">Produce</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Protein">Protein</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Grains">Grains</option>
                  <option value="Pantry">Pantry</option>
                  <option value="Spices">Spices</option>
                </select>
              </div>

              <div>
                <label className="input-label">Description (optional)</label>
                <textarea
                  rows="2"
                  placeholder="Flavor notes, aroma..."
                  value={ingDescription}
                  onChange={(e) => setIngDescription(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddIngredientModal(false)}
                  className="btn btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingIng}
                  className="btn btn-secondary text-xs shadow-glow-orange"
                >
                  {savingIng ? 'Adding...' : 'Save Ingredient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Master Ingredients */}
      {activeAdminTab === 'overview' && (
        <div className="card p-6 bg-dark-card border-dark-border space-y-4">
          <div className="flex items-center justify-between border-b border-dark-border pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Platform Master Ingredients List
            </h3>
            <span className="text-xs text-text-muted">{ingredients.length} items total</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[600px] overflow-y-auto pr-2">
            {ingredients.map((ing) => (
              <div
                key={ing._id}
                className="p-3 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-between gap-2 group hover:border-secondary/40 transition-all"
              >
                <div className="truncate">
                  <span className="text-xs font-bold text-white block truncate">{ing.name}</span>
                  <span className="text-[10px] text-text-muted">{ing.category}</span>
                </div>
                <button
                  onClick={() => handleDeleteIngredient(ing._id)}
                  className="text-text-muted hover:text-red-400 p-1 opacity-40 group-hover:opacity-100"
                  title="Delete ingredient"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: User Accounts */}
      {activeAdminTab === 'users' && (
        <div className="card p-6 bg-dark-card border-dark-border space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-dark-border pb-3">
            Manage User Accounts
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-secondary">
              <thead className="bg-dark-surface text-text-muted uppercase text-[10px] font-bold border-b border-dark-border">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-dark-surface/40 transition-colors">
                    <td className="p-3 font-bold text-white">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">
                      <span
                        className={`badge ${
                          u.role === 'admin' ? 'badge-orange' : 'badge-green'
                        } text-[10px]`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-text-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleUpdateRole(u._id, u.role)}
                        className="btn btn-outline !py-1 !px-2 text-[11px]"
                      >
                        Toggle Role
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="btn btn-outline !py-1 !px-2 text-[11px] text-red-400 border-red-500/30 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
