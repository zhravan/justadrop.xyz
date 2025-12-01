'use client'

import { Button } from '@/components/ui/button'
import { Heart, Building2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

export function CTASection() {
  const { user } = useAuth()

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-drop-500 via-drop-600 to-drop-700 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_2px,transparent_2px)] bg-[length:50px_50px]"></div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          {/* Main content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
              Be the Drop That Creates Ripples
            </h2>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              Join our community of changemakers. Whether you volunteer your time or register your organization, every contribution matters.
            </p>
          </div>

          {/* CTA Buttons - Only show if user is not logged in */}
          {!user && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Button 
                size="lg" 
                className="bg-white text-drop-600 hover:bg-slate-50 text-lg font-bold px-10 py-7 h-auto shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group"
                asChild
              >
                <Link href="/volunteer/register">
                  <Heart className="h-6 w-6 mr-3 group-hover:fill-drop-600 transition-all" />
                  Become a Volunteer
                  <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button 
                size="lg" 
                className="bg-white text-drop-600 hover:bg-slate-50 text-lg font-bold px-10 py-7 h-auto shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group"
                asChild
              >
                <Link href="/organization/register">
                  <Building2 className="h-6 w-6 mr-3 group-hover:fill-drop-600 transition-all" />
                  Register Your Organization
                  <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-white/20">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">100+</div>
              <div className="text-white/80 text-sm md:text-base">Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">500+</div>
              <div className="text-white/80 text-sm md:text-base">Active Volunteers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">10K+</div>
              <div className="text-white/80 text-sm md:text-base">Hours Contributed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">∞</div>
              <div className="text-white/80 text-sm md:text-base">Ripples Created</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
