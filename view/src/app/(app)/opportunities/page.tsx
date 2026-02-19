'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { OpportunityCardSkeleton } from '@/components/opportunities/OpportunityCardSkeleton';
import { VOLUNTEER_CAUSES, LOCATIONS } from '@/lib/constants';
import { cn } from '@/lib/common';
import { Heart, Loader2, SlidersHorizontal, X, ChevronDown } from 'lucide-react';

const PAGE_SIZE = 12;

function causeLabel(value: string) {
  return VOLUNTEER_CAUSES.find((c) => c.value === value)?.label ?? value;
}

export default function OpportunitiesPage() {
  const searchParams = useSearchParams();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [city, setCity] = useState(searchParams.get('city') || '');
  const [causes, setCauses] = useState<string[]>(() => {
    const c = searchParams.get('causes');
    return c ? c.split(',') : [];
  });
  const [mode, setMode] = useState(searchParams.get('mode') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

  const activeFilterCount =
    (city ? 1 : 0) + (mode ? 1 : 0) + causes.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  const clearAllFilters = () => {
    setCity('');
    setCauses([]);
    setMode('');
    setDateFrom('');
    setDateTo('');
  };

  const fetchOpportunities = useCallback(
    async (off: number) => {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (causes.length) params.set('causes', causes.join(','));
      if (mode) params.set('opportunityMode', mode);
      if (dateFrom) params.set('startDateFrom', dateFrom);
      if (dateTo) params.set('startDateTo', dateTo);
      params.set('limit', String(PAGE_SIZE));
      params.set('offset', String(off));

      const res = await fetch(`/api/opportunities?${params}`, {
        credentials: 'include',
      });
      const data = await res.json();
      const items = data?.opportunities ?? [];
      const totalVal = data?.total ?? items.length;
      return { items, total: totalVal };
    },
    [city, causes, mode, dateFrom, dateTo]
  );

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchOpportunities(0)
      .then(({ items, total: t }) => {
        if (cancelled) return;
        setOpportunities(items);
        setTotal(t);
      })
      .catch(() => {
        if (!cancelled) setOpportunities([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchOpportunities]);

  const handleLoadMore = () => {
    const newOffset = opportunities.length;
    setLoadingMore(true);
    fetchOpportunities(newOffset)
      .then(({ items, total: t }) => {
        setOpportunities((prev) => [...prev, ...items]);
        setTotal(t);
      })
      .finally(() => setLoadingMore(false));
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
            'Opportunities'
          ) : (
            <>
              <span className="text-jad-primary">{total}</span>{' '}
              {total === 1 ? 'opportunity' : 'opportunities'}, waiting for you
            </>
          )}
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-foreground/60">
          Find volunteering opportunities that match your interests. Filter by location, mode, or
          cause.
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

      {/* Active filter badges (always visible when filters are applied) */}
      {activeFilterCount > 0 && !filtersOpen && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {city && <FilterBadge label={city} onRemove={() => setCity('')} />}
          {mode && <FilterBadge label={mode} onRemove={() => setMode('')} />}
          {causes.map((c) => (
            <FilterBadge key={c} label={causeLabel(c)} onRemove={() => toggleCause(c)} />
          ))}
          {dateFrom && <FilterBadge label={`From ${dateFrom}`} onRemove={() => setDateFrom('')} />}
          {dateTo && <FilterBadge label={`To ${dateTo}`} onRemove={() => setDateTo('')} />}
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
            <h3 className="text-sm font-semibold text-jad-foreground">Filter opportunities</h3>
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

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/60">
                Location
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-foreground/15 bg-white px-3.5 py-2.5 text-sm focus:border-jad-primary/40 focus:outline-none focus:ring-2 focus:ring-jad-primary/20"
              >
                <option value="">All cities</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/60">Mode</label>
              <div className="flex rounded-xl border border-foreground/15 bg-white p-0.5">
                {['', 'onsite', 'remote', 'hybrid'].map((m) => (
                  <button
                    key={m || 'all'}
                    type="button"
                    onClick={() => setMode(m)}
                    className={cn(
                      'flex-1 rounded-lg px-2 py-2 text-xs font-medium capitalize transition-all',
                      mode === m
                        ? 'bg-jad-primary text-white shadow-sm'
                        : 'text-foreground/60 hover:text-foreground/80'
                    )}
                  >
                    {m || 'All'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/60">
                From date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-xl border border-foreground/15 bg-white px-3.5 py-2.5 text-sm focus:border-jad-primary/40 focus:outline-none focus:ring-2 focus:ring-jad-primary/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/60">To date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-xl border border-foreground/15 bg-white px-3.5 py-2.5 text-sm focus:border-jad-primary/40 focus:outline-none focus:ring-2 focus:ring-jad-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-foreground/60">Causes</label>
            <div className="flex flex-wrap gap-2">
              {VOLUNTEER_CAUSES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleCause(value)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200',
                    causes.includes(value)
                      ? 'bg-jad-primary text-white shadow-md shadow-jad-primary/20'
                      : 'border border-foreground/15 bg-white text-foreground/70 hover:border-jad-primary/30 hover:bg-jad-mint/30'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <OpportunityCardSkeleton key={i} />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-jad-primary/20 bg-jad-mint/20 py-16 text-center">
          <Heart className="h-12 w-12 text-jad-primary/40" />
          <p className="mt-4 font-medium text-jad-foreground">
            {activeFilterCount > 0
              ? 'No opportunities match your filters'
              : 'No upcoming opportunities yet'}
          </p>
          <p className="mt-1 text-sm text-foreground/60">
            {activeFilterCount > 0
              ? 'Try adjusting your filters or check back later.'
              : 'Check back soon — new opportunities are added regularly.'}
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
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={{
                  id: opp.id,
                  title: opp.title,
                  orgName: opp.orgName,
                  orgVerificationStatus: opp.orgVerificationStatus,
                  city: opp.city,
                  state: opp.state,
                  startDate: opp.startDate,
                  endDate: opp.endDate,
                  startTime: opp.startTime,
                  endTime: opp.endTime,
                  opportunityMode: opp.opportunityMode,
                  causeCategoryNames: opp.causeCategoryNames ?? [],
                }}
              />
            ))}
          </div>
          {opportunities.length < total && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-jad-primary px-6 py-2.5 text-sm font-semibold text-jad-primary hover:bg-jad-mint/30 disabled:opacity-60"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Load more (${opportunities.length} of ${total})`
                )}
              </button>
            </div>
          )}
        </>
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
