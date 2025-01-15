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

export default async function VolunteerApplicationsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/auth/login');
  }

  if (profile.role !== 'volunteer') {
    redirect('/');
  }

  const supabase = await createClient();

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
    .order('created_at', { ascending: false });

  const groupedApplications = {
    pending: applications?.filter((app) => app.status === 'pending') || [],
    approved: applications?.filter((app) => app.status === 'approved') || [],
    rejected: applications?.filter((app) => app.status === 'rejected') || [],
    completed: applications?.filter((app) => app.status === 'completed') || [],
  };

  return (
    <DashboardLayout
      navItems={navItems}
      user={{ email: profile.email, full_name: profile.full_name }}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">Track the status of your volunteer applications</p>
        </div>

        {/* Applications by Status */}
        <div className="space-y-6">
          {/* Pending Applications */}
          {groupedApplications.pending.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-700">
                  Pending Applications ({groupedApplications.pending.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groupedApplications.pending.map((app: any) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approved Applications */}
          {groupedApplications.approved.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">
                  Approved Applications ({groupedApplications.approved.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groupedApplications.approved.map((app: any) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed Applications */}
          {groupedApplications.completed.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-700">
                  Completed ({groupedApplications.completed.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groupedApplications.completed.map((app: any) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rejected Applications */}
          {groupedApplications.rejected.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">
                  Not Selected ({groupedApplications.rejected.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groupedApplications.rejected.map((app: any) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {applications && applications.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No applications yet
                </h3>
                <p className="text-gray-600">
                  Start applying to volunteer opportunities to see them here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function ApplicationCard({ application }: { application: any }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{application.opportunity.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {application.opportunity.organization?.organization_name ||
              application.opportunity.organization?.full_name}
          </p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>Applied: {formatDate(application.created_at)}</span>
            <span>•</span>
            <span>Event: {formatDate(application.opportunity.date_start)}</span>
          </div>
          {application.message && (
            <p className="text-sm text-gray-600 mt-2 italic">
              &quot;{application.message}&quot;
            </p>
          )}
          {application.status === 'completed' && application.hours_completed && (
            <p className="text-sm text-green-600 mt-2 font-medium">
              Completed {application.hours_completed} hours
            </p>
          )}
        </div>
        <div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              application.status === 'approved'
                ? 'bg-green-100 text-green-800'
                : application.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : application.status === 'completed'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

