import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/Card';
import { Calendar, MapPin, Users, Heart } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default async function PublicOpportunitiesPage() {
  const supabase = await createClient();

  const { data: opportunities } = await supabase
    .from('opportunities')
    .select(`
      *,
      organization:profiles(full_name, organization_name, avatar_url)
    `)
    .eq('status', 'published')
    .gte('date_start', new Date().toISOString())
    .order('date_start', { ascending: true })
    .limit(50);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">JustADrop</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-primary-600 transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Volunteer Opportunities
          </h1>
          <p className="text-xl text-gray-600">
            Find meaningful ways to give back to your community
          </p>
        </div>

        {opportunities && opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity: any) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition">
                {opportunity.image_url && (
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                    <img
                      src={opportunity.image_url}
                      alt={opportunity.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-3 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                      {opportunity.category}
                    </span>
                    {opportunity.remote_option && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        Remote
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                    {opportunity.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {opportunity.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{opportunity.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(opportunity.date_start)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {opportunity.spots_available - opportunity.spots_filled} spots available
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-sm text-gray-700 font-medium">
                      {opportunity.organization?.organization_name ||
                        opportunity.organization?.full_name}
                    </p>
                    <Link
                      href="/auth/register?role=volunteer"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Apply →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No opportunities available
              </h3>
              <p className="text-gray-600">
                Check back soon for new volunteer opportunities!
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

