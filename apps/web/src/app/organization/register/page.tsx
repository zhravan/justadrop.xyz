'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGuestOnly } from '@/hooks/use-auth-redirect'
import { authApi, ApiError } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { StepIndicator } from '@/components/multi-step-form/step-indicator'
import { FormNavigation } from '@/components/multi-step-form/form-navigation'
import { PageLoading } from '@/components/ui/page-loading'
import { Building2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// Types
type OrganizationType = 'ngo' | 'trust' | 'society' | 'non_profit_company' | 'section_8_company' | 'other'
type OrganizationSize = 'micro' | 'small' | 'medium' | 'large'

interface OrganizationFormData {
  // Step 1: Basic Information
  name: string
  email: string
  password: string
  confirmPassword: string
  organizationType: OrganizationType
  yearEstablished: string
  registrationNumber: string
  organizationSize: OrganizationSize
  description: string

  // Step 2: Documents
  registrationCertificateUrl: string
  panUrl?: string
  certificate80gUrl?: string
  certificate12aUrl?: string
  addressProofUrl?: string
  csrApprovalCertificateUrl?: string
  fcraRegistrationUrl?: string

  // Step 3: Location & Causes
  city: string
  state: string
  country: string
  causes: string[]
  website?: string
  facebookUrl?: string
  twitterUrl?: string
  instagramUrl?: string
  linkedinUrl?: string

  // Step 4: Volunteer Preferences
  preferredVolunteerType: string[]
  csrEligible: boolean
  fcraRegistered: boolean
  ageRestrictions?: string
  genderRestrictions?: string
  requiredSkills?: string

  // Step 5: Contact Information
  contactName: string
  contactEmail: string
  contactPhone: string
  contactDesignation: string

  // Terms
  agreeToTerms: boolean
}

const CAUSES = [
  'Environment',
  'Education',
  'Healthcare',
  'Elderly Care',
  'Child Welfare',
  'Women Empowerment',
  'Animal Welfare',
  'Poverty Alleviation',
  'Disaster Relief',
  'Skill Development',
  'Rural Development',
  'Arts & Culture',
]

const VOLUNTEER_TYPES = [
  'Skilled Volunteers',
  'Remote Volunteers',
  'Field Work',
  'Event Support',
  'Teaching',
  'Technical Support',
  'Administrative Support',
]

const STEPS = [
  { number: 1, title: 'Basic Info' },
  { number: 2, title: 'Documents' },
  { number: 3, title: 'Location & Causes' },
  { number: 4, title: 'Volunteer Preferences' },
  { number: 5, title: 'Contact Info' },
  { number: 6, title: 'Review & Submit' },
]

export default function OrganizationRegisterPage() {
  const router = useRouter()
  const { isLoading, shouldRender } = useGuestOnly('/')
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationType: 'ngo',
    yearEstablished: '',
    registrationNumber: '',
    organizationSize: 'small',
    description: '',
    registrationCertificateUrl: '',
    city: '',
    state: '',
    country: 'India',
    causes: [],
    preferredVolunteerType: [],
    csrEligible: false,
    fcraRegistered: false,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactDesignation: '',
    agreeToTerms: false,
  })

  // Show loading state while checking auth
  if (isLoading) {
    return <PageLoading />
  }

  // Don't render if user is already logged in
  if (!shouldRender) {
    return null
  }

  const totalSteps = 6

  const handleInputChange = (field: keyof OrganizationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const toggleArrayValue = (field: 'causes' | 'preferredVolunteerType', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Organization name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'
        if (!formData.password) newErrors.password = 'Password is required'
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
        if (!formData.yearEstablished) newErrors.yearEstablished = 'Year of establishment is required'
        else if (!/^(19|20)\d{2}$/.test(formData.yearEstablished)) newErrors.yearEstablished = 'Invalid year format'
        if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required'
        if (!formData.description.trim()) newErrors.description = 'Description is required'
        else if (formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters'
        break

      case 2:
        if (!formData.registrationCertificateUrl.trim()) newErrors.registrationCertificateUrl = 'Registration certificate URL is required'
        break

      case 3:
        if (!formData.city.trim()) newErrors.city = 'City is required'
        if (!formData.state.trim()) newErrors.state = 'State is required'
        if (formData.causes.length === 0) newErrors.causes = 'Select at least one cause'
        break

      case 4:
        if (formData.preferredVolunteerType.length === 0) newErrors.preferredVolunteerType = 'Select at least one volunteer type'
        break

      case 5:
        if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required'
        if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) newErrors.contactEmail = 'Invalid email format'
        if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required'
        if (!formData.contactDesignation.trim()) newErrors.contactDesignation = 'Designation is required'
        break

      case 6:
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        description: formData.description,
        organizationType: formData.organizationType,
        yearEstablished: formData.yearEstablished,
        registrationNumber: formData.registrationNumber,
        organizationSize: formData.organizationSize,
        registrationCertificateUrl: formData.registrationCertificateUrl,
        panUrl: formData.panUrl || undefined,
        certificate80gUrl: formData.certificate80gUrl || undefined,
        certificate12aUrl: formData.certificate12aUrl || undefined,
        addressProofUrl: formData.addressProofUrl || undefined,
        csrApprovalCertificateUrl: formData.csrApprovalCertificateUrl || undefined,
        fcraRegistrationUrl: formData.fcraRegistrationUrl || undefined,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        causes: formData.causes,
        website: formData.website || undefined,
        socialLinks: {
          facebook: formData.facebookUrl || undefined,
          twitter: formData.twitterUrl || undefined,
          instagram: formData.instagramUrl || undefined,
          linkedin: formData.linkedinUrl || undefined,
        },
        preferredVolunteerType: formData.preferredVolunteerType,
        csrEligible: formData.csrEligible,
        fcraRegistered: formData.fcraRegistered,
        ageRestrictions: formData.ageRestrictions || undefined,
        genderRestrictions: formData.genderRestrictions || undefined,
        requiredSkills: formData.requiredSkills ? formData.requiredSkills.split(',').map(s => s.trim()) : undefined,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        contactDesignation: formData.contactDesignation,
      }

      await authApi.registerOrganization(payload)

      toast.success('Registration successful! Please check your email to verify your account.')
      router.push('/organization/register/success')
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
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
              Register Your Organization
            </h1>
            <p className="text-slate-600">
              Join our network of verified NGOs and connect with passionate volunteers
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator steps={STEPS} currentStep={currentStep} />

          {/* Form Card */}
          <Card className="border-2 border-drop-200 mt-8">
            <CardHeader>
              <CardTitle className="text-2xl">
                {currentStep === 1 && 'Basic Information'}
                {currentStep === 2 && 'Documents'}
                {currentStep === 3 && 'Location & Causes'}
                {currentStep === 4 && 'Volunteer Preferences'}
                {currentStep === 5 && 'Contact Information'}
                {currentStep === 6 && 'Review & Submit'}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && 'Tell us about your organization'}
                {currentStep === 2 && 'Upload your registration and compliance documents'}
                {currentStep === 3 && 'Where do you operate and what causes do you support?'}
                {currentStep === 4 && 'What kind of volunteers do you need?'}
                {currentStep === 5 && 'Primary contact details'}
                {currentStep === 6 && 'Please review your information before submitting'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organizationType">Organization Type *</Label>
                      <select
                        id="organizationType"
                        value={formData.organizationType}
                        onChange={(e) => handleInputChange('organizationType', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="ngo">NGO</option>
                        <option value="trust">Trust</option>
                        <option value="society">Society</option>
                        <option value="non_profit_company">Non-profit Company</option>
                        <option value="section_8_company">Section 8 Company</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={errors.password ? 'border-red-500' : ''}
                      />
                      {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearEstablished">Year Established *</Label>
                      <Input
                        id="yearEstablished"
                        placeholder="e.g., 2010"
                        value={formData.yearEstablished}
                        onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                        className={errors.yearEstablished ? 'border-red-500' : ''}
                      />
                      {errors.yearEstablished && <p className="text-sm text-red-500">{errors.yearEstablished}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Registration Number *</Label>
                      <Input
                        id="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                        className={errors.registrationNumber ? 'border-red-500' : ''}
                      />
                      {errors.registrationNumber && <p className="text-sm text-red-500">{errors.registrationNumber}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organizationSize">Organization Size *</Label>
                      <select
                        id="organizationSize"
                        value={formData.organizationSize}
                        onChange={(e) => handleInputChange('organizationSize', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="micro">Micro (1-10)</option>
                        <option value="small">Small (11-50)</option>
                        <option value="medium">Medium (51-200)</option>
                        <option value="large">Large (200+)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description (1-2 sentences) *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your organization's mission and work..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      maxLength={500}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-slate-500">{formData.description.length}/500 characters</p>
                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                  </div>
                </>
              )}

              {/* Step 2: Documents */}
              {currentStep === 2 && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Please upload your documents to Google Drive, Dropbox, or any cloud storage and paste the shareable links below. Make sure the links are publicly accessible.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registrationCertificateUrl">Registration Certificate URL *</Label>
                    <Input
                      id="registrationCertificateUrl"
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={formData.registrationCertificateUrl}
                      onChange={(e) => handleInputChange('registrationCertificateUrl', e.target.value)}
                      className={errors.registrationCertificateUrl ? 'border-red-500' : ''}
                    />
                    {errors.registrationCertificateUrl && <p className="text-sm text-red-500">{errors.registrationCertificateUrl}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="panUrl">PAN Card URL (Optional)</Label>
                    <Input
                      id="panUrl"
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={formData.panUrl}
                      onChange={(e) => handleInputChange('panUrl', e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="certificate80gUrl">80G Certificate URL (Optional)</Label>
                      <Input
                        id="certificate80gUrl"
                        type="url"
                        placeholder="https://drive.google.com/..."
                        value={formData.certificate80gUrl}
                        onChange={(e) => handleInputChange('certificate80gUrl', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certificate12aUrl">12A Certificate URL (Optional)</Label>
                      <Input
                        id="certificate12aUrl"
                        type="url"
                        placeholder="https://drive.google.com/..."
                        value={formData.certificate12aUrl}
                        onChange={(e) => handleInputChange('certificate12aUrl', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressProofUrl">Address Proof URL (Optional)</Label>
                    <Input
                      id="addressProofUrl"
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={formData.addressProofUrl}
                      onChange={(e) => handleInputChange('addressProofUrl', e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="csrApprovalCertificateUrl">CSR Approval Certificate URL (Optional)</Label>
                      <Input
                        id="csrApprovalCertificateUrl"
                        type="url"
                        placeholder="https://drive.google.com/..."
                        value={formData.csrApprovalCertificateUrl}
                        onChange={(e) => handleInputChange('csrApprovalCertificateUrl', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fcraRegistrationUrl">FCRA Certificate URL (Optional)</Label>
                      <Input
                        id="fcraRegistrationUrl"
                        type="url"
                        placeholder="https://drive.google.com/..."
                        value={formData.fcraRegistrationUrl}
                        onChange={(e) => handleInputChange('fcraRegistrationUrl', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Location & Causes */}
              {currentStep === 3 && (
                <>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={errors.city ? 'border-red-500' : ''}
                      />
                      {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className={errors.state ? 'border-red-500' : ''}
                      />
                      {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Causes You Work For *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {CAUSES.map((cause) => (
                        <div key={cause} className="flex items-center space-x-2">
                          <Checkbox
                            id={`cause-${cause}`}
                            checked={formData.causes.includes(cause)}
                            onCheckedChange={() => toggleArrayValue('causes', cause)}
                          />
                          <label htmlFor={`cause-${cause}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {cause}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.causes && <p className="text-sm text-red-500">{errors.causes}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://www.yourorganization.org"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Social Media Links (Optional)</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Facebook URL"
                        value={formData.facebookUrl}
                        onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                      />
                      <Input
                        placeholder="Twitter URL"
                        value={formData.twitterUrl}
                        onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                      />
                      <Input
                        placeholder="Instagram URL"
                        value={formData.instagramUrl}
                        onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                      />
                      <Input
                        placeholder="LinkedIn URL"
                        value={formData.linkedinUrl}
                        onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 4: Volunteer Preferences */}
              {currentStep === 4 && (
                <>
                  <div className="space-y-2">
                    <Label>Preferred Volunteer Type *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {VOLUNTEER_TYPES.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`volunteer-${type}`}
                            checked={formData.preferredVolunteerType.includes(type)}
                            onCheckedChange={() => toggleArrayValue('preferredVolunteerType', type)}
                          />
                          <label htmlFor={`volunteer-${type}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.preferredVolunteerType && <p className="text-sm text-red-500">{errors.preferredVolunteerType}</p>}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="csrEligible"
                        checked={formData.csrEligible}
                        onCheckedChange={(checked) => handleInputChange('csrEligible', checked)}
                      />
                      <label htmlFor="csrEligible" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        CSR Eligible
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fcraRegistered"
                        checked={formData.fcraRegistered}
                        onCheckedChange={(checked) => handleInputChange('fcraRegistered', checked)}
                      />
                      <label htmlFor="fcraRegistered" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        FCRA Registered
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ageRestrictions">Age Restrictions (Optional)</Label>
                    <Input
                      id="ageRestrictions"
                      placeholder="e.g., 18+, 21-60, No restrictions"
                      value={formData.ageRestrictions}
                      onChange={(e) => handleInputChange('ageRestrictions', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genderRestrictions">Gender Restrictions (Optional)</Label>
                    <select
                      id="genderRestrictions"
                      value={formData.genderRestrictions}
                      onChange={(e) => handleInputChange('genderRestrictions', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">No restrictions</option>
                      <option value="Male only">Male only</option>
                      <option value="Female only">Female only</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requiredSkills">Required Skills (Optional)</Label>
                    <Input
                      id="requiredSkills"
                      placeholder="e.g., Teaching, Medical, Technical (comma-separated)"
                      value={formData.requiredSkills}
                      onChange={(e) => handleInputChange('requiredSkills', e.target.value)}
                    />
                    <p className="text-xs text-slate-500">Enter skills separated by commas</p>
                  </div>
                </>
              )}

              {/* Step 5: Contact Information */}
              {currentStep === 5 && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Primary Contact Name *</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                        className={errors.contactName ? 'border-red-500' : ''}
                      />
                      {errors.contactName && <p className="text-sm text-red-500">{errors.contactName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactDesignation">Designation *</Label>
                      <Input
                        id="contactDesignation"
                        placeholder="e.g., Coordinator, Founder, Admin"
                        value={formData.contactDesignation}
                        onChange={(e) => handleInputChange('contactDesignation', e.target.value)}
                        className={errors.contactDesignation ? 'border-red-500' : ''}
                      />
                      {errors.contactDesignation && <p className="text-sm text-red-500">{errors.contactDesignation}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Official Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        className={errors.contactEmail ? 'border-red-500' : ''}
                      />
                      {errors.contactEmail && <p className="text-sm text-red-500">{errors.contactEmail}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Official Phone Number *</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        className={errors.contactPhone ? 'border-red-500' : ''}
                      />
                      {errors.contactPhone && <p className="text-sm text-red-500">{errors.contactPhone}</p>}
                    </div>
                  </div>
                </>
              )}

              {/* Step 6: Review & Submit */}
              {currentStep === 6 && (
                <>
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-3 bg-slate-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 text-lg">Basic Information</h3>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-slate-600">Organization Name:</span>
                          <p className="font-medium text-slate-900">{formData.name}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Email:</span>
                          <p className="font-medium text-slate-900">{formData.email}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Type:</span>
                          <p className="font-medium text-slate-900 capitalize">{formData.organizationType.replace(/_/g, ' ')}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Year Established:</span>
                          <p className="font-medium text-slate-900">{formData.yearEstablished}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Registration Number:</span>
                          <p className="font-medium text-slate-900">{formData.registrationNumber}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Organization Size:</span>
                          <p className="font-medium text-slate-900 capitalize">{formData.organizationSize}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-600 text-sm">Description:</span>
                        <p className="font-medium text-slate-900 text-sm mt-1">{formData.description}</p>
                      </div>
                    </div>

                    {/* Location & Causes */}
                    <div className="space-y-3 bg-slate-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 text-lg">Location & Causes</h3>
                      <div className="grid md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-slate-600">City:</span>
                          <p className="font-medium text-slate-900">{formData.city}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">State:</span>
                          <p className="font-medium text-slate-900">{formData.state}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Country:</span>
                          <p className="font-medium text-slate-900">{formData.country}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-600 text-sm">Causes:</span>
                        <p className="font-medium text-slate-900 text-sm mt-1">{formData.causes.join(', ')}</p>
                      </div>
                      {formData.website && (
                        <div>
                          <span className="text-slate-600 text-sm">Website:</span>
                          <p className="font-medium text-slate-900 text-sm mt-1">{formData.website}</p>
                        </div>
                      )}
                    </div>

                    {/* Volunteer Preferences */}
                    <div className="space-y-3 bg-slate-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 text-lg">Volunteer Preferences</h3>
                      <div>
                        <span className="text-slate-600 text-sm">Preferred Volunteer Types:</span>
                        <p className="font-medium text-slate-900 text-sm mt-1">{formData.preferredVolunteerType.join(', ')}</p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-slate-600">CSR Eligible:</span>
                          <p className="font-medium text-slate-900">{formData.csrEligible ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">FCRA Registered:</span>
                          <p className="font-medium text-slate-900">{formData.fcraRegistered ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                      {formData.ageRestrictions && (
                        <div>
                          <span className="text-slate-600 text-sm">Age Restrictions:</span>
                          <p className="font-medium text-slate-900 text-sm mt-1">{formData.ageRestrictions}</p>
                        </div>
                      )}
                      {formData.genderRestrictions && (
                        <div>
                          <span className="text-slate-600 text-sm">Gender Restrictions:</span>
                          <p className="font-medium text-slate-900 text-sm mt-1">{formData.genderRestrictions}</p>
                        </div>
                      )}
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3 bg-slate-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 text-lg">Contact Information</h3>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-slate-600">Contact Name:</span>
                          <p className="font-medium text-slate-900">{formData.contactName}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Designation:</span>
                          <p className="font-medium text-slate-900">{formData.contactDesignation}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Email:</span>
                          <p className="font-medium text-slate-900">{formData.contactEmail}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Phone:</span>
                          <p className="font-medium text-slate-900">{formData.contactPhone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="space-y-3 bg-slate-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 text-lg">Documents Submitted</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span className="text-slate-700">Registration Certificate</span>
                        </div>
                        {formData.panUrl && (
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-slate-700">PAN Card</span>
                          </div>
                        )}
                        {formData.certificate80gUrl && (
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-slate-700">80G Certificate</span>
                          </div>
                        )}
                        {formData.certificate12aUrl && (
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-slate-700">12A Certificate</span>
                          </div>
                        )}
                        {formData.addressProofUrl && (
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-slate-700">Address Proof</span>
                          </div>
                        )}
                        {formData.csrApprovalCertificateUrl && (
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-slate-700">CSR Approval Certificate</span>
                          </div>
                        )}
                        {formData.fcraRegistrationUrl && (
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-slate-700">FCRA Certificate</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start gap-3 p-4 bg-drop-50 rounded-lg mt-6">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                    />
                    <label htmlFor="agreeToTerms" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                      I agree to the{' '}
                      <Link href="/terms" className="text-drop-600 font-semibold hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-drop-600 font-semibold hover:underline">
                        Privacy Policy
                      </Link>
                      . I confirm that all information provided is accurate and I have the authority to register this organization.
                    </label>
                  </div>
                  {errors.agreeToTerms && <p className="text-sm text-red-500 mt-2">{errors.agreeToTerms}</p>}
                </>
              )}

              {/* Navigation */}
              <FormNavigation
                currentStep={currentStep}
                totalSteps={totalSteps}
                onBack={handleBack}
                onNext={handleNext}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                canGoNext={currentStep === 6 ? formData.agreeToTerms : true}
              />

              {/* Back to Login */}
              <div className="text-center text-sm pt-4 border-t">
                <span className="text-slate-600">Already have an account? </span>
                <Link href="/login" className="text-drop-600 hover:text-drop-700 font-semibold">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
