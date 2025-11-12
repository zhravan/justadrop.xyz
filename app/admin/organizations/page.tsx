'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Users, Building2, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Shield },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/organizations', label: 'Organizations', icon: Building2 },
  { href: '/admin/opportunities', label: 'Opportunities', icon: Calendar },
];

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'organization')
      .order('created_at', { ascending: false });

    setOrganizations(data || []);
    setLoading(false);
  };

  const handleVerify = async (orgId: string, verify: boolean) => {
    setActionLoading(orgId);
    const supabase = createClient();

    const { error } = await supabase
      .from('profiles')
      .update({ organization_verified: verify })
      .eq('id', orgId);

    if (!error) {
      await fetchOrganizations();
    }

    setActionLoading(null);
  };

  const pendingOrgs = organizations.filter((org) => !org.organization_verified);
  const verifiedOrgs = organizations.filter((org) => org.organization_verified);

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
            <div className="flex items-center space-x-8">
              <Shield className="h-8 w-8 text-primary-600" />
              <div className="flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organization Management</h1>
            <p className="text-gray-600 mt-1">Review and verify organization accounts</p>
          </div>

          {/* Pending Organizations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-700">
                Pending Verification ({pendingOrgs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingOrgs.length > 0 ? (
                <div className="space-y-4">
                  {pendingOrgs.map((org) => (
                    <div
                      key={org.id}
                      className="border border-yellow-200 bg-yellow-50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {org.organization_name || 'Unnamed Organization'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Contact: {org.full_name || 'Not provided'}
                          </p>
                          <p className="text-sm text-gray-600">Email: {org.email}</p>
                          {org.phone && (
                            <p className="text-sm text-gray-600">Phone: {org.phone}</p>
                          )}
                          {org.bio && (
                            <p className="text-sm text-gray-700 mt-2">{org.bio}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Registered: {formatDate(org.created_at)}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            onClick={() => handleVerify(org.id, true)}
                            disabled={actionLoading === org.id}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                          <Button
                            onClick={() => handleVerify(org.id, false)}
                            disabled={actionLoading === org.id}
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
              ) : (
                <p className="text-center text-gray-600 py-8">
                  No organizations pending verification
                </p>
              )}
            </CardContent>
          </Card>

          {/* Verified Organizations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">
                Verified Organizations ({verifiedOrgs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {verifiedOrgs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left text-sm font-medium text-gray-600">
                        <th className="pb-3">Organization</th>
                        <th className="pb-3">Contact</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Verified Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {verifiedOrgs.map((org) => (
                        <tr key={org.id} className="text-sm">
                          <td className="py-3 font-medium">
                            {org.organization_name || 'Unnamed'}
                          </td>
                          <td className="py-3">{org.full_name || 'N/A'}</td>
                          <td className="py-3">{org.email}</td>
                          <td className="py-3">{formatDate(org.updated_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">
                  No verified organizations yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

