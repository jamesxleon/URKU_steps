import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L, { Map as LeafletMap } from 'leaflet';
import { Career, getMockResourceData } from '../../services/mockDataService';
import MapViewWithGIBS from '../../components/MapViewWithGIBS';
import 'leaflet/dist/leaflet.css';
import './InteractiveMap.css';

import userIcon from '../../assets/user-location.png';
import resourceIcon from '../../assets/resource-location.png';

interface UserData {
  name: string;
  coordinates: [number, number];
  locationType: 'device' | 'random';
}

const InteractiveMap: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [career, setCareer] = useState<Career | null>(null);
  const [resourceData, setResourceData] = useState<{ disparityScore: number; urkuSteps: number } | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  useEffect(() => {
    if (career && userData) {
      const newResourceData = getMockResourceData(userData.locationType === 'device', career);
      setResourceData(newResourceData);
    }
  }, [career, userData]);

  const resourceLocations = useMemo(() => {
    if (!userData || !resourceData) return [];
    const { coordinates } = userData;
    const [lat, lng] = coordinates;
    const locations = [];
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = resourceData.urkuSteps * 250 * Math.random();
      const newLat = lat + (distance / 111) * Math.cos(angle);
      const newLng = lng + (distance / (111 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle);
      locations.push([newLat, newLng]);
    }
    return locations;
  }, [userData, resourceData]);

  // Center map on user location after userData is set
  useEffect(() => {
    if (mapRef.current && userData) {
      mapRef.current.setView(userData.coordinates, 10);
    }
  }, [userData]);

  const userMarker = L.icon({
    iconUrl: userIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const resourceMarker = L.icon({
    iconUrl: resourceIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const layers = [
    'Reference_Labels_15m',
    'Reference_Features_15m',
    'Coastlines_15m',
    'GRUMP_Settlements',
    'Probabilities_of_Urban_Expansion_2000-2030',
    'Landsat_Human_Built-up_And_Settlement_Extent',
    'Last_of_the_Wild_1995-2004',
    'GPW_Population_Density_2020',
  ];

  return (
    <section className="principal">
      <div className="container">
        <div className="logo-container">
          <a href="Urku.html">
            <h3>URKU STEPS</h3>
          </a>
        </div>

        <div className="flex-containerstep">
          <div className="text-container">
            <h1>What do you want to be?</h1>
            <label>
              Choose your career:
              <select value={career || ''} onChange={(e) => setCareer(e.target.value as Career)}>
                <option value="">Select a career</option>
                <option value="agriculture">Agriculture</option>
                <option value="healthcare">Healthcare</option>
                <option value="technology">Technology</option>
                <option value="astronomy">Astronomy</option>
              </select>
            </label>
            {resourceData && (
              <p>Urku Steps to Ideal Resources: {resourceData.urkuSteps.toFixed(2)}</p>
            )}
          </div>

          <div className="text-container">
            <h1>Your Interactive Map</h1>
            <MapContainer
              center={userData?.coordinates || [0, 0]}
              zoom={10}
              style={{ height: '600px', width: '100%' }}
              whenReady={() => {
                if (mapRef.current && userData) {
                  mapRef.current.setView(userData.coordinates, 10);
                }
              }}
            >
              <MapViewWithGIBS userCoordinates={userData?.coordinates || [0, 0]} layers={layers} zoom={10} showUserMarker={true} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {userData && (
                <Marker position={userData.coordinates} icon={userMarker}>
                  <Popup>Your Location</Popup>
                </Marker>
              )}

              {resourceLocations.map((location, index) => (
                <React.Fragment key={index}>
                  <Marker position={location as [number, number]} icon={resourceMarker}>
                    <Popup>Resource Location {index + 1}</Popup>
                  </Marker>
                  <Polyline positions={[userData?.coordinates as [number, number], location as [number, number]]} color="red" />
                </React.Fragment>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveMap;
