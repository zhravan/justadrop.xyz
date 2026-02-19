'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, User, Sparkles, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/use-auth';
import { VOLUNTEER_CAUSES, VOLUNTEER_SKILLS } from '@/lib/constants';
import { FormPageSkeleton } from '@/components/skeletons';
import { FormField, FormInput, FormSection, ChipGroup, StepperWizard } from '@/components/ui/form';
import type { WizardStep } from '@/components/ui/form';
import { useVolunteerOnboarding } from '@/hooks';

function SaveIndicator({ status }: { status: string }) {
  if (status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-foreground/50">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving…
      </span>
    );
  }
  if (status === 'saved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-jad-primary">
        <Check className="h-3 w-3" />
        Saved
      </span>
    );
  }
  return null;
}

export default function VolunteerOnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isReady } = useAuth();
  const { form, saveStatus, updateName, toggleCause, toggleSkill } = useVolunteerOnboarding();
  const [activeStep, setActiveStep] = useState('name');

  if (!isReady || isLoading || !user) {
    return <FormPageSkeleton />;
  }

  if (!isAuthenticated) {
    router.replace('/login?redirect=/onboarding/volunteer');
    return null;
  }

  const steps: WizardStep[] = [
    {
      id: 'name',
      label: 'Basic info',
      icon: <User className="h-5 w-5" />,
      isComplete: !!form.name.trim(),
      content: (
        <FormSection
          title="Basic info"
          description="We'll use this to personalise your experience"
          icon={<User className="h-5 w-5" />}
        >
          <FormField label="Full name" htmlFor="name" required>
            <FormInput
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => updateName(e.target.value)}
              placeholder="Your name"
            />
          </FormField>
        </FormSection>
      ),
    },
    {
      id: 'causes',
      label: 'Causes',
      icon: <Heart className="h-5 w-5" />,
      isComplete: form.causes.length > 0,
      content: (
        <FormSection
          title="Causes you care about"
          description="Select all that resonate with you"
          icon={<Heart className="h-5 w-5" />}
        >
          <ChipGroup options={VOLUNTEER_CAUSES} selected={form.causes} onChange={toggleCause} />
        </FormSection>
      ),
    },
    {
      id: 'skills',
      label: 'Skills',
      icon: <Sparkles className="h-5 w-5" />,
      isComplete: form.skills.length > 0,
      content: (
        <FormSection
          title="Skills (optional)"
          description="Add skills that could help organisations"
          icon={<Sparkles className="h-5 w-5" />}
        >
          <ChipGroup
            options={VOLUNTEER_SKILLS.map((s) => ({ value: s, label: s }))}
            selected={form.skills}
            onChange={toggleSkill}
            variant="mint"
          />
        </FormSection>
      ),
    },
  ];

  const allDone = !!form.name.trim() && form.causes.length > 0;

  return (
    <div className="container max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-jad-mint text-jad-primary shadow-lg shadow-jad-primary/10">
          <Heart className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-jad-foreground sm:text-3xl">Volunteer profile</h1>
          <p className="mt-1 text-sm text-foreground/70">
            Tell us about yourself so we can match you with the right opportunities.
          </p>
        </div>
      </div>

      <StepperWizard
        steps={steps}
        activeStep={activeStep}
        onStepChange={setActiveStep}
        headerExtra={<SaveIndicator status={saveStatus} />}
      />

      {/* Navigation actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard"
          className="order-2 sm:order-1 text-center text-sm font-medium text-foreground/70 hover:text-jad-primary transition-colors"
        >
          Skip for now — go to dashboard
        </Link>
        {allDone && (
          <Link
            href="/opportunities"
            className="order-1 sm:order-2 flex items-center justify-center gap-2 rounded-xl bg-jad-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-jad-primary/25 transition-all hover:bg-jad-dark hover:shadow-xl"
          >
            Browse opportunities →
          </Link>
        )}
      </div>
    </div>
  );
}
