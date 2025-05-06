/**
 * Utilitário para estimar recursos computacionais necessários para tarefas de IA
 * baseado em parâmetros de modelo, quantização e configuração de tarefa
 */

// Constantes para cálculos de estimativa de VRAM
const BYTES_PER_PARAMETER = {
  'q4': 2.5,  // ~2.5 bytes por parâmetro em média para quantização de 4-bit
  'q5': 3.0,  // ~3.0 bytes por parâmetro para 5-bit
  'q8': 4.5,  // ~4.5 bytes por parâmetro para 8-bit
  'fp16': 6.0, // 6 bytes por parâmetro para fp16
  'fp32': 12.0 // 12 bytes por parâmetro para fp32
};

// Estimativa base de tokens por segundo por GPU
const TOKENS_PER_SECOND = {
  'integrated': {
    'q4': 7,
    'q8': 4,
    'fp16': 2,
  },
  'nvidia_consumer': { // GTX/RTX séries
    'q4': 20,
    'q8': 12,
    'fp16': 8,
  },
  'nvidia_professional': { // Quadro/Tesla/A100
    'q4': 50,
    'q8': 30,
    'fp16': 20,
  }
};

// Fatores de ajuste para estimar sobrecarga de LoRA
const LORA_OVERHEAD_FACTORS = {
  rankMultiplier: 0.1,  // MB por unidade de rank
  alphaMultiplier: 0.01  // MB por unidade de alpha
};

/**
 * Estima VRAM necessária para carregar um modelo específico
 * @param {number} modelSize - Tamanho do modelo em bilhões de parâmetros
 * @param {string} quantization - Tipo de quantização (q4, q8, fp16, fp32)
 * @param {number} contextLength - Tamanho do contexto em tokens
 * @returns {number} - VRAM estimada em bytes
 */
export function estimateModelVramUsage(modelSize, quantization, contextLength = 4096) {
  const bytesPerParam = BYTES_PER_PARAMETER[quantization] || BYTES_PER_PARAMETER.fp16;
  const modelParams = modelSize * 1_000_000_000;
  const baseVramUsage = modelParams * bytesPerParam;
  
  // Adicionar overhead para KV cache
  // Formula simplificada: 2 * num_layers * hidden_size * context_length * bytes_per_value
  // Aproximação: ~12 bytes por token por bilhão de parâmetros
  const kvCacheOverhead = contextLength * modelSize * 12;
  
  // Overhead do sistema (buffers, tensores temporários, etc)
  const systemOverhead = 300 * 1024 * 1024; // ~300MB fixo de overhead
  
  return baseVramUsage + kvCacheOverhead + systemOverhead;
}

/**
 * Estima RAM necessária para o processo completo
 * @param {number} modelSize - Tamanho do modelo em bilhões de parâmetros
 * @param {string} quantization - Tipo de quantização
 * @param {number} batchSize - Tamanho do batch para treinamento
 * @returns {number} - RAM estimada em bytes
 */
export function estimateRamUsage(modelSize, quantization, batchSize = 1) {
  // Base: VRAM + overhead para processos Python, framework e dados de treinamento
  const baseVram = estimateModelVramUsage(modelSize, quantization);
  const processOverhead = 2 * 1024 * 1024 * 1024; // ~2GB para processos Python
  const batchOverhead = batchSize * modelSize * 0.3 * 1024 * 1024 * 1024; // Muito aproximado
  
  return baseVram + processOverhead + batchOverhead;
}

/**
 * Estima VRAM necessária para fine-tuning com LoRA
 * @param {Object} params - Parâmetros de fine-tuning
 * @returns {number} - VRAM estimada em bytes
 */
export function estimateQLoRAVramUsage(params) {
  const { modelSize, quantization, batchSize, loraRank, loraAlpha, maxLength } = params;
  
  // VRAM base para o modelo
  let baseVram = estimateModelVramUsage(modelSize, quantization);
  
  // Overhead do LoRA depende do rank e alpha
  let loraOverhead = 0;
  if (loraRank) {
    // Estimativa simplificada: cada unidade de rank adiciona ~100KB de VRAM por bilhão de parâmetros
    loraOverhead += modelSize * loraRank * LORA_OVERHEAD_FACTORS.rankMultiplier * 1024 * 1024;
    
    // Alpha afeta o tamanho das matrizes e gradientes
    if (loraAlpha) {
      loraOverhead += modelSize * loraAlpha * LORA_OVERHEAD_FACTORS.alphaMultiplier * 1024 * 1024;
    }
  }
  
  // Overhead de batch e comprimento de sequência
  const batchOverhead = batchSize * maxLength * modelSize * 4 * 4; // 4 bytes por elemento, 4 como fator de segurança
  
  // Overhead de otimizador e gradientes
  const optimizerOverhead = loraRank * modelSize * 0.2 * 1024 * 1024; // 0.2MB por rank por bilhão de parâmetros
  
  return baseVram + loraOverhead + batchOverhead + optimizerOverhead;
}

/**
 * Estima tempo de treinamento para fine-tuning
 * @param {Object} params - Parâmetros de fine-tuning
 * @returns {number} - Tempo estimado em segundos
 */
export function estimateTrainingTime(params) {
  const { 
    modelSize, 
    quantization, 
    epochs, 
    datasetSize, // número de amostras
    batchSize, 
    gpuType = 'nvidia_consumer',
    maxLength = 512
  } = params;
  
  // Estimativa de tokens processados por segundo
  const baseTokensPerSecond = TOKENS_PER_SECOND[gpuType]?.[quantization] || 
                            TOKENS_PER_SECOND.integrated[quantization] || 5;
  
  // Ajustes baseados no tamanho do modelo
  const sizeAdjustment = Math.min(1.5, 7 / modelSize);
  const tokensPerSecond = baseTokensPerSecond * sizeAdjustment;
  
  // Estimativa do número de passos de treinamento
  const stepsPerEpoch = Math.ceil(datasetSize / batchSize);
  const totalSteps = stepsPerEpoch * epochs;
  
  // Tempo por passo (em segundos)
  const tokensPerBatch = batchSize * maxLength;
  const secondsPerStep = tokensPerBatch / tokensPerSecond;
  
  // Adicionar overhead para processamento entre passos (backward pass, otimização, etc)
  const overheadPerStep = 0.1 + (0.05 * modelSize); // segundos
  
  return totalSteps * (secondsPerStep + overheadPerStep);
}

/**
 * Estima VRAM necessária para executar um sistema LMAS
 * @param {Object} params - Configuração LMAS
 * @returns {number} - VRAM estimada em bytes
 */
export function estimateLMASVramUsage(params) {
  const { 
    agents = [], 
    executionMode = 'parallel', 
    maxConcurrentAgents = agents.length 
  } = params;
  
  // Para execução paralela, somamos VRAM de todos os agentes concorrentes
  if (executionMode === 'parallel') {
    // Ordenar agentes por uso de VRAM (decrescente) e pegar os N mais intensivos
    const sortedAgents = [...agents].sort((a, b) => {
      const vramA = estimateModelVramUsage(a.modelSize, a.quantization);
      const vramB = estimateModelVramUsage(b.modelSize, b.quantization);
      return vramB - vramA;
    });
    
    // Pegar os agentes que seriam executados concorrentemente (limitado pelo maxConcurrentAgents)
    const concurrentAgents = sortedAgents.slice(0, maxConcurrentAgents);
    
    // Somar VRAM de todos os agentes concorrentes
    return concurrentAgents.reduce((total, agent) => {
      return total + estimateModelVramUsage(agent.modelSize, agent.quantization);
    }, 0);
  }
  
  // Para execução sequencial, usamos apenas o agente que consome mais VRAM
  else if (executionMode === 'sequential') {
    if (agents.length === 0) return 0;
    
    // Encontrar o agente com maior consumo de VRAM
    let maxVram = 0;
    for (const agent of agents) {
      const agentVram = estimateModelVramUsage(agent.modelSize, agent.quantization);
      maxVram = Math.max(maxVram, agentVram);
    }
    
    return maxVram;
  }
  
  return 0;
}

/**
 * Estima tempo de execução para um sistema LMAS
 * @param {Object} params - Configuração LMAS
 * @returns {Object} - Tempos estimados em segundos (melhor/pior caso)
 */
export function estimateLMASExecutionTime(params) {
  const { 
    agents = [], 
    executionMode = 'parallel', 
    interactions = 3, // estimativa de interações entre agentes
    tokensPerInteraction = 1000, // tokens gerados por interação
    gpuType = 'nvidia_consumer',
    maxConcurrentAgents = agents.length
  } = params;
  
  // Não há agentes
  if (agents.length === 0) return { min: 0, max: 0, expected: 0 };
  
  // Para cada agente, estimar tempo de processamento por interação
  const agentTimes = agents.map(agent => {
    const tokensPerSecond = TOKENS_PER_SECOND[gpuType]?.[agent.quantization] || 
                           TOKENS_PER_SECOND.integrated.q8;
    return tokensPerInteraction / tokensPerSecond;
  });
  
  // Modo sequencial: soma dos tempos de todos os agentes para todas as interações
  if (executionMode === 'sequential') {
    const totalAgentTime = agentTimes.reduce((sum, time) => sum + time, 0);
    const expectedTime = totalAgentTime * interactions;
    
    return {
      min: expectedTime * 0.7,  // Melhor caso: 30% mais rápido que o esperado
      max: expectedTime * 1.5,  // Pior caso: 50% mais lento que o esperado
      expected: expectedTime
    };
  }
  
  // Modo paralelo: tempo do agente mais lento multiplicado pelo número de interações
  // dividido pelo número de agentes concorrentes
  else if (executionMode === 'parallel') {
    const slowestAgentTime = Math.max(...agentTimes);
    const concurrentGroups = Math.ceil(agents.length / maxConcurrentAgents);
    const expectedTime = slowestAgentTime * interactions * concurrentGroups;
    
    return {
      min: expectedTime * 0.7,
      max: expectedTime * 1.5,
      expected: expectedTime
    };
  }
  
  return { min: 0, max: 0, expected: 0 };
}

/**
 * Gera sugestões de otimização com base nos parâmetros e recursos disponíveis
 * @param {Object} params - Parâmetros da tarefa (fine-tuning ou LMAS)
 * @param {Object} availableResources - Recursos disponíveis (VRAM, RAM)
 * @param {string} taskType - Tipo de tarefa ('fine-tuning' ou 'lmas')
 * @returns {Array} - Lista de sugestões de otimização
 */
export function generateOptimizationSuggestions(params, availableResources, taskType) {
  const suggestions = [];
  let estimatedVram = 0;
  
  if (taskType === 'fine-tuning') {
    estimatedVram = estimateQLoRAVramUsage(params);
    
    // Verificar se o modelo cabe na VRAM disponível
    if (estimatedVram > availableResources.vram) {
      // Sugerir quantização mais agressiva se estiver usando q8
      if (params.quantization === 'q8') {
        const q4Estimate = estimateQLoRAVramUsage({...params, quantization: 'q4'});
        const savings = ((estimatedVram - q4Estimate) / estimatedVram * 100).toFixed(1);
        
        suggestions.push({
          id: 'switch_to_q4',
          title: 'Utilizar quantização Q4 em vez de Q8',
          description: `Mudar para Q4 pode reduzir o uso de VRAM em aproximadamente ${savings}%, mas pode aumentar a instabilidade (H1)`,
          impact: 'high',
          reduction: estimatedVram - q4Estimate,
          clComplBalanced: false  // Indica que esta sugestão foca apenas em CompL, pode aumentar CL
        });
      }
      
      // Sugerir redução no rank LoRA se for maior que 8
      if (params.loraRank > 8) {
        const lowerRank = Math.max(4, Math.floor(params.loraRank / 2));
        const lowerRankEstimate = estimateQLoRAVramUsage({...params, loraRank: lowerRank});
        const rankSavings = ((estimatedVram - lowerRankEstimate) / estimatedVram * 100).toFixed(1);
        
        suggestions.push({
          id: 'reduce_lora_rank',
          title: `Reduzir rank LoRA de ${params.loraRank} para ${lowerRank}`,
          description: `Reduzir o rank LoRA pode diminuir o uso de VRAM em ~${rankSavings}% com impacto moderado na qualidade`,
          impact: 'medium',
          reduction: estimatedVram - lowerRankEstimate,
          clComplBalanced: true  // Bom equilíbrio entre CL e CompL
        });
      }
      
      // Sugerir redução do tamanho de batch
      if (params.batchSize > 1) {
        const smallerBatch = Math.max(1, Math.floor(params.batchSize / 2));
        const smallerBatchEstimate = estimateQLoRAVramUsage({...params, batchSize: smallerBatch});
        const batchSavings = ((estimatedVram - smallerBatchEstimate) / estimatedVram * 100).toFixed(1);
        
        suggestions.push({
          id: 'reduce_batch_size',
          title: `Reduzir tamanho de batch de ${params.batchSize} para ${smallerBatch}`,
          description: `Diminuir o batch size reduz o uso de VRAM em ~${batchSavings}%, mas pode aumentar o tempo de treinamento`,
          impact: 'medium',
          reduction: estimatedVram - smallerBatchEstimate,
          clComplBalanced: true
        });
      }
    }
    
    // Sugerir modelo menor se estiver usando um modelo grande e a VRAM estiver no limite
    if (params.modelSize >= 13 && (estimatedVram / availableResources.vram) > 0.8) {
      const smallerModelSize = params.modelSize > 13 ? 13 : 7;
      const smallerModelEstimate = estimateQLoRAVramUsage({...params, modelSize: smallerModelSize});
      const modelSavings = ((estimatedVram - smallerModelEstimate) / estimatedVram * 100).toFixed(1);
      
      suggestions.push({
        id: 'use_smaller_model',
        title: `Considerar modelo de ${smallerModelSize}B em vez de ${params.modelSize}B`,
        description: `Um modelo menor pode reduzir o uso de VRAM em ~${modelSavings}%, mantendo boa qualidade para muitas tarefas`,
        impact: 'high',
        reduction: estimatedVram - smallerModelEstimate,
        clComplBalanced: true
      });
    }
  } 
  else if (taskType === 'lmas') {
    estimatedVram = estimateLMASVramUsage(params);
    
    // Verificar se o sistema cabe na VRAM disponível
    if (estimatedVram > availableResources.vram) {
      // Sugerir execução sequencial se estiver usando paralelo
      if (params.executionMode === 'parallel') {
        const sequentialEstimate = estimateLMASVramUsage({...params, executionMode: 'sequential'});
        const modeSavings = ((estimatedVram - sequentialEstimate) / estimatedVram * 100).toFixed(1);
        
        suggestions.push({
          id: 'switch_to_sequential',
          title: 'Executar agentes sequencialmente',
          description: `Mudar para execução sequencial reduz o uso de VRAM em ~${modeSavings}%, com aumento no tempo total`,
          impact: 'high',
          reduction: estimatedVram - sequentialEstimate,
          clComplBalanced: true
        });
      }
      
      // Sugerir quantização mais agressiva para todos os agentes
      const agentsWithQ8 = params.agents.filter(a => a.quantization === 'q8').length;
      if (agentsWithQ8 > 0) {
        const q4Agents = params.agents.map(a => 
          a.quantization === 'q8' ? {...a, quantization: 'q4'} : a
        );
        
        const q4Estimate = estimateLMASVramUsage({...params, agents: q4Agents});
        const q4Savings = ((estimatedVram - q4Estimate) / estimatedVram * 100).toFixed(1);
        
        suggestions.push({
          id: 'quantize_agents_to_q4',
          title: `Quantizar ${agentsWithQ8} agente(s) para Q4`,
          description: `Mudar agentes de Q8 para Q4 pode reduzir o uso de VRAM em ~${q4Savings}%, com possível aumento em CL (H1)`,
          impact: 'high',
          reduction: estimatedVram - q4Estimate,
          clComplBalanced: false
        });
      }
      
      // Sugerir limitar agentes concorrentes
      if (params.executionMode === 'parallel' && params.agents.length > 2) {
        const fewerConcurrentAgents = Math.max(2, Math.floor(params.agents.length / 2));
        const fewerAgentsEstimate = estimateLMASVramUsage({
          ...params, 
          maxConcurrentAgents: fewerConcurrentAgents
        });
        
        const concurrencySavings = ((estimatedVram - fewerAgentsEstimate) / estimatedVram * 100).toFixed(1);
        
        suggestions.push({
          id: 'limit_concurrent_agents',
          title: `Limitar a ${fewerConcurrentAgents} agentes concorrentes`,
          description: `Reduzir agentes em execução simultânea economiza ~${concurrencySavings}% de VRAM`,
          impact: 'medium',
          reduction: estimatedVram - fewerAgentsEstimate,
          clComplBalanced: true
        });
      }
    }
    
    // Identificar agentes com modelos grandes que poderiam ser substituídos
    const largeAgents = params.agents.filter(a => a.modelSize >= 13).length;
    if (largeAgents > 0) {
      suggestions.push({
        id: 'downsize_large_agents',
        title: `Considerar modelos menores para ${largeAgents} agente(s)`,
        description: 'Substituir modelos de 13B+ por alternativas de 7B pode melhorar performance sem grande impacto na qualidade',
        impact: 'medium',
        reduction: null, // Dependeria dos modelos específicos
        clComplBalanced: true
      });
    }
  }
  
  return suggestions;
}

/**
 * Avalia se uma configuração é viável com os recursos disponíveis
 * @param {Object} params - Parâmetros da tarefa
 * @param {Object} availableResources - Recursos disponíveis
 * @param {string} taskType - Tipo de tarefa
 * @returns {Object} - Resultados da avaliação de viabilidade
 */
export function evaluateViability(params, availableResources, taskType) {
  let estimatedVram = 0;
  let estimatedRam = 0;
  let estimatedTime = 0;
  
  if (taskType === 'fine-tuning') {
    estimatedVram = estimateQLoRAVramUsage(params);
    estimatedRam = estimateRamUsage(params.modelSize, params.quantization, params.batchSize);
    estimatedTime = estimateTrainingTime(params);
  } 
  else if (taskType === 'lmas') {
    estimatedVram = estimateLMASVramUsage(params);
    estimatedRam = params.agents.reduce((max, agent) => 
      Math.max(max, estimateRamUsage(agent.modelSize, agent.quantization)), 0
    );
    const timeEstimate = estimateLMASExecutionTime(params);
    estimatedTime = timeEstimate.expected;
  }
  
  // Verificar viabilidade
  const vramViable = estimatedVram <= availableResources.vram;
  const ramViable = estimatedRam <= availableResources.ram;
  
  // Classificar nível de utilização
  const vramUtilization = estimatedVram / availableResources.vram;
  const ramUtilization = estimatedRam / availableResources.ram;
  
  let performanceCategory = 'optimal';
  if (vramUtilization > 0.9 || ramUtilization > 0.9) {
    performanceCategory = 'risky';
  } else if (vramUtilization > 0.7 || ramUtilization > 0.7) {
    performanceCategory = 'high';
  }
  
  return {
    viable: vramViable && ramViable,
    vramViable,
    ramViable,
    estimatedVram,
    estimatedRam,
    estimatedTime,
    vramUtilization,
    ramUtilization,
    performanceCategory,
    suggestions: generateOptimizationSuggestions(params, availableResources, taskType)
  };
}
