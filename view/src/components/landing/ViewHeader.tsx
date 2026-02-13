'use client';

import Link from 'next/link';

const navLinks = [
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/volunteers', label: 'Volunteers' },
  { href: '/about', label: 'About' },
  { href: '/team', label: 'Team' },
];

export function ViewHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-foreground/5 bg-white/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between transition-all duration-300">
        <Link
          href="/"
          className="flex items-center gap-1 text-xl font-bold tracking-tight transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="text-jad-foreground">just</span>
          <span className="text-jad-primary">a</span>
          <span className="text-jad-accent">drop</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-all duration-200 hover:bg-jad-mint/60 hover:text-jad-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="ml-2 rounded-full bg-jad-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-jad-primary/25 transition-all duration-200 hover:bg-jad-dark hover:shadow-xl hover:shadow-jad-primary/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Login
          </Link>
        </nav>
      </div>
      {/* Glass bar - appears on scroll could be added later; for now use a subtle bottom border */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
    </header>
  );
}
