/**
 * Definição dos tipos de erro e categorias para uniformidade em toda a aplicação
 */

// Tipos de erro principais
export const ERROR_TYPES = {
  // Erros de recursos computacionais
  MEMORY_ERROR: 'memory_error',          // Erros relacionados a VRAM/RAM
  CUDA_ERROR: 'cuda_error',              // Erros específicos de CUDA
  CPU_OVERLOAD: 'cpu_overload',          // Sobrecarga de CPU
  TIMEOUT_ERROR: 'timeout_error',        // Timeout de operação
  
  // Erros de fine-tuning
  CONVERGENCE_ERROR: 'convergence_error', // Problemas de convergência (NaN, etc)
  DATASET_ERROR: 'dataset_error',         // Problemas com o dataset
  HYPERPARAMETER_ERROR: 'hyperparameter_error', // Configuração inadequada
  QUANTIZATION_ERROR: 'quantization_error', // Problemas relacionados à quantização
  
  // Erros de LMAS
  AGENT_ERROR: 'agent_error',             // Falha em um agente específico
  COMMUNICATION_ERROR: 'communication_error', // Problemas de comunicação entre agentes
  ORCHESTRATION_ERROR: 'orchestration_error', // Falhas no sistema de orquestração
  TOOL_ERROR: 'tool_error',               // Falha em uma ferramenta usada por um agente
  
  // Erros genéricos
  UNKNOWN_ERROR: 'unknown_error',         // Erro não classificado
  NETWORK_ERROR: 'network_error',         // Problemas de rede
  PERMISSION_ERROR: 'permission_error',   // Problemas de permissão
  VALIDATION_ERROR: 'validation_error'    // Entrada inválida
};

// Categorias de erro (para agrupamento)
export const ERROR_CATEGORIES = {
  COMPUTATIONAL: 'computational',  // Relacionado a recursos computacionais (CompL)
  COGNITIVE: 'cognitive',          // Potencialmente aumentando a Carga Cognitiva (CL)
  TECHNICAL: 'technical',          // Erros técnicos gerais
  USER: 'user'                     // Erros causados por ação do usuário
};

// Mapeamento de erros para suas causas mais prováveis
export const ERROR_CAUSES = {
  [ERROR_TYPES.MEMORY_ERROR]: [
    'Modelo grande demais para o hardware disponível',
    'Quantização insuficiente para o hardware',
    'Tamanho de batch muito grande',
    'Contexto muito longo para a VRAM disponível'
  ],
  
  [ERROR_TYPES.CONVERGENCE_ERROR]: [
    'Taxa de aprendizado muito alta',
    'Dataset contém outliers ou valores extremos',
    'Instabilidade numérica (comum em Q4)',
    'Configurações LoRA inadequadas (rank ou alpha)'
  ],
  
  [ERROR_TYPES.AGENT_ERROR]: [
    'Prompt do sistema inadequado',
    'Modelo base não adequado para a tarefa',
    'Falha de comunicação entre agentes',
    'Requisitos de ferramentas não atendidos'
  ],
  
  [ERROR_TYPES.QUANTIZATION_ERROR]: [
    'Quantização Q4 causando instabilidade',
    'Modelo incompatível com o nível de quantização',
    'Configurações de matriz de atenção inadequadas',
    'Tamanho de modelo e nível de quantização incompatíveis'
  ]
};

// Relacionamento de erros com trade-off CL-CompL
export const CL_COMPL_INSIGHTS = {
  [ERROR_TYPES.MEMORY_ERROR]: {
    tradeoff: 'Reduzir a quantização (Q8→Q4) diminui CompL mas pode aumentar CL via instabilidade',
    hypothesis: 'H1, H3',
    strategy: 'Buscar modelo menor com melhor quantização em vez de modelo maior com quantização agressiva'
  },
  
  [ERROR_TYPES.CONVERGENCE_ERROR]: {
    tradeoff: 'Estabilidade numérica (CL mais baixa) frequentemente requer mais recursos (CompL mais alta)',
    hypothesis: 'H1, H3',
    strategy: 'Q8 para primeiras execuções (aprendizado), depois Q4 quando o processo estiver dominado'
  },
  
  [ERROR_TYPES.AGENT_ERROR]: {
    tradeoff: 'Complexidade do LMAS (H2) impõe alta CL e CompL simultaneamente',
    hypothesis: 'H2, H3',
    strategy: 'Decomposição de problemas: testar agentes individualmente reduz CL e CompL'
  },
  
  [ERROR_TYPES.QUANTIZATION_ERROR]: {
    tradeoff: 'Otimização excessiva de CompL (Q4) compromete estabilidade e aumenta CL',
    hypothesis: 'H1, H3',
    strategy: 'Use Q8 para aprendizado inicial, Q4 apenas quando tiver experiência suficiente (H4)'
  }
};
