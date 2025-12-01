'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { StepIndicator } from '@/components/multi-step-form/step-indicator'
import { FormNavigation } from '@/components/multi-step-form/form-navigation'
import { PageLoading } from '@/components/ui/page-loading'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGuestOnly } from '@/hooks/use-auth-redirect'
import { authApi, ApiError } from '@/lib/api-client'
import { toast } from 'sonner'

// Form validation schema
const volunteerSchema = z.object({
  // Step 1: Basic Info
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),

  // Step 2: Location & Interests
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode required'),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  skills: z.string().optional(),
  availability: z.string().min(1, 'Please select your availability'),

  // Step 3: About You
  bio: z.string().optional(),
  experience: z.string().optional(),
  motivation: z.string().optional(),

  // Step 4: Terms
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type VolunteerFormData = z.infer<typeof volunteerSchema>

const STEPS = [
  { number: 1, title: 'Basic Info' },
  { number: 2, title: 'Location & Interests' },
  { number: 3, title: 'About You' },
  { number: 4, title: 'Review & Submit' },
]

const INTEREST_OPTIONS = [
  'Education',
  'Environment',
  'Healthcare',
  'Animal Welfare',
  'Community Development',
  'Disaster Relief',
  'Women Empowerment',
  'Child Welfare',
]

const AVAILABILITY_OPTIONS = [
  'Weekdays (1-5 hours/week)',
  'Weekdays (6-10 hours/week)',
  'Weekends (1-5 hours/week)',
  'Weekends (6-10 hours/week)',
  'Flexible (As per opportunity)',
]

export default function VolunteerRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { isLoading, shouldRender } = useGuestOnly('/')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
    mode: 'onChange',
    defaultValues: {
      interests: [],
      agreeToTerms: false,
    },
  })

  // Show loading state while checking auth
  if (isLoading) {
    return <PageLoading />
  }

  // Don't render register page if user is already logged in
  if (!shouldRender) {
    return null
  }

  const interests = watch('interests') || []
  const agreeToTerms = watch('agreeToTerms')

  const handleNext = async () => {
    let fieldsToValidate: (keyof VolunteerFormData)[] = []

    if (currentStep === 1) {
      fieldsToValidate = ['fullName', 'email', 'password', 'confirmPassword', 'phone']
    } else if (currentStep === 2) {
      fieldsToValidate = ['city', 'state', 'pincode', 'interests', 'availability']
    } else if (currentStep === 3) {
      // Optional fields, can proceed
      setCurrentStep(currentStep + 1)
      return
    } else if (currentStep === 4) {
      // Final submit
      handleSubmit(onSubmit)()
      return
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const toggleInterest = (interest: string) => {
    const currentInterests = interests || []
    if (currentInterests.includes(interest)) {
      setValue('interests', currentInterests.filter((i) => i !== interest))
    } else {
      setValue('interests', [...currentInterests, interest])
    }
  }

  const onSubmit = async (data: VolunteerFormData) => {
    setIsSubmitting(true)
    try {
      // Remove confirmPassword and agreeToTerms before sending to API
      const { confirmPassword, agreeToTerms, ...registrationData } = data

      await authApi.registerVolunteer(registrationData)

      toast.success('Registration successful! Please check your email to verify your account.')
      router.push('/volunteer/register/success')
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Registration failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex-1 min-h-screen bg-gradient-to-b from-drop-50 to-white py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-drop-500 mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
              Become a Volunteer
            </h1>
            <p className="text-slate-600">
              Join our community of changemakers
            </p>
          </div>

          <Card className="border-2">
            <CardHeader>
              <StepIndicator steps={STEPS} currentStep={currentStep} />
            </CardHeader>

            <CardContent>
              <form>
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <CardTitle className="text-2xl mb-2">Basic Information</CardTitle>
                      <CardDescription>
                        Let's start with your basic details
                      </CardDescription>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          {...register('fullName')}
                          placeholder="John Doe"
                          className="mt-1"
                        />
                        {errors.fullName && (
                          <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          placeholder="john@example.com"
                          className="mt-1"
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...register('phone')}
                          placeholder="+91 98765 43210"
                          className="mt-1"
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          {...register('password')}
                          placeholder="Minimum 8 characters"
                          className="mt-1"
                        />
                        {errors.password && (
                          <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          {...register('confirmPassword')}
                          placeholder="Re-enter your password"
                          className="mt-1"
                        />
                        {errors.confirmPassword && (
                          <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Location & Interests */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <CardTitle className="text-2xl mb-2">Location & Interests</CardTitle>
                      <CardDescription>
                        Help us match you with the right opportunities
                      </CardDescription>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            {...register('city')}
                            placeholder="Mumbai"
                            className="mt-1"
                          />
                          {errors.city && (
                            <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            {...register('state')}
                            placeholder="Maharashtra"
                            className="mt-1"
                          />
                          {errors.state && (
                            <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          {...register('pincode')}
                          placeholder="400001"
                          className="mt-1"
                        />
                        {errors.pincode && (
                          <p className="text-sm text-red-500 mt-1">{errors.pincode.message}</p>
                        )}
                      </div>

                      <div>
                        <Label>Interest Areas * (Select all that apply)</Label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {INTEREST_OPTIONS.map((interest) => (
                            <div
                              key={interest}
                              onClick={() => toggleInterest(interest)}
                              className={`
                                px-4 py-3 rounded-lg border-2 cursor-pointer transition-all
                                ${interests.includes(interest)
                                  ? 'border-drop-500 bg-drop-50'
                                  : 'border-slate-200 hover:border-drop-200'
                                }
                              `}
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={interests.includes(interest)}
                                  onCheckedChange={() => toggleInterest(interest)}
                                />
                                <span className="text-sm font-medium">{interest}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {errors.interests && (
                          <p className="text-sm text-red-500 mt-1">{errors.interests.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="skills">Skills (Optional)</Label>
                        <Input
                          id="skills"
                          {...register('skills')}
                          placeholder="e.g., Teaching, First Aid, Driving, Graphic Design"
                          className="mt-1"
                        />
                        <p className="text-xs text-slate-500 mt-1">Comma-separated list</p>
                      </div>

                      <div>
                        <Label>Availability *</Label>
                        <select
                          {...register('availability')}
                          className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-drop-500"
                        >
                          <option value="">Select your availability</option>
                          {AVAILABILITY_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {errors.availability && (
                          <p className="text-sm text-red-500 mt-1">{errors.availability.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: About You */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <CardTitle className="text-2xl mb-2">About You</CardTitle>
                      <CardDescription>
                        Tell us more about yourself (optional)
                      </CardDescription>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bio">Short Bio</Label>
                        <Textarea
                          id="bio"
                          {...register('bio')}
                          placeholder="Tell us a bit about yourself..."
                          className="mt-1 min-h-[100px]"
                        />
                        <p className="text-xs text-slate-500 mt-1">Optional</p>
                      </div>

                      <div>
                        <Label htmlFor="experience">Previous Volunteering Experience</Label>
                        <Textarea
                          id="experience"
                          {...register('experience')}
                          placeholder="Share your previous volunteering experience, if any..."
                          className="mt-1 min-h-[100px]"
                        />
                        <p className="text-xs text-slate-500 mt-1">Optional</p>
                      </div>

                      <div>
                        <Label htmlFor="motivation">Why do you want to volunteer?</Label>
                        <Textarea
                          id="motivation"
                          {...register('motivation')}
                          placeholder="What motivates you to volunteer?"
                          className="mt-1 min-h-[100px]"
                        />
                        <p className="text-xs text-slate-500 mt-1">Optional</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Review & Submit */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <CardTitle className="text-2xl mb-2">Review & Submit</CardTitle>
                      <CardDescription>
                        Please review your information before submitting
                      </CardDescription>
                    </div>

                    <div className="space-y-4 bg-slate-50 rounded-lg p-6">
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">Personal Information</h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-slate-600">Name:</span> {watch('fullName')}</p>
                          <p><span className="text-slate-600">Email:</span> {watch('email')}</p>
                          <p><span className="text-slate-600">Phone:</span> {watch('phone')}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">Location</h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-slate-600">City:</span> {watch('city')}</p>
                          <p><span className="text-slate-600">State:</span> {watch('state')}</p>
                          <p><span className="text-slate-600">Pincode:</span> {watch('pincode')}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">Interests & Availability</h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-slate-600">Interests:</span> {interests.join(', ')}</p>
                          <p><span className="text-slate-600">Availability:</span> {watch('availability')}</p>
                          {watch('skills') && <p><span className="text-slate-600">Skills:</span> {watch('skills')}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-drop-50 rounded-lg">
                      <Checkbox
                        id="terms"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setValue('agreeToTerms', checked as boolean)}
                      />
                      <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer">
                        I agree to the{' '}
                        <Link href="/terms" className="text-drop-600 font-semibold hover:underline">
                          Terms & Conditions
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-drop-600 font-semibold hover:underline">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="text-sm text-red-500">{errors.agreeToTerms.message}</p>
                    )}
                  </div>
                )}

                <FormNavigation
                  currentStep={currentStep}
                  totalSteps={STEPS.length}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  isSubmitting={isSubmitting}
                  canGoNext={currentStep === 4 ? agreeToTerms : true}
                />
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="text-drop-600 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
