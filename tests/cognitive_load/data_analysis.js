/**
 * Script para análise dos dados de carga cognitiva
 */

class CognitiveLoadAnalyzer {
  constructor(testData) {
    this.testData = testData;
    this.novices = testData.filter(user => user.experienceLevel <= 2);
    this.experts = testData.filter(user => user.experienceLevel >= 4);
    this.results = {
      novices: {},
      experts: {},
      comparison: {}
    };
  }

  // Calcular média do NASA-TLX para cada grupo
  calculateAverageTLX(group, taskType) {
    const relevantData = group.filter(user => user.task === taskType);
    const tlxScores = relevantData.map(user => this._calculateTLXScore(user.nasaTLX));
    
    return {
      mean: tlxScores.reduce((sum, score) => sum + score, 0) / tlxScores.length,
      stdDev: this._calculateStdDev(tlxScores),
      min: Math.min(...tlxScores),
      max: Math.max(...tlxScores)
    };
  }

  // Detectar possíveis casos de reversão de expertise
  detectExpertiseReversal() {
    const tasks = ['simple', 'medium', 'complex'];
    const reversalPoints = [];

    tasks.forEach(task => {
      const noviceScore = this.results.novices[task].mean;
      const expertScore = this.results.experts[task].mean;
      
      // Se especialistas demonstram maior carga cognitiva que novatos,
      // pode ser indício de reversão de expertise
      if (expertScore > noviceScore) {
        reversalPoints.push({
          task,
          noviceScore,
          expertScore,
          difference: expertScore - noviceScore
        });
      }
    });

    return reversalPoints;
  }

  // Analisar todos os dados e gerar relatório completo
  analyzeAll() {
    const tasks = ['simple', 'medium', 'complex'];
    
    tasks.forEach(task => {
      this.results.novices[task] = this.calculateAverageTLX(this.novices, task);
      this.results.experts[task] = this.calculateAverageTLX(this.experts, task);
      
      // Comparação direta entre novatos e especialistas
      this.results.comparison[task] = {
        tlxDifference: this.results.novices[task].mean - this.results.experts[task].mean,
        timeToCompleteDiff: this._calculateTimeComparison(task)
      };
    });
    
    this.results.expertiseReversal = this.detectExpertiseReversal();
    this.results.qualitativeAnalysis = this._analyzeQualitativeFeedback();
    
    return this.results;
  }

  // Calcular pontuação NASA-TLX (média ponderada)
  _calculateTLXScore(tlxData) {
    // Calcula o NASA-TLX raw score (sem pesos)
    const sum = tlxData.mental_demand + 
                tlxData.physical_demand + 
                tlxData.temporal_demand + 
                tlxData.performance + 
                tlxData.effort + 
                tlxData.frustration;
    
    return sum / 6; // Média simples dos 6 fatores
  }

  // Calcular desvio padrão
  _calculateStdDev(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(variance);
  }

  // Calcular diferença média de tempo entre grupos
  _calculateTimeComparison(taskType) {
    const noviceTimes = this.novices
      .filter(user => user.task === taskType)
      .map(user => user.completionTime);
    
    const expertTimes = this.experts
      .filter(user => user.task === taskType)
      .map(user => user.completionTime);
    
    const noviceAvg = noviceTimes.reduce((sum, time) => sum + time, 0) / noviceTimes.length;
    const expertAvg = expertTimes.reduce((sum, time) => sum + time, 0) / expertTimes.length;
    
    return {
      noviceAvg,
      expertAvg,
      difference: noviceAvg - expertAvg
    };
  }

  // Analisar feedback qualitativo para identificar padrões
  _analyzeQualitativeFeedback() {
    // Simplificado para este exemplo
    const noviceFeedback = this.novices.map(user => user.feedback);
    const expertFeedback = this.experts.map(user => user.feedback);
    
    return {
      noviceKeyThemes: "Análise de temas do feedback de novatos seria feita aqui",
      expertKeyThemes: "Análise de temas do feedback de especialistas seria feita aqui"
    };
  }

  // Gerar recomendações com base nos resultados
  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.expertiseReversal.length > 0) {
      recommendations.push({
        issue: "Reversão de expertise detectada",
        tasks: this.results.expertiseReversal.map(r => r.task),
        recommendation: "Considere simplificar a interface para especialistas ou oferecer modo avançado que se alinhe melhor com seus modelos mentais existentes."
      });
    }
    
    // Mais recomendações com base nas análises...
    
    return recommendations;
  }
}

module.exports = CognitiveLoadAnalyzer;
