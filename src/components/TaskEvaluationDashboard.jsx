import React, { useState, useEffect } from 'react';
import { 
  analyzeFeedbackPatterns, 
  generateRecommendations 
} from '../utils/taskEvaluator';
import '../styles/evaluationDashboard.css';

const TaskEvaluationDashboard = ({ taskId, taskData, feedbackData }) => {
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');
  
  useEffect(() => {
    if (feedbackData && feedbackData.length > 0) {
      const analysisResults = analyzeFeedbackPatterns(feedbackData);
      setAnalysis(analysisResults);
      
      const taskType = taskData?.type || 'problemSolving';
      const taskRecommendations = generateRecommendations(analysisResults, taskType);
      setRecommendations(taskRecommendations);
    }
  }, [feedbackData, taskData]);

  const renderCriterionScore = (criterion, score) => {
    // Map criterion technical name to user-friendly display name
    const criterionDisplayNames = {
      clearObjectives: "Clareza dos objetivos",
      progressiveComplexity: "Complexidade progressiva",
      multipleApproaches: "Múltiplas abordagens",
      criticalThinking: "Pensamento crítico",
      feedbackLoops: "Ciclos de feedback",
      realWorldRelevance: "Relevância real",
      clearMilestones: "Marcos claros",
      resourceAllocation: "Alocação de recursos",
      collaborationOpportunities: "Oportunidades de colaboração",
      iterativeProcess: "Processo iterativo",
      deliverableQuality: "Qualidade dos entregáveis",
      timeManagement: "Gestão de tempo"
    };
    
    const displayName = criterionDisplayNames[criterion] || criterion;
    
    // Calculate color based on score (1-5)
    let barColor;
    if (score >= 4) barColor = '#28a745'; // Good - green
    else if (score >= 3) barColor = '#ffc107'; // Average - yellow
    else barColor = '#dc3545'; // Poor - red
    
    return (
      <div key={criterion} className="criterion-score">
        <div className="criterion-name">{displayName}</div>
        <div className="score-bar-container">
          <div 
            className="score-bar" 
            style={{ 
              width: `${(score / 5) * 100}%`,
              backgroundColor: barColor 
            }}
          ></div>
          <span className="score-value">{score.toFixed(1)}</span>
        </div>
      </div>
    );
  };

  if (!analysis) {
    return <div className="loading-analysis">Carregando análise de avaliações...</div>;
  }

  return (
    <div className="evaluation-dashboard">
      <div className="dashboard-header">
        <h3>Dashboard de Avaliação da Tarefa</h3>
        <div className="task-meta">
          <span>ID: {taskId}</span>
          <span>Tipo: {taskData?.type === 'problemSolving' ? 'Resolução de Problemas' : 'Desenvolvimento de Projeto'}</span>
          <span>Avaliações: {analysis.sampleSize}</span>
        </div>
      </div>
      
      <div className="tab-navigation">
        <button 
          className={activeTab === 'summary' ? 'active' : ''} 
          onClick={() => setActiveTab('summary')}
        >
          Resumo
        </button>
        <button 
          className={activeTab === 'criteria' ? 'active' : ''} 
          onClick={() => setActiveTab('criteria')}
        >
          Critérios Detalhados
        </button>
        <button 
          className={activeTab === 'feedback' ? 'active' : ''} 
          onClick={() => setActiveTab('feedback')}
        >
          Feedback Qualitativo
        </button>
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'summary' && (
          <div className="summary-tab">
            <div className="overall-score-card">
              <div className="score-circle" style={{ 
                background: `conic-gradient(
                  #28a745 0% ${analysis.averageScore}%, 
                  #e9ecef ${analysis.averageScore}% 100%
                )` 
              }}>
                <span>{analysis.averageScore.toFixed(1)}</span>
              </div>
              <div className="score-label">Pontuação Geral</div>
            </div>
            
            <div className="summary-cards">
              <div className="summary-card strengths">
                <h4>Pontos Fortes</h4>
                {analysis.strengths.length > 0 ? (
                  <ul>
                    {analysis.strengths.map(strength => {
                      const criterionDisplayNames = {
                        clearObjectives: "Clareza dos objetivos",
                        progressiveComplexity: "Complexidade progressiva",
                        multipleApproaches: "Múltiplas abordagens",
                        criticalThinking: "Pensamento crítico",
                        feedbackLoops: "Ciclos de feedback",
                        realWorldRelevance: "Relevância real",
                        clearMilestones: "Marcos claros",
                        resourceAllocation: "Alocação de recursos",
                        collaborationOpportunities: "Oportunidades de colaboração",
                        iterativeProcess: "Processo iterativo",
                        deliverableQuality: "Qualidade dos entregáveis",
                        timeManagement: "Gestão de tempo"
                      };
                      return <li key={strength}>{criterionDisplayNames[strength] || strength}</li>;
                    })}
                  </ul>
                ) : (
                  <p className="no-data">Nenhum ponto forte identificado ainda.</p>
                )}
              </div>
              
              <div className="summary-card recommendations">
                <h4>Recomendações</h4>
                {recommendations.length > 0 ? (
                  <ul>
                    {recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data">Nenhuma recomendação disponível ainda.</p>
                )}
              </div>
            </div>
            
            <div className="avg-time-spent">
              <h4>Tempo Médio Gasto</h4>
              <div className="time-display">
                {Math.round(feedbackData.reduce((acc, item) => acc + (item.timeSpent || 0), 0) / feedbackData.length)} minutos
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'criteria' && (
          <div className="criteria-tab">
            <h4>Pontuações por Critério</h4>
            <div className="criteria-scores">
              {analysis.criteriaScores && Object.entries(analysis.criteriaScores).map(
                ([criterion, score]) => renderCriterionScore(criterion, score)
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'feedback' && (
          <div className="feedback-tab">
            <h4>Comentários dos Usuários</h4>
            <div className="feedback-list">
              {feedbackData.filter(item => item.qualitativeFeedback).length > 0 ? (
                feedbackData
                  .filter(item => item.qualitativeFeedback)
                  .map((item, index) => (
                    <div key={index} className="feedback-item">
                      <div className="feedback-meta">
                        <span>Avaliação: {item.overallScore}</span>
                        <span>Data: {new Date(item.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="feedback-text">{item.qualitativeFeedback}</p>
                    </div>
                  ))
              ) : (
                <p className="no-data">Nenhum comentário qualitativo recebido ainda.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskEvaluationDashboard;
