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
  Home,
  ChefHat,
} from 'lucide-react';
import logoEmblem from '../../assets/flavorcraft_logo_emblem.jpg';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Compact on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      to: '/',
      label: 'Home',
      icon: Home,
    },
    {
      to: '/recipes',
      label: 'Explore',
      icon: BookOpen,
    },
    {
      to: '/matcher',
      label: 'Match Recipes',
      icon: Sparkles,
      highlight: true,
    },
    {
      to: '/inventory',
      label: 'My Kitchen',
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
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-dark-bg/90 backdrop-blur-xl border-b border-dark-border/80 shadow-lg py-2.5'
          : 'bg-dark-bg/60 backdrop-blur-md border-b border-dark-border/40 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-glow-green border border-sage/40 group-hover:scale-105 group-hover:rotate-2 transition-transform duration-300 bg-dark-card flex items-center justify-center">
              <img
                src={logoEmblem}
                alt="FlavorCraft Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-xl tracking-tight text-white flex items-center gap-1">
                Flavor<span className="text-sage-400">Craft</span>
              </span>
              <span className="text-[10px] text-sage-300/80 font-bold tracking-widest uppercase -mt-1 hidden sm:block">
                Digital Kitchen
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-dark-surface/80 p-1.5 rounded-2xl border border-dark-border shadow-inner">
            {navLinks.map((link) => {
              if (link.authRequired && !isAuthenticated) return null;
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      isActive
                        ? link.highlight
                          ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-glow-green'
                          : 'bg-dark-card text-sage-300 border border-sage/30 shadow-sm'
                        : link.highlight
                        ? 'text-sage-300 hover:text-white hover:bg-primary/20'
                        : 'text-text-secondary hover:text-white hover:bg-dark-hover'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                  {link.highlight && (
                    <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-accent/20 text-accent border border-accent/30">
                      Pot
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User / Auth Area */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile?tab=favorites"
                  className="p-2 rounded-xl text-text-secondary hover:text-accent-400 hover:bg-dark-hover border border-dark-border transition-colors hidden sm:flex items-center justify-center"
                  title="My Favorites"
                >
                  <Heart className="w-4 h-4" />
                </Link>

                <Link
                  to="/recipes/new"
                  className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider bg-sage/15 text-sage-300 hover:bg-sage/25 hover:text-white transition-all border border-sage/30"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create Recipe</span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-dark-surface border border-dark-border hover:border-sage/40 transition-all focus:outline-none"
                    aria-expanded={profileDropdownOpen}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary to-sage-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <span className="text-xs font-semibold text-text-primary hidden sm:block max-w-[90px] truncate">
                      {user?.name || 'Chef'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-dark-card border border-dark-border shadow-2xl py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-dark-border">
                        <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-text-muted truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/20 text-accent text-[10px] font-bold border border-accent/30">
                            <ShieldCheck className="w-3 h-3" /> Admin
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-text-secondary hover:text-white hover:bg-dark-hover transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-sage-400" />
                          <span>My Kitchen Profile</span>
                        </Link>
                        <Link
                          to="/profile?tab=favorites"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-text-secondary hover:text-white hover:bg-dark-hover transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5 text-accent-400" />
                          <span>Saved Favorites</span>
                        </Link>
                        <Link
                          to="/recipes/new"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-text-secondary hover:text-white hover:bg-dark-hover transition-colors md:hidden"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-sage-400" />
                          <span>Create Recipe</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-accent-400 hover:text-white hover:bg-dark-hover transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Admin Management</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-dark-border pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-medium text-accent-400 hover:text-accent-300 hover:bg-accent/10 transition-colors text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
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
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-white hover:bg-dark-hover transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary !py-2 !px-4 text-xs font-bold uppercase tracking-wider shadow-glow-green"
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
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 pb-4 border-t border-dark-border/80 flex flex-col gap-1.5 animate-slide-up">
            {navLinks.map((link) => {
              if (link.authRequired && !isAuthenticated) return null;
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? link.highlight
                          ? 'bg-primary text-white shadow-glow-green'
                          : 'bg-dark-card text-sage-300 border border-sage/30'
                        : 'text-text-secondary hover:text-white hover:bg-dark-hover'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.highlight && (
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">
                      Signature
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
