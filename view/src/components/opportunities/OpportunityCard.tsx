'use client';

import Link from 'next/link';
import { MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { cn } from '@/lib/common';

export interface OpportunityCardData {
  id: string;
  title: string;
  orgName: string;
  orgVerificationStatus?: string;
  city?: string | null;
  state?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  opportunityMode: string;
  causeCategoryNames: string[];
}

function formatDate(d: string | Date | null): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateRange(start?: string | Date | null, end?: string | Date | null): string {
  if (!start && !end) return 'Ongoing';
  if (!end || String(start) === String(end)) return formatDate(start ?? null);
  return `${formatDate(start ?? null)} – ${formatDate(end ?? null)}`;
}

function formatTime(start?: string | null, end?: string | null): string {
  if (!start && !end) return '';
  if (!end) return start ?? '';
  return `${start ?? '?'} – ${end}`;
}

function modeLabel(mode: string): string {
  const map: Record<string, string> = {
    onsite: 'Onsite',
    remote: 'Remote',
    hybrid: 'Hybrid',
  };
  return map[mode] ?? mode;
}

export function OpportunityCard({ opportunity, className }: { opportunity: OpportunityCardData; className?: string }) {
  const dateStr = formatDateRange(opportunity.startDate, opportunity.endDate);
  const timeStr = formatTime(opportunity.startTime, opportunity.endTime);
  const location = [opportunity.city, opportunity.state].filter(Boolean).join(', ');

  return (
    <Link
      href={`/opportunities/${opportunity.id}`}
      className={cn(
        'group flex flex-col rounded-2xl border border-foreground/10 bg-white p-5 shadow-lg shadow-foreground/5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-jad-primary/10',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold text-jad-foreground line-clamp-2">{opportunity.title}</h3>
        <span className="shrink-0 rounded-full bg-jad-primary/10 p-1.5 text-jad-primary opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-sm font-medium text-jad-primary">{opportunity.orgName}</span>
        {opportunity.orgVerificationStatus === 'verified' && (
          <VerifiedBadge />
        )}
      </div>
      {opportunity.causeCategoryNames?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {opportunity.causeCategoryNames.slice(0, 3).map((c) => (
            <span
              key={c}
              className="rounded-full bg-jad-mint/50 px-2 py-0.5 text-xs font-medium text-jad-foreground"
            >
              {c.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}
      {location && (
        <p className="mt-3 flex items-center gap-2 text-sm text-foreground/70">
          <MapPin className="h-4 w-4 shrink-0 text-jad-primary" />
          {location}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-foreground/60">
        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-jad-primary/70" />
          {dateStr || 'TBD'}
        </span>
        {timeStr && (
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-jad-primary/70" />
            {timeStr}
          </span>
        )}
        <span className="rounded-full border border-foreground/20 px-2 py-0.5 text-xs font-medium">
          {modeLabel(opportunity.opportunityMode)}
        </span>
      </div>
    </Link>
  );
}
