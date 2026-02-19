'use client';

import Link from 'next/link';
import {
  Menu,
  X,
  LogOut,
  UserCircle,
  LayoutDashboard,
  Heart,
  Users,
  Compass,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { useAppHeader } from '@/hooks';
import { cn } from '@/lib/common';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/opportunities', label: 'Opportunities', icon: Heart },
  { href: '/volunteers', label: 'Volunteers', icon: Users },
  { href: '/onboarding', label: 'Onboarding', icon: Compass },
];

export function AppHeader() {
  const {
    mobileMenuOpen,
    userMenuOpen,
    ngoDropdownOpen,
    menuRef,
    userMenuRef,
    ngoDropdownRef,
    pathname,
    user,
    logout,
    organizations,
    selectedOrgId,
    setSelectedOrgId,
    selectedOrg,
    closeMenu,
    closeUserMenu,
    toggleMobileMenu,
    toggleUserMenu,
    toggleNgoDropdown,
  } = useAppHeader();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-foreground/5 bg-white/80 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between pt-[env(safe-area-inset-top)] sm:h-16 transition-all duration-300">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-lg font-bold tracking-tight sm:text-xl transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="text-jad-foreground">juzt</span>
          <span className="text-jad-primary">a</span>
          <span className="text-jad-accent">drop</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex md:items-center md:gap-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/dashboard' && pathname.startsWith(link.href));
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

          {/* NGO Selector */}
          {organizations.length > 0 && (
            <div ref={ngoDropdownRef} className="relative ml-2">
              <button
                type="button"
                onClick={toggleNgoDropdown}
                className="flex items-center gap-2 rounded-full border border-foreground/10 bg-muted/30 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
              >
                <Building2 className="h-4 w-4 text-jad-primary" />
                <span className="max-w-[140px] truncate">
                  {selectedOrg?.orgName ?? 'Select NGO'}
                </span>
                <ChevronDown className={cn('h-4 w-4', ngoDropdownOpen && 'rotate-180')} />
              </button>
              {ngoDropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-2xl border border-foreground/10 bg-white py-2 shadow-xl">
                  {organizations.map((org) => (
                    <Link
                      key={org.id}
                      href={`/organisations/${org.id}/opportunities`}
                      onClick={() => {
                        setSelectedOrgId(org.id);
                        toggleNgoDropdown();
                      }}
                      className={cn(
                        'block px-4 py-2.5 text-sm',
                        selectedOrgId === org.id
                          ? 'bg-jad-mint font-medium text-jad-foreground'
                          : 'text-foreground hover:bg-muted/50'
                      )}
                    >
                      {org.orgName}
                    </Link>
                  ))}
                  <Link
                    href="/organisations"
                    onClick={toggleNgoDropdown}
                    className="block border-t border-foreground/10 px-4 py-2.5 text-sm text-jad-primary hover:bg-jad-mint/30"
                  >
                    Manage NGOs
                  </Link>
                  {selectedOrgId && (
                    <Link
                      href={`/organisations/${selectedOrgId}/opportunities/create`}
                      onClick={toggleNgoDropdown}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-jad-primary hover:bg-jad-mint/30"
                    >
                      <Heart className="h-4 w-4" />
                      Create opportunity
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Profile Icon */}
          <div ref={userMenuRef} className="relative ml-2">
            <button
              type="button"
              onClick={toggleUserMenu}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-jad-primary/20 bg-jad-mint/50 text-jad-foreground transition-all hover:bg-jad-mint"
              aria-label="Profile menu"
            >
              <UserCircle className="h-5 w-5" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-foreground/10 bg-white py-2 shadow-xl">
                <div className="px-4 py-2 text-sm text-foreground/70 border-b border-foreground/5">
                  <p className="font-medium text-jad-foreground truncate">
                    {user?.name || user?.email}
                  </p>
                  {user?.name && <p className="text-xs truncate">{user?.email}</p>}
                </div>
                <Link
                  href="/profile"
                  onClick={closeUserMenu}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-foreground hover:bg-jad-mint/60"
                >
                  <UserCircle className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeUserMenu();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-foreground hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile menu button */}
        <div ref={menuRef} className="relative md:hidden">
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-full text-jad-foreground transition-colors hover:bg-jad-mint/60"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {mobileMenuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-foreground/10 bg-white py-2 shadow-xl"
              role="menu"
            >
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/dashboard' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className={cn(
                      'flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors hover:bg-jad-mint/60 hover:text-jad-foreground',
                      isActive && 'bg-jad-mint/60 text-jad-foreground font-semibold'
                    )}
                    role="menuitem"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}

              {/* NGO selector in mobile */}
              {organizations.length > 0 && (
                <div className="border-t border-foreground/5 px-5 py-3">
                  <p className="mb-2 text-xs font-medium text-foreground/60">My NGOs</p>
                  {organizations.map((org) => (
                    <Link
                      key={org.id}
                      href={`/organisations/${org.id}/opportunities`}
                      onClick={() => {
                        setSelectedOrgId(org.id);
                        closeMenu();
                      }}
                      className={cn(
                        'block py-2 text-sm',
                        selectedOrgId === org.id
                          ? 'font-medium text-jad-foreground'
                          : 'text-foreground/70'
                      )}
                    >
                      {org.orgName}
                    </Link>
                  ))}
                  <Link
                    href="/organisations"
                    onClick={closeMenu}
                    className="block py-2 text-sm text-jad-primary"
                  >
                    Manage NGOs
                  </Link>
                </div>
              )}

              {/* User section in mobile */}
              <div className="border-t border-foreground/5 px-5 py-3">
                <div className="mb-2 text-xs text-foreground/60 truncate">
                  {user?.name || user?.email}
                </div>
                <Link
                  href="/profile"
                  onClick={closeMenu}
                  className="flex items-center gap-2 py-2.5 text-sm font-medium text-jad-foreground"
                >
                  <UserCircle className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="flex w-full items-center gap-2 rounded-full border border-foreground/10 py-2.5 text-sm font-medium text-foreground/70 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
    </header>
  );
}
