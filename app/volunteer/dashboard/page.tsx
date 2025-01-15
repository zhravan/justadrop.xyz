import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Heart, Calendar, Clock, Award } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

const navItems = [
  { href: '/volunteer/dashboard', label: 'Dashboard', icon: Heart },
  { href: '/volunteer/opportunities', label: 'Find Opportunities', icon: Calendar },
  { href: '/volunteer/applications', label: 'My Applications', icon: Clock },
  { href: '/volunteer/history', label: 'History', icon: Award },
];

export default async function VolunteerDashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/auth/login');
  }

  if (profile.role !== 'volunteer') {
    redirect('/');
  }

  const supabase = await createClient();

  // Fetch user's applications with opportunity details
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      opportunity:opportunities(
        *,
        organization:profiles(full_name, organization_name)
      )
    `)
    .eq('volunteer_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch statistics
  const { count: totalApplications } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('volunteer_id', profile.id);

  const { count: approvedApplications } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('volunteer_id', profile.id)
    .eq('status', 'approved');

  const { data: completedHours } = await supabase
    .from('applications')
    .select('hours_completed')
    .eq('volunteer_id', profile.id)
    .eq('status', 'completed');

  const totalHours = completedHours?.reduce((sum, app) => sum + (app.hours_completed || 0), 0) || 0;

  return (
    <DashboardLayout
      navItems={navItems}
      user={{ email: profile.email, full_name: profile.full_name }}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile.full_name || 'Volunteer'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Track your volunteer journey and discover new opportunities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalApplications || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {approvedApplications || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Hours Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary-600">{totalHours}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Impact Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {Math.min(100, totalHours * 2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Applications</CardTitle>
              <Link
                href="/volunteer/applications"
                className="text-sm text-primary-600 hover:underline"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {applications && applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app: any) => (
                  <div
                    key={app.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {app.opportunity.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {app.opportunity.organization?.organization_name ||
                            app.opportunity.organization?.full_name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Applied on {formatDate(app.created_at)}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            app.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : app.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : app.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No applications yet</p>
                <Link
                  href="/volunteer/opportunities"
                  className="text-primary-600 hover:underline"
                >
                  Browse opportunities to get started
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/volunteer/opportunities">
            <Card className="hover:shadow-md transition cursor-pointer">
              <CardContent className="p-6">
                <Calendar className="h-10 w-10 text-primary-600 mb-3" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Find Opportunities
                </h3>
                <p className="text-gray-600">
                  Discover new volunteer opportunities that match your interests
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/volunteer/history">
            <Card className="hover:shadow-md transition cursor-pointer">
              <CardContent className="p-6">
                <Award className="h-10 w-10 text-purple-600 mb-3" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  View Your Impact
                </h3>
                <p className="text-gray-600">
                  See all your completed volunteer work and impact metrics
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

