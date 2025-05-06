/**
 * Utility for evaluating task effectiveness in problem solving and project development
 */

// Criteria weightings for evaluation
const EVALUATION_CRITERIA = {
  problemSolving: {
    clearObjectives: 0.2,
    progressiveComplexity: 0.15,
    multipleApproaches: 0.15,
    criticalThinking: 0.25,
    feedbackLoops: 0.15,
    realWorldRelevance: 0.1
  },
  projectDevelopment: {
    clearMilestones: 0.2,
    resourceAllocation: 0.15,
    collaborationOpportunities: 0.2,
    iterativeProcess: 0.15,
    deliverableQuality: 0.2,
    timeManagement: 0.1
  }
};

/**
 * Calculates an effectiveness score for a task based on user evaluations
 * @param {Object} ratings - User ratings for different criteria
 * @param {String} evaluationType - Type of evaluation ('problemSolving' or 'projectDevelopment')
 * @returns {Number} - Effectiveness score (0-100)
 */
export const calculateEffectivenessScore = (ratings, evaluationType) => {
  if (!EVALUATION_CRITERIA[evaluationType]) {
    throw new Error(`Invalid evaluation type: ${evaluationType}`);
  }
  
  const criteria = EVALUATION_CRITERIA[evaluationType];
  let totalScore = 0;
  
  Object.keys(criteria).forEach(criterion => {
    if (ratings[criterion] !== undefined) {
      totalScore += ratings[criterion] * criteria[criterion];
    }
  });
  
  // Convert to 0-100 scale
  return Math.round(totalScore * 20);
};

/**
 * Analyzes feedback from multiple users to identify patterns
 * @param {Array} feedbackArray - Array of user feedback objects
 * @returns {Object} - Analysis of feedback patterns
 */
export const analyzeFeedbackPatterns = (feedbackArray) => {
  if (!feedbackArray || !feedbackArray.length) {
    return {
      strengths: [],
      weaknesses: [],
      averageScore: 0,
      sampleSize: 0
    };
  }

  const aggregatedScores = {};
  const totalUsers = feedbackArray.length;
  let totalOverallScore = 0;
  
  // Aggregate all scores
  feedbackArray.forEach(feedback => {
    totalOverallScore += feedback.overallScore || 0;
    
    Object.keys(feedback.ratings || {}).forEach(criterion => {
      if (!aggregatedScores[criterion]) {
        aggregatedScores[criterion] = 0;
      }
      aggregatedScores[criterion] += feedback.ratings[criterion];
    });
  });
  
  // Calculate averages
  const averageScores = {};
  Object.keys(aggregatedScores).forEach(criterion => {
    averageScores[criterion] = aggregatedScores[criterion] / totalUsers;
  });
  
  // Identify strengths and weaknesses
  const strengths = Object.entries(averageScores)
    .filter(([_, score]) => score >= 4)
    .map(([criterion, _]) => criterion);
    
  const weaknesses = Object.entries(averageScores)
    .filter(([_, score]) => score <= 2.5)
    .map(([criterion, _]) => criterion);
  
  return {
    strengths,
    weaknesses,
    averageScore: totalOverallScore / totalUsers,
    sampleSize: totalUsers,
    criteriaScores: averageScores
  };
};

/**
 * Generates recommendations for task improvement based on feedback analysis
 * @param {Object} analysisResults - Results from analyzeFeedbackPatterns
 * @param {String} taskType - Type of task ('problemSolving' or 'projectDevelopment')
 * @returns {Array} - Array of improvement recommendations
 */
export const generateRecommendations = (analysisResults, taskType) => {
  const recommendations = [];
  
  if (!analysisResults || !analysisResults.weaknesses) {
    return recommendations;
  }
  
  // Map criteria to improvement recommendations
  const improvementStrategies = {
    clearObjectives: "Refine task objectives to make them more concrete and measurable",
    progressiveComplexity: "Structure the task with progressive difficulty levels to build momentum",
    multipleApproaches: "Redesign task to allow for multiple valid solution approaches",
    criticalThinking: "Add components that require analyzing and evaluating information",
    feedbackLoops: "Incorporate checkpoints for reflection and adjustment",
    realWorldRelevance: "Connect tasks more explicitly to real-world scenarios",
    
    clearMilestones: "Define concrete milestones with specific deliverables",
    resourceAllocation: "Provide clearer guidance on available resources and constraints",
    collaborationOpportunities: "Create more structured collaboration points",
    iterativeProcess: "Design task flow to encourage iterations and improvements",
    deliverableQuality: "Define quality standards for project deliverables",
    timeManagement: "Add time estimation guidance and management checkpoints"
  };
  
  analysisResults.weaknesses.forEach(weakness => {
    if (improvementStrategies[weakness]) {
      recommendations.push(improvementStrategies[weakness]);
    }
  });
  
  // Add general recommendations based on the evaluation type
  if (analysisResults.averageScore < 70) {
    if (taskType === 'problemSolving') {
      recommendations.push("Consider restructuring the task to more clearly highlight the problem to be solved");
    } else if (taskType === 'projectDevelopment') {
      recommendations.push("Provide a clearer project framework with defined phases and outcomes");
    }
  }
  
  return recommendations;
};
