import React, { useEffect, useState } from 'react';
import { TileLayer, WMSTileLayer, useMap, Marker, Popup } from 'react-leaflet';

interface MapViewWithGIBSProps {
  userCoordinates: [number, number];
  layers: string[];
  zoom: number;
  showUserMarker: boolean;
}

const MapViewWithGIBS: React.FC<MapViewWithGIBSProps> = React.memo(({ userCoordinates, layers, zoom, showUserMarker }) => {
  const [layerData, setLayerData] = useState<Record<string, any> | null>(null);
  const map = useMap();

  // Center map on userCoordinates
  useEffect(() => {
    if (map && userCoordinates) {
      map.setView(userCoordinates, zoom);
    }
  }, [map, userCoordinates, zoom]);

  useEffect(() => {
    // Load NASA GIBS data only once
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
  }, []); // Empty dependency array ensures this runs once on mount

  if (!layerData) {
    return null; // Render nothing if no layer data
  }

  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {layers.map((layer) => {
        const layerInfo = layerData[layer];
        if (layerInfo) {
          const format = layerInfo.formats.includes('image/png') ? 'image/png' : layerInfo.formats[0] || '';
          return (
            <WMSTileLayer
              key={layer}
              url="https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi"
              layers={layer}
              format={format}
              transparent
              opacity={0.7}
              tileSize={512}
              attribution="NASA EOSDIS GIBS"
            />
          );
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
    </>
  );
});

export default MapViewWithGIBS;
