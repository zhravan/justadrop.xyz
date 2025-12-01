'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useGuestOnly } from '@/hooks/use-auth-redirect'
import { authApi, ApiError } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { PageLoading } from '@/components/ui/page-loading'
import { Droplet } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

type UserType = 'volunteer' | 'organization' | 'admin'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { isLoading, shouldRender } = useGuestOnly('/')
  
  const [userType, setUserType] = useState<UserType>('volunteer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await authApi.login(userType, email, password, rememberMe)
      
      // Update auth context
      login(response.token, response.user, userType, rememberMe)

      toast.success(`Welcome back, ${response.user.name}!`)
      router.push('/')
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Login failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRegistrationLink = () => {
    switch (userType) {
      case 'volunteer':
        return '/volunteer/register'
      case 'organization':
        return '/organization/register'
      default:
        return null
    }
  }

  // Show loading state while checking auth
  if (isLoading) {
    return <PageLoading />
  }

  // Don't render login form if user is already logged in
  if (!shouldRender) {
    return null
  }

  return (
    <main className="flex-1 min-h-screen bg-gradient-to-b from-drop-50 to-white flex items-center justify-center py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-drop-500 mb-4">
              <Droplet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-600">
              Sign in to continue making a difference
            </p>
          </div>

          <Card className="border-2 border-drop-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Choose your account type and sign in
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Type Selector */}
                <div className="space-y-2">
                  <Label>I am a</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={userType === 'volunteer' ? 'default' : 'outline'}
                      className={userType === 'volunteer' ? 'bg-drop-500 hover:bg-drop-600' : ''}
                      onClick={() => setUserType('volunteer')}
                    >
                      Volunteer
                    </Button>
                    <Button
                      type="button"
                      variant={userType === 'organization' ? 'default' : 'outline'}
                      className={userType === 'organization' ? 'bg-drop-500 hover:bg-drop-600' : ''}
                      onClick={() => setUserType('organization')}
                    >
                      Organization
                    </Button>
                    <Button
                      type="button"
                      variant={userType === 'admin' ? 'default' : 'outline'}
                      className={userType === 'admin' ? 'bg-drop-500 hover:bg-drop-600' : ''}
                      onClick={() => setUserType('admin')}
                    >
                      Admin
                    </Button>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-drop-200 focus:border-drop-500"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-drop-200 focus:border-drop-500"
                  />
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-drop-500 hover:bg-drop-600 font-semibold"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>

                {/* Registration Link */}
                {getRegistrationLink() && (
                  <div className="text-center text-sm">
                    <span className="text-slate-600">Don't have an account? </span>
                    <Link
                      href={getRegistrationLink()!}
                      className="text-drop-600 hover:text-drop-700 font-semibold"
                    >
                      Sign up as {userType}
                    </Link>
                  </div>
                )}

                {/* Back to Home */}
                <div className="text-center text-sm">
                  <Link
                    href="/"
                    className="text-slate-500 hover:text-slate-700"
                  >
                    ← Back to home
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
