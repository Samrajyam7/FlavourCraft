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
  Lock,
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

  // Search Filter
  const [searchFilter, setSearchFilter] = useState('');

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

  const filteredIngredients = ingredients.filter((i) =>
    i.name.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
      u.email?.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-primary-900/40 via-dark-card to-dark-surface border-sage/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase tracking-widest border border-accent/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administration Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black text-white">
              FlavorCraft Admin Portal
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Oversee the culinary catalog, manage registered user permissions, add master pantry ingredients, and review real-time platform statistics.
            </p>
          </div>

          <button
            onClick={() => setShowAddIngredientModal(true)}
            className="btn-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-glow-green self-start md:self-auto"
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
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Chefs</span>
            <Users className="w-4 h-4 text-sage-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-heading font-black text-white">
            {stats?.totalUsers || users.length || 0}
          </span>
        </div>

        <div className="card p-5 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Recipes</span>
            <ChefHat className="w-4 h-4 text-warm" />
          </div>
          <span className="text-2xl sm:text-3xl font-heading font-black text-white">
            {stats?.totalRecipes || 32}
          </span>
        </div>

        <div className="card p-5 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Ingredients</span>
            <Sparkles className="w-4 h-4 text-primary-light" />
          </div>
          <span className="text-2xl sm:text-3xl font-heading font-black text-white">
            {stats?.totalIngredients || ingredients.length || 50}
          </span>
        </div>

        <div className="card p-5 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Reviews</span>
            <MessageSquare className="w-4 h-4 text-accent" />
          </div>
          <span className="text-2xl sm:text-3xl font-heading font-black text-white">
            {stats?.totalReviews || 0}
          </span>
        </div>
      </div>

      {/* Admin Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveAdminTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeAdminTab === 'overview'
                ? 'bg-primary text-white shadow-glow-green'
                : 'text-text-secondary hover:text-white hover:bg-dark-hover'
            }`}
          >
            Master Ingredients ({ingredients.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('users')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeAdminTab === 'users'
                ? 'bg-primary text-white shadow-glow-green'
                : 'text-text-secondary hover:text-white hover:bg-dark-hover'
            }`}
          >
            User Accounts ({users.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="input !pl-9 !py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Add Ingredient Modal */}
      {showAddIngredientModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="card max-w-md w-full p-6 bg-dark-card border-dark-border relative shadow-2xl animate-slide-up">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-sage-400" /> Add New Master Ingredient
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
                  className="select text-xs"
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
                  value={ingDescription}
                  onChange={(e) => setIngDescription(e.target.value)}
                  className="input resize-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddIngredientModal(false)}
                  className="btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingIng}
                  className="btn-primary text-xs font-semibold shadow-glow-green"
                >
                  {savingIng ? 'Creating...' : 'Create Master Ingredient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeAdminTab === 'overview' && (
        <div className="card overflow-hidden bg-dark-card border-dark-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-surface text-text-muted uppercase tracking-wider font-semibold border-b border-dark-border">
                <tr>
                  <th className="p-4">Ingredient</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredIngredients.map((ing) => (
                  <tr key={ing._id} className="hover:bg-dark-hover transition-colors">
                    <td className="p-4 font-semibold text-white">{ing.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-lg bg-dark-surface text-text-secondary border border-dark-border">
                        {ing.category || 'General'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteIngredient(ing._id)}
                        className="text-text-muted hover:text-accent p-1 transition-colors"
                        title="Delete ingredient"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeAdminTab === 'users' && (
        <div className="card overflow-hidden bg-dark-card border-dark-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-surface text-text-muted uppercase tracking-wider font-semibold border-b border-dark-border">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-dark-hover transition-colors">
                    <td className="p-4 font-semibold text-white">{u.name}</td>
                    <td className="p-4 text-text-secondary">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-accent/20 text-accent border border-accent/30'
                            : 'bg-sage/20 text-sage-300 border border-sage/30'
                        }`}
                      >
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleUpdateRole(u._id, u.role)}
                        className="btn-outline text-[11px] !py-1 !px-2.5"
                      >
                        {u.role === 'admin' ? 'Demote to Chef' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="btn-danger text-[11px] !py-1 !px-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
