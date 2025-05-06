class MetricsValidationService {
  /**
   * Valida os dados de entrada para escalas subjetivas
   * @param {Object} inputData - Dados brutos de entrada do usuário
   * @returns {Object} Dados validados e normalizados
   */
  validateSubjectiveScaleInput(inputData) {
    // Verifica se os dados estão no formato esperado
    if (!inputData || typeof inputData !== 'object') {
      throw new Error('Formato de dados inválido para métricas subjetivas');
    }
    
    // Normaliza os valores para a escala definida (ex: 1-5)
    const normalizedData = {};
    for (const key in inputData) {
      const value = Number(inputData[key]);
      if (isNaN(value) || value < 1 || value > 5) {
        throw new Error(`Valor inválido para a métrica "${key}". Deve ser um número entre 1 e 5.`);
      }
      normalizedData[key] = value;
    }
    
    return normalizedData;
  }
  
  /**
   * Valida indicadores de progresso
   * @param {Array} progressData - Dados de progresso ao longo do tempo
   * @returns {Array} Dados validados e consistentes
   */
  validateProgressIndicators(progressData) {
    if (!Array.isArray(progressData)) {
      throw new Error('Formato de dados inválido para indicadores de progresso');
    }
    
    // Validação de consistência temporal
    const validatedData = progressData.map((entry, index) => {
      if (!entry.timestamp || !entry.value) {
        throw new Error(`Dados incompletos no índice ${index}`);
      }
      
      return {
        timestamp: new Date(entry.timestamp),
        value: Number(entry.value),
        label: entry.label || `Ponto ${index + 1}`
      };
    }).sort((a, b) => a.timestamp - b.timestamp);
    
    return validatedData;
  }
  
  /**
   * Calcula métricas agregadas com base nos dados validados
   * @param {Object} validatedData - Dados já validados
   * @returns {Object} Métricas calculadas
   */
  calculateMetrics(validatedData) {
    const result = {
      average: 0,
      median: 0,
      trend: 'neutral',
      confidence: 0
    };
    
    const values = Object.values(validatedData);
    
    // Cálculo da média
    result.average = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Cálculo da mediana
    const sortedValues = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sortedValues.length / 2);
    result.median = sortedValues.length % 2 === 0
      ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
      : sortedValues[mid];
    
    // Análise de tendência
    if (values.length > 1) {
      const firstHalf = values.slice(0, Math.floor(values.length / 2));
      const secondHalf = values.slice(Math.floor(values.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg * 1.05) result.trend = 'positive';
      else if (secondAvg < firstAvg * 0.95) result.trend = 'negative';
    }
    
    // Cálculo de confiança baseado na consistência dos dados
    const variance = values.reduce((sum, val) => sum + Math.pow(val - result.average, 2), 0) / values.length;
    result.confidence = Math.max(0, 1 - (Math.sqrt(variance) / result.average));
    
    return result;
  }
}

export default new MetricsValidationService();
