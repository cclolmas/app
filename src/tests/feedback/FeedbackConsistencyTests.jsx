import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FeedbackProvider } from '../../components/feedback/FeedbackContext';

// Lista de ações comuns do usuário e seus feedbacks esperados
const userActionFeedbacks = [
  {
    actionType: 'form_submission_success',
    expectedFeedback: {
      type: 'success',
      messagePattern: /(?:enviado|salvo|criado|atualizado) com sucesso/i,
      expectedDuration: 3000,
    },
  },
  {
    actionType: 'form_submission_error',
    expectedFeedback: {
      type: 'error',
      messagePattern: /(?:erro|falha) (?:ao|na) (?:enviar|salvar|criar|atualizar)/i,
      expectedDuration: 5000,
    },
  },
  {
    actionType: 'data_loading_error',
    expectedFeedback: {
      type: 'error',
      messagePattern: /(?:erro|falha) (?:ao|na) (?:carregar|obter) (?:dados|informações)/i,
      expectedDuration: 5000,
    },
  },
  {
    actionType: 'authentication_success',
    expectedFeedback: {
      type: 'success',
      messagePattern: /(?:login|autenticado|conectado) com sucesso/i,
      expectedDuration: 3000,
    },
  },
  {
    actionType: 'authentication_error',
    expectedFeedback: {
      type: 'error',
      messagePattern: /(?:falha|erro) (?:na autenticação|ao autenticar|no login)/i,
      expectedDuration: 5000,
    },
  },
  {
    actionType: 'delete_confirmation',
    expectedFeedback: {
      type: 'success',
      messagePattern: /(?:excluído|removido|deletado) com sucesso/i,
      expectedDuration: 3000,
    },
  },
  {
    actionType: 'validation_error',
    expectedFeedback: {
      type: 'warning',
      messagePattern: /(?:erro|falha) de validação|campos (?:inválidos|obrigatórios|incorretos)/i,
      expectedDuration: 4000,
    },
  },
  {
    actionType: 'info_notification',
    expectedFeedback: {
      type: 'info',
      messagePattern: /./i, // Qualquer texto
      expectedDuration: 3000,
    },
  },
];

// Mock do observador de feedback para capturar feedbacks exibidos
const createFeedbackObserver = () => {
  const feedbacks = [];
  
  return {
    capture: (feedback) => {
      feedbacks.push({
        ...feedback,
        timestamp: Date.now(),
      });
    },
    getFeedbacks: () => feedbacks,
    reset: () => {
      feedbacks.length = 0;
    },
  };
};

// Componente para testar consistência de feedback
export const FeedbackConsistencyTester = ({ onFeedbackCaptured }) => {
  const simulateUserActions = (components) => {
    // Implementação específica para testar cada componente
    // Esta função seria implementada para cada grupo de componentes
  };
  
  const analyzeConsistency = (capturedFeedbacks) => {
    const results = {
      consistentTypes: true,
      consistentDurations: true,
      consistentMessages: true,
      inconsistencies: [],
    };
    
    // Agrupar feedbacks por tipo de ação
    const feedbacksByAction = {};
    capturedFeedbacks.forEach(feedback => {
      if (!feedbacksByAction[feedback.actionType]) {
        feedbacksByAction[feedback.actionType] = [];
      }
      feedbacksByAction[feedback.actionType].push(feedback);
    });
    
    // Verificar consistência para cada tipo de ação
    Object.entries(feedbacksByAction).forEach(([actionType, feedbacks]) => {
      if (feedbacks.length <= 1) return; // Precisa de mais de um para comparar
      
      const firstFeedback = feedbacks[0];
      
      // Verificar tipo
      const inconsistentTypes = feedbacks.filter(f => 
        f.type !== firstFeedback.type
      );
      
      if (inconsistentTypes.length > 0) {
        results.consistentTypes = false;
        results.inconsistencies.push({
          actionType,
          issue: 'type',
          expected: firstFeedback.type,
          found: inconsistentTypes.map(f => f.type),
        });
      }
      
      // Verificar duração
      const inconsistentDurations = feedbacks.filter(f => 
        f.duration !== firstFeedback.duration
      );
      
      if (inconsistentDurations.length > 0) {
        results.consistentDurations = false;
        results.inconsistencies.push({
          actionType,
          issue: 'duration',
          expected: firstFeedback.duration,
          found: inconsistentDurations.map(f => f.duration),
        });
      }
      
      // Verificar padrões de mensagem com uma abordagem mais flexível
      const expectedFeedback = userActionFeedbacks.find(uaf => 
        uaf.actionType === actionType
      )?.expectedFeedback;
      
      if (expectedFeedback?.messagePattern) {
        const inconsistentMessages = feedbacks.filter(f => 
          !expectedFeedback.messagePattern.test(f.message)
        );
        
        if (inconsistentMessages.length > 0) {
          results.consistentMessages = false;
          results.inconsistencies.push({
            actionType,
            issue: 'message',
            expected: expectedFeedback.messagePattern.toString(),
            found: inconsistentMessages.map(f => f.message),
          });
        }
      }
    });
    
    return results;
  };
  
  return {
    simulateUserActions,
    analyzeConsistency,
  };
};

// Teste de consistência de feedback para componentes específicos
describe('Feedback Consistency Tests', () => {
  test('form submissions show consistent feedback', async () => {
    // Mock de componentes de formulário
    const FormWithFeedback = ({ onSubmit, submitStatus }) => {
      return (
        <div>
          <form data-testid="test-form" onSubmit={onSubmit}>
            <input data-testid="input-field" />
            <button type="submit">Submit</button>
          </form>
          {submitStatus === 'success' && 
            <div role="alert" data-testid="success-feedback">Formulário enviado com sucesso!</div>}
          {submitStatus === 'error' && 
            <div role="alert" data-testid="error-feedback">Erro ao enviar formulário.</div>}
        </div>
      );
    };
    
    const observer = createFeedbackObserver();
    
    // Primeiro teste - sucesso
    const { rerender } = render(
      <FormWithFeedback 
        onSubmit={(e) => {
          e.preventDefault();
          observer.capture({
            actionType: 'form_submission_success',
            type: 'success',
            message: 'Formulário enviado com sucesso!',
            duration: 3000,
          });
        }} 
        submitStatus="pending"
      />
    );
    
    fireEvent.submit(screen.getByTestId('test-form'));
    rerender(<FormWithFeedback submitStatus="success" />);
    
    // Aguardar o feedback de sucesso
    expect(await screen.findByTestId('success-feedback')).toBeInTheDocument();
    
    // Segundo teste - outro formulário sucesso
    rerender(
      <FormWithFeedback 
        onSubmit={(e) => {
          e.preventDefault();
          observer.capture({
            actionType: 'form_submission_success',
            type: 'success',
            message: 'Dados salvos com sucesso!', // Mensagem diferente mas deve seguir o padrão
            duration: 3000,
          });
        }} 
        submitStatus="pending"
      />
    );
    
    fireEvent.submit(screen.getByTestId('test-form'));
    
    // Terceiro teste - formulário erro
    rerender(
      <FormWithFeedback 
        onSubmit={(e) => {
          e.preventDefault();
          observer.capture({
            actionType: 'form_submission_error',
            type: 'error',
            message: 'Erro ao enviar formulário.',
            duration: 5000,
          });
        }} 
        submitStatus="pending"
      />
    );
    
    fireEvent.submit(screen.getByTestId('test-form'));
    rerender(<FormWithFeedback submitStatus="error" />);
    
    // Aguardar o feedback de erro
    expect(await screen.findByTestId('error-feedback')).toBeInTheDocument();
    
    // Analisar consistência
    const tester = FeedbackConsistencyTester({});
    const results = tester.analyzeConsistency(observer.getFeedbacks());
    
    expect(results.consistentTypes).toBe(true);
    expect(results.consistentDurations).toBe(true);
    expect(results.consistentMessages).toBe(true);
    expect(results.inconsistencies).toHaveLength(0);
  });

  // Outros testes de consistência para diferentes ações do usuário
  // podem ser adicionados aqui
});

export default FeedbackConsistencyTester;
