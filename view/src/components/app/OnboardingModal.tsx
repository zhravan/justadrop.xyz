'use client';

import { useRouter } from 'next/navigation';
import { X, Heart, Building2, ArrowRight } from 'lucide-react';

const ONBOARDING_COMPLETE_KEY = 'juztadrop_onboarding_complete';

interface OnboardingModalProps {
  onClose: () => void;
}

export function OnboardingModal({ onClose }: OnboardingModalProps) {
  const router = useRouter();

  const handleSelect = (path: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    }
    onClose();
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-3xl rounded-2xl border border-foreground/10 bg-white p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-jad-foreground sm:text-3xl">
              What would you like to do?
            </h2>
            <p className="mt-2 text-foreground/70">
              You can do both — volunteer and run an NGO. Pick where to start.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-foreground/70 hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Volunteer path */}
          <button
            type="button"
            onClick={() => handleSelect('/onboarding/volunteer')}
            className="group relative overflow-hidden rounded-2xl border-2 border-jad-primary/20 bg-white p-8 text-left shadow-lg shadow-jad-foreground/5 transition-all duration-300 hover:border-jad-primary/40 hover:shadow-xl hover:shadow-jad-primary/15 hover:-translate-y-1"
          >
            <div className="absolute right-4 top-4 rounded-full bg-jad-mint/50 p-2 transition-colors group-hover:bg-jad-mint">
              <ArrowRight className="h-5 w-5 text-jad-primary" strokeWidth={2.5} />
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-jad-mint to-jad-mint/60 text-3xl">
              <Heart className="h-8 w-8 text-jad-primary" strokeWidth={2} />
            </div>
            <h3 className="mt-5 text-xl font-bold text-jad-foreground">Start volunteering</h3>
            <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
              Browse opportunities, apply to causes you care about, and make an impact.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-jad-primary group-hover:underline">
              Set up profile →
            </span>
          </button>

          {/* Create NGO path */}
          <button
            type="button"
            onClick={() => handleSelect('/organisations/create')}
            className="group relative overflow-hidden rounded-2xl border-2 border-jad-primary/20 bg-white p-8 text-left shadow-lg shadow-jad-foreground/5 transition-all duration-300 hover:border-jad-primary/40 hover:shadow-xl hover:shadow-jad-primary/15 hover:-translate-y-1"
          >
            <div className="absolute right-4 top-4 rounded-full bg-jad-mint/50 p-2 transition-colors group-hover:bg-jad-mint">
              <ArrowRight className="h-5 w-5 text-jad-primary" strokeWidth={2.5} />
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-jad-mint to-jad-mint/60 text-3xl">
              <Building2 className="h-8 w-8 text-jad-primary" strokeWidth={2} />
            </div>
            <h3 className="mt-5 text-xl font-bold text-jad-foreground">Create an NGO</h3>
            <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
              Register your organisation and post opportunities for volunteers.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-jad-primary group-hover:underline">
              Create organisation →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
