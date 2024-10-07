import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Start.css';

const Start: React.FC = () => {
    const [countdown, setCountdown] = useState(5); // Shortened countdown for faster transition
    const [transitioning, setTransitioning] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 600);

        if (countdown === 1) {
            setTransitioning(true);
        }

        if (countdown === 0) {
            clearInterval(timer);
            // Use requestAnimationFrame to trigger navigation right after the animation
            requestAnimationFrame(() => {
                setTimeout(() => navigate('/home'), 100); // Sync with push-up duration
            });
        }

        return () => clearInterval(timer);
    }, [countdown, navigate]);

    return (
        <section className={`home ${transitioning ? 'push-up' : ''}`}>
            <div className="container">
                <h2>Community Mapping</h2>
                <h1>URKU STEPS</h1>
                <div className="banner-image">
                    <img src={`/images/world_friendly.png`} alt="Community Mapping" className="banner-img" />
                </div>
                <br />
                <br />
                <div className="submit-button">
                    Launching in {countdown} 🚀
                </div>
            </div>
        </section>
    );
};

export default Start;
