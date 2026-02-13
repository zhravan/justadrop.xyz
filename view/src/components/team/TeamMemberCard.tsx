'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Mail } from 'lucide-react';
import { cn } from '@/lib/common';
import type { TeamMember } from '@/lib/constants';

const accentStyles = {
  primary: 'from-jad-primary to-jad-dark',
  accent: 'from-jad-accent to-jad-primary',
  mint: 'from-jad-mint to-jad-mint/60',
  dark: 'from-jad-dark to-jad-primary',
};

interface TeamMemberCardProps {
  member: TeamMember;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export function TeamMemberCard({
  member,
  size = 'md',
  className,
  style,
}: TeamMemberCardProps) {
  const gradientClass = accentStyles[member.accent];

  return (
    <article
      style={style}
        className={cn(
          'group relative overflow-hidden rounded-2xl border border-jad-primary/10 bg-white p-4 shadow-lg shadow-jad-foreground/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-jad-primary/15 hover:border-jad-primary/20 sm:p-6',
        size === 'lg' && 'md:row-span-2 md:p-8',
        size === 'md' && 'md:p-6',
        size === 'sm' && 'md:p-5',
        className
      )}
    >
      {/* Decorative gradient blob - appears on hover */}
      <div
        className={cn(
          'absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-25',
          gradientClass
        )}
      />
      {/* Subtle corner accent */}
      <div
        className={cn(
          'absolute right-0 top-0 h-20 w-20 translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br opacity-10',
          gradientClass
        )}
      />

      <div className="relative flex flex-col">
        {/* Avatar - image or initials */}
        <div
          className={cn(
            'flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br font-bold text-white',
            !member.image && gradientClass,
            size === 'lg' && 'mb-6 h-24 w-24 text-2xl',
            size === 'md' && 'mb-5 h-16 w-16 text-xl',
            size === 'sm' && 'mb-4 h-14 w-14 text-lg'
          )}
        >
          {member.image ? (
            <Image
              src={member.image}
              alt={member.name}
              width={size === 'lg' ? 96 : size === 'md' ? 64 : 56}
              height={size === 'lg' ? 96 : size === 'md' ? 64 : 56}
              className="h-full w-full object-cover"
            />
          ) : (
            member.initials
          )}
        </div>

        <div className="flex-1">
          <span
            className={cn(
              'inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-jad-foreground/60',
              size === 'lg' && 'text-xs'
            )}
          >
            {member.department}
          </span>
          <h3
            className={cn(
              'mt-2 font-bold text-jad-foreground',
              size === 'lg' && 'text-2xl md:text-3xl',
              size === 'md' && 'text-lg',
              size === 'sm' && 'text-base'
            )}
          >
            {member.name}
          </h3>
          <p
            className={cn(
              'font-medium text-jad-primary',
              size === 'lg' && 'mt-1 text-lg',
              size === 'md' && 'text-sm',
              size === 'sm' && 'text-xs'
            )}
          >
            {member.role}
          </p>
          <p
            className={cn(
              'mt-3 text-foreground/70',
              size === 'lg' && 'text-base leading-relaxed',
              size === 'md' && 'text-sm',
              size === 'sm' && 'text-xs'
            )}
          >
            {member.bio}
          </p>

          {(member.linkedIn || member.email) && (
            <div className="mt-4 flex gap-3">
              {member.linkedIn && (
                <Link
                  href={member.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-jad-mint/50 text-jad-primary transition-colors hover:bg-jad-mint"
                  aria-label={`${member.name} on LinkedIn`}
                >
                  <Linkedin className="h-4 w-4" strokeWidth={2} />
                </Link>
              )}
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-jad-mint/50 text-jad-primary transition-colors hover:bg-jad-mint"
                  aria-label={`Email ${member.name}`}
                >
                  <Mail className="h-4 w-4" strokeWidth={2} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
