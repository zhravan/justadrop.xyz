'use client';

import * as React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/common';

export interface FormActionsProps {
  submitLabel: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  loading?: boolean;
  disabled?: boolean;
  onSecondaryClick?: () => void;
  className?: string;
}

export function FormActions({
  submitLabel,
  secondaryLabel,
  secondaryHref,
  loading,
  disabled,
  onSecondaryClick,
  className,
}: FormActionsProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 pt-6',
        secondaryLabel
          ? 'sm:flex-row sm:items-center sm:justify-between'
          : 'sm:flex-row sm:justify-start',
        className
      )}
    >
      {secondaryLabel && (
        secondaryHref ? (
          <Link
            href={secondaryHref}
            className="order-2 sm:order-1 text-center text-sm font-medium text-foreground/70 hover:text-jad-primary transition-colors"
          >
            {secondaryLabel}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onSecondaryClick}
            className="order-2 sm:order-1 text-center text-sm font-medium text-foreground/70 hover:text-jad-primary transition-colors"
          >
            {secondaryLabel}
          </button>
        )
      )}
      <button
        type="submit"
        disabled={disabled || loading}
        className={cn(
          'order-1 flex items-center justify-center gap-2 rounded-xl bg-jad-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-jad-primary/25 transition-all hover:bg-jad-dark hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed',
          secondaryLabel ? 'sm:order-2' : 'w-full sm:w-auto'
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          submitLabel
        )}
      </button>
    </div>
  );
}
