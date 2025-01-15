'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { OPPORTUNITY_CATEGORIES } from '@/types';

export default function NewOpportunityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    remote_option: false,
    date_start: '',
    date_end: '',
    time_commitment: '',
    spots_available: 1,
    skills_required: '',
    status: 'draft',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const { error: insertError } = await supabase.from('opportunities').insert([
        {
          organization_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          remote_option: formData.remote_option,
          date_start: formData.date_start,
          date_end: formData.date_end || null,
          time_commitment: formData.time_commitment,
          spots_available: formData.spots_available,
          skills_required: formData.skills_required
            ? formData.skills_required.split(',').map((s) => s.trim())
            : null,
          status: formData.status,
        },
      ]);

      if (insertError) throw insertError;

      router.push('/organization/opportunities');
    } catch (err: any) {
      setError(err.message || 'Failed to create opportunity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/organization/opportunities"
            className="inline-flex items-center text-primary-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Opportunity</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <Input
                label="Opportunity Title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Beach Cleanup Volunteer"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe the volunteer opportunity..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {OPPORTUNITY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State"
                required
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remote_option"
                  checked={formData.remote_option}
                  onChange={(e) =>
                    setFormData({ ...formData, remote_option: e.target.checked })
                  }
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="remote_option" className="text-sm text-gray-700">
                  Remote opportunity available
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="datetime-local"
                  value={formData.date_start}
                  onChange={(e) => setFormData({ ...formData, date_start: e.target.value })}
                  required
                />

                <Input
                  label="End Date (Optional)"
                  type="datetime-local"
                  value={formData.date_end}
                  onChange={(e) => setFormData({ ...formData, date_end: e.target.value })}
                />
              </div>

              <Input
                label="Time Commitment"
                type="text"
                value={formData.time_commitment}
                onChange={(e) => setFormData({ ...formData, time_commitment: e.target.value })}
                placeholder="3 hours"
                required
              />

              <Input
                label="Available Spots"
                type="number"
                min="1"
                value={formData.spots_available}
                onChange={(e) =>
                  setFormData({ ...formData, spots_available: parseInt(e.target.value) })
                }
                required
              />

              <Input
                label="Required Skills (comma-separated)"
                type="text"
                value={formData.skills_required}
                onChange={(e) => setFormData({ ...formData, skills_required: e.target.value })}
                placeholder="teamwork, communication, physical fitness"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === 'draft'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">Save as Draft</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === 'published'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">Publish Immediately</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Opportunity'}
                </Button>
                <Link href="/organization/opportunities" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

