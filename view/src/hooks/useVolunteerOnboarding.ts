import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/use-auth';
import { toast } from 'sonner';

interface VolunteerOnboardingForm {
  name: string;
  causes: string[];
  skills: string[];
}

export function useVolunteerOnboarding() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<VolunteerOnboardingForm>({
    name: '',
    causes: [],
    skills: [],
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        causes: user.volunteering?.causes ?? [],
        skills: (user.volunteering?.skills ?? []).map((s) => s.name),
      });
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
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
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

  return {
    form,
    submitting,
    toggleCause,
    toggleSkill,
    handleSubmit,
    setForm,
  };
}
