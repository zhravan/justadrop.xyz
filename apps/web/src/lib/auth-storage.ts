/**
 * Centralized auth storage utility
 * Single source of truth for auth token and user data storage
 */

const AUTH_TOKEN_KEY = 'authToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_TYPE_KEY = 'userType'
const USER_KEY = 'user'

export type UserType = 'volunteer' | 'organization' | 'admin'

export interface StoredUser {
  id: string
  name: string
  email: string
  [key: string]: any
}

/**
 * Get auth token from storage
 * Checks localStorage first (remember me), then sessionStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  
  // Check localStorage first (remember me)
  let token = localStorage.getItem(AUTH_TOKEN_KEY)
  
  // If not in localStorage, check sessionStorage
  if (!token) {
    token = sessionStorage.getItem(AUTH_TOKEN_KEY)
  }
  
  return token
}

/**
 * Get refresh token from storage
 * Checks localStorage first (remember me), then sessionStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  
  // Check localStorage first (remember me)
  let token = localStorage.getItem(REFRESH_TOKEN_KEY)
  
  // If not in localStorage, check sessionStorage
  if (!token) {
    token = sessionStorage.getItem(REFRESH_TOKEN_KEY)
  }
  
  return token
}

/**
 * Get stored user type
 */
export function getStoredUserType(): UserType | null {
  if (typeof window === 'undefined') return null
  
  let userType = localStorage.getItem(USER_TYPE_KEY)
  if (!userType) {
    userType = sessionStorage.getItem(USER_TYPE_KEY)
  }
  
  return userType as UserType | null
}

/**
 * Get stored user data
 */
export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null
  
  let userJson = localStorage.getItem(USER_KEY)
  if (!userJson) {
    userJson = sessionStorage.getItem(USER_KEY)
  }
  
  if (!userJson) return null
  
  try {
    return JSON.parse(userJson)
  } catch {
    return null
  }
}

/**
 * Store auth data
 * @param token - Access token
 * @param user - User data
 * @param userType - Type of user
 * @param remember - If true, uses localStorage (persists), else sessionStorage
 * @param refreshToken - Refresh token (optional)
 */
export function setAuthData(
  token: string,
  user: StoredUser,
  userType: UserType,
  remember: boolean = false,
  refreshToken?: string
): void {
  if (typeof window === 'undefined') return
  
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(AUTH_TOKEN_KEY, token)
  storage.setItem(USER_TYPE_KEY, userType)
  storage.setItem(USER_KEY, JSON.stringify(user))
  if (refreshToken) {
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

/**
 * Update access token only (keeps refresh token)
 */
export function updateAccessToken(token: string): void {
  if (typeof window === 'undefined') return
  
  // Update in the same storage where refresh token exists
  const refreshToken = getRefreshToken()
  if (refreshToken) {
    // Check which storage has the refresh token
    if (localStorage.getItem(REFRESH_TOKEN_KEY)) {
      localStorage.setItem(AUTH_TOKEN_KEY, token)
    } else if (sessionStorage.getItem(REFRESH_TOKEN_KEY)) {
      sessionStorage.setItem(AUTH_TOKEN_KEY, token)
    }
  }
}

/**
 * Clear all auth data from both storages
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return
  
  // Clear from both storages to ensure clean logout
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_TYPE_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  sessionStorage.removeItem(USER_TYPE_KEY)
  sessionStorage.removeItem(USER_KEY)
}

/**
 * Check if user is authenticated (has a token)
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null
}

/**
 * Temporary storage for registration email (for resend functionality)
 */
export function setRegistrationEmail(email: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('registrationEmail', email)
}

export function getRegistrationEmail(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('registrationEmail')
}

export function clearRegistrationEmail(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('registrationEmail')
}

