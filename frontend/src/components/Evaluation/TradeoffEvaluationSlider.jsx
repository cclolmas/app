import React from 'react';
import {
  Box,
  Slider,
  Typography,
  Grid,
  Paper
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MemoryIcon from '@mui/icons-material/Memory';
import BalanceIcon from '@mui/icons-material/Balance';

/**
 * Componente de slider para avaliação visual do trade-off entre
 * Carga Cognitiva (CL) e Carga Computacional (CompL)
 * 
 * @param {Object} props
 * @param {number} props.value - Valor atual (1-5)
 * @param {Function} props.onChange - Callback para mudança de valor
 */
const TradeoffEvaluationSlider = ({ value = 3, onChange }) => {
  const handleChange = (_, newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };
  
  const getSliderColor = () => {
    // Azul para CompL, Roxo para CL, Verde para equilíbrio
    if (value <= 2) return '#2196f3'; // CompL dominante
    if (value >= 4) return '#9c27b0'; // CL dominante
    return '#4caf50'; // Equilibrado
  };
  
  const getTradeoffLabel = () => {
    switch (value) {
      case 1:
        return 'Foco total em otimizar recursos computacionais (CompL), mesmo que aumente a carga cognitiva';
      case 2:
        return 'Prioridade para eficiência computacional, aceitando algum aumento de esforço cognitivo';
      case 3:
        return 'Equilíbrio entre recursos computacionais e esforço cognitivo (ponto ideal H3)';
      case 4:
        return 'Prioridade para reduzir esforço cognitivo, aceitando maior uso de recursos';
      case 5:
        return 'Foco total em reduzir carga cognitiva (CL), mesmo com alto consumo de recursos';
      default:
        return 'Selecione seu posicionamento no trade-off CL-CompL';
    }
  };
  
  return (
    <Paper variant="outlined" sx={{ p: 2, position: 'relative' }}>
      <Box sx={{ 
        position: 'absolute', 
        top: '-12px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        bgcolor: 'background.paper',
        px: 1
      }}>
        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
          <BalanceIcon fontSize="small" sx={{ mr: 0.5 }} />
          Trade-off CL-CompL
        </Typography>
      </Box>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={2} sx={{ textAlign: 'center' }}>
          <MemoryIcon color="primary" />
          <Typography variant="caption" display="block">
            CompL
          </Typography>
        </Grid>
        
        <Grid item xs={8}>
          <Slider
            value={value}
            min={1}
            max={5}
            step={1}
            onChange={handleChange}
            marks
            sx={{ 
              '& .MuiSlider-track': { 
                color: getSliderColor() 
              },
              '& .MuiSlider-thumb': { 
                color: getSliderColor() 
              }
            }}
          />
          
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
              mt: 1, 
              fontStyle: 'italic', 
              color: 'text.secondary',
              minHeight: '40px'
            }}
          >
            {getTradeoffLabel()}
          </Typography>
        </Grid>
        
        <Grid item xs={2} sx={{ textAlign: 'center' }}>
          <PsychologyIcon sx={{ color: '#9c27b0' }} />
          <Typography variant="caption" display="block">
            CL
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TradeoffEvaluationSlider;
