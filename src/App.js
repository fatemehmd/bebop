import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import SpaceTunnel from './components/SpaceTunnel';
import BoidSimulation from './components/BoidSimulation';
import SpacePiano from './components/SpacePiano';

function App() {
  return (
    <Router>
      <div className="App">
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
