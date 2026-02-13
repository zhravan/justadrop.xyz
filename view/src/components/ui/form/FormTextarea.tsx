'use client';

import * as React from 'react';
import { cn } from '@/lib/common';

const baseTextareaClass =
  'w-full rounded-xl border border-foreground/15 bg-white px-4 py-2.5 text-sm text-jad-foreground placeholder:text-foreground/40 transition-all duration-200 focus:border-jad-primary focus:outline-none focus:ring-2 focus:ring-jad-primary/20 disabled:cursor-not-allowed disabled:opacity-60 resize-none';

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number;
  showCount?: boolean;
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, maxLength, showCount, value, onChange, ...props }, ref) => {
    const strVal = typeof value === 'string' ? value : '';
    const [count, setCount] = React.useState(strVal.length);

    React.useEffect(() => {
      setCount(strVal.length);
    }, [strVal.length]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className="relative">
        <textarea
          ref={ref}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          className={cn(
            showCount && maxLength && 'pb-8',
            baseTextareaClass,
            className
          )}
          {...props}
        />
        {showCount && maxLength && (
          <p className="absolute bottom-3 right-4 text-xs text-foreground/40 tabular-nums">
            {count}/{maxLength}
          </p>
        )}
      </div>
    );
  }
);
FormTextarea.displayName = 'FormTextarea';

export { FormTextarea };
