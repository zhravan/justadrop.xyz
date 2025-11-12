import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Building2, Calendar, Users, FileText } from 'lucide-react';

const navItems = [
  { href: '/organization/dashboard', label: 'Dashboard', icon: Building2 },
  { href: '/organization/opportunities', label: 'My Opportunities', icon: Calendar },
  { href: '/organization/applications', label: 'Applications', icon: FileText },
  { href: '/organization/volunteers', label: 'Volunteers', icon: Users },
];

export default async function OrganizationVolunteersPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/auth/login');
  }

  if (profile.role !== 'organization') {
    redirect('/');
  }

  const supabase = await createClient();

  // Fetch all volunteers who have applied to this organization's opportunities
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      opportunity:opportunities!inner(*),
      volunteer:profiles!volunteer_id(*)
    `)
    .eq('opportunity.organization_id', profile.id)
    .in('status', ['approved', 'completed']);

  // Get unique volunteers
  const volunteersMap = new Map();
  applications?.forEach((app: any) => {
    const volunteerId = app.volunteer.id;
    if (!volunteersMap.has(volunteerId)) {
      volunteersMap.set(volunteerId, {
        ...app.volunteer,
        applications: [],
        totalHours: 0,
      });
    }
    const volunteer = volunteersMap.get(volunteerId);
    volunteer.applications.push(app);
    if (app.status === 'completed' && app.hours_completed) {
      volunteer.totalHours += app.hours_completed;
    }
  });

  const volunteers = Array.from(volunteersMap.values());

  return (
    <DashboardLayout
      navItems={navItems}
      user={{ email: profile.email, full_name: profile.full_name }}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Our Volunteers</h1>
          <p className="text-gray-600 mt-1">
            View volunteers who have participated in your opportunities
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Volunteers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary-600">{volunteers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {applications?.filter((app: any) => app.status === 'approved').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Hours Volunteered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {volunteers.reduce((sum, v) => sum + v.totalHours, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Volunteers List */}
        <Card>
          <CardHeader>
            <CardTitle>Volunteer Roster</CardTitle>
          </CardHeader>
          <CardContent>
            {volunteers.length > 0 ? (
              <div className="space-y-4">
                {volunteers.map((volunteer: any) => (
                  <div
                    key={volunteer.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {volunteer.full_name || 'Volunteer'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{volunteer.email}</p>
                        {volunteer.location && (
                          <p className="text-sm text-gray-600">Location: {volunteer.location}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Events: {volunteer.applications.length}</span>
                          <span>•</span>
                          <span>Hours: {volunteer.totalHours}</span>
                        </div>
                        {volunteer.skills && volunteer.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {volunteer.skills.slice(0, 5).map((skill: string) => (
                              <span
                                key={skill}
                                className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No volunteers yet</h3>
                <p className="text-gray-600">
                  Volunteers will appear here once they are approved for your opportunities
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

