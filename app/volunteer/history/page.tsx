import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Heart, Calendar, Clock, Award } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const navItems = [
  { href: '/volunteer/dashboard', label: 'Dashboard', icon: Heart },
  { href: '/volunteer/opportunities', label: 'Find Opportunities', icon: Calendar },
  { href: '/volunteer/applications', label: 'My Applications', icon: Clock },
  { href: '/volunteer/history', label: 'History', icon: Award },
];

export default async function VolunteerHistoryPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/auth/login');
  }

  if (profile.role !== 'volunteer') {
    redirect('/');
  }

  const supabase = await createClient();

  const { data: completedApplications } = await supabase
    .from('applications')
    .select(`
      *,
      opportunity:opportunities(
        *,
        organization:profiles(full_name, organization_name)
      )
    `)
    .eq('volunteer_id', profile.id)
    .eq('status', 'completed')
    .order('updated_at', { ascending: false });

  const totalHours =
    completedApplications?.reduce((sum, app) => sum + (app.hours_completed || 0), 0) || 0;
  const totalEvents = completedApplications?.length || 0;

  return (
    <DashboardLayout
      navItems={navItems}
      user={{ email: profile.email, full_name: profile.full_name }}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Volunteer History</h1>
          <p className="text-gray-600 mt-1">
            Your completed volunteer work and impact metrics
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary-600">{totalHours}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Events Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{totalEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Impact Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600">
                {Math.min(100, totalHours * 2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completed Events */}
        <Card>
          <CardHeader>
            <CardTitle>Completed Events</CardTitle>
          </CardHeader>
          <CardContent>
            {completedApplications && completedApplications.length > 0 ? (
              <div className="space-y-4">
                {completedApplications.map((app: any) => (
                  <div
                    key={app.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-green-50 to-transparent"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Award className="h-5 w-5 text-green-600" />
                          <h3 className="font-semibold text-gray-900">
                            {app.opportunity.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {app.opportunity.organization?.organization_name ||
                            app.opportunity.organization?.full_name}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Completed: {formatDate(app.updated_at)}</span>
                          <span>•</span>
                          <span className="font-medium text-green-600">
                            {app.hours_completed || 0} hours
                          </span>
                        </div>
                        {app.feedback && (
                          <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                            <p className="text-sm text-gray-600">{app.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No completed events yet
                </h3>
                <p className="text-gray-600">
                  Start volunteering to build your impact history!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

