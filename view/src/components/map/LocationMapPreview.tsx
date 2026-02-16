'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/common';

interface LocationMapPreviewProps {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  height?: number | string;
  showControls?: boolean;
  className?: string;
}

const OSM_STYLE = 'https://demotiles.maplibre.org/style.json';

function buildMapsUrl(address: string): string {
  const encoded = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

function buildOsmUrl(address: string): string {
  const encoded = encodeURIComponent(address);
  return `https://www.openstreetmap.org/search?query=${encoded}`;
}

export function LocationMapPreview({
  latitude,
  longitude,
  address,
  height = 200,
  showControls = true,
  className,
}: LocationMapPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const hasCoords = latitude != null && longitude != null && !Number.isNaN(latitude) && !Number.isNaN(longitude);

  useEffect(() => {
    if (!hasCoords || !containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: [longitude, latitude],
      zoom: 14,
    });

    const marker = new maplibregl.Marker({ color: '#0d9488' })
      .setLngLat([longitude, latitude])
      .addTo(map);

    if (showControls) {
      map.addControl(new maplibregl.NavigationControl(), 'top-right');
    }

    return () => {
      marker.remove();
      map.remove();
    };
  }, [latitude, longitude, hasCoords, showControls]);

  if (!hasCoords) {
    return (
      <div className={cn('space-y-3', className)}>
        {address && (
          <div className="flex items-start gap-2 rounded-xl border border-foreground/10 bg-muted/30 p-4">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-jad-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{address}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href={buildMapsUrl(address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-jad-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open in Google Maps
                </a>
                <a
                  href={buildOsmUrl(address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-jad-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open in OpenStreetMap
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className={cn('overflow-hidden rounded-xl border border-foreground/10', className)}>
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: heightStyle }}
      />
      {address && (
        <div className="border-t border-foreground/10 bg-muted/20 px-4 py-2">
          <p className="flex items-center gap-2 text-sm text-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-jad-primary" />
            {address}
          </p>
          <a
            href={buildMapsUrl(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-jad-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Open in Google Maps
          </a>
        </div>
      )}
    </div>
  );
}
