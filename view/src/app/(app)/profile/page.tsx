'use client';

import { useRouter } from 'next/navigation';
import { User, Phone, Mail, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import {
  VOLUNTEER_CAUSES,
  VOLUNTEER_SKILLS,
  SKILL_EXPERTISE,
  GENDER_OPTIONS,
} from '@/lib/constants';
import { cn } from '@/lib/common';
import { FormPageSkeleton } from '@/components/skeletons';
import { FormField, FormInput, FormSection, ChipGroup, FormActions } from '@/components/ui/form';
import { useProfileForm } from '@/hooks';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isReady } = useAuth();
  const { form, submitting, toggleCause, toggleSkill, setSkillExpertise, handleSubmit, setForm } =
    useProfileForm();

  if (!isReady || isLoading || !user) {
    return <FormPageSkeleton />;
  }

  if (!isAuthenticated) {
    router.replace('/login?redirect=/profile');
    return null;
  }

  return (
    <div className="container max-w-2xl">
      <div className="flex items-center gap-4 mb-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-jad-mint text-jad-primary shadow-lg shadow-jad-primary/10">
          <User className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-jad-foreground sm:text-3xl">Your profile</h1>
          <p className="mt-1 text-sm text-foreground/70">
            Manage your personal details and volunteering preferences.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <FormSection
          title="Account"
          description="Your sign-in email cannot be changed"
          icon={<Mail className="h-5 w-5" />}
        >
          <FormField label="Email">
            <FormInput
              type="email"
              value={user.email}
              disabled
              className="bg-foreground/5 cursor-not-allowed"
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Personal details"
          description="How we address you and reach you"
          icon={<User className="h-5 w-5" />}
        >
          <FormField label="Full name" htmlFor="name">
            <FormInput
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
            />
          </FormField>
          <FormField label="Phone" htmlFor="phone" hint="Optional">
            <FormInput
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
              icon={<Phone className="h-5 w-5" />}
            />
          </FormField>
          <FormField label="Gender" hint="Optional">
            <ChipGroup
              options={GENDER_OPTIONS}
              selected={form.gender ? [form.gender] : []}
              onChange={(value) =>
                setForm((f) => ({
                  ...f,
                  gender: f.gender === value ? '' : value,
                }))
              }
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Causes you care about"
          description="Select causes that resonate with you"
          icon={<Heart className="h-5 w-5" />}
        >
          <ChipGroup options={VOLUNTEER_CAUSES} selected={form.causes} onChange={toggleCause} />
        </FormSection>

        <FormSection
          title="Skills & expertise"
          description="Add skills and set your proficiency level"
          icon={<Sparkles className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {VOLUNTEER_SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                    form.skills.some((s) => s.name === skill)
                      ? 'bg-jad-mint text-jad-foreground border border-jad-primary/30'
                      : 'border border-foreground/20 bg-white text-foreground/80 hover:border-jad-primary/40'
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>
            {form.skills.length > 0 && (
              <div className="rounded-xl border border-jad-primary/20 bg-jad-mint/10 p-4 space-y-3">
                <p className="text-xs font-medium text-foreground/70">Expertise level</p>
                <div className="space-y-2">
                  {form.skills.map((s) => (
                    <div key={s.name} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-jad-foreground">{s.name}</span>
                      <select
                        value={s.expertise}
                        onChange={(e) => setSkillExpertise(s.name, e.target.value)}
                        className="rounded-lg border border-foreground/15 bg-white px-3 py-1.5 text-sm text-jad-foreground min-w-[100px]"
                      >
                        {SKILL_EXPERTISE.map((exp) => (
                          <option key={exp} value={exp}>
                            {exp}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FormSection>

        <FormActions submitLabel="Save changes" loading={submitting} />
      </form>
    </div>
  );
}
