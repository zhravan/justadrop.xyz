import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/use-auth';
import { toast } from 'sonner';

interface VolunteerOnboardingForm {
  name: string;
  causes: string[];
  skills: string[];
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function formsEqual(a: VolunteerOnboardingForm, b: VolunteerOnboardingForm): boolean {
  return (
    a.name === b.name &&
    JSON.stringify(a.causes) === JSON.stringify(b.causes) &&
    JSON.stringify(a.skills) === JSON.stringify(b.skills)
  );
}

const DEBOUNCE_MS = 800;

export function useVolunteerOnboarding() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [form, setForm] = useState<VolunteerOnboardingForm>({
    name: '',
    causes: [],
    skills: [],
  });

  const lastSavedRef = useRef<VolunteerOnboardingForm>(form);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const isMountedRef = useRef(true);
  const hydratedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (user && !hydratedRef.current) {
      hydratedRef.current = true;
      const serverForm: VolunteerOnboardingForm = {
        name: user.name ?? '',
        causes: user.volunteering?.causes ?? [],
        skills: (user.volunteering?.skills ?? []).map((s) => s.name),
      };
      setForm(serverForm);
      lastSavedRef.current = serverForm;
    }
  }, [user]);

  const save = useCallback(
    async (formToSave: VolunteerOnboardingForm) => {
      if (formsEqual(formToSave, lastSavedRef.current)) return;
      if (savingRef.current) return;

      savingRef.current = true;
      setSaveStatus('saving');
      try {
        const res = await fetch('/api/users/me', {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formToSave.name || undefined,
            volunteering: {
              isInterest: true,
              skills: formToSave.skills.map((name) => ({ name, expertise: 'intermediate' })),
              causes: formToSave.causes,
            },
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? 'Failed to save');

        lastSavedRef.current = formToSave;

        if (data.user) {
          queryClient.setQueryData(['auth', 'session'], data.user);
        }

        if (isMountedRef.current) {
          setSaveStatus('saved');
          toast.success('Progress saved');
        }
      } catch (err) {
        if (isMountedRef.current) setSaveStatus('error');
        toast.error(err instanceof Error ? err.message : 'Failed to save');
      } finally {
        savingRef.current = false;
      }
    },
    [queryClient]
  );

  const scheduleSave = useCallback(
    (nextForm: VolunteerOnboardingForm) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => save(nextForm), DEBOUNCE_MS);
    },
    [save]
  );

  const saveImmediately = useCallback(
    (nextForm: VolunteerOnboardingForm) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      save(nextForm);
    },
    [save]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const updateName = useCallback(
    (value: string) => {
      setForm((f) => {
        const next = { ...f, name: value };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const toggleCause = useCallback(
    (value: string) => {
      setForm((f) => {
        const next = {
          ...f,
          causes: f.causes.includes(value)
            ? f.causes.filter((x) => x !== value)
            : [...f.causes, value],
        };
        saveImmediately(next);
        return next;
      });
    },
    [saveImmediately]
  );

  const toggleSkill = useCallback(
    (skill: string) => {
      setForm((f) => {
        const next = {
          ...f,
          skills: f.skills.includes(skill)
            ? f.skills.filter((x) => x !== skill)
            : [...f.skills, skill],
        };
        saveImmediately(next);
        return next;
      });
    },
    [saveImmediately]
  );

  return {
    form,
    saveStatus,
    updateName,
    toggleCause,
    toggleSkill,
    setForm,
  };
}
