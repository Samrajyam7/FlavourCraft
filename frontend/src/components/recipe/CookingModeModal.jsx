import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Flame,
  Clock,
  Sparkles,
  Timer,
} from 'lucide-react';

export const CookingModeModal = ({ recipe, isOpen = true, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);

  // Safely normalize recipe instructions to canonical [{ step, description, timerMinutes }]
  const rawInstructions = recipe?.instructions || [];
  const instructions = rawInstructions.map((item, idx) => {
    let description = '';
    let stepNumber = idx + 1;
    let timerMinutes = 0;

    if (typeof item === 'string') {
      description = item;
    } else if (item && typeof item === 'object') {
      description = item.description || item.instruction || item.text || '';
      stepNumber = item.step || item.stepNumber || idx + 1;
      timerMinutes = Number(item.timerMinutes) || 0;
    }

    return {
      step: stepNumber,
      description,
      timerMinutes,
    };
  });

  const totalSteps = instructions.length;
  const safeIndex = totalSteps > 0 ? Math.max(0, Math.min(currentStepIndex, totalSteps - 1)) : 0;
  const currentStep = totalSteps > 0 ? instructions[safeIndex] : null;

  // Auto-detect timer from current step instruction text or timerMinutes
  useEffect(() => {
    if (!currentStep) return;
    if (currentStep.timerMinutes && currentStep.timerMinutes > 0) {
      setTimerSeconds(currentStep.timerMinutes * 60);
      setTimerActive(false);
      return;
    }
    const text = currentStep.description || '';
    const match = text.match(/(\d+)\s*(?:minutes|mins|min)/i);
    if (match && match[1]) {
      const minutes = parseInt(match[1], 10);
      if (minutes > 0 && minutes <= 180) {
        setTimerSeconds(minutes * 60);
        setTimerActive(false);
      }
    }
  }, [safeIndex, recipe]);

  // Timer interval countdown
  useEffect(() => {
    let interval = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false);
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } catch (e) {
        console.log('Audio beep fallback', e);
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  if (!isOpen || !recipe) return null;

  const toggleStepCompleted = (idx) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalSteps > 0 ? ((safeIndex + 1) / totalSteps) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-dark-bg/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden animate-fade-in text-left">
      {/* Top Header Bar */}
      <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between bg-dark-surface/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sage/15 text-sage-300 flex items-center justify-center border border-sage/30">
            <Flame className="w-4 h-4 text-warm" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-heading font-bold text-white line-clamp-1">
              {recipe.title || 'Cooking Recipe'}
            </h2>
            <p className="text-xs text-text-secondary flex items-center gap-2">
              <span className="text-sage-400 font-semibold uppercase tracking-wider text-[10px]">
                Interactive Cooking Mode
              </span>
              {totalSteps > 0 && (
                <>
                  <span>•</span>
                  <span className="text-white font-medium">
                    Step {safeIndex + 1} of {totalSteps}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowIngredients((prev) => !prev)}
            className={`btn-sm ${showIngredients ? 'btn-primary' : 'btn-outline'}`}
          >
            Ingredients Drawer
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-dark-hover border border-dark-border transition-colors"
            aria-label="Exit Cooking Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-dark-surface h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-sage to-primary h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row gap-8 items-center justify-center w-full">
        {/* Step Card */}
        <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full">
          {totalSteps === 0 ? (
            <div className="card p-8 sm:p-12 border-sage/20 relative shadow-2xl bg-dark-card/90 text-center space-y-4">
              <p className="text-lg text-text-secondary">
                No cooking instructions are available for this recipe.
              </p>
              <button onClick={onClose} className="btn-outline text-xs !py-2 !px-4">
                Close
              </button>
            </div>
          ) : (
            <div className="card p-8 sm:p-12 border-sage/20 relative shadow-2xl bg-dark-card/90">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="px-3.5 py-1.5 rounded-xl bg-sage/15 text-sage-300 font-heading font-bold text-xs tracking-wider border border-sage/30">
                    STEP {String(safeIndex + 1).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
                  </span>
                </div>

                <button
                  onClick={() => toggleStepCompleted(safeIndex)}
                  className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                    completedSteps.has(safeIndex)
                      ? 'bg-primary/20 text-primary-light border border-primary/40'
                      : 'bg-dark-surface text-text-muted hover:text-white border border-dark-border'
                  }`}
                >
                  {completedSteps.has(safeIndex) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-primary-light" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" />
                      <span>Mark as Done</span>
                    </>
                  )}
                </button>
              </div>

              {/* Instruction description with large readable typography */}
              <p className="text-xl sm:text-2xl lg:text-3xl font-heading font-medium text-white leading-relaxed mb-8 text-balance">
                {currentStep?.description || 'Follow recipe step as directed.'}
              </p>

              {/* Step Timer Feature */}
              {timerSeconds > 0 && (
                <div className="p-4 sm:p-6 rounded-2xl bg-dark-surface border border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-warm/15 text-warm flex items-center justify-center border border-warm/30">
                      <Timer className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                        Step Timer
                      </span>
                      <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wider">
                        {formatTimer(timerSeconds)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTimerActive((prev) => !prev)}
                      className={`btn-sm ${timerActive ? 'btn-secondary' : 'btn-primary'} !py-2 !px-4 text-xs font-bold uppercase tracking-wider`}
                    >
                      {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{timerActive ? 'Pause' : 'Start Timer'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setTimerActive(false);
                        setTimerSeconds(0);
                      }}
                      className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-dark-hover border border-dark-border transition-colors"
                      title="Reset timer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Side Panel: Ingredients Drawer */}
        {showIngredients && (
          <div className="w-full lg:w-80 card p-6 bg-dark-card border-dark-border max-h-[70vh] overflow-y-auto animate-fade-in">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sage-400" /> Recipe Ingredients
            </h3>
            <ul className="space-y-2.5 text-xs">
              {recipe.ingredients?.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 pb-2 border-b border-dark-border/50 text-text-secondary"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-white">
                      {item.amount || ''} {item.unit || ''}{' '}
                    </span>
                    <span>{item.ingredientId?.name || item.ingredient?.name || item.name}</span>
                    {item.notes && <span className="text-text-muted block text-[10px]">({item.notes})</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom Step Controller */}
      {totalSteps > 0 && (
        <div className="border-t border-dark-border px-6 py-4 bg-dark-surface/80 flex items-center justify-between">
          <button
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={safeIndex === 0}
            className="btn-outline text-xs flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          {/* Step Numbers */}
          <div className="hidden sm:flex items-center gap-2">
            {instructions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                  idx === safeIndex
                    ? 'bg-primary text-white shadow-glow-green scale-110'
                    : completedSteps.has(idx)
                    ? 'bg-primary/20 text-primary-light border border-primary/40'
                    : 'bg-dark-card text-text-muted hover:text-white border border-dark-border'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {safeIndex < totalSteps - 1 ? (
            <button
              onClick={() => {
                toggleStepCompleted(safeIndex);
                setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
              }}
              className="btn-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                toggleStepCompleted(safeIndex);
                onClose();
              }}
              className="btn-accent text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-glow-accent"
            >
              <span>Finish Cooking 🎉</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CookingModeModal;
