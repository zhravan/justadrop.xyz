import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Building2, Calendar, Users, PlusCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const navItems = [
  { href: '/organization/dashboard', label: 'Dashboard', icon: Building2 },
  { href: '/organization/opportunities', label: 'My Opportunities', icon: Calendar },
  { href: '/organization/applications', label: 'Applications', icon: FileText },
  { href: '/organization/volunteers', label: 'Volunteers', icon: Users },
];

export default async function OrganizationDashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/auth/login');
  }

  if (profile.role !== 'organization') {
    redirect('/');
  }

  const supabase = await createClient();

  // Fetch organization's opportunities
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('*')
    .eq('organization_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch statistics
  const { count: totalOpportunities } = await supabase
    .from('opportunities')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', profile.id);

  const { count: publishedOpportunities } = await supabase
    .from('opportunities')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', profile.id)
    .eq('status', 'published');

  // Fetch total applications
  const { data: applications } = await supabase
    .from('applications')
    .select('*, opportunity:opportunities!inner(*)')
    .eq('opportunity.organization_id', profile.id);

  const pendingApplications = applications?.filter((app) => app.status === 'pending').length || 0;
  const totalVolunteers = new Set(applications?.map((app) => app.volunteer_id)).size;

  return (
    <DashboardLayout
      navItems={navItems}
      user={{ email: profile.email, full_name: profile.full_name }}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {profile.organization_name || 'Organization Dashboard'}
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your volunteer opportunities and applications
            </p>
          </div>
          <Link href="/organization/opportunities/new">
            <Button size="lg">
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Opportunity
            </Button>
          </Link>
        </div>

        {/* Verification Notice */}
        {!profile.organization_verified && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Organization Verification Pending
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your organization is under review. You can create opportunities, but they
                    won&apos;t be visible to volunteers until verified.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalOpportunities || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {publishedOpportunities || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Volunteers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary-600">{totalVolunteers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Opportunities */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Opportunities</CardTitle>
              <Link
                href="/organization/opportunities"
                className="text-sm text-primary-600 hover:underline"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {opportunities && opportunities.length > 0 ? (
              <div className="space-y-4">
                {opportunities.map((opportunity: any) => (
                  <div
                    key={opportunity.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{opportunity.title}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              opportunity.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : opportunity.status === 'closed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {opportunity.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{opportunity.category}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Created: {formatDate(opportunity.created_at)}</span>
                          <span>•</span>
                          <span>
                            {opportunity.spots_filled}/{opportunity.spots_available} spots filled
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/organization/opportunities/${opportunity.id}`}
                        className="text-primary-600 hover:underline text-sm"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No opportunities created yet</p>
                <Link href="/organization/opportunities/new">
                  <Button>
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Create Your First Opportunity
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

