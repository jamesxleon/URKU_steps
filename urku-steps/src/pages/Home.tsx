import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (coordinates) {
      console.log('Storing user data:', { name, coordinates }); // Log 9
      localStorage.setItem('userData', JSON.stringify({ name, coordinates }));
      navigate('/map');
    } else {
      alert('Please select a location');
    }
  };

  const handleUseDeviceLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude] as [number, number];
        setCoordinates(coords);
        setLocation(`Device location: (${coords[0]}, ${coords[1]})`);
      },
      (error) => {
        console.error('Error obtaining location:', error);
        alert('Failed to get device location');
      }
    );
  };

  const handleManualLocationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);

    const [lat, lng] = value.split(',').map(Number);
    if (!isNaN(lat) && !isNaN(lng)) {
      setCoordinates([lat, lng]);
    } else {
      setCoordinates(null);
    }
  };

  return (
    <div>
      <h1>Welcome to URKU Steps</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Enter Location (lat,lng):
          <input
            type="text"
            value={location}
            onChange={handleManualLocationInput}
            placeholder="e.g., -0.1807,-78.4678"
          />
        </label>
        <button type="button" onClick={handleUseDeviceLocation}>
          Use Device Location
        </button>
        <button type="submit">Continue</button>
      </form>
    </div>
  );
};

export default Home;
