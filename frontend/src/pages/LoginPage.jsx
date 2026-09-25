import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  UtensilsCrossed,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  User,
  ChefHat,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const { login } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      success('Welcome back to FlavorCraft! 👨‍🍳');
      navigate(from, { replace: true });
    } catch (err) {
      toastError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    try {
      const demoEmail = role === 'admin' ? 'admin@flavorcraft.com' : 'chef@flavorcraft.com';
      const demoPass = role === 'admin' ? 'admin123456' : 'password123';
      await login({ email: demoEmail, password: demoPass });
      success(`Signed in as ${role === 'admin' ? 'Admin' : 'Chef'}! 🍳`);
      navigate(from, { replace: true });
    } catch (err) {
      toastError('Demo login failed. Make sure server seed is loaded.');
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
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80"
            alt="Culinary Kitchen"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent" />

          <div className="relative z-10 space-y-2 text-left">
            <div className="w-10 h-10 rounded-xl bg-sage/20 border border-sage/40 flex items-center justify-center text-sage-300">
              <ChefHat className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-heading font-bold text-white">Your Digital Kitchen</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Track your pantry, schedule meals, and discover recipes from ingredients you have on hand.
            </p>
          </div>

          <div className="relative z-10 space-y-3 text-left">
            <div className="p-3.5 rounded-2xl bg-dark-bg/85 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-sage-300">
                <CheckCircle2 className="w-4 h-4 text-sage-400" />
                <span>Zero Food Waste Engine</span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Exact ingredient match scoring for 32+ culinary recipes.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Auth Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 space-y-6 text-left">
          {/* Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/15 text-sage-300 text-xs font-bold uppercase tracking-widest border border-sage/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-sage-400" />
              <span>Chef Sign In</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
              Welcome Back
            </h1>
            <p className="text-xs text-text-secondary">
              Sign in to access your pantry, meal plans, and saved favorites.
            </p>
          </div>

          {/* 1-Click Demo Buttons */}
          <div className="p-3.5 rounded-2xl bg-dark-surface border border-dark-border space-y-2">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
              Instant 1-Click Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('user')}
                disabled={loading}
                className="btn-outline text-xs !py-2 flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-sage-400" /> <span>Demo Chef</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="btn-outline text-xs !py-2 flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-accent" /> <span>Demo Admin</span>
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  required
                  placeholder="chef@flavorcraft.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input !pl-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input !pl-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-xs font-bold uppercase tracking-wider shadow-glow-green"
            >
              {loading ? 'Signing In...' : 'Sign In to Kitchen'}
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-text-secondary">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-sage-300 hover:underline">
              Create Chef Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
