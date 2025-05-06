import React from 'react';
import FeedbackTester from '../../components/feedback/FeedbackTester';
import { FeedbackProvider, useFeedback } from '../../components/feedback/FeedbackContext';
import { Button, Box, Typography } from '@mui/material';

export default {
  title: 'Components/Feedback',
  component: FeedbackTester,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <FeedbackProvider>
        <Story />
      </FeedbackProvider>
    ),
  ],
};

// História básica do testador de feedback
export const FeedbackTesterStory = () => <FeedbackTester />;
FeedbackTesterStory.storyName = 'Testador de Feedback';

// Demonstração do contexto de feedback
const FeedbackContextDemo = () => {
  const { showFeedback } = useFeedback();
  
  const handleSuccess = () => {
    showFeedback({
      type: 'success',
      message: 'Operação concluída com sucesso!',
      duration: 3000,
    });
  };
  
  const handleError = () => {
    showFeedback({
      type: 'error',
      message: 'Ocorreu um erro ao processar sua solicitação.',
      duration: 5000,
    });
  };
  
  const handleWarning = () => {
    showFeedback({
      type: 'warning',
      message: 'Atenção: esta ação não pode ser desfeita.',
      duration: 4000,
    });
  };
  
  const handleInfo = () => {
    showFeedback({
      type: 'info',
      message: 'Nova versão do sistema está disponível.',
      duration: 3000,
    });
  };
  
  return (
    <Box sx={{ width: '100%', maxWidth: 500, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Demonstração do Contexto de Feedback
      </Typography>
      <Box sx={{ '& > button': { m: 1 } }}>
        <Button variant="contained" color="success" onClick={handleSuccess}>
          Sucesso
        </Button>
        <Button variant="contained" color="error" onClick={handleError}>
          Erro
        </Button>
        <Button variant="contained" color="warning" onClick={handleWarning}>
          Aviso
        </Button>
        <Button variant="contained" color="info" onClick={handleInfo}>
          Informação
        </Button>
      </Box>
    </Box>
  );
};

export const ContextDemo = () => <FeedbackContextDemo />;
ContextDemo.storyName = 'Demonstração do Contexto';

// História com simulação de latência
export const WithDelay = () => {
  return (
    <FeedbackTester 
      initialDelay={1500}
      initialMessage="Esta mensagem apareceu após um delay simulado de 1.5 segundos"
    />
  );
};
WithDelay.storyName = 'Com Delay de Rede Simulado';
