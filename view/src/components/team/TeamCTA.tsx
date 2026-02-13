import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function TeamCTA() {
  return (
    <section className="relative overflow-hidden bg-jad-dark py-20 md:py-28">
      <div
        className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-jad-accent/10 blur-3xl"
        aria-hidden
      />
      <div className="container relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-jad-mint md:text-4xl">
            Want to join us?
          </h2>
          <p className="mt-4 text-lg text-jad-mint/80">
            We&apos;re always looking for people who care about impact.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 rounded-full bg-jad-mint px-6 py-3 font-semibold text-jad-foreground shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
              Explore opportunities
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center rounded-full border-2 border-jad-mint/50 px-6 py-3 font-semibold text-jad-mint transition-colors hover:bg-jad-mint/10"
            >
              Learn more about us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
