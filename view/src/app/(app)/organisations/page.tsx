'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Plus, ChevronRight } from 'lucide-react';
import { useNgo } from '@/contexts/NgoContext';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/common';

export default function OrganisationsPage() {
  const { organizations, isLoading } = useNgo();

  if (isLoading) {
    return (
      <div className="container">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-jad-foreground sm:text-3xl">
            My NGOs
          </h1>
          <p className="mt-1 text-foreground/70">
            Manage your organizations and create opportunities
          </p>
        </div>
        <Link
          href="/organisations/create"
          className="inline-flex items-center gap-2 rounded-full bg-jad-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-jad-primary/25 hover:bg-jad-dark"
        >
          <Plus className="h-4 w-4" />
          Create NGO
        </Link>
      </div>

      {organizations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-jad-primary/20 bg-jad-mint/20 py-16 text-center">
          <Building2 className="h-12 w-12 text-jad-primary/40" />
          <p className="mt-4 font-medium text-jad-foreground">No organisations yet</p>
          <p className="mt-1 text-sm text-foreground/60">
            Create your first NGO to start posting opportunities
          </p>
          <Link
            href="/organisations/create"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-jad-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-jad-dark"
          >
            <Plus className="h-4 w-4" />
            Create NGO
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="rounded-2xl border border-foreground/10 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-bold text-jad-foreground">{org.orgName}</h2>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                    org.verificationStatus === 'verified'
                      ? 'bg-emerald-100 text-emerald-700'
                      : org.verificationStatus === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  )}
                >
                  {org.verificationStatus}
                </span>
              </div>
              {org.causes?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {org.causes.slice(0, 3).map((c: string) => (
                    <span
                      key={c}
                      className="rounded-full bg-jad-mint/50 px-2 py-0.5 text-xs text-jad-foreground"
                    >
                      {c.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/organisations/${org.id}/opportunities`}
                  className="inline-flex items-center gap-1 rounded-xl border border-jad-primary px-3 py-2 text-sm font-medium text-jad-primary hover:bg-jad-mint/30"
                >
                  View opportunities
                  <ChevronRight className="h-4 w-4" />
                </Link>
                {org.verificationStatus === 'verified' && (
                  <Link
                    href={`/organisations/${org.id}/opportunities/create`}
                    className="inline-flex items-center gap-1 rounded-xl bg-jad-primary px-3 py-2 text-sm font-medium text-white hover:bg-jad-dark"
                  >
                    Create opportunity
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
