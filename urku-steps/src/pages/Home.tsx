import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView/MapView';
import { generateMap } from '../services/apiService';

interface Location {
  lat: number | null;
  lng: number | null;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('neutral');
  const [location, setLocation] = useState<Location>({ lat: null, lng: null });
  const [loading, setLoading] = useState(false);
  const [mapUrl, setMapUrl] = useState<string | null>(null);

  const handleLocationClick = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  };

  const handleGenerateMap = async () => {
    if (location.lat !== null && location.lng !== null) {
      setLoading(true);
      try {
        const result = await generateMap(location.lat, location.lng);
        setMapUrl(result.map_url);
      } catch (error) {
        console.error('Failed to generate map:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = () => {
    if (name && location.lat !== null && location.lng !== null) {
      handleGenerateMap();
      navigate('/map');
    }
  };

  return (
    <div>
      <h1>Welcome to URKU Steps</h1>
      <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
      <select value={gender} onChange={(e) => setGender(e.target.value)}>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="neutral">Neutral</option>
      </select>
      <button onClick={handleLocationClick}>Use My Location</button>
      <button onClick={handleSubmit} disabled={loading || !name || location.lat === null || location.lng === null}>
        {loading ? 'Generating...' : 'Continue'}
      </button>
      {location.lat !== null && location.lng !== null && (
        <MapView center={[location.lat, location.lng]} />
      )}
      {mapUrl && (
        <div>
            <h2>Generated Map</h2>
            <iframe
            src={mapUrl}
            title="Generated Interactive Map"
            style={{ width: '100%', height: '500px', border: 'none' }}
            />
        </div>
        )}
    </div>
  );
};

export default Home;
