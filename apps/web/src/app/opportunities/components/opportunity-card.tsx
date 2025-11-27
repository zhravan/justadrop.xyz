'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { OpportunityWithComputed } from '@justadrop/types';
import Link from 'next/link';
import { Calendar, MapPin, Users, Clock, CheckCircle2, Monitor, Laptop, Globe } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: OpportunityWithComputed;
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const {
    id,
    title,
    shortSummary,
    causeCategory,
    mode,
    city,
    state,
    computedStatus,
    isVerified,
    participantCount,
    maxVolunteers,
    startDate,
    certificateOffered,
  } = opportunity;

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'remote':
        return <Laptop className="w-4 h-4 text-drop-600" />;
      case 'hybrid':
        return <Globe className="w-4 h-4 text-drop-600" />;
      default:
        return <MapPin className="w-4 h-4 text-drop-600" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow p-6 relative">
      {/* Verified Badge */}
      {isVerified && (
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-drop-100 text-drop-700 px-3 py-1 rounded-full text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          Verified NGO
        </div>
      )}

      {/* Title and Summary */}
      <div className="mb-4 pr-24">
        <h3 className="text-xl font-bold text-drop-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">{shortSummary}</p>
      </div>

      {/* Metadata */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          {getModeIcon(mode)}
          <span>
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
            {(mode === 'onsite' || mode === 'hybrid') && city && state && (
              <> · {city}, {state}</>
            )}
          </span>
        </div>

        {startDate && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="w-4 h-4 text-drop-600" />
            <span>{new Date(startDate).toLocaleDateString()}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Users className="w-4 h-4 text-drop-600" />
          <span>
            {participantCount || 0} / {maxVolunteers} volunteers
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className={statusColors[computedStatus]}>
          {computedStatus.charAt(0).toUpperCase() + computedStatus.slice(1)}
        </Badge>
        <Badge variant="outline" className="capitalize">
          {causeCategory.replace('_', ' ')}
        </Badge>
        {certificateOffered && (
          <Badge variant="outline" className="border-drop-400 text-drop-700">
            Certificate Offered
          </Badge>
        )}
      </div>

      {/* Actions */}
      <Link href={`/opportunities/${id}`}>
        <Button className="w-full bg-drop-600 hover:bg-drop-700">
          View Details
        </Button>
      </Link>
    </Card>
  );
}
