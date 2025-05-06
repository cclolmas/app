import { ERROR_TYPES, ERROR_CATEGORIES } from '../utils/errorTypes';

/**
 * Serviço de gerenciamento de erros especializado para tarefas complexas de IA (QLoRA, LMAS)
 */
class ErrorHandlingService {
  /**
   * Analisa e classifica um erro com base em sua mensagem e código
   * @param {Error|Object} error - O objeto de erro a ser processado
   * @param {string} context - Contexto da operação que gerou o erro ('fine-tuning', 'lmas', etc.)
   * @returns {Object} Objeto de erro processado com metadados adicionais
   */
  processError(error, context = 'generic') {
    // Extrair informações básicas do erro
    const errorData = {
      title: 'Erro na operação',
      message: error.message || 'Ocorreu um erro desconhecido',
      severity: 'error',
      errorCode: error.code || 'ERR_UNKNOWN',
      errorType: this._detectErrorType(error),
      context: '',
      suggestions: [],
      resources: {},
      clComplInfo: null
    };
    
    // Identificar tipo específico de erro com base na mensagem e contexto
    if (error.code === 'ENOMEM' || error.message.includes('CUDA out of memory') || error.message.includes('OOM')) {
      return this._processMemoryError(error, context);
    } 
    else if (error.message.includes('nan loss') || error.message.includes('Infinity') || error.message.includes('diverged')) {
      return this._processConvergenceError(error, context);
    }
    else if (context === 'lmas' && (error.message.includes('agent') || error.message.includes('communication'))) {
      return this._processAgentError(error);
    }
    else if (error.message.includes('quantization') || error.message.includes('Q4') || error.message.includes('instability')) {
      return this._processStabilityError(error);
    }
    
    // Enriquecer o erro com informações padrão para o contexto
    switch (context) {
      case 'fine-tuning':
        errorData.title = 'Erro no processo de fine-tuning';
        errorData.resources.docs = '/docs/fine-tuning/troubleshooting';
        break;
      case 'lmas':
        errorData.title = 'Erro no sistema multi-agente';
        errorData.resources.docs = '/docs/lmas/troubleshooting';
        break;
      default:
        break;
    }
    
    return errorData;
  }
  
  /**
   * Detecta o tipo de erro com base na mensagem e código
   * @private
   */
  _detectErrorType(error) {
    const message = (error.message || '').toLowerCase();
    const code = (error.code || '').toLowerCase();
    
    if (message.includes('memory') || message.includes('oom') || message.includes('cuda') || code === 'enomem') {
      return 'memory';
    } else if (message.includes('convergence') || message.includes('nan') || message.includes('infinity')) {
      return 'convergence';
    } else if (message.includes('agent') || message.includes('communication')) {
      return 'agent';
    } else if (message.includes('quantization') || message.includes('instability') || message.includes('q4')) {
      return 'stability';
    }
    
    return 'generic';
  }
  
  /**
   * Processa erros relacionados a memória (VRAM/RAM)
   * @private
   */
  _processMemoryError(error, context) {
    const errorData = {
      title: 'Erro de memória',
      message: 'Memória insuficiente para concluir a operação',
      severity: 'error',
      errorCode: error.code || 'ERR_OUT_OF_MEMORY',
      errorType: 'memory',
      context: 'Sua GPU/CPU não possui memória suficiente para a tarefa atual. Este é um problema comum ao trabalhar com modelos grandes ou configurações intensivas.',
      suggestions: [
        'Reduza o tamanho de batch para consumir menos VRAM',
        'Utilize uma quantização mais eficiente (considere Q4, mas observe o trade-off)',
        'Escolha um modelo menor (7B em vez de 13B)',
        'Libere memória fechando outros processos que estejam usando a GPU'
      ],
      resources: {
        docs: context === 'fine-tuning' 
          ? '/docs/fine-tuning/memory-optimization'
          : '/docs/lmas/resource-management',
        logs: '/logs/system/latest'
      },
      clComplInfo: {
        message: 'Este erro demonstra um caso onde a Carga Computacional (CompL) excede os recursos disponíveis. A resolução envolve um trade-off entre reduzir a CompL (usando modelos menores ou mais quantização) e potencialmente aumentar a Carga Cognitiva (CL) ao lidar com modelos menos precisos.',
        suggestion: context === 'fine-tuning'
          ? 'Considere usar Q4 em vez de Q8 para reduzir o uso de VRAM pela metade, mas esteja preparado para possíveis instabilidades (H1) que podem exigir mais depuração e ajustes.'
          : 'Considere executar seus agentes sequencialmente em vez de em paralelo, ou use modelos menores para cada agente.'
      }
    };
    
    return errorData;
  }
  
  /**
   * Processa erros relacionados a problemas de convergência no fine-tuning
   * @private
   */
  _processConvergenceError(error) {
    return {
      title: 'Problema de convergência',
      message: 'O processo de treinamento encontrou valores numéricos inválidos',
      severity: 'error',
      errorCode: error.code || 'ERR_TRAINING_DIVERGED',
      errorType: 'convergence',
      context: 'Seu modelo divergiu durante o treinamento, gerando valores NaN (Not a Number) ou Infinity. Isso geralmente ocorre quando a taxa de aprendizado é muito alta ou quando os dados têm problemas.',
      suggestions: [
        'Reduza a taxa de aprendizado (tente 1/10 do valor atual)',
        'Verifique seus dados de treinamento em busca de outliers ou valores extremos',
        'Aumente o valor de LoRA alpha para melhorar a estabilidade',
        'Se estiver usando Q4, considere mudar para Q8 para maior estabilidade numérica'
      ],
      resources: {
        docs: '/docs/fine-tuning/convergence-issues',
        logs: '/logs/training/latest'
      },
      clComplInfo: {
        message: 'Problemas de convergência são frequentemente exacerbados pela quantização agressiva (Q4). Enquanto Q4 reduz a Carga Computacional (CompL), ela aumenta significativamente a Carga Cognitiva (CL) ao tornar o treinamento menos estável e previsível (H1).',
        suggestion: 'Busque o "ponto ideal" (H3) usando Q8 para treinamento, que proporciona melhor estabilidade numérica com um aumento aceitável de CompL. Alternativamente, reduza o rank LoRA para compensar o aumento de VRAM.'
      }
    };
  }
  
  /**
   * Processa erros relacionados a agentes em sistemas LMAS
   * @private
   */
  _processAgentError(error) {
    return {
      title: 'Erro no agente',
      message: error.message || 'Um agente falhou durante a execução',
      severity: 'error',
      errorCode: error.code || 'ERR_AGENT_FAILURE',
      errorType: 'agent',
      context: 'Um ou mais agentes encontraram problemas durante a execução. Isso pode ser devido a falhas de comunicação, prompts inválidos ou problemas no modelo subjacente.',
      suggestions: [
        'Verifique os prompts do sistema para cada agente',
        'Simplifique a estrutura de comunicação entre agentes',
        'Certifique-se de que todos os agentes têm acesso às ferramentas necessárias',
        'Considere usar modelos mais robustos para agentes críticos no fluxo'
      ],
      resources: {
        docs: '/docs/lmas/agent-debugging',
        logs: '/logs/agents/latest'
      },
      clComplInfo: {
        message: 'Sistemas Multi-Agente (LMAS) impõem alta Carga Cognitiva (CL) e Carga Computacional (CompL) simultaneamente (H2). A depuração exige compreensão das interações complexas entre agentes.',
        suggestion: 'Decomponha o problema (Guia PC): teste cada agente individualmente antes de testar o sistema completo. Isto reduz a CL ao isolar problemas e também reduz a CompL durante o diagnóstico.'
      }
    };
  }
  
  /**
   * Processa erros relacionados a instabilidades de quantização (especialmente Q4)
   * @private
   */
  _processStabilityError(error) {
    return {
      title: 'Problema de estabilidade',
      message: error.message || 'O modelo apresentou comportamento instável',
      severity: 'warning',
      errorCode: error.code || 'ERR_MODEL_INSTABILITY',
      errorType: 'stability',
      context: 'O modelo está exibindo comportamento instável ou imprevisível, possivelmente devido à quantização agressiva (Q4) ou outras otimizações.',
      suggestions: [
        'Mude para uma quantização mais conservadora (Q8)',
        'Reduza o tamanho do contexto para melhorar a estabilidade',
        'Use um prompt de sistema mais explícito e estruturado',
        'Experimente um modelo menor com quantização menor em vez de um modelo maior com quantização agressiva'
      ],
      resources: {
        docs: '/docs/models/quantization-effects',
      },
      clComplInfo: {
        message: 'Este é um exemplo claro do trade-off entre CL-CompL (H1): a quantização Q4 economiza memória mas gera instabilidade que aumenta significativamente a carga cognitiva do usuário.',
        suggestion: 'Para minimizar a CL total, considere usar Q8 mesmo consumindo mais recursos computacionais. Isso aproxima você do "ponto ideal" (H3) onde a CompL moderada minimiza a CL global.'
      }
    };
  }
  
  /**
   * Registra um erro para análise posterior
   * @param {Error|Object} error - O erro a ser registrado
   * @param {string} context - Contexto da operação
   * @param {Object} metadata - Metadados adicionais
   */
  logError(error, context = 'generic', metadata = {}) {
    // Em uma implementação real, isso enviaria o erro para um serviço de logging
    console.error(`[${context.toUpperCase()}] ${error.message || 'Unknown error'}`, {
      error,
      metadata,
      timestamp: new Date().toISOString()
    });
  }
}

// Singleton instance
const errorHandlingService = new ErrorHandlingService();

export default errorHandlingService;
