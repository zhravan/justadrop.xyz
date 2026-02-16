'use client';

import { BadgeCheck } from 'lucide-react';

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700 ${className ?? ''}`}
      title="Verified organization"
    >
      <BadgeCheck className="h-3 w-3" />
      Verified
    </span>
  );
}
