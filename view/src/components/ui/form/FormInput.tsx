'use client';

import * as React from 'react';
import { cn } from '@/lib/common';

const baseInputClass =
  'w-full rounded-xl border border-foreground/15 bg-white px-4 py-2.5 text-sm text-jad-foreground placeholder:text-foreground/40 transition-all duration-200 focus:border-jad-primary focus:outline-none focus:ring-2 focus:ring-jad-primary/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-foreground/5';

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  inputSize?: 'default' | 'lg';
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, icon, inputSize = 'default', ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            baseInputClass,
            icon && 'pl-11',
            inputSize === 'lg' && 'py-3 text-base',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
FormInput.displayName = 'FormInput';

export { FormInput };
