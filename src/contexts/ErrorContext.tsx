import React, { createContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import { Modal } from '../components/ui/Modal'; // Ajuste conforme necessário
import { Toast } from '../components/ui/Toast'; // Ajuste conforme necessário

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ErrorContextType {
  showError: (title: string, message: string) => void;
  showToast: (message: string, type?: ToastType) => void;
  clearError: () => void;
}

export const ErrorContext = createContext<ErrorContextType>({} as ErrorContextType);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  });
  
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Limpar o timeout ao desmontar o componente
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showError = useCallback((title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setErrorModalOpen(true);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    // Limpar qualquer timeout existente para evitar comportamento inconsistente
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    
    setToast({ message, type, visible: true });
    
    // Esconde o toast após 3 segundos
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
      toastTimeoutRef.current = null;
    }, 3000);
  }, []);

  const clearError = useCallback(() => {
    setErrorModalOpen(false);
    setErrorTitle('');
    setErrorMessage('');
  }, []);

  return (
    <ErrorContext.Provider value={{ showError, showToast, clearError }}>
      {children}
      
      {errorModalOpen && (
        <Modal
          title={errorTitle}
          isOpen={errorModalOpen}
          onClose={clearError}
        >
          <p>{errorMessage}</p>
          <button onClick={clearError}>Fechar</button>
        </Modal>
      )}
      
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => {
            if (toastTimeoutRef.current) {
              clearTimeout(toastTimeoutRef.current);
              toastTimeoutRef.current = null;
            }
            setToast(prev => ({ ...prev, visible: false }));
          }}
        />
      )}
    </ErrorContext.Provider>
  );
};
