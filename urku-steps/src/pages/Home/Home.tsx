import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCountries, getRandomCoordinates, Country } from '../../services/countryService';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [locationType, setLocationType] = useState<'device' | 'random'>('random');

  useEffect(() => {
    setCountries(getCountries());
  }, []);

  const handleUseDeviceLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setCoordinates(coords);
        setLocationType('device');
        setSelectedCountry('');
      },
      (error) => {
        console.error('Error obtaining location:', error);
        alert('Failed to get device location');
      }
    );
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    setSelectedCountry(countryCode);
    if (countryCode) {
      setCoordinates(getRandomCoordinates(countryCode));
      setLocationType('random');
    } else {
      setCoordinates(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && coordinates) {
      // Save user data in localStorage
      const userData = {
        name,
        coordinates,
        locationType
      };
      localStorage.setItem('userData', JSON.stringify(userData));

      // Log saved data for verification
      console.log('User data saved:', userData);

      // Navigate to map screen
      navigate('/map');
    } else {
      alert('Please enter your name and select a location');
    }
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to URKU Steps</h1>
      <form className="home-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Name:</label>
          <input
            id="name"
            className="form-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Choose your location:</label>
          <button type="button" className="form-button" onClick={handleUseDeviceLocation}>
            Use Device Location
          </button>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="country">Or select a country:</label>
          <select
            id="country"
            className="form-select"
            value={selectedCountry}
            onChange={handleCountryChange}
          >
            <option value="">-- Select a country --</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        {coordinates && (
          <p>
            Selected location: {locationType === 'device' ? 'Device' : 'Random'} (
            {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)})
          </p>
        )}
        <button className="form-button" type="submit" disabled={!coordinates}>Continue</button>
      </form>
    </div>
  );
};

export default Home;
