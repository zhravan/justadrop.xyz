export function TeamHero() {
  return (
    <section className="relative overflow-hidden bg-jad-primary pt-28 pb-20 md:pt-36 md:pb-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at 20% 50%, rgba(31, 168, 137, 0.4), transparent 40%), radial-gradient(circle at 80% 20%, rgba(21, 131, 107, 0.3), transparent 35%)',
        }}
      />
      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full border border-jad-mint/40 bg-jad-dark/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-jad-mint/90">
            The people behind the mission
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-jad-mint md:text-6xl lg:text-7xl">
            Meet the crew
          </h1>
          <p className="mt-6 space-y-1 text-lg leading-relaxed text-jad-mint/90 md:text-xl">
            One obsession. Infinite impact.
            <br />
            Every drop counts.
          </p>
        </div>
      </div>
    </section>
  );
}
