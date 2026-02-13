'use client';

import * as React from 'react';
import { cn } from '@/lib/common';

export interface FormSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  icon,
  children,
  className,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-foreground/5 bg-white/50 p-6 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="mb-5 flex items-start gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jad-mint text-jad-primary">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-jad-foreground">{title}</h3>
          {description && (
            <p className="mt-0.5 text-sm text-foreground/60">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
