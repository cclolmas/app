import React, { useEffect, useState } from 'react';
import MetricsValidationService from '../services/MetricsValidationService';

const CLMetricsDisplay = ({ metricData, metricType }) => {
  const [validatedData, setValidatedData] = useState(null);
  const [calculatedMetrics, setCalculatedMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      let validated;
      
      if (metricType === 'subjective') {
        validated = MetricsValidationService.validateSubjectiveScaleInput(metricData);
      } else if (metricType === 'progress') {
        validated = MetricsValidationService.validateProgressIndicators(metricData);
      } else {
        throw new Error(`Tipo de métrica não suportado: ${metricType}`);
      }
      
      setValidatedData(validated);
      setCalculatedMetrics(MetricsValidationService.calculateMetrics(validated));
      setError(null);
    } catch (err) {
      console.error('Erro na validação de métricas:', err);
      setError(err.message);
    }
  }, [metricData, metricType]);

  if (error) {
    return <div className="metrics-error">Erro: {error}</div>;
  }

  if (!validatedData || !calculatedMetrics) {
    return <div className="metrics-loading">Carregando métricas...</div>;
  }

  return (
    <div className="cl-metrics-container">
      <h3>Métricas de Aprendizado Contínuo</h3>
      
      <div className="metrics-summary">
        <div className="metric-card">
          <span className="metric-label">Média</span>
          <span className="metric-value">{calculatedMetrics.average.toFixed(2)}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Mediana</span>
          <span className="metric-value">{calculatedMetrics.median.toFixed(2)}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Tendência</span>
          <span className={`metric-trend ${calculatedMetrics.trend}`}>
            {calculatedMetrics.trend === 'positive' ? '↑' : 
             calculatedMetrics.trend === 'negative' ? '↓' : '→'}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Confiança</span>
          <div className="confidence-bar">
            <div 
              className="confidence-level" 
              style={{ width: `${(calculatedMetrics.confidence * 100).toFixed(0)}%` }}
            />
          </div>
        </div>
      </div>
      
      {metricType === 'subjective' && (
        <div className="subjective-metrics">
          <h4>Escalas Subjetivas</h4>
          <ul className="metrics-list">
            {Object.entries(validatedData).map(([key, value]) => (
              <li key={key}>
                <span className="metric-name">{key}</span>
                <div className="metric-scale">
                  {[1, 2, 3, 4, 5].map(level => (
                    <span 
                      key={level} 
                      className={`scale-point ${level <= value ? 'active' : ''}`}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {metricType === 'progress' && (
        <div className="progress-metrics">
          <h4>Indicadores de Progresso</h4>
          <div className="progress-chart">
            {validatedData.map((point, index) => (
              <div 
                key={index}
                className="progress-point"
                style={{ 
                  left: `${(index / (validatedData.length - 1)) * 100}%`,
                  bottom: `${(point.value / 5) * 100}%`
                }}
                title={`${point.label}: ${point.value}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CLMetricsDisplay;
