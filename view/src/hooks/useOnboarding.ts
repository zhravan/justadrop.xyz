import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';

const ONBOARDING_COMPLETE_KEY = 'juztadrop_onboarding_complete';

export function useOnboarding() {
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace('/login?redirect=/onboarding');
    }
  }, [isReady, isAuthenticated, router]);

  const markCompleteAndGo = (path: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    }
    router.push(path);
  };

  return { markCompleteAndGo };
}
