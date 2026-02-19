import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/use-auth';
import { toast } from 'sonner';

interface ProfileForm {
  name: string;
  phone: string;
  gender: string;
  causes: string[];
  skills: Array<{ name: string; expertise: string }>;
}

export function useProfileForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    phone: '',
    gender: '',
    causes: [],
    skills: [],
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        phone: user.phone ?? '',
        gender: user.gender ?? '',
        causes: user.volunteering?.causes ?? [],
        skills:
          user.volunteering?.skills?.map((s) => ({
            name: s.name,
            expertise: s.expertise || 'intermediate',
          })) ?? [],
      });
    }
  }, [user]);

  const toggleCause = (value: string) =>
    setForm((f) => ({
      ...f,
      causes: f.causes.includes(value) ? f.causes.filter((x) => x !== value) : [...f.causes, value],
    }));

  const toggleSkill = (skill: string) => {
    setForm((f) => {
      const exists = f.skills.find((s) => s.name === skill);
      if (exists) {
        return { ...f, skills: f.skills.filter((s) => s.name !== skill) };
      }
      return { ...f, skills: [...f.skills, { name: skill, expertise: 'intermediate' }] };
    });
  };

  const setSkillExpertise = (skillName: string, expertise: string) =>
    setForm((f) => ({
      ...f,
      skills: f.skills.map((s) => (s.name === skillName ? { ...s, expertise } : s)),
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
          name: form.name || undefined,
          phone: form.phone || undefined,
          gender: form.gender || undefined,
          volunteering: {
            isInterest: form.causes.length > 0 || form.skills.length > 0,
            skills: form.skills,
            causes: form.causes,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Failed to update profile');
      toast.success('Profile updated successfully');
      await queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    submitting,
    toggleCause,
    toggleSkill,
    setSkillExpertise,
    handleSubmit,
    setForm,
  };
}
