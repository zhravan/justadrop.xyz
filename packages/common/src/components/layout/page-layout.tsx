import * as React from 'react';
import { cn } from '../../lib/utils';
import { Header } from './header';

interface PageLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

export function PageLayout({ 
  children, 
  header,
  className 
}: PageLayoutProps) {
  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {header}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

// Convenience component that includes Header
interface LayoutWithHeaderProps {
  children: React.ReactNode;
  headerProps?: React.ComponentProps<typeof Header>;
  className?: string;
}

export function LayoutWithHeader({ 
  children, 
  headerProps,
  className 
}: LayoutWithHeaderProps) {
  return (
    <PageLayout 
      header={<Header {...headerProps} />}
      className={className}
    >
      {children}
    </PageLayout>
  );
}
