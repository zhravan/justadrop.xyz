'use client';

import { User, Heart } from 'lucide-react';
import { cn } from '@/lib/common';

export interface VolunteerCardData {
  id: string;
  name: string | null;
  email: string;
  causes: string[];
  skills: Array<{ name: string; expertise: string }>;
}

function getInitials(name: string | null, email: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return '?';
}

export function VolunteerCard({ volunteer, className }: { volunteer: VolunteerCardData; className?: string }) {
  const initials = getInitials(volunteer.name, volunteer.email);
  const displayName = volunteer.name || 'Volunteer';
  const skillsList = volunteer.skills?.slice(0, 3).map((s) => s.name) ?? [];

  return (
    <div
      className={cn(
        'rounded-2xl border border-foreground/10 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-jad-mint text-lg font-bold text-jad-primary">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-jad-foreground">{displayName}</h3>
          {volunteer.causes?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {volunteer.causes.slice(0, 4).map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-jad-mint/50 px-2 py-0.5 text-xs text-jad-foreground"
                >
                  {c.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
          {skillsList.length > 0 && (
            <p className="mt-2 text-sm text-foreground/70">
              Skills: {skillsList.join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
