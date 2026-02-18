'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/common';
import { toast } from 'sonner';

interface Application {
  id: string;
  userId: string;
  opportunityId: string;
  motivationDescription: string | null;
  status: string;
  hasAttended: boolean;
  userName: string | null;
  userEmail: string;
  createdAt: string;
}

interface Opportunity {
  id: string;
  title: string;
  ngoId: string;
}

export default function OpportunityApplicationsPage() {
  const params = useParams<{ id: string; oppId: string }>();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  const ngoId = params.id;
  const oppId = params.oppId;

  const fetchData = async () => {
    try {
      const [oppRes, appsRes] = await Promise.all([
        fetch(`/api/opportunities/${oppId}`, { credentials: 'include' }),
        fetch(`/api/opportunities/${oppId}/applications`, { credentials: 'include' }),
      ]);
      const oppData = await oppRes.json();
      const appsData = await appsRes.json();
      const oppPayload = oppData?.opportunity ?? oppData?.data?.opportunity ?? oppData;
      const appsPayload = appsData?.applications ?? appsData?.data?.applications ?? appsData;
      setOpportunity(oppPayload?.id ? { id: oppPayload.id, title: oppPayload.title, ngoId: oppPayload.ngoId } : null);
      setApplications(Array.isArray(appsPayload) ? appsPayload : []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!oppId || !isAuthenticated) {
      if (!isAuthenticated && !isLoading) router.replace('/login');
      return;
    }
    fetchData();
  }, [oppId, isAuthenticated, isLoading, router]);

  const handleStatus = async (appId: string, status: 'approved' | 'rejected') => {
    setActioning(appId);
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Failed to update');
      toast.success(status === 'approved' ? 'Application approved' : 'Application rejected');
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update application');
    } finally {
      setActioning(null);
    }
  };

  const handleAttended = async (appId: string, hasAttended: boolean) => {
    setActioning(appId);
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ hasAttended }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Failed to update');
      toast.success(hasAttended ? 'Marked as attended' : 'Marked as not attended');
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setActioning(null);
    }
  };

  if (!isAuthenticated && !isLoading) return null;

  if (loading) {
    return (
      <div className="container">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Link
        href={`/organisations/${ngoId}/opportunities`}
        className="inline-flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-jad-primary mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to opportunities
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-jad-foreground sm:text-3xl">
        Applications
      </h1>
      <p className="mt-1 text-foreground/70">
        {opportunity?.title ?? 'Opportunity'}
      </p>

      {applications.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-jad-primary/20 bg-jad-mint/20 py-16 text-center">
          <p className="font-medium text-jad-foreground">No applications yet</p>
          <p className="mt-1 text-sm text-foreground/60">
            Volunteers who apply will appear here
          </p>
          <Link
            href={`/organisations/${ngoId}/opportunities`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-jad-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-jad-dark"
          >
            Back to opportunities
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-foreground/10 bg-white shadow-lg">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-foreground/10 bg-muted/30">
                <th className="px-4 py-3 text-left text-sm font-semibold text-jad-foreground">
                  Volunteer
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-jad-foreground">
                  Motivation
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-jad-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-jad-foreground">
                  Attended
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-jad-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app.id}
                  className="border-b border-foreground/5 last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-jad-foreground">
                        {app.userName || 'Volunteer'}
                      </p>
                      <a
                        href={`mailto:${app.userEmail}`}
                        className="text-sm text-foreground/70 hover:text-jad-primary"
                      >
                        {app.userEmail}
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="max-w-xs truncate text-sm text-foreground/80">
                      {app.motivationDescription || '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : app.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      )}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {app.status === 'approved' ? (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={app.hasAttended}
                          onChange={(e) => handleAttended(app.id, e.target.checked)}
                          disabled={actioning === app.id}
                          className="h-4 w-4 rounded border-foreground/20 text-jad-primary"
                        />
                        {actioning === app.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-foreground/50" />
                        ) : (
                          <span className="text-sm">Attended</span>
                        )}
                      </label>
                    ) : (
                      <span className="text-sm text-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {app.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleStatus(app.id, 'approved')}
                          disabled={actioning === app.id}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {actioning === app.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleStatus(app.id, 'rejected')}
                          disabled={actioning === app.id}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
