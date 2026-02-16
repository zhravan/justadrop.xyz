'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Calendar, Clock, ChevronDown, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { LOCATIONS } from '@/lib/constants';
import { useOpportunityCarousel, useClickOutside } from '@/hooks';

function formatDate(d: string | Date | null): string {
  if (!d) return 'TBD';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatDateRange(start: string | Date | null, end: string | Date | null): string {
  if (!start && !end) return 'Ongoing';
  if (!end) return formatDate(start);
  return `${formatDate(start)} – ${formatDate(end)}`;
}

const ICONS = ['🌊', '📚', '🐕', '🍲', '🌱', '❤️'];

export function GetInvolvedSection() {
  const [location, setLocation] = useState('All');
  const [locationOpen, setLocationOpen] = useState(false);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const locationRef = useRef<HTMLDivElement>(null);
  const handleClickOutside = useCallback(() => setLocationOpen(false), []);

  useClickOutside(locationRef, locationOpen, handleClickOutside);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('status', 'active');
    params.set('limit', '12');
    if (location && location !== 'All') params.set('city', location);
    fetch(`/api/opportunities?${params}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setOpportunities(data?.opportunities ?? []))
      .catch(() => setOpportunities([]))
      .finally(() => setLoading(false));
  }, [location]);

  const {
    scrollRef,
    activePageIndex,
    totalPages,
    scrollToPage,
    goToNextPage,
    goToPrevPage,
  } = useOpportunityCarousel({
    totalItems: opportunities.length,
    itemsPerPage: 2,
  });

  return (
    <section className="bg-jad-mint/40 py-12 sm:py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-jad-foreground sm:text-3xl md:text-4xl">
            Get involved near you
          </h2>
          <div ref={locationRef} className="relative">
            <button
              type="button"
              onClick={() => setLocationOpen(!locationOpen)}
              className="flex items-center gap-2 rounded-full border-2 border-jad-primary/30 bg-white px-5 py-2.5 text-sm font-semibold text-jad-foreground shadow-sm transition-all duration-200 hover:border-jad-primary hover:shadow-md"
            >
              {location}
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${locationOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {locationOpen && (
              <div className="absolute left-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-jad-primary/20 bg-white py-2 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setLocation('All');
                    setLocationOpen(false);
                  }}
                  className={`w-full px-5 py-2.5 text-left text-sm font-medium transition-colors ${
                    location === 'All' ? 'bg-jad-mint text-jad-foreground' : 'text-foreground hover:bg-jad-mint/50'
                  }`}
                >
                  All
                </button>
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setLocation(loc);
                      setLocationOpen(false);
                    }}
                    className={`w-full px-5 py-2.5 text-left text-sm font-medium transition-colors ${
                      loc === location
                        ? 'bg-jad-mint text-jad-foreground'
                        : 'text-foreground hover:bg-jad-mint/50'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 overflow-hidden sm:mt-10">
          {loading ? (
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="min-w-[260px] shrink-0 animate-pulse rounded-2xl bg-white/60 p-6 sm:min-w-[280px] md:min-w-[320px]"
                >
                  <div className="h-14 w-14 rounded-2xl bg-foreground/10" />
                  <div className="mt-4 h-5 w-3/4 rounded bg-foreground/10" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-foreground/10" />
                  <div className="mt-4 h-4 w-full rounded bg-foreground/10" />
                </div>
              ))}
            </div>
          ) : opportunities.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-jad-primary/20 bg-white/60 py-12 text-center">
              <p className="text-foreground/70">
                No upcoming opportunities in {location === 'All' ? 'your area' : location}. Check back soon!
              </p>
              <Link
                href="/opportunities"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-jad-primary hover:underline"
              >
                Browse all opportunities
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide md:snap-x md:snap-mandatory [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
            >
              {opportunities.map((opp, i) => (
                <Link
                  key={opp.id}
                  href={`/opportunities/${opp.id}`}
                  className="group relative min-w-[260px] shrink-0 overflow-hidden rounded-2xl border-0 bg-white p-4 shadow-lg shadow-jad-foreground/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-jad-primary/15 sm:min-w-[280px] sm:p-6 md:min-w-[320px] md:snap-center"
                >
                  <div className="absolute right-4 top-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-jad-primary/10 text-jad-primary">
                      <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                  </div>

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-jad-mint to-jad-mint/60 text-3xl shadow-inner">
                    {ICONS[i % ICONS.length]}
                  </div>
                  <h3 className="text-lg font-bold text-jad-foreground">{opp.title}</h3>
                  <p className="mt-1.5 flex items-center gap-2 text-sm font-medium text-jad-primary">
                    <span className="h-2 w-2 rounded-full bg-jad-accent" />
                    {opp.orgName}
                  </p>
                  <p className="mt-3 flex items-start gap-2.5 text-sm text-foreground/70">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-jad-primary" />
                    {[opp.city, opp.state].filter(Boolean).join(', ') || 'Various'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-foreground/60">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-jad-primary/70" />
                      {formatDateRange(opp.startDate, opp.endDate)}
                    </span>
                    {(opp.startTime || opp.endTime) && (
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-jad-primary/70" />
                        {opp.startTime || '?'} – {opp.endTime || '?'}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {!loading && opportunities.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-4 sm:mt-8 sm:gap-6">
          <button
            type="button"
            onClick={goToPrevPage}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-jad-primary/30 bg-white text-jad-primary shadow-sm transition-all duration-200 hover:border-jad-primary hover:bg-jad-mint hover:shadow-md"
            aria-label="Previous opportunities"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToPage(i)}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  i === activePageIndex ? 'bg-jad-primary scale-125' : 'bg-jad-primary/25 hover:bg-jad-primary/50'
                }`}
                aria-label={`Go to page ${i + 1}`}
                aria-current={i === activePageIndex}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={goToNextPage}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-jad-primary/30 bg-white text-jad-primary shadow-sm transition-all duration-200 hover:border-jad-primary hover:bg-jad-mint hover:shadow-md"
            aria-label="Next opportunities"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
        )}
      </div>
    </section>
  );
}
