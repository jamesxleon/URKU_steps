import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

interface MapViewProps {
  center: [number, number];
}

const MapView: React.FC<MapViewProps> = ({ center }) => {
  return (
    <MapContainer center={center} zoom={10} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
};

export default MapView;
