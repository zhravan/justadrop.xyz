'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { OnboardingModal } from './OnboardingModal';
import { AppShellSkeleton } from '@/components/skeletons';
import { PublicBrowseLayout } from './PublicBrowseLayout';
import { useAuth } from '@/lib/auth/use-auth';
import { useOnboardingModal } from '@/hooks';

const PUBLIC_BROWSE_PATHS = ['/opportunities', '/volunteers'];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isReady } = useAuth();
  const onboardingModal = useOnboardingModal();
  const { isOpen, closeModal } = onboardingModal;

  const isPublicBrowse = PUBLIC_BROWSE_PATHS.some(
    (p) => pathname === p || pathname?.startsWith(p + '/')
  );

  useEffect(() => {
    if (isReady && !isAuthenticated && !isPublicBrowse) {
      router.replace('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [isReady, isAuthenticated, isPublicBrowse, router]);

  if (isReady && !isAuthenticated && isPublicBrowse) {
    return <PublicBrowseLayout>{children}</PublicBrowseLayout>;
  }

  if (!isReady || !isAuthenticated) {
    return <AppShellSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader onboardingModal={onboardingModal} />
      {isOpen && <OnboardingModal onClose={closeModal} />}

      {/* Main content */}
      <main className="flex-1 pt-14 sm:pt-16">
        <div className="flex min-h-screen flex-col">
          <div className="flex flex-1 flex-col pb-16 pt-8">{children}</div>
          <AppFooter />
        </div>
      </main>
    </div>
  );
}
