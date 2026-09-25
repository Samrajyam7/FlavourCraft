import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, Circle, Flame, Clock, Sparkles } from 'lucide-react';

export const CookingModeModal = ({ recipe, isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);

  const instructions = recipe?.instructions || [];
  const currentStep = instructions[currentStepIndex] || {};

  // Auto-detect timer from current step instruction text (e.g. "Simmer for 15 minutes") or timerMinutes
  useEffect(() => {
    if (!currentStep) return;
    if (currentStep.timerMinutes && currentStep.timerMinutes > 0) {
      setTimerSeconds(currentStep.timerMinutes * 60);
      setTimerActive(false);
      return;
    }
    const text = typeof currentStep === 'string' ? currentStep : (currentStep.description || currentStep.instruction || '');
    const match = text.match(/(\d+)\s*(?:minutes|mins|min)/i);
    if (match && match[1]) {
      const minutes = parseInt(match[1], 10);
      if (minutes > 0 && minutes <= 180) {
        setTimerSeconds(minutes * 60);
        setTimerActive(false);
      }
    }
  }, [currentStepIndex, recipe]);

  // Timer interval countdown
  useEffect(() => {
    let interval = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false);
      // Play a browser beep sound if possible
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

  const stepText = typeof currentStep === 'string' ? currentStep : (currentStep.description || currentStep.instruction || '');
  const progressPercent = instructions.length > 0 ? ((currentStepIndex + 1) / instructions.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-dark/95 backdrop-blur-xl flex flex-col justify-between overflow-hidden animate-fade-in">
      {/* Top Bar */}
      <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between bg-dark-card/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-heading font-bold text-white line-clamp-1">
              {recipe.title}
            </h2>
            <p className="text-xs text-text-secondary flex items-center gap-2">
              <span>Cooking Mode</span>
              <span>•</span>
              <span className="text-primary font-semibold">
                Step {currentStepIndex + 1} of {instructions.length}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowIngredients((prev) => !prev)}
            className={`btn btn-sm ${showIngredients ? 'btn-primary' : 'btn-outline'}`}
          >
            Ingredients List
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
          className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto container-page py-8 sm:py-12 flex flex-col lg:flex-row gap-8 items-stretch justify-center">
        {/* Step Card */}
        <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full">
          <div className="card p-8 sm:p-12 border-primary/20 relative shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <span className="px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary font-heading font-bold text-sm tracking-wide">
                STEP {currentStepIndex + 1}
              </span>

              <button
                onClick={() => toggleStepCompleted(currentStepIndex)}
                className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                  completedSteps.has(currentStepIndex)
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'bg-dark-surface text-text-muted hover:text-white border border-dark-border'
                }`}
              >
                {completedSteps.has(currentStepIndex) ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Done</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4" />
                    <span>Mark as Complete</span>
                  </>
                )}
              </button>
            </div>

            {/* Step text with large readable typography */}
            <p className="text-xl sm:text-2xl lg:text-3xl font-heading font-medium text-white leading-relaxed mb-8 text-balance">
              {stepText}
            </p>

            {/* Step Timer Feature if applicable */}
            {timerSeconds > 0 && (
              <div className="p-4 sm:p-6 rounded-2xl bg-dark-surface/90 border border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-text-muted uppercase font-bold tracking-wider">Step Timer</span>
                    <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wider">
                      {formatTimer(timerSeconds)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTimerActive((prev) => !prev)}
                    className={`btn ${timerActive ? 'btn-secondary' : 'btn-primary'} !py-2 !px-4 text-sm`}
                  >
                    {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{timerActive ? 'Pause' : 'Start Timer'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setTimerActive(false);
                      setTimerSeconds(0);
                    }}
                    className="btn btn-outline !py-2 !px-3"
                    title="Reset timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel: Ingredients Drawer */}
        {showIngredients && (
          <div className="w-full lg:w-80 card p-6 bg-dark-card border-dark-border max-h-[70vh] overflow-y-auto animate-fade-in">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Recipe Ingredients
            </h3>
            <ul className="space-y-3 text-sm">
              {recipe.ingredients?.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 pb-2 border-b border-dark-border/50 text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-white">
                      {item.amount || ''} {item.unit || ''}{' '}
                    </span>
                    <span>{item.ingredientId?.name || item.ingredient?.name || item.name}</span>
                    {item.notes && <span className="text-xs text-text-muted block">({item.notes})</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom Step Controller */}
      <div className="border-t border-dark-border px-6 py-4 bg-dark-card/60 flex items-center justify-between">
        <button
          onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentStepIndex === 0}
          className="btn btn-outline flex items-center gap-2 disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </button>

        {/* Steps Thumbnails */}
        <div className="hidden sm:flex items-center gap-2">
          {instructions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStepIndex(idx)}
              className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                idx === currentStepIndex
                  ? 'bg-primary text-white shadow-glow-green scale-110'
                  : completedSteps.has(idx)
                  ? 'bg-primary/20 text-primary border border-primary/40'
                  : 'bg-dark-surface text-text-muted hover:text-white border border-dark-border'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {currentStepIndex < instructions.length - 1 ? (
          <button
            onClick={() => {
              toggleStepCompleted(currentStepIndex);
              setCurrentStepIndex((prev) => Math.min(instructions.length - 1, prev + 1));
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              toggleStepCompleted(currentStepIndex);
              onClose();
            }}
            className="btn btn-secondary flex items-center gap-2 shadow-glow-orange"
          >
            <span>Finish Cooking 🎉</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CookingModeModal;
