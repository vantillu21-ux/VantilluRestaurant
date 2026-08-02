'use client';
import { useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Move icon creation inside component to avoid SSR issues
function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface LocationPickerMapProps {
  initialLat: number;
  initialLng: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export default function LocationPickerMap({ initialLat, initialLng, onLocationChange }: LocationPickerMapProps) {
  const [gpsPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const markerRef = useRef<any>(null);

  const lollipopIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-lollipop-icon bg-transparent border-0',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="width: 24px; height: 24px; background-color: #eab308; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4); z-index: 2;"></div>
          <div style="width: 4px; height: 24px; background-color: white; margin-top: -4px; z-index: 1; box-shadow: 1px 1px 3px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [24, 44],
      iconAnchor: [12, 44],
      popupAnchor: [0, -44],
    });
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
  };



  return (
    <div className="w-full rounded-xl overflow-hidden border border-brand-gold/30 mt-3 relative" style={{ height: '256px', zIndex: 0 }}>
      <MapContainer 
        center={position} 
        zoom={16} 
        scrollWheelZoom={false} 
        zoomAnimation={false}
        fadeAnimation={false} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {/* Actual GPS Location */}
        <CircleMarker 
          center={gpsPosition} 
          radius={7} 
          pathOptions={{ color: 'white', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }}
        >
          <Popup minWidth={90}>
            <span className="font-bold text-[10px] text-gray-800">Your GPS Location</span>
          </Popup>
        </CircleMarker>

        <MapEvents onMapClick={handleMapClick} />
        <Marker 
          draggable={true}
          eventHandlers={{
            dragend() {
              const marker = markerRef.current;
              if (marker != null) {
                const newPos = marker.getLatLng();
                setPosition([newPos.lat, newPos.lng]);
                onLocationChange(newPos.lat, newPos.lng);
              }
            },
          }}
          position={position}
          ref={markerRef}
          icon={lollipopIcon}
        >
          <Popup minWidth={100} autoPan={false}>
            <span className="font-bold text-xs text-gray-800">Drag me to delivery spot</span>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
