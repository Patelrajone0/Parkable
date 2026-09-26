'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ParkingSpot } from '@/types';

interface ParkingMapInnerProps {
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

export default function ParkingMapInner({
  spots,
  selectedSpot,
  onSelectSpot,
  center,
  zoom,
  interactivePinPlacement = false,
  onPinPlaced,
  pinCoords,
  userLocation,
}: ParkingMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pinMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Reset leaflet ID if container was re-mounted by React
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    const initialCenter: [number, number] = userLocation 
      ? [userLocation.lat, userLocation.lng] 
      : center;

    const map = L.map(container, {
      center: initialCenter,
      zoom: zoom,
      zoomControl: false,
    });

    // Dark CartoDB tile provider matching the Dark Desert Titanium aesthetic
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Fallback to OpenStreetMap if CartoDB network tile fails
    tileLayer.on('tileerror', () => {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
    });

    // Add Zoom control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add layer group for spot markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    mapInstanceRef.current = map;

    // Critical: Call invalidateSize on multiple layout passes so map tiles render immediately
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 80);
    const t2 = setTimeout(() => map.invalidateSize(), 250);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(container);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center when prop changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.flyTo(center, zoom, {
        duration: 1.0,
        easeLinearity: 0.25,
      });
    }
  }, [center[0], center[1], zoom]);

  // Render User Live Location Radar Marker (Desert Titanium Gold Radar)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation) {
      const userHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
          <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 30px; height: 30px; border-radius: 9999px; background: rgba(223, 186, 137, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; border-radius: 9999px; background: #dfba89; border: 2.5px solid #141210; box-shadow: 0 0 14px rgba(223, 186, 137, 0.9); position: relative; z-index: 10;"></div>
          </div>
          <div style="background: #181512; color: #f6f2ec; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; margin-top: 3px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.6); border: 1.5px solid #dfba89; display: flex; align-items: center; gap: 4px;">
            <span style="color: #dfba89; font-size: 8px;">●</span> Live Location
          </div>
        </div>
      `;

      const userIcon = L.divIcon({
        className: 'user-live-radar-icon',
        html: userHtml,
        iconSize: [85, 52],
        iconAnchor: [42.5, 15],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(map);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userLocation]);

  // Click handler for interactive pin placement (e.g., during "List a Spot")
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (interactivePinPlacement && onPinPlaced) {
      const handleClick = (e: L.LeafletMouseEvent) => {
        onPinPlaced({ lat: e.latlng.lat, lng: e.latlng.lng });
      };

      map.on('click', handleClick);
      return () => {
        map.off('click', handleClick);
      };
    }
  }, [interactivePinPlacement, onPinPlaced]);

  // Handle single pin marker placement (for host spot creation)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pinCoords) {
      if (pinMarkerRef.current) {
        pinMarkerRef.current.setLatLng([pinCoords.lat, pinCoords.lng]);
      } else {
        const pinHtml = `
          <div style="background: linear-gradient(135deg, #dfba89 0%, #b37d4e 100%); color: #12100e; padding: 8px; border-radius: 9999px; box-shadow: 0 10px 25px -3px rgba(0,0,0,0.6), 0 0 15px rgba(223, 186, 137, 0.5); border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `;
        const customPinIcon = L.divIcon({
          className: 'custom-pin-placement',
          html: pinHtml,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });
        pinMarkerRef.current = L.marker([pinCoords.lat, pinCoords.lng], {
          icon: customPinIcon,
          draggable: true,
        }).addTo(map);

        pinMarkerRef.current.on('dragend', (e: any) => {
          const latlng = e.target.getLatLng();
          if (onPinPlaced) {
            onPinPlaced({ lat: latlng.lat, lng: latlng.lng });
          }
        });
      }
    } else if (pinMarkerRef.current) {
      pinMarkerRef.current.remove();
      pinMarkerRef.current = null;
    }
  }, [pinCoords, onPinPlaced]);

  // Render spot markers with distance & charger badges in Desert Titanium
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    if (!markersLayer) return;

    markersLayer.clearLayers();

    spots.forEach((spot) => {
      const isSelected = selectedSpot?.id === spot.id;
      const isCharger = spot.amenities.includes('ev_charging');

      const bgStyle = isSelected
        ? 'linear-gradient(135deg, #dfba89 0%, #b37d4e 100%)'
        : isCharger
        ? '#1f1a14'
        : '#181512';
      const textColor = isSelected ? '#12100e' : '#f6f2ec';
      const borderColor = isSelected ? '#ffffff' : isCharger ? '#dfba89' : '#383028';
      const shadowStyle = isSelected
        ? '0 0 18px rgba(223, 186, 137, 0.7), 0 4px 14px rgba(0,0,0,0.6)'
        : '0 4px 14px rgba(0, 0, 0, 0.5)';
      const pointerColor = isSelected ? '#b37d4e' : isCharger ? '#1f1a14' : '#181512';

      const markerHtml = `
        <div class="custom-marker-pin ${isSelected ? 'selected' : ''}" style="cursor: pointer;">
          <div style="
            background: ${bgStyle};
            color: ${textColor};
            font-weight: 700;
            font-size: 12px;
            padding: 5px 9px;
            border-radius: 9999px;
            box-shadow: ${shadowStyle};
            border: 2px solid ${borderColor};
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
          ">
            ${isCharger ? `<span style="color: ${isSelected ? '#12100e' : '#dfba89'}; font-size: 12px;">⚡</span>` : ''}
            <span>₹${spot.hourly_rate}</span>
            <span style="font-size: 10px; opacity: ${isSelected ? '0.9' : '0.75'}; font-weight: 500;">/hr</span>
            ${spot.distance_km !== undefined ? `<span style="font-size: 9.5px; opacity: 0.9; background: ${isSelected ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)'}; padding: 1px 4px; border-radius: 4px; margin-left: 2px;">${spot.distance_km}km</span>` : ''}
          </div>
          <div style="
            width: 0; 
            height: 0; 
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid ${pointerColor};
            margin: -1px auto 0 auto;
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-spot-marker',
        html: markerHtml,
        iconSize: [95, 36],
        iconAnchor: [47, 36],
      });

      const marker = L.marker([spot.lat, spot.lng], { icon: customIcon });

      marker.on('click', () => {
        onSelectSpot(spot);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([spot.lat, spot.lng]);
        }
      });

      marker.addTo(markersLayer);
    });
  }, [spots, selectedSpot, onSelectSpot]);

  return (
    <div className="absolute inset-0 w-full h-full min-h-[350px]">
      <div 
        ref={mapContainerRef} 
        className="w-full h-full"
        style={{ minHeight: '350px' }}
      />
    </div>
  );
}
