import React, { useEffect, useState } from 'react';
import { MapContainer, WMSTileLayer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// You'll need to import the marker icon images
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix the default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon,
  iconUrl: markerIcon,
  shadowUrl: markerIconShadow,
});

interface MapViewWithGIBSProps {
  userCoordinates: [number, number];
  layers: string[];
  zoom: number;
  showUserMarker: boolean;
}

interface LayerData {
  tile_matrix_sets: string[];
  formats: string[];
}

const MapViewWithGIBS: React.FC<MapViewWithGIBSProps> = ({ userCoordinates, layers, zoom, showUserMarker }) => {
  const [layerData, setLayerData] = useState<Record<string, LayerData> | null>(null);

  useEffect(() => {
    const storedLayerData = localStorage.getItem('layerData');
    if (storedLayerData) {
      try {
        const parsedData = JSON.parse(storedLayerData);
        setLayerData(parsedData);
      } catch (error) {
        console.error('Error parsing layerData:', error);
      }
    } else {
      console.error("Layer data not found. Please fetch the compatibility data first.");
    }
  }, []);

  return (
    <MapContainer center={userCoordinates} zoom={zoom} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {layerData && layers.map((layer) => {
        const layerInfo = layerData[layer];
        if (layerInfo) {
          const format = layerInfo.formats.includes('image/png') ? 'image/png' : layerInfo.formats[0] || '';
        
          if (format) {
            return (
              <WMSTileLayer
                key={layer}
                url={`https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi`}
                layers={layer}
                format={format}
                transparent={true}
                opacity={0.7}
                tileSize={512}
                attribution="NASA EOSDIS GIBS"
              />
            );
          }
        }
        return null;
      })}
      {showUserMarker && (
        <Marker position={userCoordinates}>
          <Popup>
            Your location: {userCoordinates[0]}, {userCoordinates[1]}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapViewWithGIBS;