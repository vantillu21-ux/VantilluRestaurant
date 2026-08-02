'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface OrderMapProps {
  customerLat: number;
  customerLng: number;
}

export default function OrderMap({ customerLat, customerLng }: OrderMapProps) {
  // Hardcoded restaurant location as Delivery Boy start
  const RESTAURANT_LAT = 17.3616;
  const RESTAURANT_LNG = 78.5480;

  const restaurantPosition: [number, number] = [RESTAURANT_LAT, RESTAURANT_LNG];
  const customerPosition: [number, number] = [customerLat, customerLng];

  return (
    <div className="h-48 w-full rounded-xl overflow-hidden border border-white/10 mt-3 z-0 relative" style={{ zIndex: 0 }}>
      <MapContainer 
        bounds={[restaurantPosition, customerPosition]} 
        boundsOptions={{ padding: [20, 20] }} 
        scrollWheelZoom={false}
        zoomAnimation={false}
        fadeAnimation={false}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={restaurantPosition}>
          <Popup>Restaurant / Delivery Start</Popup>
        </Marker>
        <Marker position={customerPosition}>
          <Popup>Customer Location</Popup>
        </Marker>
        <Polyline positions={[restaurantPosition, customerPosition]} color="red" dashArray="5, 10" />
      </MapContainer>
    </div>
  );
}
