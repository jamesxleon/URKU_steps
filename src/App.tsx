import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Start from './pages/Start/Start';
import Home from './pages/Home/Home';
import Loading from './pages/Loading/Loading';
import InteractiveMap from './pages/InteractiveMap/InteractiveMap';
import Game from './pages/Game/Game';

const App: React.FC = () => {

  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/home" element={<Home />} />
      <Route path="/loading" element={<Loading />} />
      <Route path="/map" element={<InteractiveMap />} />
      <Route path="/game" element={<Game />} /> {/* Pass urkuSteps here */}
    </Routes>
  );
};

export default App;
