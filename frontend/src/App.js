import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';

// Import cognitive load components
import CognitiveLoadDashboard from './components/CognitiveLoadVisualizations/CognitiveLoadDashboard';
import AssessmentForm from './components/CognitiveLoadVisualizations/AssessmentForm';

function App() {
  return (
    <Router>
      <Routes>
        {/* Existing routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Home />} />
        
        {/* Cognitive Load routes */}
        <Route path="/cognitive-load" element={
          <ProtectedRoute>
            <CognitiveLoadDashboard />
          </ProtectedRoute>
        } />
        <Route path="/tasks/:taskId/assess" element={
          <ProtectedRoute>
            <AssessmentForm />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;