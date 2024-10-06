import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import InteractiveMap from './pages/InteractiveMap/InteractiveMap';
import Home from './pages/Home/Home';
import { fetchLayerCompatibilityData } from './services/gisService';
import 'leaflet/dist/leaflet.css';

const App: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLayerData = async () => {
      try {
        await fetchLayerCompatibilityData();
        console.log('Layer compatibility data loaded successfully');
      } catch (error) {
        console.error('Failed to load layer compatibility data:', error);
        setError('Failed to load map data. Please try again later.');
      }
    };

    loadLayerData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/map" element={<InteractiveMap />} />
    </Routes>
  );
};

export default App;