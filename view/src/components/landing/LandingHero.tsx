'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-jad-primary pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-24">
      {/* Depth gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 100% 80% at 20% 20%, rgba(31, 168, 137, 0.3), transparent 50%), radial-gradient(ellipse 80% 60% at 80% 80%, rgba(21, 131, 107, 0.2), transparent 50%)',
        }}
      />

      <div className="container relative z-10">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-bold leading-[1.1] tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
              Small Actions
              <br />
              <span className="text-jad-mint">Lasting Impacts</span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/90 sm:mt-6 sm:text-lg md:text-xl">
              Connect with local ❤️ NGOs and charities that need your help 👋
            </p>

            {/* Search - floating card feel */}
            <div className="mt-6 sm:mt-10">
              <div className="flex flex-col gap-3 rounded-2xl bg-white/95 p-3 shadow-2xl shadow-jad-foreground/20 backdrop-blur sm:flex-row sm:items-center sm:gap-0 sm:p-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-jad-mint/30 px-4 py-3 transition-colors focus-within:bg-jad-mint/50 sm:rounded-l-xl sm:rounded-r-none">
                  <span className="shrink-0 text-jad-foreground/50">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-jad-foreground/60">Where</span>
                    <input type="text" placeholder="Eg. Kolkata" className="w-full bg-transparent text-sm text-jad-foreground placeholder:text-jad-foreground/50 focus:outline-none" />
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-jad-mint/30 px-4 py-3 transition-colors focus-within:bg-jad-mint/50 sm:rounded-none">
                  <span className="shrink-0 text-jad-foreground/50">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-jad-foreground/60">Category</span>
                    <input type="text" placeholder="Eg. Care" className="w-full bg-transparent text-sm text-jad-foreground placeholder:text-jad-foreground/50 focus:outline-none" />
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-jad-mint/30 px-4 py-3 transition-colors focus-within:bg-jad-mint/50 sm:rounded-none">
                  <span className="shrink-0 text-jad-foreground/50">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-jad-foreground/60">When</span>
                    <input type="text" placeholder="Tomorrow" className="w-full bg-transparent text-sm text-jad-foreground placeholder:text-jad-foreground/50 focus:outline-none" />
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Search"
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-jad-accent text-white shadow-lg shadow-jad-accent/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-jad-accent/40 active:scale-95 sm:rounded-r-xl sm:rounded-l-none"
                >
                  <Search className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </div>
              <p className="mt-5 flex items-center gap-2 text-sm text-white/85">
                <span>or</span>
                <Link
                  href="/organisations/create"
                  className="font-semibold text-jad-mint underline underline-offset-4 decoration-2 transition-all hover:text-white hover:decoration-white"
                >
                  Create an Organisation →
                </Link>
              </p>
            </div>
          </div>

          <div className="relative mt-10 lg:mt-0 lg:block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl shadow-jad-foreground/30 ring-4 ring-white/20">
              <Image
                src="/images/hero-volunteers.png"
                alt="Volunteers making a difference in their community"
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
