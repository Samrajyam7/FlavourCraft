import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame, X, Utensils, ArrowRight } from 'lucide-react';

export default function CookingPotInteractive({
  selectedIngredients = [],
  onRemoveIngredient,
  onClearAll,
  onFindMatches,
  loading = false,
}) {
  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-dark-surface to-dark-card border border-dark-border p-6 shadow-2xl overflow-hidden">
      {/* Background glow when pot is active */}
      <div
        className={`absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${
          selectedIngredients.length > 0 ? 'bg-primary/20 opacity-100' : 'bg-transparent opacity-0'
        }`}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sage/15 border border-sage/30 flex items-center justify-center text-sage-300">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-white text-base tracking-wide flex items-center gap-2">
              Signature Cooking Pot
              {selectedIngredients.length > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                  {selectedIngredients.length} in pot
                </span>
              )}
            </h3>
            <p className="text-xs text-text-secondary">
              Drop your available ingredients below to simmer recipes
            </p>
          </div>
        </div>

        {selectedIngredients.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1 font-medium"
          >
            <X className="w-3.5 h-3.5" /> Empty pot
          </button>
        )}
      </div>

      {/* 3D Visual Pot Area */}
      <div className="relative min-h-[160px] flex flex-col items-center justify-center py-4 border-2 border-dashed border-dark-border/80 rounded-2xl bg-dark-bg/40 mb-6 overflow-hidden">
        {selectedIngredients.length === 0 ? (
          <div className="text-center py-4 text-text-muted space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-dark-surface border border-dark-border flex items-center justify-center text-2xl">
              🍲
            </div>
            <p className="text-xs font-medium text-text-secondary">
              The pot is currently empty.
            </p>
            <p className="text-[11px] text-text-muted">
              Select items from the pantry or categories below to start cooking.
            </p>
          </div>
        ) : (
          <div className="w-full px-4">
            <div className="flex flex-wrap items-center justify-center gap-2 max-h-48 overflow-y-auto py-2">
              <AnimatePresence>
                {selectedIngredients.map((item) => {
                  const name = typeof item === 'object' ? item.name : item;
                  const id = typeof item === 'object' ? item._id : item;

                  return (
                    <motion.div
                      key={id}
                      initial={{ scale: 0.5, y: -20, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ scale: 0.5, y: 20, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-primary/30 to-sage/20 text-white border border-sage/40 text-xs font-semibold shadow-sm backdrop-blur-sm"
                    >
                      <span className="text-sm">✨</span>
                      <span>{name}</span>
                      <button
                        onClick={() =>
                          onRemoveIngredient(
                            typeof item === 'object' ? item : { _id: item, name: item }
                          )
                        }
                        className="p-0.5 rounded-full hover:bg-white/20 text-text-muted hover:text-white transition-colors"
                        aria-label={`Remove ${name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Simmering Flame Indicator */}
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-warm font-semibold">
              <Flame className="w-4 h-4 text-warm animate-pulse" />
              <span>Simmering with {selectedIngredients.length} ingredients</span>
            </div>
          </div>
        )}
      </div>

      {/* Action CTA */}
      <button
        onClick={onFindMatches}
        disabled={selectedIngredients.length === 0 || loading}
        className="btn-primary w-full py-3.5 rounded-2xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-green disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Matching Flavors...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Find Matching Recipes</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
