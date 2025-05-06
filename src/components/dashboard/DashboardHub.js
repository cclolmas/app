import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faComments, 
  faLightbulb, 
  faSearch, 
  faUserCircle,
  faBrain,
  faMicrochip,
  faBalanceScale,  // Ícone para trade-offs
  faSlidersH  // Ícone para ajuste fino/dinâmica
} from '@fortawesome/free-solid-svg-icons';
import './DashboardHub.css';

const DashboardHub = () => {
  const navigate = useNavigate();
  const [hoveredButton, setHoveredButton] = useState(null);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const dashboardOptions = [
    {
      id: 'cognitive-load',
      icon: faBrain,
      title: 'Insights de Carga Cognitiva',
      description: 'Análise e monitoramento de cargas cognitivas em debates',
      path: '/carga-cognitiva',  // Atualizado para a nova rota
      color: '#9c27b0' // Cor roxa para representar atividade cerebral/cognitiva
    },
    {
      id: 'computational-load',
      icon: faMicrochip,
      title: 'Métricas de Carga Computacional',
      description: 'Monitoramento de desempenho e recursos computacionais',
      path: '/carga-computacional',  // Atualizado para a nova rota
      color: '#2196f3' // Cor azul para representar tecnologia/computação
    },
    {
      id: 'tradeoffs',
      icon: faBalanceScale,
      title: 'Trade-offs CC vs. CompC',
      description: 'Análise comparativa entre carga cognitiva e computacional',
      path: '/tradeoffs-cc-compc',  // Atualizado para a nova rota
      color: '#ff9800' // Cor laranja para representar equilíbrio/comparação
    },
    {
      id: 'fine-tuning',
      icon: faSlidersH,
      title: 'Dinâmica de Ajuste Fino Q4/Q8',
      description: 'Configure e otimize parâmetros de quantização para melhor desempenho',
      path: '/dinamica-q4-q8',  // Atualizado para a nova rota
      color: '#4caf50' // Cor verde para representar otimização/ajuste
    },
    {
      id: 'debates',
      icon: faComments,
      title: 'Debates',
      description: 'Gerencie seus debates em andamento e futuros',
      path: '/debates',
      color: '#3498db'
    },
    {
      id: 'arguments',
      icon: faLightbulb,
      title: 'Argumentos',
      description: 'Organize e desenvolva seus argumentos de debate',
      path: '/arguments',
      color: '#2ecc71'
    },
    {
      id: 'research',
      icon: faSearch,
      title: 'Pesquisa',
      description: 'Acesse ferramentas e recursos de pesquisa',
      path: '/research',
      color: '#e74c3c'
    },
    {
      id: 'profile',
      icon: faUserCircle,
      title: 'Perfil',
      description: 'Gerencie suas configurações e estatísticas de conta',
      path: '/profile',
      color: '#9b59b6'
    }
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Painel de Carga Cognitiva e Computacional</h1>
        <p className="platform-name">Plataforma CrossDebate</p>
        <p className="welcome-text">Bem-vindo ao seu painel de gerenciamento de debates</p>
      </header>
      
      <main className="dashboard-hub">
        <div className="navigation-buttons-container">
          {dashboardOptions.map((option) => (
            <div 
              key={option.id}
              className={`hub-option ${hoveredButton === option.id ? 'hovered' : ''}`}
              onClick={() => handleNavigate(option.path)}
              onMouseEnter={() => setHoveredButton(option.id)}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <div className="icon-container" style={{ color: option.color }}>
                <FontAwesomeIcon icon={option.icon} className="option-icon" />
              </div>
              <h2>{option.title}</h2>
              <p>{option.description}</p>
            </div>
          ))}
        </div>
      </main>
      
      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} CrossDebate Platform</p>
      </footer>
    </div>
  );
};

export default DashboardHub;
