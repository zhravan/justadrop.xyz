'use client';

import * as React from 'react';
import { cn } from '@/lib/common';

export interface ChipOption {
  value: string;
  label: string;
}

export interface ChipGroupProps {
  options: ChipOption[] | readonly { value: string; label: string }[];
  selected: string[];
  onChange: (value: string) => void;
  variant?: 'primary' | 'mint';
  className?: string;
}

export function ChipGroup({
  options,
  selected,
  onChange,
  variant = 'primary',
  className,
}: ChipGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map(({ value, label }) => {
        const isSelected = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
              isSelected
                ? variant === 'primary'
                  ? 'bg-jad-primary text-white shadow-md shadow-jad-primary/20'
                  : 'bg-jad-mint text-jad-foreground border border-jad-primary/30'
                : 'border border-foreground/20 bg-white text-foreground/80 hover:border-jad-primary/40 hover:bg-jad-mint/30'
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
