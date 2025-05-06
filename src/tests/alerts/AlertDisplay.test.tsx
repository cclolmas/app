import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Toast } from '../../components/ui/Toast'; // Ajuste o caminho conforme necessário
import { Modal } from '../../components/ui/Modal'; // Ajuste o caminho conforme necessário
import AlertTestComponent from './AlertTestComponent';

describe('Alert and Error Display Tests', () => {
  test('Toast should appear when unstable output is detected', async () => {
    render(<AlertTestComponent triggerType="unstableOutput" />);
    
    // Clique no botão para simular a detecção de saída instável
    fireEvent.click(screen.getByText('Simular saída instável'));
    
    // Verifica se o Toast com a mensagem aparece
    await waitFor(() => {
      expect(screen.getByText('Saída instável detectada')).toBeInTheDocument();
    });
  });

  test('Error Modal should appear on connection error', async () => {
    render(<AlertTestComponent triggerType="connectionError" />);
    
    // Clique no botão para simular erro de conexão
    fireEvent.click(screen.getByText('Simular erro de conexão'));
    
    // Verifica se o Modal com a mensagem de erro aparece
    await waitFor(() => {
      expect(screen.getByText('Erro de conexão')).toBeInTheDocument();
      expect(screen.getByText('Não foi possível conectar ao servidor. Tente novamente mais tarde.')).toBeInTheDocument();
    });
  });

  test('Toast notification should disappear after timeout', async () => {
    // Defina o tempo de exibição como curto para o teste
    render(<AlertTestComponent triggerType="unstableOutput" toastDuration={100} />);
    
    fireEvent.click(screen.getByText('Simular saída instável'));
    
    // Verifica se aparece
    await waitFor(() => {
      expect(screen.getByText('Saída instável detectada')).toBeInTheDocument();
    });
    
    // Verifica se desaparece após o timeout
    await waitFor(() => {
      expect(screen.queryByText('Saída instável detectada')).not.toBeInTheDocument();
    }, { timeout: 200 });
  });

  test('Modal should close when close button is clicked', async () => {
    render(<AlertTestComponent triggerType="connectionError" />);
    
    fireEvent.click(screen.getByText('Simular erro de conexão'));
    
    await waitFor(() => {
      expect(screen.getByText('Erro de conexão')).toBeInTheDocument();
    });
    
    // Clica no botão de fechar
    fireEvent.click(screen.getByRole('button', { name: /fechar/i }));
    
    // Verifica se o modal foi fechado
    await waitFor(() => {
      expect(screen.queryByText('Erro de conexão')).not.toBeInTheDocument();
    });
  });
});
