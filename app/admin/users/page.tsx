import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Shield, Users, Building2, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Shield },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/organizations', label: 'Organizations', icon: Building2 },
  { href: '/admin/opportunities', label: 'Opportunities', icon: Calendar },
];

export default async function AdminUsersPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/auth/login');
  }

  if (profile.role !== 'admin') {
    redirect('/');
  }

  const supabase = await createClient();

  // Fetch all users
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  // Group users by role
  const groupedUsers = {
    volunteers: users?.filter((u) => u.role === 'volunteer') || [],
    organizations: users?.filter((u) => u.role === 'organization') || [],
    admins: users?.filter((u) => u.role === 'admin') || [],
  };

  return (
    <DashboardLayout
      navItems={navItems}
      user={{ email: profile.email, full_name: profile.full_name }}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">View and manage all platform users</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Volunteers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary-600">
                {groupedUsers.volunteers.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Organizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {groupedUsers.organizations.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {groupedUsers.admins.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Volunteers */}
        <Card>
          <CardHeader>
            <CardTitle>Volunteers ({groupedUsers.volunteers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm font-medium text-gray-600">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {groupedUsers.volunteers.map((user: any) => (
                    <tr key={user.id} className="text-sm">
                      <td className="py-3">{user.full_name || 'N/A'}</td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">{user.location || 'Not specified'}</td>
                      <td className="py-3">{formatDate(user.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Organizations */}
        <Card>
          <CardHeader>
            <CardTitle>Organizations ({groupedUsers.organizations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm font-medium text-gray-600">
                    <th className="pb-3">Organization</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {groupedUsers.organizations.map((user: any) => (
                    <tr key={user.id} className="text-sm">
                      <td className="py-3 font-medium">
                        {user.organization_name || 'Unnamed'}
                      </td>
                      <td className="py-3">{user.full_name || 'N/A'}</td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.organization_verified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {user.organization_verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3">{formatDate(user.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

