'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/common';
import { VOLUNTEER_STEPS, NGO_STEPS, type HowItWorksFlowType } from '@/lib/constants';

export function HowItWorksSection() {
  const [flow, setFlow] = useState<HowItWorksFlowType>('volunteer');
  const steps = flow === 'volunteer' ? VOLUNTEER_STEPS : NGO_STEPS;

  return (
    <section className="bg-jad-primary py-12 sm:py-16 md:py-20">
      <div className="container">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-jad-mint sm:text-2xl md:text-3xl">
              How it works
            </h2>
            <p className="mt-1 text-sm text-jad-mint/80">
              Choose your path
            </p>
          </div>
          <div className="flex rounded-full bg-jad-dark/60 p-1">
            <button
              type="button"
              onClick={() => setFlow('volunteer')}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all',
                flow === 'volunteer'
                  ? 'bg-jad-mint text-jad-foreground'
                  : 'text-jad-mint/70 hover:text-jad-mint'
              )}
            >
              Volunteer
            </button>
            <button
              type="button"
              onClick={() => setFlow('ngo')}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all',
                flow === 'ngo'
                  ? 'bg-jad-mint text-jad-foreground'
                  : 'text-jad-mint/70 hover:text-jad-mint'
              )}
            >
              NGO
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-xl border border-jad-mint/20 bg-jad-dark/80 px-4 py-3.5 transition-colors hover:border-jad-mint/30"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-jad-mint/20 text-xs font-bold text-jad-mint">
                  {step.number}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-jad-mint">
                      {step.title}
                    </h3>
                    {step.badge && (
                      <span className="text-[10px] text-jad-mint/60">
                        {step.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-jad-mint/80">
                    {step.description}
                  </p>
                  {step.href && (
                    <Link
                      href={step.href}
                      className="mt-2.5 inline-flex items-center gap-1 rounded-lg bg-jad-mint px-2.5 py-1 text-xs font-semibold text-jad-foreground transition-opacity hover:opacity-90"
                    >
                      Sign up
                      <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
