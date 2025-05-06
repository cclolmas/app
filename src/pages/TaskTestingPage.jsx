import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskEvaluationForm from '../components/TaskEvaluationForm';
import TaskEvaluationDashboard from '../components/TaskEvaluationDashboard';
import useTaskEvaluation from '../hooks/useTaskEvaluation';
import '../styles/taskTesting.css';

const TaskTestingPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [userMode, setUserMode] = useState('participant'); // 'participant' or 'analyst'
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  
  const { 
    evaluations, 
    isLoading, 
    error, 
    submitEvaluation,
    effectivenessScore
  } = useTaskEvaluation(taskId, task?.type);
  
  useEffect(() => {
    // Fetch task data
    const fetchTask = async () => {
      try {
        // Replace with actual API call
        const response = await fetch(`/api/tasks/${taskId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch task');
        }
        
        const data = await response.json();
        setTask(data);
      } catch (err) {
        console.error('Error fetching task:', err);
      }
    };
    
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);
  
  const handleTaskCompletion = () => {
    setTaskCompleted(true);
    setShowEvaluation(true);
  };
  
  const handleEvaluationSubmit = async (evaluationData) => {
    try {
      await submitEvaluation(evaluationData);
      // Show success message or redirect
      setTimeout(() => {
        navigate('/tasks');
      }, 3000);
    } catch (err) {
      // Handle error
    }
  };
  
  const toggleUserMode = () => {
    setUserMode(prevMode => prevMode === 'participant' ? 'analyst' : 'participant');
  };
  
  if (isLoading && !task) {
    return <div className="loading-container">Carregando tarefa...</div>;
  }
  
  if (error) {
    return <div className="error-container">Erro: {error}</div>;
  }
  
  if (!task) {
    return <div className="error-container">Tarefa não encontrada</div>;
  }

  return (
    <div className="task-testing-page">
      <div className="page-header">
        <h2>{task.title}</h2>
        <div className="mode-toggle">
          <button 
            className={`mode-button ${userMode === 'analyst' ? 'active' : ''}`}
            onClick={toggleUserMode}
          >
            {userMode === 'participant' ? 'Ver análise' : 'Voltar para tarefa'}
          </button>
        </div>
      </div>
      
      {userMode === 'participant' ? (
        <div className="participant-view">
          <div className="task-details">
            <div className="task-description">
              <h3>Descrição da Tarefa</h3>
              <p>{task.description}</p>
            </div>
            
            <div className="task-objectives">
              <h3>Objetivos</h3>
              <ul>
                {task.objectives?.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
            
            {task.resources && (
              <div className="task-resources">
                <h3>Recursos</h3>
                <ul>
                  {task.resources.map((resource, index) => (
                    <li key={index}>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        {resource.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {!taskCompleted ? (
            <div className="task-actions">
              <button className="complete-button" onClick={handleTaskCompletion}>
                Marcar como concluída e avaliar
              </button>
            </div>
          ) : null}
          
          {showEvaluation && (
            <div className="evaluation-section">
              <TaskEvaluationForm 
                taskId={taskId} 
                taskType={task.type || 'problemSolving'} 
                onSubmit={handleEvaluationSubmit}
                isCompleted={taskCompleted}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="analyst-view">
          <div className="effectiveness-banner">
            <div className="effectiveness-label">Eficácia da Tarefa:</div>
            <div className="effectiveness-score">
              <div className={`score-badge ${
                effectivenessScore >= 80 ? 'high' :
                effectivenessScore >= 60 ? 'medium' : 'low'
              }`}>
                {effectivenessScore}%
              </div>
              <div className="score-description">
                {effectivenessScore >= 80 ? 'Alta eficácia' :
                 effectivenessScore >= 60 ? 'Eficácia média' : 'Baixa eficácia'}
              </div>
            </div>
          </div>
          
          <TaskEvaluationDashboard 
            taskId={taskId}
            taskData={task}
            feedbackData={evaluations}
          />
          
          <div className="task-improvement">
            <h3>Melhorar esta tarefa</h3>
            <div className="improvement-buttons">
              <button className="edit-button">
                Editar tarefa
              </button>
              <button className="clone-button">
                Clonar e modificar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTestingPage;
