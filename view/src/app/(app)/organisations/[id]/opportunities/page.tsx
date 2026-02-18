'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Plus, ChevronLeft, Users, FileEdit } from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import { useNgo } from '@/contexts/NgoContext';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/common';

interface Opportunity {
  id: string;
  title: string;
  status: string;
  opportunityMode: string;
  startDate: string | null;
  endDate: string | null;
  city: string | null;
  state: string | null;
  causeCategoryNames: string[];
  _count?: { applications?: number };
}

export default function OrgOpportunitiesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { organizations } = useNgo();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  const ngoId = params.id;
  const org = organizations.find((o) => o.id === ngoId) ?? null;

  useEffect(() => {
    if (!ngoId || !isAuthenticated) {
      if (!isAuthenticated && !isLoading) router.replace('/login');
      return;
    }
    let cancelled = false;

    async function load() {
      try {
        const oppsRes = await fetch(
          `/api/opportunities?ngoId=${encodeURIComponent(ngoId)}&includePast=true&limit=50`,
          { credentials: 'include' }
        );
        if (cancelled) return;
        const oppsData = await oppsRes.json();
        const oppsPayload = oppsData?.opportunities ?? oppsData?.data?.opportunities ?? oppsData;
        setOpportunities(Array.isArray(oppsPayload) ? oppsPayload : []);
      } catch {
        if (!cancelled) setOpportunities([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ngoId, isAuthenticated, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="container">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="container">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/organisations"
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-jad-primary mb-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to My NGOs
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-jad-foreground sm:text-3xl">
            {org?.orgName ?? 'Opportunities'}
          </h1>
          <p className="mt-1 text-foreground/70">
            Manage opportunities for this organization
          </p>
        </div>
        {org?.verificationStatus === 'verified' && (
          <Link
            href={`/organisations/${ngoId}/opportunities/create`}
            className="inline-flex items-center gap-2 rounded-full bg-jad-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-jad-primary/25 hover:bg-jad-dark"
          >
            <Plus className="h-4 w-4" />
            Create opportunity
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-jad-primary/20 bg-jad-mint/20 py-16 text-center">
          <p className="font-medium text-jad-foreground">No opportunities yet</p>
          <p className="mt-1 text-sm text-foreground/60">
            Create your first opportunity to attract volunteers
          </p>
          {org?.verificationStatus === 'verified' && (
            <Link
              href={`/organisations/${ngoId}/opportunities/create`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-jad-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-jad-dark"
            >
              <Plus className="h-4 w-4" />
              Create opportunity
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-white p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 className="text-lg font-bold text-jad-foreground">{opp.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-foreground/70">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      opp.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : opp.status === 'draft'
                        ? 'bg-amber-100 text-amber-700'
                        : opp.status === 'completed'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-red-100 text-red-700'
                    )}
                  >
                    {opp.status}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 capitalize">
                    {opp.opportunityMode}
                  </span>
                  {opp.city && (
                    <span>
                      {[opp.city, opp.state].filter(Boolean).join(', ')}
                    </span>
                  )}
                  <span>
                    {formatDate(opp.startDate)} – {formatDate(opp.endDate)}
                  </span>
                </div>
                {opp.causeCategoryNames?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {opp.causeCategoryNames.slice(0, 3).map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-jad-mint/50 px-2 py-0.5 text-xs text-jad-foreground"
                      >
                        {c.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/opportunities/${opp.id}`}
                  className="inline-flex items-center gap-1 rounded-xl border border-jad-primary px-3 py-2 text-sm font-medium text-jad-primary hover:bg-jad-mint/30"
                >
                  View
                </Link>
                <Link
                  href={`/organisations/${ngoId}/opportunities/${opp.id}/edit`}
                  className="inline-flex items-center gap-1 rounded-xl border border-foreground/20 px-3 py-2 text-sm font-medium hover:bg-muted/50"
                >
                  <FileEdit className="h-4 w-4" />
                  Edit
                </Link>
                <Link
                  href={`/organisations/${ngoId}/opportunities/${opp.id}/applications`}
                  className="inline-flex items-center gap-1 rounded-xl border border-foreground/20 px-3 py-2 text-sm font-medium hover:bg-muted/50"
                >
                  <Users className="h-4 w-4" />
                  Applications
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
