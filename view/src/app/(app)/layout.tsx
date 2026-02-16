import { AppLayout } from '@/components/app/AppLayout';
import { NgoProvider } from '@/contexts/NgoContext';

export default function AppRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NgoProvider>
      <AppLayout>{children}</AppLayout>
    </NgoProvider>
  );
}
