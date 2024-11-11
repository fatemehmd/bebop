import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SpaceTunnel from './components/SpaceTunnel';
import BoidSimulation from './components/BoidSimulation';
import SpacePiano from './components/SpacePiano';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="fixed top-0 left-0 z-50 p-4">
          <Link to="/" className="mr-4 text-white hover:text-gray-300">Space Tunnel</Link>
          <Link to="/boids" className="mr-4 text-white hover:text-gray-300">Boids</Link>
          <Link to="/piano" className="text-white hover:text-gray-300">Space Piano</Link>
        </nav>

        <Routes>
          <Route path="/" element={<SpaceTunnel />} />
          <Route path="/boids" element={<BoidSimulation />} />
          <Route path="/piano" element={<SpacePiano />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
