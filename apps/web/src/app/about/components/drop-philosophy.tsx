'use client'

import { Quote } from 'lucide-react'

export function DropPhilosophy() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle,#0ea5e9_1px,transparent_1px)] bg-[length:40px_40px]"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left: Ripple animation */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square">
              {/* Animated ripples */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-32 h-32 bg-drop-500 rounded-full opacity-80"></div>
                <div className="absolute w-48 h-48 bg-drop-400 rounded-full opacity-50 animate-ping [animation-duration:3s]"></div>
                <div className="absolute w-64 h-64 bg-drop-300 rounded-full opacity-30 animate-ping [animation-duration:4s] [animation-delay:0.5s]"></div>
                <div className="absolute w-80 h-80 bg-drop-200 rounded-full opacity-20 animate-ping [animation-duration:5s] [animation-delay:1s]"></div>
              </div>
              
              {/* Center drop */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-drop-400 to-drop-600 rounded-full flex items-center justify-center shadow-2xl">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                The Drop Philosophy
              </h2>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                Our earliest idea was simple: save <span className="font-bold text-drop-600">₹1 every day</span> and use it to make someone's life a little easier.
              </p>
            </div>

            <div className="space-y-6">
              <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                Those tiny drops turned into groceries, emergency support, medicines, educational help, and countless acts of care.
              </p>

              <div className="relative bg-white border-l-4 border-drop-500 rounded-r-xl p-6 shadow-lg">
                <Quote className="absolute -top-2 -left-2 h-8 w-8 text-drop-200" />
                <p className="text-lg md:text-xl font-semibold text-slate-800 italic leading-relaxed pl-6">
                  "The real magic was never the money; it was the people who kept showing up with sincerity, month after month."
                </p>
              </div>

              <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                As our community grew, one thing became clear: <span className="font-bold text-slate-900">people want to help</span>. They just need a simple, trustworthy way to do it.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <span className="px-4 py-2 bg-drop-100 text-drop-700 rounded-full font-semibold text-sm">Consistency</span>
              <span className="px-4 py-2 bg-drop-100 text-drop-700 rounded-full font-semibold text-sm">Sincerity</span>
              <span className="px-4 py-2 bg-drop-100 text-drop-700 rounded-full font-semibold text-sm">Community</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
