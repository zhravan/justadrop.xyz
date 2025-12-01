'use client'

import { useState } from 'react'
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import { getUserTypeBadgeColor } from '@/lib/utils/badge-colors'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, userType, isLoading, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
  }

  const getUserTypeLabel = () => {
    if (!userType) return ''
    return userType.charAt(0).toUpperCase() + userType.slice(1)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="Just A Drop Logo"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <span className="font-bold text-xl text-[#1e293b]">Just A Drop</span>
        </Link>

        {/* Desktop Navigation - Centered */}
        <div className="hidden lg:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
          <Link href="/opportunities" className="text-base font-medium text-[#1e293b] transition-colors hover:text-drop-500">
            Opportunities
          </Link>
          <Link href="/volunteers" className="text-base font-medium text-[#1e293b] transition-colors hover:text-drop-500">
            Volunteers
          </Link>
          <Link href="/about" className="text-base font-medium text-[#1e293b] transition-colors hover:text-drop-500">
            About Us
          </Link>
        </div>

        {/* Desktop Auth Buttons / User Menu */}
        <div className="hidden lg:flex items-center space-x-3">
          {isLoading ? (
            <div className="h-9 w-32 bg-gray-200 animate-pulse rounded" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-drop-100 text-drop-600 rounded-full font-medium">
                  {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-[#1e293b]">{user.name || user.email}</div>
                  <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getUserTypeBadgeColor(userType)}`}>
                    {getUserTypeLabel()}
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <Link
                      href="/"
                      className="flex items-center px-4 py-2 text-sm text-[#1e293b] hover:bg-gray-100 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-[#1e293b] hover:text-drop-500 hover:bg-drop-50" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" className="bg-drop-500 hover:bg-drop-600 text-white" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="/opportunities"
              className="block py-2 text-base font-medium text-[#1e293b] transition-colors hover:text-drop-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Opportunities
            </Link>
            <Link
              href="/volunteers"
              className="block py-2 text-base font-medium text-[#1e293b] transition-colors hover:text-drop-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Volunteers
            </Link>
            <Link
              href="/about"
              className="block py-2 text-base font-medium text-[#1e293b] transition-colors hover:text-drop-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <div className="pt-4 space-y-2">
              {isLoading ? (
                <div className="h-9 bg-gray-200 animate-pulse rounded" />
              ) : user ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 bg-drop-100 text-drop-600 rounded-full font-medium">
                      {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#1e293b]">{user.name || user.email}</div>
                      <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getUserTypeBadgeColor(userType)}`}>
                        {getUserTypeLabel()}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                    <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" className="w-full bg-drop-500 hover:bg-drop-600" asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
