'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { OpportunityWithComputed } from '@justadrop/types';
import Link from 'next/link';
import { Calendar, MapPin, Users, CheckCircle2, Laptop, Globe, Award } from 'lucide-react';
import { getStatusColors } from '@/lib/utils/badge-colors';

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
    <Card className="hover:shadow-lg transition-all duration-300 p-3 sm:p-4 md:p-6 relative group border-2 border-slate-200 hover:border-drop-400">
      {/* Verified Badge */}
      {isVerified && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 flex items-center gap-1 bg-drop-100 text-drop-700 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold shadow-sm">
          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Verified</span>
        </div>
      )}

      {/* Title and Summary */}
      <div className="mb-3 sm:mb-4 pr-16 xs:pr-20 sm:pr-24">
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-drop-800 mb-1 sm:mb-2 line-clamp-2 group-hover:text-drop-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">{shortSummary}</p>
      </div>

      {/* Metadata */}
      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
          {getModeIcon(mode)}
          <span className="truncate">
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
            {(mode === 'onsite' || mode === 'hybrid') && city && state && (
              <> · {city}, {state}</>
            )}
          </span>
        </div>

        {startDate && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-drop-600 flex-shrink-0" />
            <span>{new Date(startDate).toLocaleDateString()}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
          <Users className="w-3 h-3 sm:w-4 sm:h-4 text-drop-600 flex-shrink-0" />
          <span>
            {participantCount || 0} / {maxVolunteers} volunteers
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        <Badge className={`${getStatusColors(computedStatus)} text-[10px] xs:text-xs px-2 py-0.5`}>
          {computedStatus.charAt(0).toUpperCase() + computedStatus.slice(1)}
        </Badge>
        <Badge variant="outline" className="capitalize text-[10px] xs:text-xs px-2 py-0.5">
          {causeCategory.replace('_', ' ')}
        </Badge>
        {certificateOffered && (
          <Badge variant="outline" className="border-drop-400 text-drop-700 text-[10px] xs:text-xs px-2 py-0.5">
            <Award className="w-3 h-3 mr-1 inline" />
            Certificate
          </Badge>
        )}
      </div>

      {/* Actions */}
      <Link href={`/opportunities/${id}`}>
        <Button className="w-full bg-drop-600 hover:bg-drop-700 group-hover:shadow-md transition-all text-xs sm:text-sm h-9 sm:h-10">
          View Details
        </Button>
      </Link>
    </Card>
  );
}
