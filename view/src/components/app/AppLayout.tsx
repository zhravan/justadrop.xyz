'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, ChevronDown, Building2 } from 'lucide-react';
import { AppSidebar } from './AppSidebar';
import { AppFooter } from './AppFooter';
import { AppShellSkeleton } from '@/components/skeletons';
import { PublicBrowseLayout } from './PublicBrowseLayout';
import { useAuth } from '@/lib/auth/use-auth';
import { useNgo } from '@/contexts/NgoContext';
import { useClickOutside } from '@/hooks';
import { cn } from '@/lib/common';

const PUBLIC_BROWSE_PATHS = ['/opportunities', '/volunteers'];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isReady } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [ngoDropdownOpen, setNgoDropdownOpen] = useState(false);
  const ngoDropdownRef = useRef<HTMLDivElement>(null);
  const { organizations, selectedOrgId, setSelectedOrgId, selectedOrg } = useNgo();

  const isPublicBrowse = PUBLIC_BROWSE_PATHS.some((p) => pathname === p || pathname?.startsWith(p + '/'));

  useClickOutside(ngoDropdownRef, ngoDropdownOpen, () => setNgoDropdownOpen(false));

  useEffect(() => {
    if (isReady && !isAuthenticated && !isPublicBrowse) {
      router.replace('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [isReady, isAuthenticated, isPublicBrowse, router]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isReady && !isAuthenticated && isPublicBrowse) {
    return <PublicBrowseLayout>{children}</PublicBrowseLayout>;
  }

  if (!isReady || !isAuthenticated) {
    return <AppShellSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      {/* Mobile header */}
      <header className="fixed top-0 right-0 left-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-foreground/5 bg-white/95 backdrop-blur-xl md:left-64 px-2 md:px-4">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center text-jad-foreground md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 md:flex-none" />
        {organizations.length > 0 && (
          <div ref={ngoDropdownRef} className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setNgoDropdownOpen(!ngoDropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-muted/30 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50"
            >
              <Building2 className="h-4 w-4 text-jad-primary" />
              <span className="max-w-[140px] truncate">
                {selectedOrg?.orgName ?? 'Select NGO'}
              </span>
              <ChevronDown className={cn('h-4 w-4', ngoDropdownOpen && 'rotate-180')} />
            </button>
            {ngoDropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-foreground/10 bg-white py-1 shadow-lg">
                {organizations.map((org) => (
                  <Link
                    key={org.id}
                    href={`/organisations/${org.id}/opportunities`}
                    onClick={() => {
                      setSelectedOrgId(org.id);
                      setNgoDropdownOpen(false);
                    }}
                    className={cn(
                      'block px-4 py-2 text-sm',
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
                  className="block border-t border-foreground/10 px-4 py-2 text-sm text-jad-primary hover:bg-jad-mint/30"
                >
                  Manage NGOs
                </Link>
              </div>
            )}
          </div>
        )}
        <Link
          href="/"
          className="pr-2 md:pr-0 text-lg font-bold tracking-tight md:hidden"
        >
          <span className="text-jad-foreground">juzt</span>
          <span className="text-jad-primary">a</span>
          <span className="text-jad-accent">drop</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-14 md:pl-64 md:pt-0">
        <div className="flex min-h-screen flex-col">
          <div className="flex flex-1 flex-col pb-16 pt-20 md:pt-24">{children}</div>
          <AppFooter />
        </div>
      </main>
    </div>
  );
}
