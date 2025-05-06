import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Alert, Snackbar } from '@mui/material';

// Criar contexto para feedback global
const FeedbackContext = createContext({
  showFeedback: () => {},
  clearFeedback: () => {},
});

// Hook para facilitar o uso do contexto
export const useFeedback = () => useContext(FeedbackContext);

export const FeedbackProvider = ({ children }) => {
  const [feedback, setFeedback] = useState(null);
  const metricsRef = useRef({
    displayedCount: 0,
    totalResponseTime: 0,
  });

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const showFeedback = useCallback(({ type, message, duration = 5000 }) => {
    const startTime = performance.now();
    
    // Capturar momento antes da renderização
    requestAnimationFrame(() => {
      // Medir o tempo até a renderização
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Atualizar métricas
      metricsRef.current = {
        displayedCount: metricsRef.current.displayedCount + 1,
        totalResponseTime: metricsRef.current.totalResponseTime + responseTime,
        avgResponseTime: 
          (metricsRef.current.totalResponseTime + responseTime) / 
          (metricsRef.current.displayedCount + 1),
      };
      
      console.debug('Métricas de feedback:', metricsRef.current);
    });

    setFeedback({
      type,
      message,
      duration,
      timestamp: new Date().getTime(),
    });
    
    // Auto-limpeza após duração definida
    if (duration > 0) {
      setTimeout(() => {
        clearFeedback();
      }, duration);
    }
  }, [clearFeedback]);

  return (
    <FeedbackContext.Provider value={{ showFeedback, clearFeedback }}>
      {children}
      <Snackbar
        open={feedback !== null}
        autoHideDuration={feedback?.duration || 5000}
        onClose={clearFeedback}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {feedback && (
          <Alert 
            onClose={clearFeedback} 
            severity={feedback.type || 'info'} 
            sx={{ width: '100%' }}
          >
            {feedback.message}
          </Alert>
        )}
      </Snackbar>
    </FeedbackContext.Provider>
  );
};

export default FeedbackContext;
