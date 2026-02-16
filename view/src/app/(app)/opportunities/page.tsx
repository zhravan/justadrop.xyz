'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { OpportunityCardSkeleton } from '@/components/opportunities/OpportunityCardSkeleton';
import { VOLUNTEER_CAUSES, LOCATIONS } from '@/lib/constants';
import { cn } from '@/lib/common';
import { Heart, Loader2 } from 'lucide-react';

const PAGE_SIZE = 12;

export default function OpportunitiesPage() {
  const searchParams = useSearchParams();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [causes, setCauses] = useState<string[]>(() => {
    const c = searchParams.get('causes');
    return c ? c.split(',') : [];
  });
  const [mode, setMode] = useState(searchParams.get('mode') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-jad-foreground sm:text-3xl">
          Opportunities
        </h1>
        <p className="mt-1 text-foreground/70">
          Find volunteering opportunities. Apply to ones you like.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium text-foreground/70">Location</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-xl border border-foreground/20 bg-white px-4 py-2 text-sm font-medium focus:border-jad-primary focus:outline-none"
          >
            <option value="">All cities</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="w-full text-sm font-medium text-foreground/70 sm:w-auto">Mode</label>
          {['', 'onsite', 'remote', 'hybrid'].map((m) => (
            <button
              key={m || 'all'}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                mode === m
                  ? 'bg-jad-primary text-white'
                  : 'border border-foreground/20 bg-white text-foreground hover:bg-jad-mint/30'
              )}
            >
              {m || 'All'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium text-foreground/70">Date range</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-xl border border-foreground/20 bg-white px-3 py-2 text-sm"
          />
          <span className="text-foreground/50">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-xl border border-foreground/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground/70">Causes</label>
          <div className="flex flex-wrap gap-2">
            {VOLUNTEER_CAUSES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleCause(value)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  causes.includes(value)
                    ? 'bg-jad-primary text-white'
                    : 'border border-foreground/20 bg-white text-foreground hover:bg-jad-mint/30'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

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
            No upcoming opportunities match your filters
          </p>
          <p className="mt-1 text-sm text-foreground/60">
            Try adjusting your filters or check back later.
          </p>
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
