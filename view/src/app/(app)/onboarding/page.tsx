'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { AppShellSkeleton } from '@/components/skeletons';

export default function OnboardingPage() {
  const router = useRouter();
  const { isReady, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isReady) {
      if (!isAuthenticated) {
        router.replace('/login?redirect=/onboarding');
      } else {
        // Redirect to dashboard - the modal will show if needed
        router.replace('/dashboard');
      }
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady) {
    return <AppShellSkeleton />;
  }

  return null;
}
