import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './DashboardPages.css';

const CargaComputacionalPage = () => {
  return (
    <div className="dashboard-page">
      <header className="page-header">
        <Link to="/dashboard" className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Voltar ao Painel
        </Link>
        <div className="page-title-container">
          <FontAwesomeIcon icon={faMicrochip} className="page-icon" style={{ color: '#2196f3' }} />
          <h1>Métricas de Carga Computacional</h1>
        </div>
      </header>

      <main className="page-content">
        <section className="intro-section">
          <h2>Análise de Carga Computacional</h2>
          <p>
            Bem-vindo à ferramenta de análise de carga computacional. Esta seção permite monitorar
            e analisar o desempenho e recursos computacionais utilizados durante os debates.
          </p>
        </section>

        <section className="metrics-section">
          <h2>Métricas de Desempenho</h2>
          <div className="metrics-container">
            {/* Conteúdo da página será implementado posteriormente */}
            <div className="placeholder-content">
              <p>Conteúdo da página de Carga Computacional em desenvolvimento.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CargaComputacionalPage;
