import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Shield, Users, Building2, Calendar } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Shield },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/organizations', label: 'Organizations', icon: Building2 },
  { href: '/admin/opportunities', label: 'Opportunities', icon: Calendar },
];

export default async function AdminDashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/auth/login');
  }

  if (profile.role !== 'admin') {
    redirect('/');
  }

  const supabase = await createClient();

  // Fetch statistics
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: totalVolunteers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'volunteer');

  const { count: totalOrganizations } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'organization');

  const { count: verifiedOrganizations } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'organization')
    .eq('organization_verified', true);

  const { count: totalOpportunities } = await supabase
    .from('opportunities')
    .select('*', { count: 'exact', head: true });

  const { count: publishedOpportunities } = await supabase
    .from('opportunities')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  const { count: totalApplications } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true });

  // Fetch pending organizations
  const { data: pendingOrganizations } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'organization')
    .eq('organization_verified', false)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <DashboardLayout
      navItems={navItems}
      user={{ email: profile.email, full_name: profile.full_name }}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">System overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalUsers || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                {totalVolunteers} volunteers, {totalOrganizations} organizations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Organizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary-600">
                {totalOrganizations || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {verifiedOrganizations} verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {totalOpportunities || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {publishedOpportunities} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {totalApplications || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Organizations */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Pending Organization Verifications</CardTitle>
              <Link
                href="/admin/organizations"
                className="text-sm text-primary-600 hover:underline"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingOrganizations && pendingOrganizations.length > 0 ? (
              <div className="space-y-4">
                {pendingOrganizations.map((org: any) => (
                  <div
                    key={org.id}
                    className="border border-yellow-200 bg-yellow-50 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {org.organization_name || 'Unnamed Organization'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{org.email}</p>
                        <p className="text-sm text-gray-600">
                          Contact: {org.full_name || 'Not provided'}
                        </p>
                      </div>
                      <Link
                        href={`/admin/organizations`}
                        className="text-primary-600 hover:underline text-sm font-medium"
                      >
                        Review →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">
                No pending organization verifications
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/users">
            <Card className="hover:shadow-md transition cursor-pointer">
              <CardContent className="p-6">
                <Users className="h-10 w-10 text-primary-600 mb-3" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Manage Users</h3>
                <p className="text-gray-600">View and manage all system users</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/organizations">
            <Card className="hover:shadow-md transition cursor-pointer">
              <CardContent className="p-6">
                <Building2 className="h-10 w-10 text-green-600 mb-3" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Verify Organizations
                </h3>
                <p className="text-gray-600">Review and verify organization accounts</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/opportunities">
            <Card className="hover:shadow-md transition cursor-pointer">
              <CardContent className="p-6">
                <Calendar className="h-10 w-10 text-purple-600 mb-3" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Monitor Opportunities
                </h3>
                <p className="text-gray-600">Oversee all volunteer opportunities</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

