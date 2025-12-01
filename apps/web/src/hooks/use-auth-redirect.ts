'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

interface UseAuthRedirectOptions {
  /** Where to redirect if condition is met */
  redirectTo: string
  /** If true, redirects when user IS authenticated. If false, redirects when NOT authenticated */
  redirectIfAuthenticated?: boolean
}

/**
 * Hook for handling auth-based redirects
 * 
 * Usage for guest-only pages (login, register):
 * ```
 * const { isReady, shouldRender } = useAuthRedirect({ 
 *   redirectTo: '/', 
 *   redirectIfAuthenticated: true 
 * })
 * ```
 * 
 * Usage for protected pages:
 * ```
 * const { isReady, shouldRender } = useAuthRedirect({ 
 *   redirectTo: '/login', 
 *   redirectIfAuthenticated: false 
 * })
 * ```
 */
export function useAuthRedirect({
  redirectTo,
  redirectIfAuthenticated = true,
}: UseAuthRedirectOptions) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    const shouldRedirect = redirectIfAuthenticated ? !!user : !user

    if (shouldRedirect) {
      router.push(redirectTo)
    }
  }, [user, isLoading, router, redirectTo, redirectIfAuthenticated])

  // Page is ready when auth check is complete
  const isReady = !isLoading

  // Should render content when:
  // - Still loading (show loading state)
  // - OR condition is NOT met (user should stay on page)
  const shouldRender = isLoading || (redirectIfAuthenticated ? !user : !!user)

  return {
    isReady,
    isLoading,
    shouldRender,
    user,
  }
}

/**
 * Shorthand for guest-only pages (login, register, etc.)
 * Redirects to home if user is already logged in
 */
export function useGuestOnly(redirectTo: string = '/') {
  return useAuthRedirect({ redirectTo, redirectIfAuthenticated: true })
}

/**
 * Shorthand for protected pages
 * Redirects to login if user is not authenticated
 */
export function useProtectedPage(redirectTo: string = '/login') {
  return useAuthRedirect({ redirectTo, redirectIfAuthenticated: false })
}

