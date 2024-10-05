import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import InteractiveMap from './pages/InteractiveMap';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<InteractiveMap />} />
      </Routes>
    </Router>
  );
}

export default App;
