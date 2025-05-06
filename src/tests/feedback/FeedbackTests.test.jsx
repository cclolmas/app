import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FeedbackProvider, useFeedback } from '../../components/feedback/FeedbackContext';
import FeedbackTester from '../../components/feedback/FeedbackTester';

// Componente de teste que usa o contexto de feedback
const TestComponent = ({ triggerType = 'success', message = 'Test message' }) => {
  const { showFeedback } = useFeedback();
  
  const handleClick = () => {
    showFeedback({
      type: triggerType,
      message: message,
      duration: 2000
    });
  };
  
  return (
    <div>
      <button data-testid="trigger-feedback" onClick={handleClick}>
        Show Feedback
      </button>
    </div>
  );
};

// Testes para o sistema de feedback
describe('Feedback System Tests', () => {
  test('feedback appears when triggered', async () => {
    render(
      <FeedbackProvider>
        <TestComponent />
      </FeedbackProvider>
    );
    
    fireEvent.click(screen.getByTestId('trigger-feedback'));
    
    // Verificar se o alerta apareceu
    expect(await screen.findByText('Test message')).toBeInTheDocument();
  });
  
  test('feedback disappears after duration', async () => {
    jest.useFakeTimers();
    
    render(
      <FeedbackProvider>
        <TestComponent />
      </FeedbackProvider>
    );
    
    fireEvent.click(screen.getByTestId('trigger-feedback'));
    
    // Verificar se o alerta apareceu
    expect(await screen.findByText('Test message')).toBeInTheDocument();
    
    // Avançar o tempo para após a duração do feedback
    act(() => {
      jest.advanceTimersByTime(2500);
    });
    
    // Verificar se o alerta desapareceu
    await waitFor(() => {
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });
  
  test('different feedback types render with correct severity', async () => {
    render(
      <FeedbackProvider>
        <TestComponent triggerType="error" message="Error occurred" />
      </FeedbackProvider>
    );
    
    fireEvent.click(screen.getByTestId('trigger-feedback'));
    
    // Obter o alerta
    const alert = await screen.findByText('Error occurred');
    
    // Verificar se tem a classe correta associada à severidade
    const alertElement = alert.closest('.MuiAlert-root');
    expect(alertElement).toHaveClass('MuiAlert-standardError');
  });
  
  test('feedback component renders with different configurations', async () => {
    render(<FeedbackTester />);
    
    // Verificar se o componente principal renderizou
    expect(screen.getByText('Testador de Feedback UI')).toBeInTheDocument();
    
    // Mudar o tipo de operação
    fireEvent.mouseDown(screen.getByLabelText('Tipo de Operação'));
    fireEvent.click(screen.getByText('Erro'));
    
    // Mudar a mensagem
    fireEvent.change(screen.getByLabelText('Mensagem de Feedback'), {
      target: { value: 'Mensagem de erro personalizada' },
    });
    
    // Disparar feedback
    fireEvent.click(screen.getByText('Testar Feedback'));
    
    // Verificar se o feedback apareceu com a nova mensagem
    expect(await screen.findByText('Mensagem de erro personalizada')).toBeInTheDocument();
  });
});

// Testes de performance do feedback
describe('Feedback Performance Tests', () => {
  test('feedback renders within acceptable time frame', async () => {
    const startTime = performance.now();
    
    render(
      <FeedbackProvider>
        <TestComponent />
      </FeedbackProvider>
    );
    
    fireEvent.click(screen.getByTestId('trigger-feedback'));
    
    // Esperar o feedback aparecer
    await screen.findByText('Test message');
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Verifique se o feedback foi renderizado em menos de 100ms
    // Ajuste esse valor com base nas expectativas da sua aplicação
    expect(renderTime).toBeLessThan(100);
  });
});
