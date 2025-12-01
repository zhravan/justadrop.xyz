'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  getAuthToken,
  getStoredUser,
  getStoredUserType,
  setAuthData,
  clearAuthData,
  type UserType,
  type StoredUser,
} from '@/lib/auth-storage'

interface AuthContextType {
  user: StoredUser | null
  userType: UserType | null
  token: string | null
  isLoading: boolean
  login: (token: string, user: StoredUser, userType: UserType, remember?: boolean) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null)
  const [userType, setUserType] = useState<UserType | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load auth state from storage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const storedToken = getAuthToken()
        const storedUserType = getStoredUserType()
        const storedUser = getStoredUser()

        if (storedToken && storedUserType && storedUser) {
          setToken(storedToken)
          setUserType(storedUserType)
          setUser(storedUser)
        }
      } catch (error) {
        console.error('Error loading auth state:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAuthState()
  }, [])

  const login = (
    newToken: string,
    newUser: StoredUser,
    newUserType: UserType,
    remember: boolean = false
  ) => {
    // Update state
    setToken(newToken)
    setUser(newUser)
    setUserType(newUserType)

    // Persist to storage
    setAuthData(newToken, newUser, newUserType, remember)
  }

  const logout = () => {
    // Clear state
    setToken(null)
    setUser(null)
    setUserType(null)

    // Clear storage
    clearAuthData()

    // Redirect to home
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, userType, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
