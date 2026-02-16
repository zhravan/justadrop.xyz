'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MapPin,
  Calendar,
  Clock,
  Mail,
  Phone,
  User,
  ArrowLeft,
  ChevronRight,
  Award,
  DollarSign,
  Users,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import { useNgo } from '@/contexts/NgoContext';
import { LocationMapPreview } from '@/components/map/LocationMapPreview';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { ApplyModal } from '@/components/opportunities/ApplyModal';
import { Skeleton } from '@/components/ui/skeleton';

function formatDate(d: string | Date | null): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateRange(start: string | Date | null, end: string | Date | null): string {
  if (!start && !end) return 'Ongoing';
  if (!end || String(start) === String(end)) return formatDate(start);
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export default function OpportunityDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, isAuthenticated } = useAuth();
  const { organizations } = useNgo();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [myApplication, setMyApplication] = useState<any>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch(`/api/opportunities/${id}`, { credentials: 'include' }).then((r) => r.json()),
      isAuthenticated
        ? fetch('/api/applications', { credentials: 'include' }).then((r) => r.json())
        : Promise.resolve(null),
    ])
      .then(([oppRes, appsRes]) => {
        if (cancelled) return;
        const opp = oppRes?.opportunity ?? oppRes;
        setOpportunity(opp);
        if (appsRes) {
          const apps = appsRes?.applications ?? appsRes ?? [];
          const mine = Array.isArray(apps) ? apps.find((a: any) => a.opportunityId === id) : null;
          setMyApplication(mine);
        }
      })
      .catch(() => {
        if (!cancelled) setOpportunity(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated]);

  const hasVolunteerProfile = user?.volunteering?.isInterest === true;
  const canApply = isAuthenticated && hasVolunteerProfile && !myApplication;
  const isNgoOwner = organizations.some((o) => o.id === opportunity?.ngoId);
  const addressStr = [opportunity?.address, opportunity?.city, opportunity?.state]
    .filter(Boolean)
    .join(', ');

  if (loading || !opportunity) {
    return (
      <div className="container">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="container">
      <Link
        href="/opportunities"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-jad-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to opportunities
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-jad-foreground sm:text-3xl">
              {opportunity.title}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-lg font-medium text-jad-primary">{opportunity.orgName}</span>
              {opportunity.orgVerificationStatus === 'verified' && <VerifiedBadge />}
            </div>
            {opportunity.causeCategoryNames?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {opportunity.causeCategoryNames.map((c: string) => (
                  <span
                    key={c}
                    className="rounded-full bg-jad-mint/50 px-2.5 py-0.5 text-xs font-medium text-jad-foreground"
                  >
                    {c.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-jad-foreground mb-2">Description</h2>
            <p className="whitespace-pre-wrap text-foreground/80">{opportunity.description}</p>
          </div>

          {(opportunity.requiredSkills?.length ?? 0) > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-jad-foreground mb-2">Required skills</h2>
              <div className="flex flex-wrap gap-2">
                {opportunity.requiredSkills.map((s: string) => (
                  <span
                    key={s}
                    className="rounded-full bg-foreground/10 px-3 py-1 text-sm text-foreground/80"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(opportunity.languagePreference || opportunity.genderPreference) && (
            <div>
              <h2 className="text-lg font-semibold text-jad-foreground mb-2">Preferences</h2>
              <div className="flex flex-wrap gap-3 text-sm text-foreground/80">
                {opportunity.languagePreference && (
                  <span>Language: {opportunity.languagePreference}</span>
                )}
                {opportunity.genderPreference && (
                  <span>Gender: {opportunity.genderPreference.replace(/_/g, ' ')}</span>
                )}
              </div>
            </div>
          )}

          {(opportunity.stipendInfo || opportunity.isCertificateOffered) && (
            <div>
              <h2 className="text-lg font-semibold text-jad-foreground mb-2">Benefits</h2>
              <div className="flex flex-wrap items-center gap-4">
                {opportunity.stipendInfo?.amount != null && (
                  <span className="flex items-center gap-2 text-foreground/80">
                    <DollarSign className="h-4 w-4 text-jad-primary" />
                    ₹{opportunity.stipendInfo.amount}
                    {opportunity.stipendInfo.duration && ` (${opportunity.stipendInfo.duration})`}
                  </span>
                )}
                {opportunity.isCertificateOffered && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-jad-mint/50 px-3 py-1 text-sm font-medium text-jad-foreground">
                    <Award className="h-4 w-4 text-jad-primary" />
                    Certificate offered
                  </span>
                )}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-jad-foreground mb-2">Date & time</h2>
            <div className="flex flex-wrap gap-4 text-foreground/80">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-jad-primary" />
                {formatDateRange(opportunity.startDate, opportunity.endDate) || 'TBD'}
              </span>
              {(opportunity.startTime || opportunity.endTime) && (
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-jad-primary" />
                  {opportunity.startTime} – {opportunity.endTime}
                </span>
              )}
              <span className="rounded-full border border-foreground/20 px-2 py-0.5 text-sm">
                {opportunity.opportunityMode}
              </span>
            </div>
          </div>

          {(addressStr || opportunity.latitude) && (
            <div>
              <h2 className="text-lg font-semibold text-jad-foreground mb-2">Location</h2>
              <LocationMapPreview
                latitude={opportunity.latitude}
                longitude={opportunity.longitude}
                address={addressStr || undefined}
                height={240}
              />
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-jad-foreground mb-2">Contact</h2>
            <div className="space-y-2 text-foreground/80">
              <p className="flex items-center gap-2">
                <User className="h-4 w-4 text-jad-primary" />
                {opportunity.contactName}
              </p>
              <a
                href={`mailto:${opportunity.contactEmail}`}
                className="flex items-center gap-2 text-jad-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                {opportunity.contactEmail}
              </a>
              {opportunity.contactPhoneNumber && (
                <a
                  href={`tel:${opportunity.contactPhoneNumber}`}
                  className="flex items-center gap-2 text-jad-primary hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {opportunity.contactPhoneNumber}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-foreground/10 bg-white p-6 shadow-lg">
            <div className="mb-4 rounded-xl bg-jad-mint/30 px-4 py-3 text-center">
              <p className="text-sm font-medium text-jad-foreground">When</p>
              <p className="mt-1 font-semibold">
                {formatDateRange(opportunity.startDate, opportunity.endDate) || 'TBD'}
              </p>
            </div>
            {myApplication ? (
              <div className="space-y-2">
                <div className="rounded-xl border border-foreground/10 bg-muted/30 px-4 py-3">
                  <p className="text-sm font-medium text-jad-foreground">Your application</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      myApplication.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : myApplication.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {myApplication.status}
                  </span>
                </div>
                {myApplication.status === 'approved' &&
                  myApplication.hasAttended &&
                  opportunity?.endDate &&
                  new Date(opportunity.endDate) < new Date() && (
                    <Link
                      href={`/opportunities/${id}/feedback`}
                      className="block w-full rounded-xl border-2 border-jad-primary py-2.5 text-center text-sm font-semibold text-jad-primary hover:bg-jad-mint/30"
                    >
                      Give feedback
                    </Link>
                  )}
              </div>
            ) : canApply ? (
              <button
                type="button"
                onClick={() => setShowApplyModal(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-jad-primary py-3 text-sm font-semibold text-white hover:bg-jad-dark"
              >
                Apply
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : !hasVolunteerProfile && isAuthenticated ? (
              <Link
                href="/onboarding/volunteer"
                className="block w-full rounded-xl border-2 border-jad-primary py-3 text-center text-sm font-semibold text-jad-primary hover:bg-jad-mint/30"
              >
                Complete profile to apply
              </Link>
            ) : !isAuthenticated ? (
              <Link
                href={`/login?redirect=/opportunities/${id}`}
                className="block w-full rounded-xl bg-jad-primary py-3 text-center text-sm font-semibold text-white hover:bg-jad-dark"
              >
                Log in to apply
              </Link>
            ) : null}
            {isNgoOwner && (
              <Link
                href={`/organisations/${opportunity.ngoId}/opportunities/${id}/applications`}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-jad-primary py-2.5 text-sm font-semibold text-jad-primary hover:bg-jad-mint/30"
              >
                <Users className="h-4 w-4" />
                Manage applications
              </Link>
            )}
          </div>
        </div>
      </div>

      {showApplyModal && (
        <ApplyModal
          opportunityId={id}
          opportunityTitle={opportunity.title}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => setMyApplication({ status: 'pending' })}
        />
      )}
    </div>
  );
}
