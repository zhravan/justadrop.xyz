'use client';

import { useState, useEffect } from 'react';
import { opportunitiesApi } from '@/lib/api-client';
import type { OpportunityWithComputed, OpportunityFilters } from '@justadrop/types';
import OpportunityCard from './components/opportunity-card';
import FilterSidebar from './components/filter-sidebar';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Plus, Briefcase, MapPin, Users, Award } from 'lucide-react';

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<OpportunityWithComputed[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<OpportunityFilters>({
    page: 1,
    limit: 12,
    sortBy: 'newest',
  });

  useEffect(() => {
    loadOpportunities();
  }, [filters]);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const response = await opportunitiesApi.list(filters);
      setOpportunities(response.opportunities);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: OpportunityFilters) => {
    setFilters({ ...newFilters, page: 1 }); // Reset to page 1 when filters change
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: 'newest',
    });
  };

  const handleLoadMore = () => {
    setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
  };

  // Calculate stats
  const stats = [
    {
      icon: Briefcase,
      label: 'Active Opportunities',
      value: total,
      color: 'text-drop-600',
      bgColor: 'bg-drop-100'
    },
    {
      icon: MapPin,
      label: 'Locations',
      value: new Set(opportunities.map(o => `${o.city}-${o.state}`)).size || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Users,
      label: 'Volunteers Needed',
      value: opportunities.reduce((sum, o) => sum + (o.maxVolunteers - (o.participantCount || 0)), 0),
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      icon: Award,
      label: 'Certificates Offered',
      value: opportunities.filter(o => o.certificateOffered).length,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    }
  ];

  return (
    <main className="flex-1 min-h-screen bg-gradient-to-b from-white via-drop-50/30 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-drop-500 via-drop-600 to-drop-700 text-white">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-3 sm:space-y-4 md:space-y-6">
            <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-bold mb-2 sm:mb-4">
              💼 Make an Impact
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight px-2">
              Volunteer Opportunities
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-drop-100 leading-relaxed max-w-2xl mx-auto px-2">
              Discover meaningful ways to make a difference in communities across India. Join verified NGOs and create lasting impact.
            </p>
            {user && (
              <div className="pt-2 sm:pt-4">
                <Link href="/opportunities/create">
                  <Button size="lg" className="bg-white text-drop-700 hover:bg-drop-50 font-bold text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Post Opportunity
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-12 md:h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Stats Overview */}
      <section className="container mx-auto px-3 sm:px-4 lg:px-8 -mt-4 sm:-mt-6 md:-mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              color={stat.color}
              bgColor={stat.bgColor}
            />
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Filter Sidebar - Desktop */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-4">
              <FilterSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleResetFilters}
              />
            </div>
          </aside>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="w-full mb-4 border-2 border-drop-300 hover:bg-drop-50 text-drop-700 font-semibold"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            {showFilters && (
              <div className="mb-6">
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onReset={handleResetFilters}
                />
              </div>
            )}
          </div>

          {/* Opportunities Grid */}
          <div className="lg:col-span-3">
            {loading && opportunities.length === 0 ? (
              <LoadingSpinner size="md" text="Loading opportunities..." className="py-12 sm:py-16 md:py-20" />
            ) : opportunities.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No opportunities found"
                description="Try adjusting your filters or check back later"
                action={{ label: 'Reset Filters', onClick: handleResetFilters }}
              />
            ) : (
              <>
                <div className="text-center mb-4 sm:mb-6 md:mb-8">
                  <p className="text-xs sm:text-sm md:text-base text-slate-600 font-medium">
                    Showing <span className="text-drop-600 font-bold">{opportunities.length}</span> of <span className="text-drop-600 font-bold">{total}</span> opportunities
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {opportunities.map(opportunity => (
                    <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                  ))}
                </div>
                {opportunities.length < total && (
                  <div className="mt-6 sm:mt-8 text-center">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loading}
                      variant="outline"
                      className="min-w-[200px] border-2 border-drop-300 hover:bg-drop-50 text-drop-700 font-semibold"
                    >
                      {loading ? 'Loading...' : 'Load More Opportunities'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
