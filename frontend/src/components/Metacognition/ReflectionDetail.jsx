import React from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Chip, Divider,
  Grid, Paper, Avatar
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MemoryIcon from '@mui/icons-material/Memory';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Componente que exibe os detalhes completos de uma reflexão
 * 
 * @param {Object} props
 * @param {Object} props.reflection - Dados da reflexão
 * @param {boolean} props.open - Se o diálogo está aberto
 * @param {Function} props.onClose - Função chamada ao fechar o diálogo
 */
const ReflectionDetail = ({ reflection, open, onClose }) => {
  if (!reflection) return null;
  
  const { taskName, taskType, userName, timestamp, questions } = reflection;
  
  // Agrupar questões por elemento de Pensamento Computacional
  const groupedQuestions = questions.reduce((acc, question) => {
    const element = question.pcElement || 'Outros';
    if (!acc[element]) {
      acc[element] = [];
    }
    acc[element].push(question);
    return acc;
  }, {});
  
  const getIconForElement = (element) => {
    switch (element.toLowerCase()) {
      case 'decomposição': return '🧩';
      case 'abstração': return '💡';
      case 'reconhecimento de padrões': return '🔍';
      case 'algoritmo': return '📋';
      case 'metacognição': return '🧠';
      default: return '📌';
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: '70vh' } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            Reflexão: {taskName}
          </Typography>
          <Button 
            startIcon={<CloseIcon />} 
            onClick={onClose}
            size="small"
          >
            Fechar
          </Button>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.light', mr: 1 }}>
              <AccountCircleIcon />
            </Avatar>
            <Typography>{userName}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={taskType === 'fine-tuning' ? 'Fine-Tuning' : 'LMAS'}
              color={taskType === 'fine-tuning' ? 'primary' : 'secondary'}
            />
            <Typography variant="body2" color="text.secondary">
              {new Date(timestamp).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
        
        {Object.entries(groupedQuestions).map(([element, elementQuestions]) => (
          <Box key={element} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ mr: 1 }}>{getIconForElement(element)}</Box>
                {element}
              </Typography>
            </Box>
            
            {elementQuestions.map((question) => (
              <Paper
                key={question.id}
                variant="outlined"
                sx={{ p: 2, mb: 2 }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  {question.text}
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {question.response}
                </Typography>
              </Paper>
            ))}
            
            {element === 'Metacognição' && (
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Chip 
                  icon={<PsychologyIcon fontSize="small" />} 
                  label="Carga Cognitiva" 
                  color="primary" 
                  variant="outlined"
                />
                <Chip 
                  icon={<MemoryIcon fontSize="small" />} 
                  label="Carga Computacional" 
                  color="secondary"
                  variant="outlined" 
                />
              </Box>
            )}
          </Box>
        ))}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
          As reflexões compartilhadas contribuem para o aprendizado coletivo sobre estratégias eficazes
          para gerenciar o equilíbrio CL-CompL.
        </Typography>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReflectionDetail;
