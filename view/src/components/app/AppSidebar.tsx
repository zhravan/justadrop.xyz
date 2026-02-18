'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Heart,
  Building2,
  UserCircle,
  LogOut,
  X,
  Compass,
  ChevronDown,
  Users,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import { useNgo } from '@/contexts/NgoContext';
import { useClickOutside } from '@/hooks';
import { cn } from '@/lib/common';

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/opportunities', label: 'Opportunities', icon: Heart },
  { href: '/volunteers', label: 'Volunteers', icon: Users },
  { href: '/onboarding', label: 'Onboarding', icon: Compass },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export function AppSidebar({ open, onClose, isMobile }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { organizations, selectedOrgId, setSelectedOrgId, selectedOrg } = useNgo();
  const [ngoDropdownOpen, setNgoDropdownOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const ngoDropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(sidebarRef, isMobile && open, onClose);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col border-r border-foreground/10 bg-white transition-transform duration-300 ease-out',
          isMobile
            ? 'w-72 -translate-x-full shadow-xl'
            : 'w-64 translate-x-0',
          isMobile && open && 'translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-foreground/5 px-4 sm:h-16">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-lg font-bold tracking-tight"
            onClick={isMobile ? onClose : undefined}
          >
            <span className="text-jad-foreground">juzt</span>
            <span className="text-jad-primary">a</span>
            <span className="text-jad-accent">drop</span>
          </Link>
          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-jad-mint/60 hover:text-jad-foreground"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* NGO selector */}
        {organizations.length > 0 && (
          <div className="border-b border-foreground/5 px-3 py-2">
            <p className="mb-1.5 text-xs font-medium text-foreground/60">My NGOs</p>
            <div className="relative" ref={ngoDropdownRef}>
              <button
                type="button"
                onClick={() => setNgoDropdownOpen(!ngoDropdownOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-foreground/10 bg-muted/30 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
              >
                <span className="truncate">
                  {selectedOrg?.orgName ?? 'Select NGO'}
                </span>
                <ChevronDown
                  className={cn('h-4 w-4 shrink-0 transition-transform', ngoDropdownOpen && 'rotate-180')}
                />
              </button>
              {ngoDropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-auto rounded-xl border border-foreground/10 bg-white py-1 shadow-lg">
                  {organizations.map((org) => (
                    <Link
                      key={org.id}
                      href={`/organisations/${org.id}/opportunities`}
                      onClick={() => {
                        setSelectedOrgId(org.id);
                        setNgoDropdownOpen(false);
                        if (isMobile) onClose();
                      }}
                      className={cn(
                        'block px-3 py-2 text-sm',
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
                    onClick={() => setNgoDropdownOpen(false)}
                    className="block border-t border-foreground/10 px-3 py-2 text-sm text-jad-primary hover:bg-jad-mint/30"
                  >
                    Manage NGOs
                  </Link>
                </div>
              )}
            </div>
            {selectedOrgId && (
              <Link
                href={`/organisations/${selectedOrgId}/opportunities/create`}
                onClick={isMobile ? onClose : undefined}
                className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-jad-primary hover:bg-jad-mint/30"
              >
                <Building2 className="h-4 w-4" />
                Create opportunity
              </Link>
            )}
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {organizations.length === 0 && (
            <Link
              href="/organisations/create"
              onClick={isMobile ? onClose : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                pathname === '/organisations/create'
                  ? 'bg-jad-mint text-jad-foreground'
                  : 'text-foreground/70 hover:bg-jad-mint/50'
              )}
            >
              <Building2 className="h-5 w-5 shrink-0" />
              Create NGO
            </Link>
          )}
          {sidebarLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={isMobile ? onClose : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-jad-mint text-jad-foreground'
                    : 'text-foreground/70 hover:bg-jad-mint/50 hover:text-jad-foreground'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-foreground/5 p-3">
          <div className="mb-2 rounded-xl px-3 py-2">
            <p className="truncate text-xs font-medium text-jad-foreground">
              {user?.name || user?.email}
            </p>
            <p className="truncate text-xs text-foreground/50">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              if (isMobile) onClose();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
