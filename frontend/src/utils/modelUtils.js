/**
 * Utilitários para cálculos relacionados a modelos de linguagem
 */

/**
 * Estima o uso de VRAM para um modelo com base no tamanho, quantização e contexto
 * 
 * @param {number} modelSizeBillions - Tamanho do modelo em bilhões de parâmetros
 * @param {string} quantization - Tipo de quantização (q4, q8, etc)
 * @param {number} contextLength - Tamanho do contexto em tokens
 * @returns {number} - Estimativa de uso de VRAM em bytes
 */
export const estimateVramUsage = (modelSizeBillions, quantization, contextLength = 4096) => {
  // Cada parâmetro usa X bytes dependendo da quantização
  const bytesPerParameter = {
    'q4': 2.5, // ~2.5 bytes por parâmetro em média
    'q8': 4.5, // ~4.5 bytes por parâmetro
    // Outros tipos de quantização podem ser adicionados aqui
  };
  
  // Valores padrão caso a quantização não seja reconhecida
  const bytesPerParam = bytesPerParameter[quantization] || 5;
  
  // Cálculo básico de VRAM para o modelo
  const modelParams = modelSizeBillions * 1_000_000_000;
  const baseVramUsage = modelParams * bytesPerParam;
  
  // Overhead para o contexto (KV cache, processamento, etc)
  // Esta é uma estimativa aproximada que depende muito da implementação
  const contextOverhead = contextLength * modelSizeBillions * 12;
  
  // Overhead do sistema (buffers, etc)
  const systemOverhead = 200 * 1024 * 1024; // ~200MB fixo de overhead
  
  return baseVramUsage + contextOverhead + systemOverhead;
};

/**
 * Estima a latência de resposta para uma inferência
 * 
 * @param {number} modelSizeBillions - Tamanho do modelo em bilhões de parâmetros
 * @param {string} quantization - Tipo de quantização
 * @param {number} tokensRequested - Tokens a serem gerados
 * @param {string} gpuType - Tipo de GPU (opcional)
 * @returns {number} - Tempo estimado em segundos
 */
export const estimateResponseLatency = (modelSizeBillions, quantization, tokensRequested, gpuType = 'integrated') => {
  // Valores base para tokens por segundo em diferentes configurações
  const baseTokensPerSecond = {
    'integrated': {
      'q4': 7,
      'q8': 4,
    },
    'rtx3060': {
      'q4': 20,
      'q8': 12,
    },
    'rtx4090': {
      'q4': 50,
      'q8': 30,
    }
  };
  
  // Pegar o valor base ou usar um fallback conservador
  const tokensPerSecond = 
    (baseTokensPerSecond[gpuType]?.[quantization]) || 
    (baseTokensPerSecond['integrated']?.[quantization]) || 
    3;
  
  // Ajuste com base no tamanho do modelo
  const sizeAdjustment = 7 / modelSizeBillions;
  const adjustedTokensPerSecond = tokensPerSecond * Math.min(sizeAdjustment, 1.5);
  
  // Cálculo final
  return tokensRequested / Math.max(1, adjustedTokensPerSecond);
};

/**
 * Determina se um modelo é adequado para determinado hardware
 * 
 * @param {Object} modelConfig - Configuração do modelo
 * @param {Object} systemMetrics - Métricas do sistema
 * @returns {Object} - Objeto com análise de adequação
 */
export const analyzeModelFitForHardware = (modelConfig, systemMetrics) => {
  const { modelSize, quantization, contextLength } = modelConfig;
  const { vram, ram } = systemMetrics;
  
  const modelVramUsage = estimateVramUsage(modelSize, quantization, contextLength);
  const availableVram = vram.total - vram.used;
  
  // Verificar se o modelo cabe na VRAM
  const fitsInVram = modelVramUsage < availableVram;
  
  // Determinar o quão próximo estamos do limite
  const vramUtilizationPercent = (modelVramUsage / availableVram) * 100;
  
  // Avaliar adequação
  let adequacyLevel = 'ideal';
  if (!fitsInVram) {
    adequacyLevel = 'impossible';
  } else if (vramUtilizationPercent > 90) {
    adequacyLevel = 'risky';
  } else if (vramUtilizationPercent > 75) {
    adequacyLevel = 'tight';
  }
  
  // Recomendar quantização alternativa se necessário
  let recommendedQuantization = quantization;
  if (adequacyLevel === 'impossible' || adequacyLevel === 'risky') {
    if (quantization === 'q8') {
      recommendedQuantization = 'q4';
    }
  }
  
  return {
    fits: fitsInVram,
    adequacyLevel,
    vramUtilizationPercent,
    recommendedQuantization,
    modelVramUsage,
    availableVram
  };
};
