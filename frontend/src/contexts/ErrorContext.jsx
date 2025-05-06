import React, { createContext, useContext, useReducer, useCallback } from 'react';
import errorHandlingService from '../services/errorHandlingService';

// Inicialização do contexto
const ErrorContext = createContext();

// Tipos de ações para o reducer
const ERROR_ACTIONS = {
  ADD_ERROR: 'ADD_ERROR',
  DISMISS_ERROR: 'DISMISS_ERROR',
  DISMISS_ALL: 'DISMISS_ALL'
};

// Estado inicial
const initialState = {
  errors: [],
  hasErrors: false
};

// Reducer para gerenciar o estado dos erros
const errorReducer = (state, action) => {
  switch (action.type) {
    case ERROR_ACTIONS.ADD_ERROR:
      return {
        ...state,
        errors: [...state.errors, { id: Date.now(), ...action.payload }],
        hasErrors: true
      };
      
    case ERROR_ACTIONS.DISMISS_ERROR:
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload),
        hasErrors: state.errors.length > 1 // Ainda há erros se havia mais de um
      };
      
    case ERROR_ACTIONS.DISMISS_ALL:
      return {
        ...state,
        errors: [],
        hasErrors: false
      };
      
    default:
      return state;
  }
};

/**
 * Provedor de contexto para gerenciamento de erros na aplicação
 */
export const ErrorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);
  
  /**
   * Adiciona um erro ao contexto com processamento avançado
   */
  const handleError = useCallback((error, context = 'generic', metadata = {}) => {
    // Processa o erro para adicionar contexto, sugestões, etc.
    const processedError = errorHandlingService.processError(error, context);
    
    // Registra o erro para análise
    errorHandlingService.logError(error, context, metadata);
    
    // Adiciona ao estado
    dispatch({
      type: ERROR_ACTIONS.ADD_ERROR,
      payload: {
        ...processedError,
        timestamp: new Date(),
        metadata
      }
    });
    
    return processedError;
  }, []);
  
  /**
   * Remove um erro específico pelo ID
   */
  const dismissError = useCallback((errorId) => {
    dispatch({
      type: ERROR_ACTIONS.DISMISS_ERROR,
      payload: errorId
    });
  }, []);
  
  /**
   * Remove todos os erros
   */
  const dismissAllErrors = useCallback(() => {
    dispatch({ type: ERROR_ACTIONS.DISMISS_ALL });
  }, []);
  
  const value = {
    ...state,
    handleError,
    dismissError,
    dismissAllErrors
  };
  
  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

/**
 * Hook para usar o contexto de erros
 */
export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError deve ser usado dentro de um ErrorProvider');
  }
  return context;
};

export default ErrorContext;
