import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCountries, getRandomCoordinates, Country } from '../../services/countryService';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState<string>('neutral');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [locationType, setLocationType] = useState<'device' | 'random'>('random');
  const [avatar, setAvatar] = useState<string>('/images/AvatarF.png');
  const [locationReady, setLocationReady] = useState(false);

  useEffect(() => {
    setCountries(getCountries());
  }, []);

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gender = e.target.value;
    setSelectedGender(gender);
    setAvatar(gender === 'female' ? '/images/AvatarF.png' : gender === 'male' ? '/images/AvatarM.png' : '/images/AvatarF.png');
  };

  const handleUseDeviceLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates([position.coords.latitude, position.coords.longitude]);
        setLocationType('device');
        setSelectedCountry('');
        setLocationReady(true);
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
      setLocationReady(true);
    } else {
      setCoordinates(null);
      setLocationReady(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (coordinates) {
      const userData = {
        coordinates,
        locationType,
        selectedGender,
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      console.log('User data saved:', userData);
      navigate('/map');
    } else {
      alert('Please select a location or use device location');
    }
  };

  return (
    <section className="principal">
      <div className="container">
        <div className="logo-container">
          <h3>URKU STEPS</h3>
        </div>

        <div className="text-container">
          <h1>Every journey begins with a step</h1>
          <h2>READY?</h2>
        </div>

        <div className="flex-container">
          <div id="form-container" className="form-container">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select id="gender" name="gender" value={selectedGender} onChange={handleGenderChange} required>
                  <option value="neutral">Select gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="country">Location</label>
                <select id="country" name="country" value={selectedCountry} onChange={handleCountryChange}>
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <button type="button" className="location-button" onClick={handleUseDeviceLocation}>
                OR Use Device Location
              </button>

              {locationReady && (
                <p className="location-ready-label">Location confirmed and ready to proceed.</p>
              )}

              <button type="submit" className="submit-button" disabled={!coordinates}>
                Continue
              </button>
            </form>
          </div>

          <div id="transition-image" className="banner-image responsive-img">
            <img src={avatar} alt="Avatar" className="banner-img" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
