'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/use-auth';
import { DashboardSkeleton } from '@/components/skeletons';
import { Calendar, CheckCircle2, Clock, Heart, ArrowRight, MapPin, Building2 } from 'lucide-react';

function formatDate(d: string | Date | null): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isReady } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace('/login?redirect=/dashboard');
    }
  }, [isReady, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('/api/applications', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setApplications(data?.applications ?? []))
      .catch(() => setApplications([]));
  }, [isAuthenticated]);

  if (!isReady || isLoading || !user) {
    return <DashboardSkeleton />;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = applications.filter(
    (a) =>
      a.status === 'approved' && a.opportunityEndDate && new Date(a.opportunityEndDate) >= today
  );
  const past = applications.filter(
    (a) =>
      a.status === 'approved' &&
      (a.hasAttended || (a.opportunityEndDate && new Date(a.opportunityEndDate) < today))
  );
  const pending = applications.filter((a) => a.status === 'pending');

  return (
    <div className="container">
      {/* Welcome */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-jad-foreground sm:text-3xl">
          Your dashboard
        </h1>
        <p className="mt-1 text-foreground/70">
          Welcome back, {user.name || user.email} — volunteer, create an NGO, or do both.
        </p>
      </div>

      {/* Quick actions */}
      <div className="mb-10 flex flex-wrap gap-4">
        <Link
          href="/opportunities"
          className="inline-flex items-center gap-2 rounded-full bg-jad-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-jad-primary/25 transition-all hover:bg-jad-dark"
        >
          <Heart className="h-4 w-4" />
          Find volunteering
        </Link>
        <Link
          href="/organisations/create"
          className="inline-flex items-center gap-2 rounded-full border-2 border-jad-primary bg-white px-5 py-2.5 text-sm font-semibold text-jad-primary transition-all hover:bg-jad-mint/50"
        >
          <Building2 className="h-4 w-4" />
          Create an NGO
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* My applications */}
        <section className="rounded-2xl border border-jad-primary/10 bg-white p-6 shadow-lg shadow-jad-foreground/5 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-jad-mint text-jad-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-jad-foreground">My applications</h2>
          </div>
          {applications.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-jad-primary/15 bg-jad-mint/20 py-12 text-center">
              <Heart className="h-12 w-12 text-jad-primary/40" />
              <p className="mt-4 font-medium text-jad-foreground">No applications yet</p>
              <p className="mt-1 text-sm text-foreground/60">
                Browse opportunities and apply to start volunteering
              </p>
              <Link
                href="/opportunities"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-jad-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-jad-primary/25 transition-all hover:bg-jad-dark"
              >
                Browse opportunities
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {applications.slice(0, 5).map((app) => (
                <Link
                  key={app.id}
                  href={`/opportunities/${app.opportunityId}`}
                  className="block rounded-xl border border-foreground/10 p-4 transition-colors hover:bg-jad-mint/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-jad-foreground">{app.opportunityTitle}</p>
                      <p className="text-sm text-foreground/60">{app.orgName}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : app.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  {app.opportunityStartDate && (
                    <p className="mt-1 text-sm text-foreground/60">
                      {formatDate(app.opportunityStartDate)}
                    </p>
                  )}
                </Link>
              ))}
              {applications.length > 5 && (
                <Link
                  href="/opportunities"
                  className="block text-center text-sm font-medium text-jad-primary hover:underline"
                >
                  View all
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Upcoming */}
        <section className="rounded-2xl border border-jad-primary/10 bg-white p-6 shadow-lg shadow-jad-foreground/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-jad-mint text-jad-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-jad-foreground">Upcoming ({upcoming.length})</h2>
          </div>
          {upcoming.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-jad-primary/15 bg-jad-mint/20 py-10 text-center">
              <Clock className="h-10 w-10 text-jad-primary/40" />
              <p className="mt-4 text-sm font-medium text-jad-foreground">No upcoming sessions</p>
              <p className="mt-1 text-xs text-foreground/60">
                Approved applications will appear here
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-2">
              {upcoming.slice(0, 3).map((app) => (
                <Link
                  key={app.id}
                  href={`/opportunities/${app.opportunityId}`}
                  className="block rounded-xl border border-foreground/10 p-3 text-sm hover:bg-jad-mint/20"
                >
                  <p className="font-medium text-jad-foreground line-clamp-1">
                    {app.opportunityTitle}
                  </p>
                  <p className="text-xs text-foreground/60">
                    {formatDate(app.opportunityStartDate)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Past volunteering */}
      <section className="mt-8 rounded-2xl border border-jad-primary/10 bg-white p-6 shadow-lg shadow-jad-foreground/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-jad-mint text-jad-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-jad-foreground">
            Past volunteering ({past.length})
          </h2>
        </div>
        {past.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-jad-primary/15 bg-jad-mint/20 py-10 text-center">
            <p className="text-sm font-medium text-jad-foreground">No past sessions yet</p>
            <p className="mt-1 text-xs text-foreground/60">
              Completed volunteering will appear here
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-2">
            {past.slice(0, 5).map((app) => {
              const canFeedback =
                app.hasAttended &&
                app.opportunityEndDate &&
                new Date(app.opportunityEndDate) < today;
              return (
                <div
                  key={app.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-foreground/10 p-3"
                >
                  <Link
                    href={`/opportunities/${app.opportunityId}`}
                    className="min-w-0 flex-1 text-sm hover:opacity-80"
                  >
                    <p className="font-medium text-jad-foreground line-clamp-1">
                      {app.opportunityTitle}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {formatDate(app.opportunityEndDate)}
                    </p>
                  </Link>
                  {canFeedback && (
                    <Link
                      href={`/opportunities/${app.opportunityId}/feedback`}
                      className="shrink-0 rounded-lg bg-jad-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-jad-dark"
                    >
                      Give feedback
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
