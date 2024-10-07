import React from 'react';
import { Link } from 'react-router-dom';
import './Header.module.css';

const Header: React.FC = () => (
  <header className="header">
    <div className="logo">
      <Link to="/">URKU Steps</Link>
    </div>
    <nav>
      <ul>
        <li><Link to="/profile">Profile</Link></li>
      </ul>
    </nav>
  </header>
);

export default Header;
