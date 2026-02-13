'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, Clock, ChevronDown, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';

const LOCATIONS = ['Kolkata', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai'];

const OPPORTUNITIES = [
  {
    id: 1,
    title: 'Lets feed the stray-dogs',
    organisation: 'Calcutta, Dog Community',
    location: 'New Town, Kolkata',
    dateRange: '29th → 31st Dec',
    timeRange: '8:30pm → 9:30pm',
    category: 'animal-care',
    icon: '🐕',
  },
  {
    id: 2,
    title: 'Beach cleanup drive',
    organisation: 'Ocean Guardians',
    location: 'Marine Drive, Mumbai',
    dateRange: '15th → 16th Feb',
    timeRange: '6:00am → 10:00am',
    category: 'environment',
    icon: '🌊',
  },
  {
    id: 3,
    title: 'Teach basic literacy',
    organisation: 'Siksha Foundation',
    location: 'Salt Lake, Kolkata',
    dateRange: 'Every Saturday',
    timeRange: '10:00am → 12:00pm',
    category: 'education',
    icon: '📚',
  },
  {
    id: 4,
    title: 'Community kitchen volunteer',
    organisation: 'Annapurna Trust',
    location: 'Park Street, Kolkata',
    dateRange: 'Daily',
    timeRange: '11:00am → 2:00pm',
    category: 'community',
    icon: '🍲',
  },
];

export function GetInvolvedSection() {
  const [location, setLocation] = useState('Kolkata');
  const [locationOpen, setLocationOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
      }
    }
    if (locationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [locationOpen]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = 340;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    });
  };

  return (
    <section className="bg-jad-mint/40 py-20 md:py-28">
      <div className="container">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-jad-foreground md:text-4xl">
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

        <div className="mt-10 overflow-hidden">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide md:snap-x md:snap-mandatory [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
          >
            {OPPORTUNITIES.map((opp) => (
              <article
                key={opp.id}
                className="group relative min-w-[300px] shrink-0 overflow-hidden rounded-2xl border-0 bg-white p-6 shadow-lg shadow-jad-foreground/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-jad-primary/15 md:min-w-[320px] md:snap-center"
              >
                <div className="absolute right-4 top-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-jad-primary/10 text-jad-primary">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                </div>

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-jad-mint to-jad-mint/60 text-3xl shadow-inner">
                  {opp.icon}
                </div>
                <h3 className="text-lg font-bold text-jad-foreground">{opp.title}</h3>
                <p className="mt-1.5 flex items-center gap-2 text-sm font-medium text-jad-primary">
                  <span className="h-2 w-2 rounded-full bg-jad-accent" />
                  {opp.organisation}
                </p>
                <p className="mt-3 flex items-start gap-2.5 text-sm text-foreground/70">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-jad-primary" />
                  {opp.location}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-foreground/60">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-jad-primary/70" />
                    {opp.dateRange}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-jad-primary/70" />
                    {opp.timeRange}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-jad-primary/30 bg-white text-jad-primary shadow-sm transition-all duration-200 hover:border-jad-primary hover:bg-jad-mint hover:shadow-md"
            aria-label="Previous opportunities"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <div className="flex gap-2">
            {OPPORTUNITIES.map((_, i) => (
              <div
                key={i}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  i === 0 ? 'bg-jad-primary scale-125' : 'bg-jad-primary/25'
                }`}
                aria-hidden
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-jad-primary/30 bg-white text-jad-primary shadow-sm transition-all duration-200 hover:border-jad-primary hover:bg-jad-mint hover:shadow-md"
            aria-label="Next opportunities"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
