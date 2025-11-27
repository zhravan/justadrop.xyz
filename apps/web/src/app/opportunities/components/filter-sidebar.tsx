'use client';

import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { OpportunityFilters } from '@justadrop/types';

interface FilterSidebarProps {
  filters: OpportunityFilters;
  onFiltersChange: (filters: OpportunityFilters) => void;
  onReset: () => void;
}

const causeCategories = [
  { value: 'community', label: 'Community Development' },
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'environment', label: 'Environment' },
  { value: 'animals', label: 'Animal Welfare' },
  { value: 'disaster', label: 'Disaster Relief' },
  { value: 'elderly', label: 'Elderly Care' },
  { value: 'children', label: 'Children & Youth' },
];

const modeOptions = [
  { value: 'onsite', label: 'On-site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
];

const statusOptions = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

export default function FilterSidebar({
  filters,
  onFiltersChange,
  onReset,
}: FilterSidebarProps) {
  const updateFilter = (key: keyof OpportunityFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (
    key: 'mode' | 'causeCategory' | 'status' | 'skills',
    value: string
  ) => {
    const current = (filters[key as 'mode' | 'causeCategory' | 'status'] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  return (
    <div className="bg-white rounded-lg shadow-md sm:shadow-lg border border-slate-200 p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-200">
        <h3 className="text-base sm:text-lg font-bold text-drop-800">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-xs sm:text-sm hover:bg-drop-50 hover:text-drop-700 font-semibold">
          Reset All
        </Button>
      </div>

      {/* Verified Only */}
      <div className="bg-drop-50 p-3 sm:p-4 rounded-lg border border-drop-200">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified"
            checked={filters.verified || false}
            onCheckedChange={checked => updateFilter('verified', checked)}
            className="data-[state=checked]:bg-drop-600 data-[state=checked]:border-drop-600"
          />
          <Label htmlFor="verified" className="text-xs sm:text-sm font-semibold text-drop-800 cursor-pointer">
            ✓ Verified NGOs Only
          </Label>
        </div>
      </div>

      {/* Mode */}
      <div>
        <Label className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 block text-slate-700 uppercase tracking-wider">Mode</Label>
        <div className="space-y-2 sm:space-y-2.5">
          {modeOptions.map(option => (
            <div key={option.value} className="flex items-center space-x-2 hover:bg-slate-50 p-1.5 rounded transition-colors">
              <Checkbox
                id={`mode-${option.value}`}
                checked={(filters.mode || []).includes(option.value as any)}
                onCheckedChange={() => toggleArrayFilter('mode', option.value)}
                className="data-[state=checked]:bg-drop-600 data-[state=checked]:border-drop-600"
              />
              <Label htmlFor={`mode-${option.value}`} className="text-xs sm:text-sm cursor-pointer flex-1">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Cause Category */}
      <div>
        <Label className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 block text-slate-700 uppercase tracking-wider">Cause Category</Label>
        <div className="space-y-2 sm:space-y-2.5 max-h-48 sm:max-h-56 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-drop-300 scrollbar-track-slate-100">
          {causeCategories.map(category => (
            <div key={category.value} className="flex items-center space-x-2 hover:bg-slate-50 p-1.5 rounded transition-colors">
              <Checkbox
                id={`cause-${category.value}`}
                checked={(filters.causeCategory || []).includes(category.value as any)}
                onCheckedChange={() => toggleArrayFilter('causeCategory', category.value)}
                className="data-[state=checked]:bg-drop-600 data-[state=checked]:border-drop-600"
              />
              <Label htmlFor={`cause-${category.value}`} className="text-xs sm:text-sm cursor-pointer flex-1">
                {category.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <Label className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 block text-slate-700 uppercase tracking-wider">Status</Label>
        <div className="space-y-2 sm:space-y-2.5">
          {statusOptions.map(option => (
            <div key={option.value} className="flex items-center space-x-2 hover:bg-slate-50 p-1.5 rounded transition-colors">
              <Checkbox
                id={`status-${option.value}`}
                checked={(filters.status || []).includes(option.value as any)}
                onCheckedChange={() => toggleArrayFilter('status', option.value)}
                className="data-[state=checked]:bg-drop-600 data-[state=checked]:border-drop-600"
              />
              <Label htmlFor={`status-${option.value}`} className="text-xs sm:text-sm cursor-pointer flex-1">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <Label className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 block text-slate-700 uppercase tracking-wider">Location</Label>
        <div className="space-y-2 sm:space-y-3">
          <Input
            placeholder="City"
            value={filters.city || ''}
            onChange={e => updateFilter('city', e.target.value)}
            className="text-xs sm:text-sm border-2 focus:border-drop-500"
          />
          <Input
            placeholder="State"
            value={filters.state || ''}
            onChange={e => updateFilter('state', e.target.value)}
            className="text-xs sm:text-sm border-2 focus:border-drop-500"
          />
        </div>
      </div>

      {/* Skills */}
      <div>
        <Label htmlFor="skills" className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 block text-slate-700 uppercase tracking-wider">
          Required Skills
        </Label>
        <Input
          id="skills"
          placeholder="e.g., Communication, Teaching"
          value={(filters.skills || []).join(', ')}
          onChange={e =>
            updateFilter(
              'skills',
              e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            )
          }
          className="text-xs sm:text-sm border-2 focus:border-drop-500"
        />
        <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5">Separate skills with commas</p>
      </div>
    </div>
  );
}
