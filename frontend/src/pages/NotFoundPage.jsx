import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Home, Sparkles } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center container-page py-16">
      <div className="card p-10 sm:p-14 bg-dark-card border-dark-border text-center max-w-lg mx-auto space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto">
          <UtensilsCrossed className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-heading font-black text-white">404</h1>
          <h2 className="text-xl font-bold text-white">Recipe or Page Not Found</h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Oops! It seems this dish has left the kitchen or the page you are looking for does not exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="btn btn-primary btn-sm w-full sm:w-auto flex items-center justify-center gap-2 shadow-glow-green">
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link to="/matcher" className="btn btn-outline btn-sm w-full sm:w-auto flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Try Recipe Matcher</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
