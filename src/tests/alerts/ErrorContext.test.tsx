import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React, { useContext } from 'react';
import { ErrorProvider, ErrorContext } from '../../contexts/ErrorContext'; // Ajuste conforme necessário

// Componente de teste que utiliza o contexto de erros
const TestErrorConsumer = () => {
  const { showError, showToast, clearError } = useContext(ErrorContext);
  
  return (
    <div>
      <button 
        onClick={() => showError('Erro crítico', 'Este é um erro crítico que requer atenção.')}
        data-testid="show-error-btn"
      >
        Mostrar erro
      </button>
      
      <button 
        onClick={() => showToast('Aviso', 'warning')}
        data-testid="show-toast-btn"
      >
        Mostrar aviso
      </button>
      
      <button 
        onClick={clearError}
        data-testid="clear-error-btn"
      >
        Limpar erro
      </button>
    </div>
  );
};

describe('ErrorContext Tests', () => {
  test('should show error modal when showError is called', async () => {
    render(
      <ErrorProvider>
        <TestErrorConsumer />
      </ErrorProvider>
    );
    
    fireEvent.click(screen.getByTestId('show-error-btn'));
    
    await waitFor(() => {
      expect(screen.getByText('Erro crítico')).toBeInTheDocument();
      expect(screen.getByText('Este é um erro crítico que requer atenção.')).toBeInTheDocument();
    });
  });
  
  test('should show toast notification when showToast is called', async () => {
    render(
      <ErrorProvider>
        <TestErrorConsumer />
      </ErrorProvider>
    );
    
    fireEvent.click(screen.getByTestId('show-toast-btn'));
    
    await waitFor(() => {
      expect(screen.getByText('Aviso')).toBeInTheDocument();
    });
  });
  
  test('should clear error when clearError is called', async () => {
    render(
      <ErrorProvider>
        <TestErrorConsumer />
      </ErrorProvider>
    );
    
    // Primeiro mostra o erro
    fireEvent.click(screen.getByTestId('show-error-btn'));
    
    await waitFor(() => {
      expect(screen.getByText('Erro crítico')).toBeInTheDocument();
    });
    
    // Depois limpa o erro
    fireEvent.click(screen.getByTestId('clear-error-btn'));
    
    await waitFor(() => {
      expect(screen.queryByText('Erro crítico')).not.toBeInTheDocument();
    });
  });
});
