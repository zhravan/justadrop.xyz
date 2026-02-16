'use client';

import { ViewHeader, ViewFooter } from '@/components/landing';

export function PublicBrowseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <ViewHeader />
      <main className="flex-1 pt-14">
        <div className="container py-8 md:py-12">{children}</div>
      </main>
      <ViewFooter />
    </div>
  );
}
