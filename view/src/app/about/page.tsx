import { InProgressPage } from '@/components/common/InProgressPage';

export const metadata = {
  title: 'About | juztadrop',
  description: 'Learn about juztadrop and our mission.',
};

export default function AboutPage() {
  return (
    <InProgressPage
      title="About us"
      description="Learn about our mission to connect volunteers with organisations that need help."
    />
  );
}
