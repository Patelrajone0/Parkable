'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ParkingSpot } from '@/types';
import { Loader2 } from 'lucide-react';

interface ParkingMapProps {
  spots: ParkingSpot[];
  selectedSpot: ParkingSpot | null;
  onSelectSpot: (spot: ParkingSpot) => void;
  center: [number, number];
  zoom: number;
  interactivePinPlacement?: boolean;
  onPinPlaced?: (coords: { lat: number; lng: number }) => void;
  pinCoords?: { lat: number; lng: number } | null;
  userLocation?: { lat: number; lng: number } | null;
}

const DynamicMap = dynamic(() => import('./ParkingMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] bg-[#141210] flex flex-col items-center justify-center text-[#a89682] gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-[#dfba89]" />
      <span className="text-xs font-semibold tracking-wide text-[#dfba89]">Loading interactive satellite & street map...</span>
    </div>
  ),
});

export default function ParkingMap(props: ParkingMapProps) {
  return (
    <div className="w-full h-full relative min-h-[350px]">
      <DynamicMap {...props} />
    </div>
  );
}
