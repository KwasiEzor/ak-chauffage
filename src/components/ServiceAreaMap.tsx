import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
const markerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface ServiceAreaMapProps {
  /** Center coordinates [lat, lng] - defaults to Charleroi */
  center?: [number, number];
  /** Service radius in meters - defaults to 25km */
  radius?: number;
  /** Map height class */
  className?: string;
}

export default function ServiceAreaMap({
  center = [50.4108, 4.4446], // Charleroi coordinates
  radius = 25000, // 25km radius
  className = 'h-64',
}: ServiceAreaMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Only render map on client side (fixes SSR issues)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={`${className} rounded-xl overflow-hidden border border-white/10 bg-zinc-800 flex items-center justify-center`}>
        <div className="text-zinc-400">Chargement de la carte...</div>
      </div>
    );
  }

  return (
    <div className={`${className} rounded-xl overflow-hidden border border-white/10`}>
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ background: '#27272a' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />

        {/* Service area circle */}
        <Circle
          center={center}
          radius={radius}
          pathOptions={{
            color: '#f97316',
            fillColor: '#f97316',
            fillOpacity: 0.15,
            weight: 2,
            opacity: 0.6,
          }}
        />

        {/* Center marker */}
        <Marker position={center} icon={markerIcon}>
          <Popup>
            <div className="text-center p-2">
              <strong className="text-orange-600 text-lg">AK CHAUFFAGE</strong>
              <p className="text-sm text-zinc-600 mt-1">
                Zone d'intervention : {radius / 1000}km
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Charleroi et environs
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
