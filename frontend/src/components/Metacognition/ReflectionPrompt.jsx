import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Alert, Checkbox, FormControlLabel
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { useNavigate } from 'react-router-dom';

/**
 * Componente que apresenta um prompt para o usuário refletir após concluir uma tarefa
 * 
 * @param {Object} props
 * @param {boolean} props.open - Se o diálogo está aberto
 * @param {Function} props.onClose - Função chamada ao fechar o diálogo
 * @param {string} props.taskType - Tipo de tarefa ('fine-tuning', 'lmas')
 * @param {Object} props.taskData - Dados da tarefa concluída
 * @param {Function} props.onStartReflection - Função chamada quando o usuário decide iniciar a reflexão
 * @param {Function} props.onPostponeReflection - Função chamada quando o usuário decide adiar a reflexão
 */
const ReflectionPrompt = ({
  open,
  onClose,
  taskType,
  taskData,
  onStartReflection,
  onPostponeReflection
}) => {
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const navigate = useNavigate();
  
  const handleStartReflection = () => {
    if (onStartReflection) {
      onStartReflection();
    }
    onClose();
  };
  
  const handlePostpone = () => {
    if (onPostponeReflection) {
      onPostponeReflection(dontAskAgain);
    }
    onClose();
  };
  
  const getTaskTypeDescription = () => {
    if (taskType === 'fine-tuning') {
      return 'ajuste fino do modelo';
    } else if (taskType === 'lmas') {
      return 'execução do sistema multi-agente';
    }
    return 'tarefa';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <PsychologyIcon color="primary" sx={{ mr: 1 }} />
        Momento de Reflexão
      </DialogTitle>
      
      <DialogContent>
        <Typography paragraph>
          Parabéns pela conclusão do {getTaskTypeDescription()}!
          {taskData?.name && ` "${taskData.name}"`}
        </Typography>
        
        <Typography paragraph>
          Reservar alguns minutos para refletir sobre sua experiência pode melhorar 
          significativamente seu aprendizado. Através da metacognição (pensar sobre seu 
          próprio pensamento), você desenvolverá uma compreensão mais profunda sobre:
        </Typography>
        
        <Box component="ul" sx={{ pl: 4 }}>
          <Typography component="li" sx={{ mb: 0.5 }}>
            Como você decompôs e abordou o problema
          </Typography>
          <Typography component="li" sx={{ mb: 0.5 }}>
            Quais abstrações e estratégias você utilizou
          </Typography>
          <Typography component="li" sx={{ mb: 0.5 }}>
            Como gerenciou o equilíbrio entre carga cognitiva e computacional
          </Typography>
          <Typography component="li">
            Padrões observados durante o processo
          </Typography>
        </Box>
        
        <Alert 
          severity="info" 
          sx={{ mt: 2, mb: 2 }}
          icon={<PsychologyIcon />}
        >
          <Typography variant="body2">
            Estudos em metacognição (Zimmerman, 2002) demonstram que refletir conscientemente 
            sobre seu processo de aprendizagem consolida o conhecimento e desenvolve habilidades 
            transferíveis para novos desafios.
          </Typography>
        </Alert>
        
        <FormControlLabel
          control={
            <Checkbox 
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
              color="primary"
            />
          }
          label="Não mostrar esse lembrete novamente"
        />
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handlePostpone} color="inherit">
          Adiar
        </Button>
        <Button 
          onClick={handleStartReflection} 
          variant="contained" 
          color="primary"
        >
          Iniciar Reflexão
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReflectionPrompt;
