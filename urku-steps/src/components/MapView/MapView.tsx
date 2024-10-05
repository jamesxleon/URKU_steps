import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

interface MapViewProps {
  center: [number, number];
}

const MapView: React.FC<MapViewProps> = ({ center }) => {
  // Set up the default icon for markers
  const DefaultIcon = L.icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconAnchor: [12, 41],
  });

  L.Marker.prototype.options.icon = DefaultIcon;

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={center}>
        <Popup>Your current location</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapView;
