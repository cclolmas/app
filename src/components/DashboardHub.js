import React from 'react';
import { Link } from 'react-router-dom';
import './DashboardHub.css'; // Import CSS for styling

function DashboardHub() {
  return (
    <div className="dashboard-hub">
      <h1>Painel de Carga Cognitiva e Computacional</h1>
      <div className="button-container">
        {/* Botão 1: Insights de Carga Cognitiva */}
        <Link to="/carga-cognitiva" className="hub-button">
          Insights de Carga Cognitiva
        </Link>
        {/* Botão 2: Métricas de Carga Computacional */}
        <Link to="/carga-computacional" className="hub-button">
          Métricas de Carga Computacional
        </Link>
        {/* Botão 3: Trade-offs CC vs. CompC */}
        <Link to="/tradeoffs-cc-compc" className="hub-button">
          Trade-offs CC vs. CompC
        </Link>
        {/* Botão 4: Dinâmica de Ajuste Fino Q4/Q8 */}
        <Link to="/dinamica-q4-q8" className="hub-button">
          Dinâmica de Ajuste Fino Q4/Q8
        </Link>
      </div>
    </div>
  );
}

export default DashboardHub;
