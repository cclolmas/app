import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBalanceScale, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './DashboardPages.css';

const TradeoffsPage = () => {
  return (
    <div className="dashboard-page">
      <header className="page-header">
        <Link to="/dashboard" className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Voltar ao Painel
        </Link>
        <div className="page-title-container">
          <FontAwesomeIcon icon={faBalanceScale} className="page-icon" style={{ color: '#ff9800' }} />
          <h1>Trade-offs CC vs. CompC</h1>
        </div>
      </header>

      <main className="page-content">
        <section className="intro-section">
          <h2>Análise de Trade-offs</h2>
          <p>
            Esta ferramenta permite analisar e visualizar os trade-offs entre 
            Carga Cognitiva (CC) e Carga Computacional (CompC) em diferentes 
            contextos e configurações de debate.
          </p>
        </section>

        <section className="metrics-section">
          <h2>Comparação de Métricas</h2>
          <div className="metrics-container">
            <div className="placeholder-content">
              <p>Conteúdo da página de Trade-offs em desenvolvimento.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TradeoffsPage;
