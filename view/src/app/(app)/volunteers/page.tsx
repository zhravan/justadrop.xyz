'use client';

import { useState, useEffect, useCallback } from 'react';
import { VolunteerCard } from '@/components/volunteers/VolunteerCard';
import { VOLUNTEER_CAUSES, VOLUNTEER_SKILLS } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchableChipGroup } from '@/components/ui/form';
import { cn } from '@/lib/common';
import { Users, SlidersHorizontal, X, ChevronDown } from 'lucide-react';

function causeLabel(value: string) {
  return VOLUNTEER_CAUSES.find((c) => c.value === value)?.label ?? value;
}

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [causes, setCauses] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  const activeFilterCount = causes.length + skills.length;

  const clearAllFilters = () => {
    setCauses([]);
    setSkills([]);
  };

  const fetchVolunteers = useCallback(async () => {
    const params = new URLSearchParams();
    if (causes.length) params.set('causes', causes.join(','));
    if (skills.length) params.set('skills', skills.join(','));

    const res = await fetch(`/api/volunteers?${params}`, {
      credentials: 'include',
    });
    const data = await res.json();
    const items = data?.volunteers ?? [];
    const totalVal = data?.total ?? items.length;
    return { items, total: totalVal };
  }, [causes, skills]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchVolunteers()
      .then(({ items, total: t }) => {
        if (cancelled) return;
        setVolunteers(items);
        setTotal(t);
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
  }, [fetchVolunteers]);

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
      {/* Hero header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-jad-foreground sm:text-4xl">
          {isLoading ? (
            'Volunteers'
          ) : (
            <>
              <span className="text-jad-primary">{total}</span> {total === 1 ? 'person' : 'people'},
              united by purpose
            </>
          )}
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-foreground/60">
          People making a difference in their communities. Filter by cause or skill to find
          volunteers.
        </p>
      </div>

      <div className="mb-6 flex items-center">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all',
            filtersOpen || activeFilterCount > 0
              ? 'border-jad-primary/30 bg-jad-mint/40 text-jad-primary'
              : 'border-foreground/15 bg-white/80 text-foreground/70 hover:border-jad-primary/30 hover:bg-jad-mint/20'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-jad-primary px-1.5 text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={cn('h-3.5 w-3.5 transition-transform', filtersOpen && 'rotate-180')}
          />
        </button>
      </div>

      {/* Active filter badges (visible when panel is collapsed) */}
      {activeFilterCount > 0 && !filtersOpen && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {causes.map((c) => (
            <FilterBadge key={c} label={causeLabel(c)} onRemove={() => toggleCause(c)} />
          ))}
          {skills.map((s) => (
            <FilterBadge key={s} label={s} onRemove={() => toggleSkill(s)} />
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-medium text-foreground/50 hover:text-jad-primary transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Collapsible filters panel */}
      {filtersOpen && (
        <div className="mb-8 rounded-2xl border border-foreground/10 bg-white/80 backdrop-blur-sm p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-jad-foreground">Filter volunteers</h3>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-medium text-foreground/50 hover:text-jad-primary transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-foreground/60">Causes</label>
            <SearchableChipGroup
              options={VOLUNTEER_CAUSES}
              selected={causes}
              onChange={toggleCause}
              placeholder="Search causes…"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-foreground/60">Skills</label>
            <SearchableChipGroup
              options={VOLUNTEER_SKILLS.map((s) => ({ value: s, label: s }))}
              selected={skills}
              onChange={toggleSkill}
              placeholder="Search skills…"
              variant="mint"
            />
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : volunteers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-jad-primary/20 bg-jad-mint/20 py-16 text-center">
          <Users className="h-12 w-12 text-jad-primary/40" />
          <p className="mt-4 font-medium text-jad-foreground">
            {activeFilterCount > 0 ? 'No volunteers match your filters' : 'No volunteers yet'}
          </p>
          <p className="mt-1 text-sm text-foreground/60">
            {activeFilterCount > 0
              ? 'Try adjusting your filters or check back later.'
              : 'Be the first to complete your volunteer profile and appear here.'}
          </p>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-4 rounded-xl bg-jad-primary px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-jad-primary/25 transition-all hover:bg-jad-dark"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {volunteers.map((v) => (
            <VolunteerCard key={v.id} volunteer={v} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-jad-mint/50 border border-jad-primary/20 px-3 py-1 text-xs font-medium text-jad-foreground capitalize">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 text-foreground/40 hover:bg-jad-primary/10 hover:text-jad-primary transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
