import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Lock,
  Mail,
  User,
  Sparkles,
  ChefHat,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toastError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password });
      success('Welcome to FlavorCraft! Your kitchen is ready. 🚀');
      navigate('/');
    } catch (err) {
      toastError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 max-w-6xl mx-auto">
      <div className="card w-full bg-dark-card border-dark-border shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Culinary Visual Side */}
        <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-10 bg-dark-surface overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?auto=format&fit=crop&w=1200&q=80"
            alt="Chef Cooking"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent" />

          <div className="relative z-10 space-y-2 text-left">
            <div className="w-10 h-10 rounded-xl bg-sage/20 border border-sage/40 flex items-center justify-center text-sage-300">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-heading font-bold text-white">Join FlavorCraft</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Transform random fridge ingredients into Michelin-inspired home dining.
            </p>
          </div>

          <div className="relative z-10 space-y-3 text-left">
            <div className="p-3.5 rounded-2xl bg-dark-bg/85 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-sage-300">
                <CheckCircle2 className="w-4 h-4 text-sage-400" />
                <span>Smart Meal Planning</span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Auto-generate weekly grocery lists & sync your inventory.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Register Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 space-y-6 text-left">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/15 text-sage-300 text-xs font-bold uppercase tracking-widest border border-sage/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-sage-400" />
              <span>New Chef Registration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
              Create Your Account
            </h1>
            <p className="text-xs text-text-secondary">
              Start cooking smarter, save money, and discover personalized recipes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  required
                  placeholder="Gordon Ramsay"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input !pl-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  required
                  placeholder="chef@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input !pl-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Password (min 6 characters)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input !pl-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input !pl-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-xs font-bold uppercase tracking-wider shadow-glow-green"
            >
              {loading ? 'Creating Account...' : 'Join FlavorCraft Free'}
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-text-secondary">
            Already have a chef account?{' '}
            <Link to="/login" className="font-bold text-sage-300 hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
