import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Heart, Sparkles, Compass, ShieldCheck, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-dark-border bg-dark-surface/40 mt-20">
      <div className="container-page py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-glow-green">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-heading font-black text-2xl tracking-tight text-white">
                Flavor<span className="gradient-text">Craft</span>
              </span>
            </Link>
            <p className="text-text-secondary text-sm max-w-sm leading-relaxed">
              Transform whatever is in your fridge into mouthwatering, gourmet home-cooked meals. Stop food waste and unleash your inner culinary creator.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" /> Intelligent Recipe AI
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold border border-secondary/20">
                <Compass className="w-3.5 h-3.5" /> Zero-Waste Kitchen
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link to="/matcher" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Recipe Matcher
                </Link>
              </li>
              <li>
                <Link to="/recipes" className="hover:text-primary transition-colors">
                  Browse All Recipes
                </Link>
              </li>
              <li>
                <Link to="/recipes?diet=Vegetarian" className="hover:text-primary transition-colors">
                  Vegetarian Dishes
                </Link>
              </li>
              <li>
                <Link to="/recipes?diet=Vegan" className="hover:text-primary transition-colors">
                  Vegan & Plant-Based
                </Link>
              </li>
              <li>
                <Link to="/recipes?diet=Gluten-Free" className="hover:text-primary transition-colors">
                  Gluten-Free Cooking
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools & Features */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Kitchen Tools</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link to="/inventory" className="hover:text-primary transition-colors">
                  Pantry Inventory
                </Link>
              </li>
              <li>
                <Link to="/meal-planner" className="hover:text-primary transition-colors">
                  Weekly Meal Planner
                </Link>
              </li>
              <li>
                <Link to="/grocery" className="hover:text-primary transition-colors">
                  Smart Grocery List
                </Link>
              </li>
              <li>
                <Link to="/recipes/new" className="hover:text-primary transition-colors">
                  Submit a Recipe
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Cuisines */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Popular Cuisines</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link to="/recipes?cuisine=Italian" className="hover:text-primary transition-colors">
                  Italian Cuisine
                </Link>
              </li>
              <li>
                <Link to="/recipes?cuisine=Mexican" className="hover:text-primary transition-colors">
                  Mexican Flavors
                </Link>
              </li>
              <li>
                <Link to="/recipes?cuisine=Asian" className="hover:text-primary transition-colors">
                  Asian & Stir-Fry
                </Link>
              </li>
              <li>
                <Link to="/recipes?cuisine=Mediterranean" className="hover:text-primary transition-colors">
                  Mediterranean Diet
                </Link>
              </li>
              <li>
                <Link to="/recipes?cuisine=Indian" className="hover:text-primary transition-colors">
                  Indian Spiced
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="divider my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} FlavorCraft. All rights reserved. Cook with passion, zero waste.</p>
          <div className="flex items-center gap-1 text-text-secondary">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline mx-0.5" />
            <span>for food lovers everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
