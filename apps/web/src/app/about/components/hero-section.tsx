'use client'

import { ArrowDown } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-drop-50 via-white to-drop-100">
      {/* Animated water droplet background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-drop-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-drop-300/20 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Drop icon with ripple effect */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-drop-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-drop-400 to-drop-600 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
            <span className="block text-slate-900 mb-2">Where Small Acts</span>
            <span className="block bg-gradient-to-r from-drop-500 to-drop-600 bg-clip-text text-transparent">
              Became a Movement
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            What started as a handful of friends saving ₹1 a day during the COVID crisis grew into a family of 100+ volunteers creating ripples of change.
          </p>

          {/* Scroll indicator */}
          <div className="pt-12 flex flex-col items-center animate-bounce">
            <span className="text-sm text-slate-500 mb-2">Scroll to explore our story</span>
            <ArrowDown className="h-6 w-6 text-drop-500" />
          </div>
        </div>
      </div>
    </section>
  )
}
