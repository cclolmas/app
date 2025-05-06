import { useState, useEffect } from 'react';
import ReflectionPrompt from '../Metacognition/ReflectionPrompt';
import GuidedReflection from '../Metacognition/GuidedReflection';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { Box, Button } from '@mui/material';

const LMASResult = ({ result, lmasData, onRetry }) => {
  const [showReflectionPrompt, setShowReflectionPrompt] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  // Verificar se deve mostrar o prompt de reflexão após um delay
  useEffect(() => {
    if (result && result.status === 'success') {
      // Verificar preferência do usuário sobre reflexão
      const skipReflection = localStorage.getItem('skipReflectionPrompt') === 'true';

      if (!skipReflection) {
        const timer = setTimeout(() => {
          setShowReflectionPrompt(true);
        }, 1500); // Dar tempo para o usuário ver o resultado primeiro

        return () => clearTimeout(timer);
      }
    }
  }, [result]);

  // Manipulador para iniciar reflexão
  const handleStartReflection = () => {
    setShowReflectionPrompt(false);
    setShowReflection(true);
  };

  // Manipulador para adiar reflexão
  const handlePostponeReflection = (dontAskAgain) => {
    setShowReflectionPrompt(false);

    if (dontAskAgain) {
      localStorage.setItem('skipReflectionPrompt', 'true');
    }
  };

  // Manipulador para salvar reflexão
  const handleSaveReflection = (reflectionData) => {
    console.log('Reflexão salva:', reflectionData);
    // Aqui você pode adicionar lógica adicional após salvar a reflexão
  };

  return (
    <div>
      {/* Adicionar botão para abrir reflexão manualmente */}
      {result && result.status === 'success' && (
        <Box sx={{ mt: 2 }}>
          <Button
            startIcon={<PsychologyIcon />}
            variant="outlined"
            onClick={() => setShowReflection(true)}
            sx={{ ml: 'auto' }}
          >
            Registrar Reflexão
          </Button>
        </Box>
      )}

      {/* Modal de prompt para reflexão */}
      <ReflectionPrompt
        open={showReflectionPrompt}
        onClose={() => setShowReflectionPrompt(false)}
        taskType="lmas"
        taskData={lmasData}
        onStartReflection={handleStartReflection}
        onPostponeReflection={handlePostponeReflection}
      />

      {/* Modal de reflexão guiada */}
      <GuidedReflection
        isDialog={true}
        open={showReflection}
        onClose={() => setShowReflection(false)}
        taskType="lmas"
        taskData={lmasData}
        onSave={handleSaveReflection}
      />
    </div>
  );
};

export default LMASResult;