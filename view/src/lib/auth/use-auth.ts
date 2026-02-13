'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient, type AuthUser } from './auth-client';

export function useSession() {
  return useQuery({
    queryKey: ['auth', 'session'],
    queryFn: () => authClient.getSession(),
    staleTime: 5 * 60 * 1000, // 5 min
    retry: false,
  });
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading, isFetched } = useSession();

  const logoutMutation = useMutation({
    mutationFn: () => authClient.logout(),
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'session'], null);
    },
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: Boolean(user),
    isReady: isFetched,
    logout: () => logoutMutation.mutateAsync(),
  };
}
