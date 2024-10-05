import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapViewWithGIBS from '../components/MapViewWithGIBS';

const InteractiveMap: React.FC = () => {
  const navigate = useNavigate();
  const [userCoordinates, setUserCoordinates] = useState<[number, number] | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserCoordinates(parsedData.coordinates);
    } else {
      navigate('/');
    }
  }, [navigate]);

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

  if (!userCoordinates) {
    return <p>Loading map...</p>;
  }

  return (
    <div>
      <h2>NASA GIBS Map</h2>
      <MapViewWithGIBS 
        userCoordinates={userCoordinates} 
        layers={layers} 
        zoom={10} // Add initial zoom level
        showUserMarker={true} // Add flag to show user marker
      />
    </div>
  );
};

export default InteractiveMap;