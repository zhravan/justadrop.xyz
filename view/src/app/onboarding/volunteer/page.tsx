'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Loader2, User, Sparkles } from 'lucide-react';
import { ViewHeader, ViewFooter } from '@/components/landing';
import { useAuth } from '@/lib/auth/use-auth';
import { useQueryClient } from '@tanstack/react-query';
import { VOLUNTEER_CAUSES, VOLUNTEER_SKILLS } from '@/lib/constants';
import { toast } from 'sonner';
import {
  FormField,
  FormInput,
  FormSection,
  ChipGroup,
  FormActions,
} from '@/components/ui/form';

export default function VolunteerOnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading, isReady } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    causes: [] as string[],
    skills: [] as string[],
  });

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name ?? '',
        causes: user.volunteering?.causes ?? [],
        skills: (user.volunteering?.skills ?? []).map((s) => s.name),
      }));
    }
  }, [user]);

  const toggleCause = (value: string) =>
    setForm((f) => ({
      ...f,
      causes: f.causes.includes(value) ? f.causes.filter((x) => x !== value) : [...f.causes, value],
    }));

  const toggleSkill = (skill: string) =>
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter((x) => x !== skill) : [...f.skills, skill],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: form.name,
          volunteering: {
            isInterest: true,
            skills: form.skills.map((name) => ({ name, expertise: 'intermediate' })),
            causes: form.causes,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Failed to save');
      toast.success('Volunteer profile saved');
      await queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
      router.push('/opportunities');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isReady || isLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <ViewHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-jad-primary border-t-transparent" />
            <p className="text-sm text-foreground/60">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.replace('/login?redirect=/onboarding/volunteer');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ViewHeader />
      <main className="flex-1 pt-20 pb-16 sm:pt-24">
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
              <h1 className="text-2xl font-bold text-jad-foreground sm:text-3xl">
                Volunteer profile
              </h1>
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
              <ChipGroup
                options={VOLUNTEER_CAUSES}
                selected={form.causes}
                onChange={toggleCause}
              />
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
              disabled={!form.name}
            />
          </form>
        </div>
      </main>
      <ViewFooter />
    </div>
  );
}
