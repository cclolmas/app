import React, { useState } from 'react';
import '../styles/taskEvaluation.css';

const RATING_LABELS = {
  1: 'Muito insatisfatório',
  2: 'Insatisfatório',
  3: 'Adequado',
  4: 'Bom',
  5: 'Excelente'
};

const criteriaDescriptions = {
  // Problem Solving criteria
  clearObjectives: "Os objetivos da tarefa são claros e compreensíveis?",
  progressiveComplexity: "A tarefa apresenta complexidade progressiva adequada?",
  multipleApproaches: "A tarefa permite múltiplas abordagens para solução?",
  criticalThinking: "A tarefa estimula pensamento crítico e análise?",
  feedbackLoops: "Existem oportunidades de feedback durante o processo?",
  realWorldRelevance: "A tarefa tem relevância para cenários reais?",
  
  // Project Development criteria
  clearMilestones: "Os marcos do projeto são claros e bem definidos?",
  resourceAllocation: "A alocação de recursos é explicada adequadamente?",
  collaborationOpportunities: "Existem oportunidades adequadas para colaboração?",
  iterativeProcess: "O processo de desenvolvimento é iterativo?",
  deliverableQuality: "Os entregáveis têm padrões de qualidade claros?",
  timeManagement: "Existem orientações para gerenciamento de tempo?"
};

const TaskEvaluationForm = ({ taskId, taskType, onSubmit, isCompleted = false }) => {
  const [ratings, setRatings] = useState({});
  const [qualitativeFeedback, setQualitativeFeedback] = useState('');
  const [overallScore, setOverallScore] = useState(3);
  const [timeSpent, setTimeSpent] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  // Determine which criteria to show based on task type
  const criteriaToShow = taskType === 'problemSolving' 
    ? ['clearObjectives', 'progressiveComplexity', 'multipleApproaches', 'criticalThinking', 'feedbackLoops', 'realWorldRelevance']
    : ['clearMilestones', 'resourceAllocation', 'collaborationOpportunities', 'iterativeProcess', 'deliverableQuality', 'timeManagement'];

  const handleRatingChange = (criterion, value) => {
    setRatings(prev => ({
      ...prev,
      [criterion]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const evaluationData = {
      taskId,
      taskType,
      ratings,
      qualitativeFeedback,
      overallScore,
      timeSpent: parseInt(timeSpent, 10) || 0,
      completedTask: isCompleted,
      submittedAt: new Date()
    };
    
    onSubmit(evaluationData);
    setSubmitted(true);
  };
  
  if (submitted) {
    return (
      <div className="evaluation-submitted">
        <h3>Avaliação Enviada</h3>
        <p>Obrigado pelo seu feedback! Ele nos ajudará a melhorar as tarefas.</p>
      </div>
    );
  }

  return (
    <form className="task-evaluation-form" onSubmit={handleSubmit}>
      <h3>Avaliação de Tarefa</h3>
      <p className="evaluation-intro">
        Ajude-nos a melhorar nossas tarefas avaliando a eficácia 
        {taskType === 'problemSolving' ? ' para resolução de problemas' : ' para desenvolvimento de projetos'}.
      </p>
      
      <div className="criteria-section">
        <h4>Critérios de Avaliação</h4>
        {criteriaToShow.map(criterion => (
          <div key={criterion} className="criteria-item">
            <label>{criteriaDescriptions[criterion]}</label>
            <div className="rating-controls">
              {[1, 2, 3, 4, 5].map(value => (
                <div key={value} className="rating-option">
                  <input
                    type="radio"
                    id={`${criterion}-${value}`}
                    name={criterion}
                    value={value}
                    checked={ratings[criterion] === value}
                    onChange={() => handleRatingChange(criterion, value)}
                  />
                  <label htmlFor={`${criterion}-${value}`} title={RATING_LABELS[value]}>
                    {value}
                  </label>
                </div>
              ))}
            </div>
            {ratings[criterion] && (
              <div className="rating-label">{RATING_LABELS[ratings[criterion]]}</div>
            )}
          </div>
        ))}
      </div>
      
      <div className="overall-rating">
        <h4>Avaliação Geral</h4>
        <div className="slider-container">
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={overallScore}
            onChange={(e) => setOverallScore(parseFloat(e.target.value))}
          />
          <div className="slider-value">{overallScore.toFixed(1)}</div>
        </div>
        <div className="slider-labels">
          <span>Insatisfatório</span>
          <span>Excelente</span>
        </div>
      </div>
      
      <div className="time-spent">
        <label htmlFor="timeSpent">Tempo aproximado gasto na tarefa (em minutos):</label>
        <input
          type="number"
          id="timeSpent"
          value={timeSpent}
          onChange={(e) => setTimeSpent(e.target.value)}
          min="1"
        />
      </div>
      
      <div className="qualitative-feedback">
        <label htmlFor="feedback">Comentários adicionais (opcional):</label>
        <textarea
          id="feedback"
          rows="4"
          value={qualitativeFeedback}
          onChange={(e) => setQualitativeFeedback(e.target.value)}
          placeholder="Compartilhe sua experiência, sugestões ou dificuldades enfrentadas..."
        ></textarea>
      </div>
      
      <div className="form-actions">
        <button type="submit" className="submit-evaluation">Enviar Avaliação</button>
      </div>
    </form>
  );
};

export default TaskEvaluationForm;
