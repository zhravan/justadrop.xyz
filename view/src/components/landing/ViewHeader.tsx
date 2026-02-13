'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useClickOutside } from '@/hooks';
import { useAuth } from '@/lib/auth/use-auth';
import { cn } from '@/lib/common';

const navLinks = [
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/volunteers', label: 'Volunteers' },
  { href: '/about', label: 'About' },
  { href: '/team', label: 'Team' },
];

export function ViewHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);
  const closeUserMenu = useCallback(() => setUserMenuOpen(false), []);
  useClickOutside(menuRef, mobileMenuOpen, closeMenu);
  useClickOutside(userMenuRef, userMenuOpen, closeUserMenu);
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-foreground/5 bg-white/80 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between pt-[env(safe-area-inset-top)] sm:h-16 transition-all duration-300">
        <Link
          href="/"
          className="flex items-center gap-1 text-lg font-bold tracking-tight sm:text-xl transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="text-jad-foreground">just</span>
          <span className="text-jad-primary">a</span>
          <span className="text-jad-accent">drop</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex md:items-center md:gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-jad-mint/60 hover:text-jad-foreground',
                  isActive
                    ? 'bg-jad-mint/60 text-jad-foreground font-semibold'
                    : 'text-foreground/80'
                )}
              >
                {link.label}
              </Link>
            );
          })}
          {isAuthenticated && user && (
            <Link
              href="/dashboard"
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                pathname.startsWith('/dashboard')
                  ? 'bg-jad-primary/20 text-jad-dark'
                  : 'bg-jad-primary/10 text-jad-primary hover:bg-jad-primary/20 hover:text-jad-dark'
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}
          {isAuthenticated && user ? (
            <div ref={userMenuRef} className="relative ml-2">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-jad-primary/20 bg-jad-mint/50 px-4 py-2.5 text-sm font-medium text-jad-foreground transition-all hover:bg-jad-mint"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[120px] truncate">{user.email}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-foreground/10 bg-white py-2 shadow-xl">
                  <div className="px-4 py-2 text-sm text-foreground/70">
                    {user.email}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-foreground hover:bg-jad-mint/60"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-2 rounded-full bg-jad-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-jad-primary/25 transition-all duration-200 hover:bg-jad-dark hover:shadow-xl hover:shadow-jad-primary/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              Login
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <div ref={menuRef} className="relative md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-jad-foreground transition-colors hover:bg-jad-mint/60"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {mobileMenuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-foreground/10 bg-white py-2 shadow-xl"
              role="menu"
            >
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className={cn(
                      'block px-5 py-3 text-sm font-medium transition-colors hover:bg-jad-mint/60 hover:text-jad-foreground',
                      isActive && 'bg-jad-mint/60 text-jad-foreground font-semibold'
                    )}
                    role="menuitem"
                  >
                    {link.label}
                  </Link>
                );
              })}
              {isAuthenticated && user && (
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors hover:bg-jad-mint/60',
                    pathname.startsWith('/dashboard')
                      ? 'bg-jad-mint/60 text-jad-foreground'
                      : 'text-jad-primary'
                  )}
                  role="menuitem"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              )}
              <div className="border-t border-foreground/5 px-5 py-3">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-2 py-1.5 text-xs text-foreground/60 truncate">
                      {user.email}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        closeMenu();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-jad-primary/20 py-2.5 text-sm font-medium text-jad-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="block w-full rounded-full bg-jad-primary py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-jad-dark"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
    </header>
  );
}
