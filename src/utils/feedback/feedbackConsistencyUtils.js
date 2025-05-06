/**
 * Utilitários para verificar a consistência do feedback em toda a aplicação
 */

// Padrões de feedback para tipos de ação específicos
export const feedbackPatterns = {
  // Formulários
  formSuccess: {
    type: 'success',
    duration: 3000,
    messagePattern: /(?:enviado|salvo|criado|atualizado) com sucesso/i,
  },
  
  formError: {
    type: 'error',
    duration: 5000,
    messagePattern: /(?:erro|falha) (?:ao|na) (?:enviar|salvar|criar|atualizar)/i,
  },
  
  // Autenticação
  authSuccess: {
    type: 'success',
    duration: 3000,
    messagePattern: /(?:login|autenticado|conectado) com sucesso/i,
  },
  
  authError: {
    type: 'error',
    duration: 5000,
    messagePattern: /(?:falha|erro) (?:na autenticação|ao autenticar|no login)/i,
  },
  
  // Operações de exclusão
  deleteSuccess: {
    type: 'success',
    duration: 3000,
    messagePattern: /(?:excluído|removido|deletado) com sucesso/i,
  },
  
  deleteError: {
    type: 'error',
    duration: 5000,
    messagePattern: /(?:erro|falha) (?:ao|na) (?:excluir|remover|deletar)/i,
  },
  
  // Validação
  validationError: {
    type: 'warning',
    duration: 4000,
    messagePattern: /(?:erro|falha) de validação|campos (?:inválidos|obrigatórios|incorretos)/i,
  },
  
  // Carregamento de dados
  loadingError: {
    type: 'error',
    duration: 5000,
    messagePattern: /(?:erro|falha) (?:ao|na) (?:carregar|obter) (?:dados|informações)/i,
  },
};

/**
 * Verifica se um feedback específico está conforme o padrão esperado
 * @param {Object} feedback O feedback a ser verificado
 * @param {Object} pattern O padrão esperado para o tipo de feedback
 * @returns {Object} Resultado da verificação com detalhes sobre inconsistências
 */
export const checkFeedbackConsistency = (feedback, pattern) => {
  const result = {
    isConsistent: true,
    inconsistencies: []
  };
  
  // Verificar tipo
  if (feedback.type !== pattern.type) {
    result.isConsistent = false;
    result.inconsistencies.push({
      field: 'type',
      expected: pattern.type,
      received: feedback.type
    });
  }
  
  // Verificar duração
  if (feedback.duration !== pattern.duration) {
    result.isConsistent = false;
    result.inconsistencies.push({
      field: 'duration',
      expected: pattern.duration,
      received: feedback.duration
    });
  }
  
  // Verificar padrão de mensagem
  if (!pattern.messagePattern.test(feedback.message)) {
    result.isConsistent = false;
    result.inconsistencies.push({
      field: 'message',
      expected: pattern.messagePattern.toString(),
      received: feedback.message
    });
  }
  
  return result;
};

/**
 * Mapeia um tipo de ação para o padrão de feedback esperado
 * @param {string} actionType O tipo de ação do usuário
 * @returns {Object|null} O padrão de feedback correspondente ou null se não encontrado
 */
export const getPatternForActionType = (actionType) => {
  const mappings = {
    'form_submission_success': feedbackPatterns.formSuccess,
    'form_submission_error': feedbackPatterns.formError,
    'authentication_success': feedbackPatterns.authSuccess,
    'authentication_error': feedbackPatterns.authError,
    'delete_confirmation': feedbackPatterns.deleteSuccess,
    'delete_error': feedbackPatterns.deleteError,
    'validation_error': feedbackPatterns.validationError,
    'data_loading_error': feedbackPatterns.loadingError,
  };
  
  return mappings[actionType] || null;
};

/**
 * Analisa um conjunto de feedbacks capturados para verificar consistência
 * @param {Array} feedbacks Lista de feedbacks capturados
 * @returns {Object} Relatório de consistência
 */
export const analyzeFeedbackConsistency = (feedbacks) => {
  const report = {
    totalFeedbacks: feedbacks.length,
    consistentFeedbacks: 0,
    inconsistentFeedbacks: 0,
    actionTypeConsistency: {},
    overallConsistency: true
  };
  
  // Agrupar feedbacks por tipo de ação
  const feedbacksByActionType = {};
  feedbacks.forEach(feedback => {
    if (!feedbacksByActionType[feedback.actionType]) {
      feedbacksByActionType[feedback.actionType] = [];
    }
    feedbacksByActionType[feedback.actionType].push(feedback);
  });
  
  // Analisar consistência por tipo de ação
  Object.entries(feedbacksByActionType).forEach(([actionType, actionFeedbacks]) => {
    const pattern = getPatternForActionType(actionType);
    
    if (!pattern) {
      report.actionTypeConsistency[actionType] = {
        pattern: 'undefined',
        isConsistent: false,
        inconsistencies: [{
          issue: 'No pattern defined for this action type'
        }]
      };
      report.overallConsistency = false;
      report.inconsistentFeedbacks += actionFeedbacks.length;
      return;
    }
    
    const actionConsistency = {
      pattern,
      isConsistent: true,
      inconsistencies: []
    };
    
    // Verificar cada feedback deste tipo de ação
    actionFeedbacks.forEach(feedback => {
      const checkResult = checkFeedbackConsistency(feedback, pattern);
      
      if (!checkResult.isConsistent) {
        actionConsistency.isConsistent = false;
        actionConsistency.inconsistencies.push({
          feedback,
          issues: checkResult.inconsistencies
        });
        report.inconsistentFeedbacks++;
      } else {
        report.consistentFeedbacks++;
      }
    });
    
    if (!actionConsistency.isConsistent) {
      report.overallConsistency = false;
    }
    
    report.actionTypeConsistency[actionType] = actionConsistency;
  });
  
  return report;
};
