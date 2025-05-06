import React from 'react';
import { Box, Typography, Slider, Paper, Rating, Grid, Tooltip, Stack } from '@mui/material';
import BrainIcon from '@mui/icons-material/Psychology';
import { cognitiveLoadContainer, sliderMarks, ratingLabels } from './styles';

const CognitiveLoadWidget = ({ value, onChange, history = [] }) => {
  // Slider marks para escala SEQ de Paas
  const marks = [
    { value: 1, label: 'Muito baixo' },
    { value: 2, label: 'Baixo' },
    { value: 3, label: 'Médio' },
    { value: 4, label: 'Alto' },
    { value: 5, label: 'Muito alto' }
  ];

  // Função para converter valor numérico em texto explicativo
  const getEffortDescription = (val) => {
    switch(val) {
      case 1: return "Tarefa muito simples, quase sem esforço mental";
      case 2: return "Pouco esforço mental necessário";
      case 3: return "Esforço mental moderado";
      case 4: return "Esforço mental significativo necessário";
      case 5: return "Esforço mental extremo, no limite da minha capacidade";
      default: return "Selecione seu nível de esforço mental";
    }
  };

  return (
    <Paper elevation={1} sx={cognitiveLoadContainer}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BrainIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Carga Cognitiva (CL)
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Como você avalia seu esforço mental atual para este projeto?
        </Typography>

        <Box sx={{ mt: 3, mb: 1 }}>
          <Rating
            name="cognitive-load-rating"
            value={value}
            onChange={(event, newValue) => onChange(newValue || 3)}
            max={5}
            size="large"
            sx={{ mb: 1 }}
          />
          
          <Tooltip title={getEffortDescription(value)} arrow placement="top">
            <Typography 
              variant="body1" 
              fontWeight="medium"
              sx={{ mt: 1, color: value > 3 ? 'warning.main' : 'info.main' }}
            >
              Nível atual: {marks.find(mark => mark.value === value)?.label || 'Médio'}
            </Typography>
          </Tooltip>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {getEffortDescription(value)}
          </Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" color="text.secondary">
            Baseado na escala de esforço subjetivo (SEQ) de Paas et al., 2003
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default CognitiveLoadWidget;
