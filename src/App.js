import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DashboardHub from './components/DashboardHub';
import CognitiveLoadView from './components/CognitiveLoadView';
// Import other view components when created
// import ComputationalLoadView from './components/ComputationalLoadView';
// import ClComplTradeoffsView from './components/ClComplTradeoffsView';
// import Q4Q8DynamicsView from './components/Q4Q8DynamicsView';
import './styles/chartReset.css'; // Import chart reset CSS

// Placeholder components for routes not yet implemented
const PlaceholderView = ({ title }) => (
  <div style={{ padding: '20px' }}>
    <h2>{title}</h2>
    <p>Componente em construção.</p>
    <Link to="/">Voltar ao Painel</Link>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota Principal - Hub */}
        <Route path="/" element={<DashboardHub />} />

        {/* Rota Carga Cognitiva */}
        <Route path="/carga-cognitiva" element={<CognitiveLoadView />} />

        {/* Rota Carga Computacional (Placeholder) */}
        <Route
          path="/carga-computacional"
          element={<PlaceholderView title="Métricas de Carga Computacional" />}
          // Replace with actual component when ready:
          // element={<ComputationalLoadView />}
        />

        {/* Rota Trade-offs (Placeholder) */}
        <Route
          path="/tradeoffs-cc-compc"
          element={<PlaceholderView title="Trade-offs CC vs. CompC" />}
          // Replace with actual component when ready:
          // element={<ClComplTradeoffsView />}
        />

        {/* Rota Dinâmica Q4/Q8 (Placeholder) */}
        <Route
          path="/dinamica-q4-q8"
          element={<PlaceholderView title="Dinâmica de Ajuste Fino Q4/Q8" />}
          // Replace with actual component when ready:
          // element={<Q4Q8DynamicsView />}
        />

        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;