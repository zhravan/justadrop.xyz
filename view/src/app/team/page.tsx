import { ViewHeader } from '@/components/landing';
import { TeamHero, TeamGrid, TeamCTA } from '@/components/team';

export const metadata = {
  title: 'Team | just a drop',
  description: 'Meet the people behind just a drop – building a unified volunteering ecosystem.',
};

export default function TeamPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ViewHeader />
      <main className="flex-1">
        <TeamHero />
        <TeamGrid />
        <TeamCTA />
      </main>
    </div>
  );
}
