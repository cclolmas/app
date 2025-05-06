import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import CognitiveLoadDashboard from './components/CognitiveLoadDashboard';
import ResourceVisualizationDashboard from './components/ResourceVisualizationDashboard';
import CognitiveComputationalDashboard from './components/CognitiveComputationalDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="app-navigation">
          <Link to="/">Cognitive Load</Link>
          <Link to="/resources">Computational Resources</Link>
          <Link to="/cl-comp-relation">CL-CompL Relation</Link>
        </nav>
        
        <div className="app-content">
          <Routes>
            <Route path="/" element={<CognitiveLoadDashboard />} />
            <Route path="/resources" element={<ResourceVisualizationDashboard />} />
            <Route path="/cl-comp-relation" element={<CognitiveComputationalDashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;