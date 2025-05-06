import { useState, useEffect } from 'react';
import { calculateEffectivenessScore } from '../utils/taskEvaluator';

/**
 * Custom hook for managing task evaluation data and processes
 * @param {String} taskId - The ID of the task to evaluate
 * @param {String} taskType - The type of task ('problemSolving' or 'projectDevelopment')
 * @returns {Object} - Methods and state for handling evaluations
 */
const useTaskEvaluation = (taskId, taskType = 'problemSolving') => {
  const [evaluations, setEvaluations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [effectivenessScore, setEffectivenessScore] = useState(0);
  
  // Fetch existing evaluations for this task
  useEffect(() => {
    const fetchEvaluations = async () => {
      setIsLoading(true);
      try {
        // Replace with actual API call
        const response = await fetch(`/api/tasks/${taskId}/evaluations`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch evaluations');
        }
        
        const data = await response.json();
        setEvaluations(data);
        
        // Calculate overall effectiveness if we have evaluations
        if (data.length > 0) {
          // Aggregate ratings across all evaluations
          const aggregatedRatings = {};
          
          data.forEach(evaluation => {
            Object.entries(evaluation.ratings || {}).forEach(([criterion, rating]) => {
              if (!aggregatedRatings[criterion]) {
                aggregatedRatings[criterion] = [];
              }
              aggregatedRatings[criterion].push(rating);
            });
          });
          
          // Average the ratings
          const averagedRatings = {};
          Object.entries(aggregatedRatings).forEach(([criterion, ratings]) => {
            averagedRatings[criterion] = ratings.reduce((sum, val) => sum + val, 0) / ratings.length;
          });
          
          const score = calculateEffectivenessScore(averagedRatings, taskType);
          setEffectivenessScore(score);
        }
      } catch (err) {
        console.error('Error fetching evaluations:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (taskId) {
      fetchEvaluations();
    }
  }, [taskId, taskType]);
  
  // Submit a new evaluation
  const submitEvaluation = async (evaluationData) => {
    try {
      // Replace with actual API call
      const response = await fetch(`/api/tasks/${taskId}/evaluations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(evaluationData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit evaluation');
      }
      
      const newEvaluation = await response.json();
      
      // Update local state with the new evaluation
      setEvaluations(prev => [...prev, newEvaluation]);
      
      return newEvaluation;
    } catch (err) {
      console.error('Error submitting evaluation:', err);
      setError(err.message);
      throw err;
    }
  };
  
  // Get evaluation summary
  const getEvaluationSummary = () => {
    if (evaluations.length === 0) {
      return {
        totalEvaluations: 0,
        averageScore: 0,
        effectivenessScore: 0,
        completionRate: 0,
        averageTimeSpent: 0
      };
    }
    
    const completedCount = evaluations.filter(e => e.completedTask).length;
    const averageScore = evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length;
    const averageTimeSpent = evaluations.reduce((sum, e) => sum + (e.timeSpent || 0), 0) / evaluations.length;
    
    return {
      totalEvaluations: evaluations.length,
      averageScore,
      effectivenessScore,
      completionRate: (completedCount / evaluations.length) * 100,
      averageTimeSpent
    };
  };
  
  return {
    evaluations,
    isLoading,
    error,
    submitEvaluation,
    getEvaluationSummary,
    effectivenessScore
  };
};

export default useTaskEvaluation;
