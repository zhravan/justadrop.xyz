'use client';

import { useState, useEffect } from 'react';
import { VolunteerCard } from '@/components/volunteers/VolunteerCard';
import { VOLUNTEER_CAUSES, VOLUNTEER_SKILLS } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [causes, setCauses] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (causes.length) params.set('causes', causes.join(','));
    if (skills.length) params.set('skills', skills.join(','));

    let cancelled = false;
    setIsLoading(true);
    fetch(`/api/volunteers?${params}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const items = data?.volunteers ?? [];
        setVolunteers(items);
        setTotal(data?.total ?? items.length);
      })
      .catch(() => {
        if (!cancelled) setVolunteers([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [causes, skills]);

  const toggleSkill = (value: string) => {
    setSkills((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const toggleCause = (value: string) => {
    setCauses((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  return (
    <div className="container">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-jad-foreground sm:text-3xl">
          Volunteers
        </h1>
        <p className="mt-1 text-foreground/70">
          People making a difference in their communities.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground/70">Causes:</span>
          {VOLUNTEER_CAUSES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => toggleCause(value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              causes.includes(value)
                ? 'bg-jad-primary text-white shadow-md'
                : 'border border-foreground/20 bg-white text-foreground/80 hover:border-jad-primary/40'
            }`}
          >
            {label}
          </button>
        ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground/70">Skills:</span>
          {(VOLUNTEER_SKILLS as readonly string[]).map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                skills.includes(skill)
                  ? 'bg-jad-primary text-white shadow-md'
                  : 'border border-foreground/20 bg-white text-foreground/80 hover:border-jad-primary/40'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : volunteers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-jad-primary/20 bg-jad-mint/20 py-16 text-center">
          <Users className="h-12 w-12 text-jad-primary/40" />
          <p className="mt-4 font-medium text-jad-foreground">No volunteers yet</p>
          <p className="mt-1 text-sm text-foreground/60">
            Be the first to complete your volunteer profile and appear here
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {volunteers.map((v) => (
            <VolunteerCard key={v.id} volunteer={v} />
          ))}
        </div>
      )}
    </div>
  );
}
