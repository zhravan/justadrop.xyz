'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/common';

const baseSelectClass =
  'w-full rounded-xl border border-foreground/15 bg-white px-4 py-2.5 pr-10 text-sm text-jad-foreground transition-all duration-200 focus:border-jad-primary focus:outline-none focus:ring-2 focus:ring-jad-primary/20 disabled:cursor-not-allowed disabled:opacity-60 appearance-none bg-transparent';

export interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(baseSelectClass, className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/40"
          strokeWidth={2}
        />
      </div>
    );
  }
);
FormSelect.displayName = 'FormSelect';

export { FormSelect };
