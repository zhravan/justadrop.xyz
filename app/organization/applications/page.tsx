'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Building2, Calendar, Users, FileText, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const navItems = [
  { href: '/organization/dashboard', label: 'Dashboard', icon: Building2 },
  { href: '/organization/opportunities', label: 'My Opportunities', icon: Calendar },
  { href: '/organization/applications', label: 'Applications', icon: FileText },
  { href: '/organization/volunteers', label: 'Volunteers', icon: Users },
];

export default function OrganizationApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('applications')
        .select(`
          *,
          opportunity:opportunities!inner(*),
          volunteer:profiles!volunteer_id(*)
        `)
        .eq('opportunity.organization_id', user.id)
        .order('created_at', { ascending: false });

      setApplications(data || []);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (
    applicationId: string,
    status: 'approved' | 'rejected'
  ) => {
    setActionLoading(applicationId);
    const supabase = createClient();

    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId);

    if (!error) {
      await fetchApplications();
    }

    setActionLoading(null);
  };

  const groupedApplications = {
    pending: applications.filter((app) => app.status === 'pending'),
    approved: applications.filter((app) => app.status === 'approved'),
    rejected: applications.filter((app) => app.status === 'rejected'),
    completed: applications.filter((app) => app.status === 'completed'),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-bold">Applications</div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Volunteer Applications</h1>
            <p className="text-gray-600 mt-1">Review and manage volunteer applications</p>
          </div>

          {/* Pending Applications */}
          {groupedApplications.pending.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-700">
                  Pending Review ({groupedApplications.pending.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groupedApplications.pending.map((app) => (
                    <div
                      key={app.id}
                      className="border border-yellow-200 bg-yellow-50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {app.volunteer?.full_name || 'Volunteer'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {app.volunteer?.email}
                          </p>
                          <p className="text-sm font-medium text-gray-700 mt-2">
                            Applied for: {app.opportunity?.title}
                          </p>
                          {app.message && (
                            <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                              <p className="text-sm text-gray-700">&quot;{app.message}&quot;</p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Applied: {formatDate(app.created_at)}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            onClick={() => handleUpdateStatus(app.id, 'approved')}
                            disabled={actionLoading === app.id}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleUpdateStatus(app.id, 'rejected')}
                            disabled={actionLoading === app.id}
                            size="sm"
                            variant="danger"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
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
                  Approved ({groupedApplications.approved.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groupedApplications.approved.map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {applications.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No applications yet
                </h3>
                <p className="text-gray-600">
                  Applications will appear here when volunteers apply to your opportunities
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

function ApplicationCard({ application }: { application: any }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {application.volunteer?.full_name || 'Volunteer'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{application.volunteer?.email}</p>
          <p className="text-sm text-gray-700 mt-2">
            Opportunity: {application.opportunity?.title}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Applied: {formatDate(application.created_at)}
          </p>
        </div>
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
  );
}

