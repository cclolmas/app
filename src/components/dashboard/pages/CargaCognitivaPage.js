import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faArrowLeft, faHome } from '@fortawesome/free-solid-svg-icons';
import CognitiveLoadView from '../views/CognitiveLoadView';
import './DashboardPages.css';

const CargaCognitivaPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Volta para a página anterior no histórico
  };
  
  const handleGoHome = () => {
    navigate('/'); // Navega para a página principal
  };

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div className="navigation-buttons">
          <button onClick={handleGoBack} className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} /> Voltar
          </button>
          
          <button onClick={handleGoHome} className="home-button">
            <FontAwesomeIcon icon={faHome} /> Página Principal
          </button>
        </div>
        
        <div className="page-title-container">
          <FontAwesomeIcon icon={faBrain} className="page-icon" style={{ color: '#9c27b0' }} />
          <h1>Insights de Carga Cognitiva</h1>
        </div>
      </header>

      <main className="page-content">
        <section className="intro-section">
          <h2>Análise de Carga Cognitiva</h2>
          <p>
            Bem-vindo à ferramenta de análise de carga cognitiva. Esta seção permite monitorar
            e analisar a carga cognitiva em diferentes contextos de debate.
          </p>
        </section>

        <section className="data-section">
          <h2 className="dashboard-section-title">Painel de Análise de Carga Cognitiva</h2>
          <div className="dashboard-divider"></div>
          <CognitiveLoadView />
        </section>
      </main>
    </div>
  );
};

export default CargaCognitivaPage;
