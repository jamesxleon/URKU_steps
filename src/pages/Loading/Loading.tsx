import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Loading.css';

const Loading: React.FC = () => {
  const navigate = useNavigate();
  const [career, setCareer] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string>('/images/AvatarD.png'); // Default avatar path

  useEffect(() => {
    // Retrieve the avatar from localStorage
    const storedAvatar = localStorage.getItem('avatar');
    if (storedAvatar) {
      setAvatar(storedAvatar);
    }
  }, []);

  const handleNavigate = () => {
    if (career) {
      localStorage.setItem('career', career);
      navigate('/map');
    } else {
      alert("Please select a career.");
    }
  };

  return (
    <div className="loading-container">
      <video className="video-background" autoPlay loop muted>
        <source src="/videos/loadScreen.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="loading-overlay">
        <h1>The world is full of chances</h1>
        {/* Avatar image display */}
        <div className="avatar-container">
          <img src={avatar} alt="User Avatar" className="loading-avatar" />
        </div>
        <div className="career-selection">
          <label>
            Where do you wanna go?
            <select
              value={career || ''}
              onChange={(e) => setCareer(e.target.value)}
            >
              <option value="">Select a career</option>
              <option value="agriculture">Agriculture</option>
              <option value="healthcare">Healthcare</option>
              <option value="technology">Technology</option>
              <option value="astronomy">Astronomy</option>
            </select>
          </label>
          <button onClick={handleNavigate} className="navigate-button">
            Take me there
          </button>
        </div>
      </div>
    </div>
  );
};

export default Loading;
