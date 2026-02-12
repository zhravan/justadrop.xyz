import * as React from 'react';
import { cn } from '../../lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: 'section' | 'div';
}

export function Section({ 
  children, 
  className,
  as: Component = 'section',
  ...props 
}: SectionProps) {
  return (
    <Component 
      className={cn('container py-12 md:py-24', className)} 
      {...props}
    >
      {children}
    </Component>
  );
}

interface HeroSectionProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
}

export function HeroSection({ 
  title, 
  description, 
  actions,
  className 
}: HeroSectionProps) {
  return (
    <Section className={cn('py-24 md:py-32', className)}>
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl">
          {title}
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          {description}
        </p>
        {actions && (
          <div className="flex gap-4 mt-4">
            {actions}
          </div>
        )}
      </div>
    </Section>
  );
}
