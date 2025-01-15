import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Building2, Calendar, Users, FileText, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const navItems = [
  { href: '/organization/dashboard', label: 'Dashboard', icon: Building2 },
  { href: '/organization/opportunities', label: 'My Opportunities', icon: Calendar },
  { href: '/organization/applications', label: 'Applications', icon: FileText },
  { href: '/organization/volunteers', label: 'Volunteers', icon: Users },
];

export default async function OrganizationOpportunitiesPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/auth/login');
  }

  if (profile.role !== 'organization') {
    redirect('/');
  }

  const supabase = await createClient();

  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('*')
    .eq('organization_id', profile.id)
    .order('created_at', { ascending: false });

  const groupedOpportunities = {
    published: opportunities?.filter((opp) => opp.status === 'published') || [],
    draft: opportunities?.filter((opp) => opp.status === 'draft') || [],
    closed: opportunities?.filter((opp) => opp.status === 'closed') || [],
  };

  return (
    <DashboardLayout
      navItems={navItems}
      user={{ email: profile.email, full_name: profile.full_name }}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Opportunities</h1>
            <p className="text-gray-600 mt-1">Manage your volunteer opportunities</p>
          </div>
          <Link href="/organization/opportunities/new">
            <Button size="lg">
              <PlusCircle className="h-5 w-5 mr-2" />
              Create New
            </Button>
          </Link>
        </div>

        {/* Published Opportunities */}
        {groupedOpportunities.published.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">
                Published ({groupedOpportunities.published.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupedOpportunities.published.map((opp: any) => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Draft Opportunities */}
        {groupedOpportunities.draft.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-700">
                Drafts ({groupedOpportunities.draft.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupedOpportunities.draft.map((opp: any) => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Closed Opportunities */}
        {groupedOpportunities.closed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-700">
                Closed ({groupedOpportunities.closed.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupedOpportunities.closed.map((opp: any) => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {opportunities && opportunities.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No opportunities yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first opportunity to start connecting with volunteers
              </p>
              <Link href="/organization/opportunities/new">
                <Button>
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Create Opportunity
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function OpportunityCard({ opportunity }: { opportunity: any }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition">
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
            <span>Start: {formatDate(opportunity.date_start)}</span>
            <span>•</span>
            <span>
              {opportunity.spots_filled}/{opportunity.spots_available} spots filled
            </span>
          </div>
        </div>
        <Link
          href={`/organization/opportunities/${opportunity.id}`}
          className="text-primary-600 hover:underline text-sm font-medium"
        >
          Manage →
        </Link>
      </div>
    </div>
  );
}

