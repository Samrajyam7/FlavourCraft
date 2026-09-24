import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Lock, Mail, ArrowRight, Sparkles, ShieldCheck, User } from 'lucide-react';
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
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="card max-w-md w-full p-8 sm:p-10 bg-dark-card border-dark-border shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white mx-auto shadow-glow-green mb-3">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
            Welcome Back
          </h1>
          <p className="text-xs text-text-secondary">
            Sign in to access your pantry, meal plans, and saved favorites.
          </p>
        </div>

        {/* 1-Click Demo Buttons */}
        <div className="p-3.5 rounded-2xl bg-dark-surface/80 border border-primary/20 space-y-2 text-center">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
            Instant Demo Logins
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('user')}
              disabled={loading}
              className="btn btn-outline text-xs !py-2 flex items-center justify-center gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
            >
              <User className="w-3.5 h-3.5" /> Demo Chef
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="btn btn-outline text-xs !py-2 flex items-center justify-center gap-1.5 border-secondary/40 text-secondary hover:bg-secondary/10"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Demo Admin
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
                placeholder="chef@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input !pl-10 text-xs"
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
                className="input !pl-10 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full shadow-glow-green text-sm mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-text-secondary pt-2">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="text-primary font-bold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
