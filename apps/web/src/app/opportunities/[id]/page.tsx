'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { opportunitiesApi, participationsApi } from '@/lib/api-client';
import type { OpportunityWithComputed } from '@justadrop/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  Award,
  DollarSign,
  Mail,
  Phone,
  User,
  ArrowLeft,
  Languages,
} from 'lucide-react';

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [opportunity, setOpportunity] = useState<OpportunityWithComputed | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (params.id) {
      loadOpportunity();
    }
  }, [params.id]);

  const loadOpportunity = async () => {
    setLoading(true);
    try {
      const response = await opportunitiesApi.get(params.id as string);
      setOpportunity(response.opportunity);
    } catch (error) {
      console.error('Failed to load opportunity:', error);
      setError('Failed to load opportunity');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setApplying(true);
    setError('');
    setSuccess('');

    try {
      await participationsApi.apply(params.id as string, message);
      setSuccess('Application submitted successfully!');
      setMessage('');
      loadOpportunity(); // Reload to update participant count
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-drop-600"></div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Opportunity not found</p>
          <Link href="/opportunities">
            <Button>Back to Opportunities</Button>
          </Link>
        </div>
      </div>
    );
  }

  const {
    title,
    shortSummary,
    description,
    causeCategory,
    mode,
    address,
    city,
    state,
    country,
    osrmLink,
    dateType,
    startDate,
    endDate,
    startTime,
    endTime,
    maxVolunteers,
    participantCount,
    skillsRequired,
    languagePreferences,
    agePreference,
    genderPreference,
    certificateOffered,
    stipendInfo,
    contactName,
    contactEmail,
    contactPhone,
    computedStatus,
    isVerified,
    canParticipate,
    creator,
  } = opportunity;

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-drop-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/opportunities">
          <Button variant="ghost" className="mb-4 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Opportunities
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-drop-800 mb-2">{title}</h1>
                  <p className="text-lg text-gray-600">{shortSummary}</p>
                </div>
                {isVerified && (
                  <Badge className="bg-drop-100 text-drop-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified NGO
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge className={statusColors[computedStatus]}>
                  {computedStatus.charAt(0).toUpperCase() + computedStatus.slice(1)}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {causeCategory.replace('_', ' ')}
                </Badge>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{description}</p>
              </div>
            </Card>

            {/* Details */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-drop-800 mb-4">Opportunity Details</h2>
              
              <div className="space-y-4">
                {/* Location */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-drop-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Location</p>
                    <p className="text-gray-700">
                      {mode === 'remote' ? (
                        'Remote'
                      ) : (
                        <>
                          {address && <span>{address}<br /></span>}
                          {city}, {state}, {country}
                          {osrmLink && (
                            <>
                              <br />
                              <a
                                href={osrmLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-drop-600 hover:underline"
                              >
                                View on map
                              </a>
                            </>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Schedule */}
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-drop-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Schedule</p>
                    <p className="text-gray-700">
                      {dateType === 'ongoing' ? (
                        'Ongoing - flexible timing'
                      ) : dateType === 'single_day' ? (
                        <>
                          {new Date(startDate!).toLocaleDateString()}
                          {startTime && endTime && (
                            <> · {startTime} - {endTime}</>
                          )}
                        </>
                      ) : (
                        <>
                          {new Date(startDate!).toLocaleDateString()} - {new Date(endDate!).toLocaleDateString()}
                          {startTime && endTime && (
                            <> · {startTime} - {endTime}</>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Volunteers */}
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-drop-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Volunteers</p>
                    <p className="text-gray-700">
                      {participantCount || 0} / {maxVolunteers} registered
                    </p>
                  </div>
                </div>

                {/* Skills */}
                {skillsRequired && skillsRequired.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-drop-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Required Skills</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {skillsRequired.map(skill => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Languages */}
                {languagePreferences && languagePreferences.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Languages className="w-5 h-5 text-drop-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Languages</p>
                      <p className="text-gray-700">{languagePreferences.join(', ')}</p>
                    </div>
                  </div>
                )}

                {/* Age & Gender */}
                {(agePreference || genderPreference) && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-drop-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Preferences</p>
                      <p className="text-gray-700">
                        {agePreference && `Age: ${agePreference}`}
                        {agePreference && genderPreference && ' · '}
                        {genderPreference && `Gender: ${genderPreference}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {(certificateOffered || stipendInfo) && (
                  <div className="bg-drop-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-2">Benefits</p>
                    <div className="space-y-1">
                      {certificateOffered && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-drop-600" />
                          Certificate of participation
                        </div>
                      )}
                      {stipendInfo && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <DollarSign className="w-4 h-4 text-drop-600" />
                          {stipendInfo}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Contact */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-drop-800 mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-drop-600" />
                  <span className="text-gray-700">{contactName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-drop-600" />
                  <a href={`mailto:${contactEmail}`} className="text-drop-600 hover:underline">
                    {contactEmail}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-drop-600" />
                  <a href={`tel:${contactPhone}`} className="text-drop-600 hover:underline">
                    {contactPhone}
                  </a>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Apply Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h3 className="text-xl font-bold text-drop-800 mb-4">Apply Now</h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
                  {success}
                </div>
              )}

              {!user ? (
                <div className="text-center space-y-4">
                  <p className="text-gray-600">Sign in to apply for this opportunity</p>
                  <Link href="/login">
                    <Button className="w-full bg-drop-600 hover:bg-drop-700">
                      Sign In
                    </Button>
                  </Link>
                </div>
              ) : !canParticipate ? (
                <div className="text-center space-y-4">
                  <p className="text-gray-600">You cannot apply for this opportunity</p>
                  <p className="text-sm text-gray-500">
                    This may be because you created it, already applied, or the opportunity is full/archived.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="applicationMessage">Why do you want to volunteer? (Optional)</Label>
                    <Textarea
                      id="applicationMessage"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Tell us about your interest and relevant experience..."
                      rows={4}
                    />
                  </div>
                  <Button
                    onClick={handleApply}
                    disabled={applying || success !== ''}
                    className="w-full bg-drop-600 hover:bg-drop-700"
                  >
                    {applying ? 'Submitting...' : success ? 'Applied!' : 'Submit Application'}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
