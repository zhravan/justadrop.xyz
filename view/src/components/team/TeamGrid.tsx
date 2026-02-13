'use client';

import { TEAM_MEMBERS } from '@/lib/constants';
import { TeamMemberCard } from './TeamMemberCard';

export function TeamGrid() {
  return (
    <section className="bg-jad-mint/30 py-12 sm:py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM_MEMBERS.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
