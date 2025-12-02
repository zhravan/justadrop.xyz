'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { opportunitiesApi } from '@/lib/api-client';
import type { CreateOpportunityRequest } from '@justadrop/types';
import { 
  validateOpportunityField,
  validateOpportunityForm,
  OPPORTUNITY_VALIDATION,
  VALIDATION_MESSAGES,
  type OpportunityFormData 
} from '@justadrop/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { StepIndicator } from '@/components/multi-step-form/step-indicator';
import { FormNavigation } from '@/components/multi-step-form/form-navigation';
import { Briefcase, MapPin, Calendar, Users, Award, CheckCircle2, AlertCircle } from 'lucide-react';

type OpportunityFormData = Partial<Omit<CreateOpportunityRequest, 'creatorType' | 'creatorId'>> & {
  title: string;
  shortSummary: string;
  description: string;
  causeCategory: string;
  mode: 'onsite' | 'remote' | 'hybrid';
  dateType: 'single_day' | 'multi_day' | 'ongoing';
};

type ValidationErrors = {
  [key: string]: string;
};

const initialFormData: OpportunityFormData = {
  title: '',
  shortSummary: '',
  description: '',
  causeCategory: 'community',
  mode: 'onsite',
  dateType: 'single_day',
  skillsRequired: [],
  languagePreferences: [],
  maxVolunteers: 10,
  certificateOffered: false,
};

const STEPS = [
  { number: 1, title: 'Basic Info' },
  { number: 2, title: 'Location & Mode' },
  { number: 3, title: 'Schedule' },
  { number: 4, title: 'Requirements' },
  { number: 5, title: 'Review & Submit' },
];

export default function CreateOpportunityForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OpportunityFormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, token, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <main className="flex-1 min-h-screen bg-gradient-to-b from-drop-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-drop-500"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </main>
    );
  }

  // Don't render form if not authenticated
  if (!user) {
    return null;
  }

  const FieldError = ({ field }: { field: string }) => {
    if (!touchedFields.has(field) || !validationErrors[field]) {
      return null;
    }
    return (
      <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
        <AlertCircle className="w-4 h-4" />
        <span>{validationErrors[field]}</span>
      </div>
    );
  };

  const getFieldClassName = (field: string) => {
    const baseClass = "w-full border rounded-md p-2";
    if (touchedFields.has(field) && validationErrors[field]) {
      return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500`;
    }
    return `${baseClass} border-gray-300`;
  };

  const updateField = (field: keyof OpportunityFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(field));
    
    // Validate the specific field
    const error = validateOpportunityField(field, value, { ...formData, [field]: value } as any);
    
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  const validateStep = (stepNumber: number): boolean => {
    const fieldsToValidate: string[] = [];
    
    switch (stepNumber) {
      case 1:
        fieldsToValidate.push('title', 'shortSummary', 'description');
        break;
      case 2:
        fieldsToValidate.push('mode');
        if (formData.mode !== 'remote') {
          fieldsToValidate.push('address', 'city', 'state', 'country');
        }
        if (formData.osrmLink) {
          fieldsToValidate.push('osrmLink');
        }
        break;
      case 3:
        fieldsToValidate.push('dateType');
        if (formData.dateType === 'single_day') {
          fieldsToValidate.push('startDate');
        } else if (formData.dateType === 'multi_day') {
          fieldsToValidate.push('startDate', 'endDate');
        }
        break;
      case 4:
        fieldsToValidate.push('maxVolunteers', 'contactName', 'contactEmail', 'contactPhone');
        break;
    }
    
    let hasErrors = false;
    const newErrors: ValidationErrors = { ...validationErrors };
    
    fieldsToValidate.forEach(field => {
      const value = formData[field as keyof OpportunityFormData];
      const error = validateOpportunityField(field, value, formData as any);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
      setTouchedFields(prev => new Set(prev).add(field));
    });
    
    setValidationErrors(newErrors);
    return !hasErrors;
  };

  const handleNext = (currentStep: number) => {
    if (validateStep(currentStep)) {
      setStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    // Validate the entire form before submission
    const validation = validateOpportunityForm(formData as any);
    
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      setError('Please fix all validation errors before submitting');
      // Mark all fields as touched to show errors
      const allFields = Object.keys(validation.errors);
      setTouchedFields(new Set(allFields));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare submission data with proper handling of optional fields
      const submitData: CreateOpportunityRequest = {
        title: formData.title,
        shortSummary: formData.shortSummary,
        description: formData.description,
        causeCategory: formData.causeCategory,
        skillsRequired: formData.skillsRequired || [],
        languagePreferences: formData.languagePreferences || [],
        mode: formData.mode,
        // Address is optional for remote mode, required for onsite/hybrid
        ...(formData.mode !== 'remote' && { address: formData.address }),
        // City, state, country are optional for remote mode, required for onsite/hybrid
        ...(formData.mode !== 'remote' && formData.city && { city: formData.city }),
        ...(formData.mode !== 'remote' && formData.state && { state: formData.state }),
        ...(formData.mode !== 'remote' && formData.country && { country: formData.country }),
        ...(formData.osrmLink && { osrmLink: formData.osrmLink }),
        dateType: formData.dateType,
        // For ongoing opportunities, startDate is optional (backend will default to now)
        // For single_day and multi_day, startDate is required
        ...(formData.dateType !== 'ongoing' && formData.startDate && { startDate: formData.startDate }),
        ...(formData.endDate && { endDate: formData.endDate }),
        ...(formData.startTime && { startTime: formData.startTime }),
        ...(formData.endTime && { endTime: formData.endTime }),
        ...(formData.maxVolunteers !== undefined && { maxVolunteers: formData.maxVolunteers }),
        ...(formData.agePreference && { agePreference: formData.agePreference }),
        ...(formData.genderPreference && { genderPreference: formData.genderPreference }),
        certificateOffered: formData.certificateOffered,
        ...(formData.stipendInfo && { stipendInfo: formData.stipendInfo }),
        contactName: formData.contactName!,
        contactEmail: formData.contactEmail!,
        contactPhone: formData.contactPhone!,
      };
      
      await opportunitiesApi.create(submitData);
      router.push('/opportunities?created=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create opportunity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 min-h-screen bg-gradient-to-b from-drop-50 to-white py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-drop-500 mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
              Create Opportunity
            </h1>
            <p className="text-slate-600">
              Share a meaningful volunteering opportunity with the community
            </p>
          </div>

          <Card className="border-2">
            <CardHeader>
              <StepIndicator steps={STEPS} currentStep={step} />
            </CardHeader>

            <CardContent>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                      <p className="text-red-700 text-sm">{error}</p>
                      {Object.keys(validationErrors).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-red-200">
                          <p className="text-sm font-medium text-red-900 mb-2">Validation Errors:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {Object.entries(validationErrors).map(([field, message]) => (
                              <li key={field} className="text-sm text-red-700">
                                <span className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</span> {message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <CardTitle className="text-2xl mb-2">Basic Information</CardTitle>
                    <CardDescription>
                      Tell us about your volunteering opportunity
                    </CardDescription>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">
                        Opportunity Title * 
                        <span className="text-xs text-gray-500 ml-2">
                          ({OPPORTUNITY_VALIDATION.title.minLength}-{OPPORTUNITY_VALIDATION.title.maxLength} characters)
                        </span>
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={e => updateField('title', e.target.value)}
                        onBlur={() => setTouchedFields(prev => new Set(prev).add('title'))}
                        placeholder="e.g., Beach Cleanup Drive"
                        className={getFieldClassName('title')}
                        required
                      />
                      <FieldError field="title" />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.title.length}/{OPPORTUNITY_VALIDATION.title.maxLength}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="shortSummary">
                        Short Summary *
                        <span className="text-xs text-gray-500 ml-2">
                          ({OPPORTUNITY_VALIDATION.shortSummary.minLength}-{OPPORTUNITY_VALIDATION.shortSummary.maxLength} characters)
                        </span>
                      </Label>
                      <Input
                        id="shortSummary"
                        value={formData.shortSummary}
                        onChange={e => updateField('shortSummary', e.target.value)}
                        onBlur={() => setTouchedFields(prev => new Set(prev).add('shortSummary'))}
                        placeholder="Brief one-line description"
                        className={getFieldClassName('shortSummary')}
                        required
                      />
                      <FieldError field="shortSummary" />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.shortSummary.length}/{OPPORTUNITY_VALIDATION.shortSummary.maxLength}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="description">
                        Full Description *
                        <span className="text-xs text-gray-500 ml-2">
                          ({OPPORTUNITY_VALIDATION.description.minLength}-{OPPORTUNITY_VALIDATION.description.maxLength} characters)
                        </span>
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={e => updateField('description', e.target.value)}
                        onBlur={() => setTouchedFields(prev => new Set(prev).add('description'))}
                        placeholder="Describe the opportunity, what volunteers will do, and impact"
                        rows={6}
                        className={getFieldClassName('description')}
                        required
                      />
                      <FieldError field="description" />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.description.length}/{OPPORTUNITY_VALIDATION.description.maxLength}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="causeCategory">Cause Category *</Label>
                      <select
                        id="causeCategory"
                        value={formData.causeCategory}
                        onChange={e => updateField('causeCategory', e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2"
                      >
                        <option value="community">Community Development</option>
                        <option value="education">Education</option>
                        <option value="health">Health & Wellness</option>
                        <option value="environment">Environment</option>
                        <option value="animals">Animal Welfare</option>
                        <option value="disaster">Disaster Relief</option>
                        <option value="elderly">Elderly Care</option>
                        <option value="children">Children & Youth</option>
                      </select>
                    </div>
                  </div>

                  <FormNavigation
                    currentStep={1}
                    totalSteps={5}
                    onNext={() => handleNext(1)}
                    canGoNext={!!(formData.title && formData.shortSummary && formData.description)}
                  />
                </div>
              )}

        {/* Step 2: Location & Mode */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <CardTitle className="text-2xl mb-2">Location & Mode</CardTitle>
              <CardDescription>
                Where will volunteers participate?
              </CardDescription>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="mode">Opportunity Mode *</Label>
              <select
                id="mode"
                value={formData.mode}
                onChange={e => updateField('mode', e.target.value as 'onsite' | 'remote' | 'hybrid')}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="onsite">On-site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {formData.mode === 'remote' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Remote opportunities don't require a physical address. Volunteers can participate from anywhere.
                </p>
              </div>
            )}

            {(formData.mode === 'onsite' || formData.mode === 'hybrid') && (
              <>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={e => updateField('address', e.target.value)}
                    onBlur={() => setTouchedFields(prev => new Set(prev).add('address'))}
                    placeholder="Street address"
                    className={getFieldClassName('address')}
                    required
                  />
                  <FieldError field="address" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={e => updateField('city', e.target.value)}
                      onBlur={() => setTouchedFields(prev => new Set(prev).add('city'))}
                      className={getFieldClassName('city')}
                      required
                    />
                    <FieldError field="city" />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state || ''}
                      onChange={e => updateField('state', e.target.value)}
                      onBlur={() => setTouchedFields(prev => new Set(prev).add('state'))}
                      className={getFieldClassName('state')}
                      required
                    />
                    <FieldError field="state" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country || 'India'}
                    onChange={e => updateField('country', e.target.value)}
                    onBlur={() => setTouchedFields(prev => new Set(prev).add('country'))}
                    className={getFieldClassName('country')}
                    required
                  />
                  <FieldError field="country" />
                </div>

                <div>
                  <Label htmlFor="osrmLink">Maps Link (optional)</Label>
                  <Input
                    id="osrmLink"
                    value={formData.osrmLink || ''}
                    onChange={e => updateField('osrmLink', e.target.value)}
                    onBlur={() => setTouchedFields(prev => new Set(prev).add('osrmLink'))}
                    placeholder="Google Maps or similar"
                    className={getFieldClassName('osrmLink')}
                  />
                  <FieldError field="osrmLink" />
                </div>
              </>
            )}
            </div>

            <FormNavigation
              currentStep={2}
              totalSteps={5}
              onBack={() => setStep(1)}
              onNext={() => handleNext(2)}
              canGoNext={
                formData.mode === 'remote' ||
                !!(formData.address && formData.city && formData.state && formData.country)
              }
            />
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <CardTitle className="text-2xl mb-2">Schedule</CardTitle>
              <CardDescription>
                When will this opportunity take place?
              </CardDescription>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="dateType">Date Type *</Label>
              <select
                id="dateType"
                value={formData.dateType}
                onChange={e => updateField('dateType', e.target.value as 'single_day' | 'multi_day' | 'ongoing')}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="single_day">Single Day</option>
                <option value="multi_day">Multi-Day</option>
                <option value="ongoing">Ongoing</option>
              </select>
            </div>

            {formData.dateType === 'single_day' && (
              <>
                <div>
                  <Label htmlFor="startDate">Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate || ''}
                    onChange={e => updateField('startDate', e.target.value)}
                    onBlur={() => setTouchedFields(prev => new Set(prev).add('startDate'))}
                    className={getFieldClassName('startDate')}
                    required
                  />
                  <FieldError field="startDate" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime || ''}
                      onChange={e => updateField('startTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime || ''}
                      onChange={e => updateField('endTime', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {formData.dateType === 'multi_day' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate || ''}
                      onChange={e => updateField('startDate', e.target.value)}
                      onBlur={() => setTouchedFields(prev => new Set(prev).add('startDate'))}
                      className={getFieldClassName('startDate')}
                      required
                    />
                    <FieldError field="startDate" />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate || ''}
                      onChange={e => updateField('endDate', e.target.value)}
                      onBlur={() => setTouchedFields(prev => new Set(prev).add('endDate'))}
                      className={getFieldClassName('endDate')}
                      required
                    />
                    <FieldError field="endDate" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime || ''}
                      onChange={e => updateField('startTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime || ''}
                      onChange={e => updateField('endTime', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {formData.dateType === 'ongoing' && (
              <>
                <div>
                  <Label htmlFor="startDate">Start Date (optional)</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate || ''}
                    onChange={e => updateField('startDate', e.target.value)}
                    onBlur={() => setTouchedFields(prev => new Set(prev).add('startDate'))}
                    className={getFieldClassName('startDate')}
                  />
                  <FieldError field="startDate" />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to start immediately, or set a future start date
                  </p>
                </div>
                <div>
                  <Label htmlFor="endDate">End Date (optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate || ''}
                    onChange={e => updateField('endDate', e.target.value)}
                    onBlur={() => setTouchedFields(prev => new Set(prev).add('endDate'))}
                    className={getFieldClassName('endDate')}
                  />
                  <FieldError field="endDate" />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional end date for ongoing opportunities
                  </p>
                </div>
              </>
            )}
            </div>

            <FormNavigation
              currentStep={3}
              totalSteps={5}
              onBack={() => setStep(2)}
              onNext={() => handleNext(3)}
              canGoNext={
                formData.dateType === 'ongoing' ||
                (formData.dateType === 'single_day' && !!formData.startDate) ||
                (formData.dateType === 'multi_day' && !!(formData.startDate && formData.endDate))
              }
            />
          </div>
        )}

        {/* Step 4: Requirements */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <CardTitle className="text-2xl mb-2">Requirements & Details</CardTitle>
              <CardDescription>
                Who are you looking for and what will you offer?
              </CardDescription>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="maxVolunteers">
                  Maximum Volunteers *
                  <span className="text-xs text-gray-500 ml-2">
                    ({OPPORTUNITY_VALIDATION.maxVolunteers.min}-{OPPORTUNITY_VALIDATION.maxVolunteers.max})
                  </span>
                </Label>
              <Input
                id="maxVolunteers"
                type="number"
                min={OPPORTUNITY_VALIDATION.maxVolunteers.min}
                max={OPPORTUNITY_VALIDATION.maxVolunteers.max}
                value={formData.maxVolunteers}
                onChange={e => updateField('maxVolunteers', parseInt(e.target.value))}
                onBlur={() => setTouchedFields(prev => new Set(prev).add('maxVolunteers'))}
                className={getFieldClassName('maxVolunteers')}
                required
              />
              <FieldError field="maxVolunteers" />
            </div>

            <div>
              <Label htmlFor="skillsRequired">Skills Required (comma-separated)</Label>
              <Input
                id="skillsRequired"
                value={formData.skillsRequired?.join(', ') || ''}
                onChange={e =>
                  updateField(
                    'skillsRequired',
                    e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  )
                }
                placeholder="e.g., Communication, Teamwork, First Aid"
              />
            </div>

            <div>
              <Label htmlFor="languagePreferences">Languages (comma-separated)</Label>
              <Input
                id="languagePreferences"
                value={formData.languagePreferences?.join(', ') || ''}
                onChange={e =>
                  updateField(
                    'languagePreferences',
                    e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  )
                }
                placeholder="e.g., English, Hindi"
              />
            </div>

            <div>
              <Label htmlFor="agePreference">Age Preference</Label>
              <Input
                id="agePreference"
                value={formData.agePreference || ''}
                onChange={e => updateField('agePreference', e.target.value)}
                placeholder="e.g., 18+, 16-25, All ages"
              />
            </div>

            <div>
              <Label htmlFor="genderPreference">Gender Preference</Label>
              <select
                id="genderPreference"
                value={formData.genderPreference || ''}
                onChange={e => updateField('genderPreference', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">No preference</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="certificateOffered"
                checked={formData.certificateOffered}
                onCheckedChange={checked => updateField('certificateOffered', checked)}
              />
              <Label htmlFor="certificateOffered">Offer participation certificate</Label>
            </div>

            <div>
              <Label htmlFor="stipendInfo">Stipend Information (optional)</Label>
              <Input
                id="stipendInfo"
                value={formData.stipendInfo || ''}
                onChange={e => updateField('stipendInfo', e.target.value)}
                placeholder="e.g., ₹500/day, Travel reimbursement available"
              />
            </div>

            <div>
              <Label htmlFor="contactName">
                Contact Name *
                <span className="text-xs text-gray-500 ml-2">
                  (min {OPPORTUNITY_VALIDATION.contactName.minLength} characters)
                </span>
              </Label>
              <Input
                id="contactName"
                value={formData.contactName || ''}
                onChange={e => updateField('contactName', e.target.value)}
                onBlur={() => setTouchedFields(prev => new Set(prev).add('contactName'))}
                className={getFieldClassName('contactName')}
                required
              />
              <FieldError field="contactName" />
            </div>

            <div>
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail || ''}
                onChange={e => updateField('contactEmail', e.target.value)}
                onBlur={() => setTouchedFields(prev => new Set(prev).add('contactEmail'))}
                className={getFieldClassName('contactEmail')}
                required
              />
              <FieldError field="contactEmail" />
            </div>

            <div>
              <Label htmlFor="contactPhone">
                Contact Phone *
                <span className="text-xs text-gray-500 ml-2">
                  (min {OPPORTUNITY_VALIDATION.contactPhone.minLength} digits)
                </span>
              </Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone || ''}
                onChange={e => updateField('contactPhone', e.target.value)}
                onBlur={() => setTouchedFields(prev => new Set(prev).add('contactPhone'))}
                className={getFieldClassName('contactPhone')}
                required
              />
              <FieldError field="contactPhone" />
            </div>
          </div>

            <FormNavigation
              currentStep={4}
              totalSteps={5}
              onBack={() => setStep(3)}
              onNext={() => handleNext(4)}
              canGoNext={
                !!(formData.maxVolunteers &&
                formData.contactName &&
                formData.contactEmail &&
                formData.contactPhone)
              }
            />
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <CardTitle className="text-2xl mb-2">Review & Submit</CardTitle>
              <CardDescription>
                Please review all the details before submitting
              </CardDescription>
            </div>

            {/* Basic Info Review */}
            <div className="bg-drop-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 text-drop-800 font-semibold mb-3">
                <Briefcase className="w-5 h-5" />
                <span>Basic Information</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Title</p>
                  <p className="font-medium text-gray-900">{formData.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Summary</p>
                  <p className="font-medium text-gray-900">{formData.shortSummary}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium text-gray-900 whitespace-pre-wrap">{formData.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cause Category</p>
                  <Badge variant="outline" className="capitalize">
                    {formData.causeCategory.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Location & Mode Review */}
            <div className="bg-drop-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 text-drop-800 font-semibold mb-3">
                <MapPin className="w-5 h-5" />
                <span>Location & Mode</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Mode</p>
                  <Badge className="capitalize">{formData.mode}</Badge>
                </div>
                {(formData.mode === 'onsite' || formData.mode === 'hybrid') && (
                  <>
                    {formData.address && (
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-gray-900">{formData.address}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">
                        {formData.city}, {formData.state}, {formData.country}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Schedule Review */}
            <div className="bg-drop-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 text-drop-800 font-semibold mb-3">
                <Calendar className="w-5 h-5" />
                <span>Schedule</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Date Type</p>
                  <Badge className="capitalize">{formData.dateType.replace('_', ' ')}</Badge>
                </div>
                {formData.dateType === 'single_day' && formData.startDate && (
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">
                      {typeof formData.startDate === 'string' 
                        ? new Date(formData.startDate).toLocaleDateString()
                        : formData.startDate}
                      {formData.startTime && formData.endTime && (
                        <> · {formData.startTime} - {formData.endTime}</>
                      )}
                    </p>
                  </div>
                )}
                {formData.dateType === 'multi_day' && formData.startDate && formData.endDate && (
                  <div>
                    <p className="text-sm text-gray-600">Dates</p>
                    <p className="font-medium text-gray-900">
                      {typeof formData.startDate === 'string' && typeof formData.endDate === 'string'
                        ? `${new Date(formData.startDate).toLocaleDateString()} - ${new Date(formData.endDate).toLocaleDateString()}`
                        : `${formData.startDate} - ${formData.endDate}`}
                      {formData.startTime && formData.endTime && (
                        <> · {formData.startTime} - {formData.endTime}</>
                      )}
                    </p>
                  </div>
                )}
                {formData.dateType === 'ongoing' && (
                  <div>
                    <p className="font-medium text-gray-900">Ongoing - Flexible timing</p>
                  </div>
                )}
              </div>
            </div>

            {/* Requirements Review */}
            <div className="bg-drop-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 text-drop-800 font-semibold mb-3">
                <Users className="w-5 h-5" />
                <span>Requirements & Details</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Maximum Volunteers</p>
                  <p className="font-medium text-gray-900">{formData.maxVolunteers}</p>
                </div>
                {formData.skillsRequired && formData.skillsRequired.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Skills Required</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.skillsRequired.map(skill => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {formData.languagePreferences && formData.languagePreferences.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Languages</p>
                    <p className="font-medium text-gray-900">{formData.languagePreferences.join(', ')}</p>
                  </div>
                )}
                {formData.agePreference && (
                  <div>
                    <p className="text-sm text-gray-600">Age Preference</p>
                    <p className="font-medium text-gray-900">{formData.agePreference}</p>
                  </div>
                )}
                {formData.genderPreference && (
                  <div>
                    <p className="text-sm text-gray-600">Gender Preference</p>
                    <p className="font-medium text-gray-900 capitalize">{formData.genderPreference}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Benefits</p>
                  <div className="flex items-center gap-4 mt-1">
                    {formData.certificateOffered && (
                      <div className="flex items-center gap-1 text-drop-700">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">Certificate</span>
                      </div>
                    )}
                    {formData.stipendInfo && (
                      <p className="text-sm text-gray-900">{formData.stipendInfo}</p>
                    )}
                  </div>
                </div>
                <div className="pt-2 border-t border-drop-200">
                  <p className="text-sm text-gray-600 mb-1">Contact Information</p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">{formData.contactName}</p>
                    <p className="text-sm text-gray-700">{formData.contactEmail}</p>
                    <p className="text-sm text-gray-700">{formData.contactPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            <FormNavigation
              currentStep={5}
              totalSteps={5}
              onBack={() => setStep(4)}
              onSubmit={handleSubmit}
              isSubmitting={loading}
              canGoNext={true}
            />
          </div>
        )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
}
