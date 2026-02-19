'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/common';

export interface WizardStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  /** Optional — mark step as complete (shows checkmark) */
  isComplete?: boolean;
}

export interface StepperWizardProps {
  steps: WizardStep[];
  activeStep: string;
  onStepChange: (stepId: string) => void;
  className?: string;
  /** Render slot next to the title (e.g. save indicator) */
  headerExtra?: React.ReactNode;
}

export function StepperWizard({
  steps,
  activeStep,
  onStepChange,
  className,
  headerExtra,
}: StepperWizardProps) {
  const activeIndex = steps.findIndex((s) => s.id === activeStep);
  const currentStep = steps[activeIndex];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step indicators */}
      <nav className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {steps.map((step, i) => {
          const isActive = step.id === activeStep;
          const isComplete = step.isComplete && !isActive;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(step.id)}
              className={cn(
                'group relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap',
                isActive
                  ? 'bg-jad-primary text-white shadow-md shadow-jad-primary/20'
                  : isComplete
                    ? 'bg-jad-mint/60 text-jad-foreground hover:bg-jad-mint'
                    : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground/80'
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all',
                  isActive
                    ? 'bg-white/20 text-white'
                    : isComplete
                      ? 'bg-jad-primary/15 text-jad-primary'
                      : 'bg-foreground/10 text-foreground/50'
                )}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          );
        })}
        {headerExtra && <div className="ml-auto shrink-0 pl-2">{headerExtra}</div>}
      </nav>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-foreground/5">
        <div
          className="h-full rounded-full bg-jad-primary transition-all duration-500 ease-out"
          style={{ width: `${((activeIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Active step content */}
      {currentStep && (
        <div className="animate-in fade-in slide-in-from-right-2 duration-200">
          {currentStep.content}
        </div>
      )}
    </div>
  );
}
