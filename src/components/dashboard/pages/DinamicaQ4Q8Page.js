import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSlidersH, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './DashboardPages.css';

const DinamicaQ4Q8Page = () => {
  return (
    <div className="dashboard-page">
      <header className="page-header">
        <Link to="/dashboard" className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Voltar ao Painel
        </Link>
        <div className="page-title-container">
          <FontAwesomeIcon icon={faSlidersH} className="page-icon" style={{ color: '#4caf50' }} />
          <h1>Dinâmica de Ajuste Fino Q4/Q8</h1>
        </div>
      </header>

      <main className="page-content">
        <section className="intro-section">
          <h2>Ajuste Fino de Quantização</h2>
          <p>
            Esta ferramenta permite configurar parâmetros de quantização Q4/Q8 para 
            otimizar o equilíbrio entre desempenho computacional e qualidade de 
            processamento em debates.
          </p>
        </section>

        <section className="metrics-section">
          <h2>Configuração de Parâmetros</h2>
          <div className="metrics-container">
            <div className="placeholder-content">
              <p>Interface de configuração de quantização em desenvolvimento.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DinamicaQ4Q8Page;
