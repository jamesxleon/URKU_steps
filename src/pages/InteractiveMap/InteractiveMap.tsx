import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L, { Map as LeafletMap } from 'leaflet';
import { Career, getMockResourceData } from '../../services/mockDataService';
import MapViewWithGIBS from '../../components/MapViewWithGIBS';
import 'leaflet/dist/leaflet.css';
import './InteractiveMap.css';

interface UserData {
  coordinates: [number, number];
  locationType: 'device' | 'random';
  avatar: string;
}

const InteractiveMap: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [career, setCareer] = useState<Career | null>(null);
  const [resourceData, setResourceData] = useState<{ disparityScore: number; urkuSteps: number } | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const navigate = useNavigate();
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    const storedCareer = localStorage.getItem('career') as Career | null;
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    if (storedCareer) {
      setCareer(storedCareer);
    }
  }, []);

  useEffect(() => {
    if (career && userData) {
      const newResourceData = getMockResourceData(userData.locationType === 'device', career);
      setResourceData(newResourceData);

      // Store urkuSteps in localStorage for later use in the /game page
      localStorage.setItem('urkuSteps', newResourceData.urkuSteps.toString());
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

  useEffect(() => {
    if (mapRef.current && userData) {
      mapRef.current.setView(userData.coordinates, 10);
    }
  }, [userData]);

  const handleTransitionToGame = () => {
    setTransitioning(true);
    setTimeout(() => {
      navigate('/game');
    }, 1500);
  };

  const userMarker = L.icon({
    iconUrl: userData?.avatar || '/images/default-avatar.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const resourceMarker = L.icon({
    iconUrl: '/images/resource-location.png',
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
    <section className={`principal ${transitioning ? 'fade-out' : ''}`}>
      <div className="container">
        <div className="logo-container">
          <a href="Urku.html">
            <h3>URKU STEPS</h3>
          </a>
        </div>

        <div className="text-container">
          <h1>Chances are you will need</h1>
          {resourceData && (
            <h2> <strong>{resourceData.urkuSteps.toFixed(2)}</strong> Urku Steps to arrive!</h2>
          )}
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

          <button className="transition-button" onClick={handleTransitionToGame}>
            Face your Urkus
          </button>
        </div>
      </div>
    </section>
  );
};

export default InteractiveMap;
