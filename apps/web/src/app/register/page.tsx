'use client'

import { useGuestOnly } from '@/hooks/use-auth-redirect'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoading } from '@/components/ui/page-loading'
import { Heart, Building2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const { isLoading, shouldRender } = useGuestOnly('/')

  // Show loading state while checking auth
  if (isLoading) {
    return <PageLoading />
  }

  // Don't render register page if user is already logged in
  if (!shouldRender) {
    return null
  }

  return (
    <main className="flex-1 min-h-screen bg-gradient-to-b from-drop-50 to-white">
      <div className="container mx-auto px-4 lg:px-8 py-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900">
              Join Just A Drop
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose how you want to make an impact
            </p>
          </div>

          {/* Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Volunteer Card */}
            <Card className="border-2 hover:border-drop-500 transition-all duration-300 hover:shadow-2xl group cursor-pointer">
              <Link href="/volunteer/register">
                <CardHeader className="space-y-4 pb-8">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-center text-slate-900">
                    I'm a Volunteer
                  </CardTitle>
                  <CardDescription className="text-center text-base">
                    Join thousands of volunteers making a difference in their communities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-drop-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-drop-600 text-sm font-bold">✓</span>
                      </div>
                      <span className="text-slate-600">Find opportunities that match your interests and skills</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-drop-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-drop-600 text-sm font-bold">✓</span>
                      </div>
                      <span className="text-slate-600">Track your volunteer hours and impact</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-drop-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-drop-600 text-sm font-bold">✓</span>
                      </div>
                      <span className="text-slate-600">Earn certificates and recognition</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-drop-500 hover:bg-drop-600 text-white font-semibold py-6 text-base group-hover:shadow-lg">
                    Register as Volunteer
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Link>
            </Card>

            {/* Organization Card */}
            <Card className="border-2 hover:border-drop-500 transition-all duration-300 hover:shadow-2xl group cursor-pointer">
              <Link href="/organization/register">
                <CardHeader className="space-y-4 pb-8">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Building2 className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-center text-slate-900">
                    I'm an Organization
                  </CardTitle>
                  <CardDescription className="text-center text-base">
                    Connect with passionate volunteers ready to support your cause
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-drop-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-drop-600 text-sm font-bold">✓</span>
                      </div>
                      <span className="text-slate-600">Post volunteer opportunities and manage applications</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-drop-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-drop-600 text-sm font-bold">✓</span>
                      </div>
                      <span className="text-slate-600">Access a network of verified volunteers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-drop-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-drop-600 text-sm font-bold">✓</span>
                      </div>
                      <span className="text-slate-600">Build your organization's volunteer community</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-drop-500 hover:bg-drop-600 text-white font-semibold py-6 text-base group-hover:shadow-lg">
                    Register Organization
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Already have account */}
          <div className="text-center mt-12">
            <p className="text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="text-drop-600 font-semibold hover:text-drop-700 underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
