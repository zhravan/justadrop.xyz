'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Mail, Clock, Shield, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function OrganizationRegisterSuccessPage() {
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleResendEmail = async () => {
    // Try to get email from localStorage
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
          <Card className="border-2 border-green-200 shadow-lg">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-black text-slate-900">
                Registration Submitted Successfully!
              </CardTitle>
              <CardDescription className="text-base">
                Thank you for registering your organization with Just A Drop
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Next Steps */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">What happens next?</h3>
                
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-drop-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-drop-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">1. Verify Your Email</h4>
                      <p className="text-sm text-slate-600">
                        Check your inbox for a verification email. Click the link to verify your email address.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-drop-100 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-drop-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">2. Admin Review</h4>
                      <p className="text-sm text-slate-600">
                        Our team will review your organization details and documents. This typically takes 2-3 business days.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-drop-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-drop-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">3. Approval Notification</h4>
                      <p className="text-sm text-slate-600">
                        Once approved, you'll receive an email notification. You can then start posting volunteer opportunities!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> Make sure to check your spam folder if you don't see the verification email within a few minutes.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button className="flex-1 bg-drop-500 hover:bg-drop-600" asChild>
                  <Link href="/">Go to Home</Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>

              {/* Resend Email */}
              <div className="text-center pt-4 border-t">
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

              {/* Contact Support */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-slate-600">
                  Have questions?{' '}
                  <Link href="/contact" className="text-drop-600 hover:underline font-semibold">
                    Contact Support
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
