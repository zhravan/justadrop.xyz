'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { authApi, ApiError } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

type VerificationStatus = 'verifying' | 'success' | 'error'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<VerificationStatus>('verifying')
  const [message, setMessage] = useState('')
  const hasVerified = useRef(false)

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. No token provided.')
      return
    }

    // Prevent duplicate API calls
    if (hasVerified.current) {
      return
    }
    hasVerified.current = true

    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    try {
      const result = await authApi.verifyEmail(token)
      
      setStatus('success')
      setMessage(result.message || 'Email verified successfully!')
      toast.success('Email verified successfully!')
    } catch (error) {
      setStatus('error')
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'An error occurred during verification. Please try again.'
      setMessage(errorMessage)
      toast.error(errorMessage)
      console.error('Verification error:', error)
    }
  }

  return (
    <main className="flex-1 min-h-screen bg-gradient-to-b from-drop-50 to-white flex items-center justify-center py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-drop-200">
            <CardHeader className="text-center pb-8">
              {status === 'verifying' && (
                <>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-drop-100 mx-auto mb-6">
                    <Loader2 className="w-10 h-10 text-drop-600 animate-spin" />
                  </div>
                  <CardTitle className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
                    Verifying Your Email...
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Please wait while we verify your email address
                  </CardDescription>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-drop-500 mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
                    Email Verified!
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Your email has been successfully verified
                  </CardDescription>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500 mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
                    Verification Failed
                  </CardTitle>
                  <CardDescription className="text-lg">
                    We couldn't verify your email address
                  </CardDescription>
                </>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-drop-50 rounded-lg p-6 text-center">
                <p className="text-slate-700">{message}</p>
              </div>

              {status === 'success' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      {message.includes('organization')
                        ? 'Your organization registration is pending admin approval. You will be notified once approved.'
                        : 'You can now sign in to your account and start exploring volunteer opportunities!'
                      }
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button
                      asChild
                      className="w-full bg-drop-500 hover:bg-drop-600 font-semibold"
                    >
                      <Link href="/login">
                        Sign In Now
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800 mb-2">
                      <strong>Common reasons for verification failure:</strong>
                    </p>
                    <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                      <li>The verification link has expired (valid for 24 hours)</li>
                      <li>The link has already been used</li>
                      <li>The link is invalid or corrupted</li>
                    </ul>
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full"
                    >
                      <Link href="/">
                        Back to Home
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {status === 'verifying' && (
                <div className="text-center">
                  <p className="text-sm text-slate-500">
                    This should only take a moment...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
