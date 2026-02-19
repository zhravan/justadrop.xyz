'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, User, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import { VOLUNTEER_CAUSES, VOLUNTEER_SKILLS } from '@/lib/constants';
import { FormPageSkeleton } from '@/components/skeletons';
import { FormField, FormInput, FormSection, ChipGroup, FormActions } from '@/components/ui/form';
import { useVolunteerOnboarding } from '@/hooks';

export default function VolunteerOnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isReady } = useAuth();
  const { form, submitting, toggleCause, toggleSkill, handleSubmit } = useVolunteerOnboarding();

  if (!isReady || isLoading || !user) {
    return <FormPageSkeleton />;
  }

  if (!isAuthenticated) {
    router.replace('/login?redirect=/onboarding/volunteer');
    return null;
  }

  return (
    <div className="container max-w-2xl">
      <Link
        href="/onboarding"
        className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-jad-primary transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="flex items-center gap-4 mb-10">
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

      <form onSubmit={handleSubmit} className="space-y-8">
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
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              required
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Causes you care about"
          description="Select all that resonate with you"
          icon={<Heart className="h-5 w-5" />}
        >
          <ChipGroup options={VOLUNTEER_CAUSES} selected={form.causes} onChange={toggleCause} />
        </FormSection>

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

        <FormActions
          submitLabel="Save & browse opportunities"
          secondaryLabel="Skip for now — go to dashboard"
          secondaryHref="/dashboard"
          loading={submitting}
          disabled={!form.name.trim()}
        />
      </form>
    </div>
  );
}
