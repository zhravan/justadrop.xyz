import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Heart, Calendar, Clock, Award, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

const navItems = [
  { href: '/volunteer/dashboard', label: 'Dashboard', icon: Heart },
  { href: '/volunteer/opportunities', label: 'Find Opportunities', icon: Calendar },
  { href: '/volunteer/applications', label: 'My Applications', icon: Clock },
  { href: '/volunteer/history', label: 'History', icon: Award },
];

export default async function VolunteerOpportunitiesPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/auth/login');
  }

  if (profile.role !== 'volunteer') {
    redirect('/');
  }

  const supabase = await createClient();

  // Fetch published opportunities
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select(`
      *,
      organization:profiles(full_name, organization_name, avatar_url)
    `)
    .eq('status', 'published')
    .gte('date_start', new Date().toISOString())
    .order('date_start', { ascending: true })
    .limit(20);

  return (
    <DashboardLayout
      navItems={navItems}
      user={{ email: profile.email, full_name: profile.full_name }}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Opportunities</h1>
          <p className="text-gray-600 mt-1">
            Discover meaningful volunteer opportunities that match your interests
          </p>
        </div>

        {/* Opportunities Grid */}
        {opportunities && opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity: any) => (
              <Link key={opportunity.id} href={`/volunteer/opportunities/${opportunity.id}`}>
                <Card className="h-full hover:shadow-lg transition cursor-pointer">
                  {opportunity.image_url && (
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                      <img
                        src={opportunity.image_url}
                        alt={opportunity.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <span className="px-3 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                        {opportunity.category}
                      </span>
                      {opportunity.remote_option && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          Remote
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {opportunity.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {opportunity.description}
                    </p>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{opportunity.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(opportunity.date_start)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {opportunity.spots_filled}/{opportunity.spots_available} spots filled
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-700 font-medium">
                        {opportunity.organization?.organization_name ||
                          opportunity.organization?.full_name}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No opportunities available
              </h3>
              <p className="text-gray-600">Check back soon for new volunteer opportunities!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

