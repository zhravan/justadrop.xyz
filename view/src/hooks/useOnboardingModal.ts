import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { useNgo } from '@/contexts/NgoContext';

const ONBOARDING_COMPLETE_KEY = 'juztadrop_onboarding_complete';
const SHOW_ONBOARDING_KEY = 'juztadrop_show_onboarding';

export function useOnboardingModal() {
  const router = useRouter();
  const { user, isReady, isAuthenticated } = useAuth();
  const { organizations } = useNgo();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isReady && isAuthenticated && user) {
      // Check if onboarding was already completed
      const completed =
        typeof window !== 'undefined' && sessionStorage.getItem(ONBOARDING_COMPLETE_KEY);
      const shouldShow =
        typeof window !== 'undefined' && sessionStorage.getItem(SHOW_ONBOARDING_KEY);

      if (!completed && shouldShow) {
        // Check if user has no organizations and no volunteering data
        const needsOnboarding = !user.volunteering && organizations.length === 0;
        if (needsOnboarding) {
          setIsOpen(true);
          // Clear the flag
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem(SHOW_ONBOARDING_KEY);
          }
        }
      }
    }
  }, [isReady, isAuthenticated, user, organizations]);

  const markCompleteAndGo = (path: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    }
    setIsOpen(false);
    router.push(path);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Don't mark as completed when manually closed - allow reopening
  };

  const openModal = () => {
    setIsOpen(true);
  };

  return {
    isOpen,
    setIsOpen,
    openModal,
    closeModal,
    markCompleteAndGo,
  };
}
