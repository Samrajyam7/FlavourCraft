import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Heart, Sparkles, Compass, ShieldCheck, Mail, ChefHat } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-dark-border bg-dark-surface/80 mt-20 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-sage-600 flex items-center justify-center text-white shadow-glow-green">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-heading font-black text-2xl tracking-tight text-white">
                Flavor<span className="text-sage-400">Craft</span>
              </span>
            </Link>
            <p className="text-text-secondary text-xs sm:text-sm max-w-sm leading-relaxed">
              Transform whatever is in your fridge into mouthwatering, gourmet home-cooked meals. Stop food waste and unleash your inner culinary creator.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage/15 text-sage-300 text-[11px] font-semibold border border-sage/30">
                <Sparkles className="w-3 h-3 text-sage-400" /> Digital Kitchen
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm/15 text-warm text-[11px] font-semibold border border-warm/30">
                <Compass className="w-3 h-3" /> Zero Food Waste
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>
                <Link to="/matcher" className="hover:text-sage-300 transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sage-400" /> Match Recipes
                </Link>
              </li>
              <li>
                <Link to="/recipes" className="hover:text-sage-300 transition-colors">
                  Browse Catalog
                </Link>
              </li>
              <li>
                <Link to="/recipes?cuisine=Indian" className="hover:text-sage-300 transition-colors">
                  Indian Curries
                </Link>
              </li>
              <li>
                <Link to="/recipes?cuisine=Italian" className="hover:text-sage-300 transition-colors">
                  Italian Pastas
                </Link>
              </li>
            </ul>
          </div>

          {/* Kitchen Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Kitchen Tools</h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>
                <Link to="/inventory" className="hover:text-sage-300 transition-colors">
                  Pantry Shelf
                </Link>
              </li>
              <li>
                <Link to="/meal-planner" className="hover:text-sage-300 transition-colors">
                  Weekly Meal Planner
                </Link>
              </li>
              <li>
                <Link to="/grocery" className="hover:text-sage-300 transition-colors">
                  Smart Grocery List
                </Link>
              </li>
              <li>
                <Link to="/recipes/new" className="hover:text-sage-300 transition-colors">
                  Submit a Recipe
                </Link>
              </li>
            </ul>
          </div>

          {/* Cuisines & Diets */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Diets & Cuisines</h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>
                <Link to="/recipes?diet=Vegetarian" className="hover:text-sage-300 transition-colors">
                  Vegetarian Dishes
                </Link>
              </li>
              <li>
                <Link to="/recipes?diet=Vegan" className="hover:text-sage-300 transition-colors">
                  Vegan & Plant-Based
                </Link>
              </li>
              <li>
                <Link to="/recipes?diet=Gluten-Free" className="hover:text-sage-300 transition-colors">
                  Gluten-Free Cooking
                </Link>
              </li>
              <li>
                <Link to="/recipes?cuisine=Asian" className="hover:text-sage-300 transition-colors">
                  Asian Stir-Fries
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
          <p>© {new Date().getFullYear()} FlavorCraft. All rights reserved. Crafted with care for passionate cooks.</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
