'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'
import Image from 'next/image'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="text-[#1e293b] hover:text-drop-500 hover:bg-drop-50" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button size="sm" className="bg-drop-500 hover:bg-drop-600 text-white" asChild>
            <Link href="/register">Sign Up</Link>
          </Button>
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
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" className="w-full bg-drop-500 hover:bg-drop-600" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
