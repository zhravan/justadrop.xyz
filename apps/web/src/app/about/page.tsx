import { Metadata } from 'next'
import { HeroSection } from './components/hero-section'
import { TimelineSection } from './components/timeline-section'
import { DropPhilosophy } from './components/drop-philosophy'
import { FounderNote } from './components/founder-note'
import { TwoPillars } from './components/two-pillars'
import { ValuesSection } from './components/values-section'
import { CTASection } from './components/cta-section'

export const metadata: Metadata = {
  title: 'About Us - Just a Drop',
  description: 'Learn how Just a Drop began in 2019 during COVID, growing from friends pooling ₹1/day to a family of 100+ volunteers creating meaningful change through community support and a volunteering platform.',
}

export default function AboutPage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <TimelineSection />
      <DropPhilosophy />
      <FounderNote />
      <TwoPillars />
      <ValuesSection />
      <CTASection />
    </main>
  )
}
