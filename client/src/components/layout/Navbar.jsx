import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  UtensilsCrossed,
  Sparkles,
  BookOpen,
  Refrigerator,
  Calendar,
  ShoppingCart,
  User,
  LogOut,
  PlusCircle,
  ShieldCheck,
  Menu,
  X,
  Heart,
  ChevronDown,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    info('Logged out successfully');
    navigate('/');
  };

  const navLinks = [
    {
      to: '/matcher',
      label: 'Recipe Matcher',
      icon: Sparkles,
      highlight: true,
    },
    {
      to: '/recipes',
      label: 'Browse Recipes',
      icon: BookOpen,
    },
    {
      to: '/inventory',
      label: 'My Pantry',
      icon: Refrigerator,
      authRequired: true,
    },
    {
      to: '/meal-planner',
      label: 'Meal Planner',
      icon: Calendar,
      authRequired: true,
    },
    {
      to: '/grocery',
      label: 'Grocery List',
      icon: ShoppingCart,
      authRequired: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-dark-border/60 bg-dark/80 backdrop-blur-xl transition-all duration-200">
      <div className="container-page">
        <div className="flex h-18 items-center justify-between gap-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-glow-green group-hover:scale-105 transition-transform duration-200">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-xl tracking-tight text-white flex items-center gap-1.5">
                Flavor<span className="gradient-text">Craft</span>
              </span>
              <span className="text-[10px] text-text-muted font-medium tracking-wider uppercase -mt-1 hidden sm:block">
                Smart Kitchen AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-dark-surface/60 p-1.5 rounded-2xl border border-dark-border/50">
            {navLinks.map((link) => {
              if (link.authRequired && !isAuthenticated) return null;
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? link.highlight
                          ? 'bg-gradient-to-r from-primary to-primary-600 text-white shadow-glow-green'
                          : 'bg-dark-hover text-white'
                        : link.highlight
                        ? 'text-primary hover:bg-primary/10'
                        : 'text-text-secondary hover:text-white hover:bg-dark-hover/60'
                    }`
                  }
                >
                  <Icon className={`w-4 h-4 ${link.highlight ? 'text-current animate-pulse-slow' : ''}`} />
                  <span>{link.label}</span>
                  {link.highlight && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-secondary/30 text-secondary ml-0.5">
                      Smart
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User / CTA Area */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/recipes/new"
                  className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Recipe</span>
                </Link>

                {/* Profile dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-dark-surface border border-dark-border hover:border-primary/40 transition-all focus:outline-none"
                    aria-expanded={profileDropdownOpen}
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-semibold text-text-primary hidden sm:block max-w-[100px] truncate">
                      {user?.name || 'Chef'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-dark-card border border-dark-border shadow-2xl py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-dark-border/60">
                        <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-text-muted truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/20 text-secondary text-[11px] font-bold">
                            <ShieldCheck className="w-3 h-3" /> Admin
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-white hover:bg-dark-hover transition-colors"
                        >
                          <User className="w-4 h-4 text-primary" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/profile?tab=favorites"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-white hover:bg-dark-hover transition-colors"
                        >
                          <Heart className="w-4 h-4 text-red-400" />
                          <span>Favorite Recipes</span>
                        </Link>
                        <Link
                          to="/recipes/new"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-white hover:bg-dark-hover transition-colors sm:hidden"
                        >
                          <PlusCircle className="w-4 h-4 text-secondary" />
                          <span>Create Recipe</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-secondary hover:text-secondary-light hover:bg-dark-hover transition-colors font-medium"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Admin Portal</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-dark-border/60 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-white hover:bg-dark-hover transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary btn-sm !py-2 !px-4 shadow-glow-green"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-white hover:bg-dark-hover border border-dark-border"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-dark-border bg-dark/95 backdrop-blur-2xl px-4 py-6 space-y-4 animate-slide-up">
          <div className="space-y-1">
            {navLinks.map((link) => {
              if (link.authRequired && !isAuthenticated) return null;
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? link.highlight
                          ? 'bg-primary text-white font-semibold shadow-glow-green'
                          : 'bg-dark-card text-white border border-dark-border'
                        : 'text-text-secondary hover:text-white hover:bg-dark-hover'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${link.highlight ? 'text-amber-300' : ''}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.highlight && (
                    <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-black/20 text-white">
                      AI Match
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {!isAuthenticated && (
            <div className="pt-4 border-t border-dark-border flex flex-col gap-2">
              <Link to="/login" className="btn btn-outline w-full py-3">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary w-full py-3 shadow-glow-green">
                Create Free Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
