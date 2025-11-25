'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function VolunteerRegistrationSuccessPage() {
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleResendEmail = async () => {
    // Try to get email from localStorage or session
    const email = localStorage.getItem('registrationEmail')

    if (!email) {
      setResendMessage('Email address not found. Please register again.')
      return
    }

    setResendLoading(true)
    setResendMessage('')

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (response.ok) {
        setResendMessage('✓ Verification email sent! Please check your inbox.')
      } else {
        setResendMessage(`✗ ${result.message || 'Failed to resend email. Please try again.'}`)
      }
    } catch (error) {
      console.error('Resend error:', error)
      setResendMessage('✗ An error occurred. Please try again later.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <main className="flex-1 min-h-screen bg-gradient-to-b from-drop-50 to-white flex items-center justify-center py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-drop-200">
            <CardHeader className="text-center pb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-drop-500 mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
                Registration Successful!
              </CardTitle>
              <CardDescription className="text-lg">
                Welcome to the Just A Drop community
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-drop-50 rounded-lg p-6 text-center">
                <Mail className="w-12 h-12 text-drop-600 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2 text-lg">
                  Verify Your Email
                </h3>
                <p className="text-slate-600">
                  We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
                </p>
              </div>

              <div className="space-y-4 text-sm text-slate-600">
                <p className="font-medium text-slate-900">What's next?</p>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-drop-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-drop-600 font-bold">1</span>
                    </div>
                    <span>Check your email and click the verification link</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-drop-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-drop-600 font-bold">2</span>
                    </div>
                    <span>Once verified, you can sign in to your account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-drop-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-drop-600 font-bold">3</span>
                    </div>
                    <span>Browse and apply for volunteer opportunities</span>
                  </li>
                </ol>
              </div>

              <div className="pt-6 space-y-3">
                <Button
                  asChild
                  className="w-full bg-drop-500 hover:bg-drop-600 font-semibold"
                >
                  <Link href="/login">
                    Go to Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href="/">
                    Back to Home
                  </Link>
                </Button>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-slate-500 mb-2">
                  Didn't receive the email?{' '}
                  <button
                    onClick={handleResendEmail}
                    disabled={resendLoading}
                    className="text-drop-600 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Resend verification email'
                    )}
                  </button>
                </p>
                {resendMessage && (
                  <p className={`text-sm mt-2 ${resendMessage.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                    {resendMessage}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
