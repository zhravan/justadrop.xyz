'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          className="rounded p-1 transition-colors hover:scale-110 disabled:cursor-not-allowed"
        >
          <Star
            className={`h-8 w-8 ${
              n <= value ? 'fill-amber-400 text-amber-400' : 'text-foreground/20'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function OpportunityFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, isAuthenticated, isLoading } = useAuth();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [myApplication, setMyApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [oppRating, setOppRating] = useState(0);
  const [oppSubmitting, setOppSubmitting] = useState(false);
  const [volunteerRatings, setVolunteerRatings] = useState<Record<string, { rating: number; testimonial: string }>>({});
  const [volunteerSubmitting, setVolunteerSubmitting] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = opportunity?.endDate
    ? new Date(opportunity.endDate) < today
    : opportunity?.startDate
    ? new Date(opportunity.startDate) < today
    : false;
  const iAttended = myApplication?.status === 'approved' && myApplication?.hasAttended;
  const attendedVolunteers = applications.filter(
    (a) => a.status === 'approved' && a.hasAttended && a.userId !== user?.id
  );

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace(`/login?redirect=/opportunities/${id}/feedback`);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch(`/api/opportunities/${id}`, { credentials: 'include' }).then((r) => r.json()),
      isAuthenticated ? fetch('/api/applications', { credentials: 'include' }).then((r) => r.json()) : Promise.resolve(null),
      isAuthenticated ? fetch(`/api/opportunities/${id}/attendees`, { credentials: 'include' }).then((r) => r.json()) : Promise.resolve(null),
    ])
      .then(([oppRes, appsRes, attendeesRes]) => {
        if (cancelled) return;
        const opp = oppRes?.opportunity ?? oppRes;
        setOpportunity(opp);
        const myApps = appsRes?.applications ?? appsRes ?? [];
        const mine = Array.isArray(myApps) ? myApps.find((a: any) => a.opportunityId === id) : null;
        setMyApplication(mine);
        const attendees = attendeesRes?.attendees ?? [];
        setApplications(
          Array.isArray(attendees)
            ? attendees.map((a: any) => ({
                userId: a.userId,
                userName: a.userName,
                userEmail: a.userEmail,
                status: 'approved',
                hasAttended: true,
              }))
            : []
        );
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
  }, [id, isAuthenticated, isLoading, router]);

  const handleRateOpportunity = async () => {
    if (oppRating < 1) return;
    setOppSubmitting(true);
    try {
      const res = await fetch(`/api/opportunities/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating: oppRating }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Failed to submit');
      toast.success('Thank you for rating this opportunity!');
      setOppRating(0);
      setMyApplication((a: any) => (a ? { ...a, feedbackGiven: true } : a));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setOppSubmitting(false);
    }
  };

  const handleRateVolunteer = async (volunteerId: string) => {
    const v = volunteerRatings[volunteerId];
    if (!v || v.rating < 1) return;
    setVolunteerSubmitting(volunteerId);
    try {
      const res = await fetch(
        `/api/opportunities/${id}/volunteers/${volunteerId}/feedback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ rating: v.rating, testimonial: v.testimonial || undefined }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Failed to submit');
      toast.success('Thank you for your feedback!');
      setVolunteerRatings((prev) => {
        const next = { ...prev };
        delete next[volunteerId];
        return next;
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setVolunteerSubmitting(null);
    }
  };

  if (!isAuthenticated && !isLoading) return null;

  if (loading || !opportunity) {
    return (
      <div className="container">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!isPast) {
    return (
      <div className="container">
        <Link
          href={`/opportunities/${id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-jad-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to opportunity
        </Link>
        <p className="text-foreground/70">
          Feedback is available after the opportunity has ended.
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <Link
        href={`/opportunities/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-jad-primary mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to opportunity
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-jad-foreground sm:text-3xl">
        Rate your experience
      </h1>
      <p className="mt-1 text-foreground/70">{opportunity.title}</p>

      <div className="mt-8 space-y-8">
        {iAttended && (
          <section className="rounded-2xl border border-foreground/10 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-jad-foreground">
              Rate this opportunity
            </h2>
            <p className="mt-1 text-sm text-foreground/60">
              How was your volunteering experience?
            </p>
            <div className="mt-4">
              <StarRating value={oppRating} onChange={setOppRating} disabled={oppSubmitting} />
              <button
                type="button"
                onClick={handleRateOpportunity}
                disabled={oppRating < 1 || oppSubmitting}
                className="mt-4 rounded-xl bg-jad-primary px-4 py-2 text-sm font-semibold text-white hover:bg-jad-dark disabled:opacity-50"
              >
                {oppSubmitting ? (
                  <>
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit rating'
                )}
              </button>
            </div>
          </section>
        )}

        {attendedVolunteers.length > 0 && (
          <section className="rounded-2xl border border-foreground/10 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-jad-foreground">
              Rate fellow volunteers
            </h2>
            <p className="mt-1 text-sm text-foreground/60">
              Share feedback for volunteers who attended with you
            </p>
            <div className="mt-6 space-y-6">
              {attendedVolunteers.map((app) => {
                const vr = volunteerRatings[app.userId] ?? { rating: 0, testimonial: '' };
                const loading = volunteerSubmitting === app.userId;
                return (
                  <div
                    key={app.userId}
                    className="rounded-xl border border-foreground/10 p-4"
                  >
                    <p className="font-medium text-jad-foreground">
                      {app.userName || app.userEmail || 'Volunteer'}
                    </p>
                    <div className="mt-3">
                      <StarRating
                        value={vr.rating}
                        onChange={(r) =>
                          setVolunteerRatings((prev) => ({
                            ...prev,
                            [app.userId]: { ...vr, rating: r },
                          }))
                        }
                        disabled={loading}
                      />
                    </div>
                    <textarea
                      placeholder="Optional testimonial..."
                      value={vr.testimonial}
                      onChange={(e) =>
                        setVolunteerRatings((prev) => ({
                          ...prev,
                          [app.userId]: { ...vr, testimonial: e.target.value },
                        }))
                      }
                      disabled={loading}
                      className="mt-3 w-full rounded-xl border border-foreground/15 px-3 py-2 text-sm"
                      rows={2}
                    />
                    <button
                      type="button"
                      onClick={() => handleRateVolunteer(app.userId)}
                      disabled={vr.rating < 1 || loading}
                      className="mt-2 rounded-xl bg-jad-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-jad-dark disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {!iAttended && attendedVolunteers.length === 0 && (
          <p className="text-foreground/60">
            You need to have attended this opportunity to give feedback.
          </p>
        )}
      </div>
    </div>
  );
}
