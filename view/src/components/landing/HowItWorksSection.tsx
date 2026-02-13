'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  FileEdit,
  Compass,
  Building2,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { buttonVariants } from '@/lib/common';
import { cn } from '@/lib/common';

const VOLUNTEER_STEPS = [
  {
    number: 1,
    title: 'Sign up',
    description: 'Create your account in seconds.',
    icon: UserPlus,
    href: '/signup',
    cta: 'Sign up',
  },
  {
    number: 2,
    title: 'Fill your details',
    description: 'Add your skills, causes, and availability to your profile.',
    icon: FileEdit,
  },
  {
    number: 3,
    title: 'Explore & apply',
    description: 'Discover opportunities near you and apply to causes that matter.',
    icon: Compass,
  },
];

const NGO_STEPS = [
  {
    number: 1,
    title: 'Sign up',
    description: 'Create your organisation account.',
    icon: UserPlus,
    href: '/signup',
    cta: 'Sign up',
  },
  {
    number: 2,
    title: 'Fill your details',
    description: 'Complete your profile and contact information.',
    icon: FileEdit,
  },
  {
    number: 3,
    title: 'Create NGO',
    description: 'Add your NGO details, mission, and documentation.',
    icon: Building2,
  },
  {
    number: 4,
    title: 'Wait for approval',
    description: 'Our team verifies your organisation. You’ll be notified once approved.',
    icon: Clock,
  },
  {
    number: 5,
    title: 'Create & manage',
    description: 'Post opportunities, coordinate volunteers, and track impact.',
    icon: Sparkles,
    badge: 'Upon approval',
  },
];

type FlowType = 'volunteer' | 'ngo';

export function HowItWorksSection() {
  const [flow, setFlow] = useState<FlowType>('volunteer');

  return (
    <section className="relative overflow-hidden bg-jad-primary py-24 md:py-32">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-jad-accent/20 blur-3xl"
        aria-hidden
      />

      <div className="container relative z-10">
        <header className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-jad-mint md:text-4xl lg:text-5xl">
            How it works
          </h2>
          <p className="mt-4 text-lg font-medium tracking-wide text-jad-mint/90 md:text-xl">
            Choose your path and get started
          </p>

          {/* Flow toggle */}
          <div className="mt-10 inline-flex rounded-2xl border-2 border-jad-mint/30 bg-jad-dark/50 p-1.5">
            <button
              type="button"
              onClick={() => setFlow('volunteer')}
              className={cn(
                'flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200',
                flow === 'volunteer'
                  ? 'bg-jad-mint text-jad-foreground shadow-lg'
                  : 'text-jad-mint/80 hover:bg-jad-mint/10 hover:text-jad-mint'
              )}
            >
              <UserPlus className="h-4 w-4" />
              As Volunteer
            </button>
            <button
              type="button"
              onClick={() => setFlow('ngo')}
              className={cn(
                'flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200',
                flow === 'ngo'
                  ? 'bg-jad-mint text-jad-foreground shadow-lg'
                  : 'text-jad-mint/80 hover:bg-jad-mint/10 hover:text-jad-mint'
              )}
            >
              <Building2 className="h-4 w-4" />
              As NGO
            </button>
          </div>
        </header>

        {/* Steps */}
        <div className="mt-16">
          {flow === 'volunteer' ? (
            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              {VOLUNTEER_STEPS.map((step, i) => (
                <StepCard key={step.number} step={step} index={i} total={3} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto pb-4 scrollbar-hide md:overflow-visible">
              <div className="flex min-w-0 gap-6 md:grid md:min-w-full md:grid-cols-5 md:gap-4">
                {NGO_STEPS.map((step, i) => (
                  <StepCard
                    key={step.number}
                    step={step}
                    index={i}
                    total={5}
                    compact
                    showConnector={i < 4}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface StepCardProps {
  step: (typeof VOLUNTEER_STEPS)[0] | (typeof NGO_STEPS)[0];
  index: number;
  total: number;
  compact?: boolean;
  showConnector?: boolean;
}

function StepCard({
  step,
  index,
  total,
  compact = false,
  showConnector = false,
}: StepCardProps) {
  const StepIcon = step.icon;

  return (
    <div className="relative flex min-w-[280px] shrink-0 md:min-w-0">
      <div
        className={cn(
          'group relative flex flex-col overflow-hidden rounded-2xl border-2 border-jad-accent/40 bg-jad-dark/90 p-6 shadow-xl backdrop-blur',
          'transition-all duration-300 hover:-translate-y-1 hover:border-jad-mint/50 hover:shadow-jad-accent/20',
          compact && 'md:p-5'
        )}
      >
        {step.badge && (
          <span className="absolute right-4 top-4 rounded-full bg-jad-accent/30 px-2.5 py-1 text-xs font-semibold text-jad-mint">
            {step.badge}
          </span>
        )}
        <span
          className={cn(
            'absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-jad-mint/20 text-sm font-bold text-jad-mint',
            step.badge && 'right-4 top-14'
          )}
        >
          {step.number}
        </span>

        <div
          className={cn(
            'flex items-center justify-center rounded-xl border-2 border-dashed border-jad-mint/30 bg-jad-dark',
            compact ? 'mb-5 h-20' : 'mb-6 h-24'
          )}
        >
          <StepIcon
            className={cn(
              'text-jad-mint/70',
              compact ? 'h-10 w-10' : 'h-12 w-12'
            )}
            strokeWidth={1.5}
          />
        </div>

        <h3
          className={cn(
            'font-bold tracking-tight text-jad-mint',
            compact ? 'text-lg' : 'text-xl md:text-2xl'
          )}
        >
          {step.number}. {step.title}
        </h3>
        <p
          className={cn(
            'mt-2 leading-relaxed text-jad-mint/90',
            compact ? 'text-sm' : 'text-base'
          )}
        >
          {step.description}
        </p>

        {'href' in step && step.href ? (
          <div className="mt-6 flex-1">
            <Link
              href={step.href}
              className={cn(
                buttonVariants({ variant: 'jad-mint', size: compact ? 'default' : 'lg' }),
                'group/btn flex w-full items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                compact && 'px-4 py-2'
              )}
            >
              {step.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </div>
        ) : null}
      </div>

      {/* Connector arrow (NGO flow) */}
      {showConnector && (
        <div className="absolute -right-2 top-1/2 hidden -translate-y-1/2 md:flex">
          <ArrowRight className="h-6 w-6 text-jad-mint/40" strokeWidth={2} />
        </div>
      )}
    </div>
  );
}
