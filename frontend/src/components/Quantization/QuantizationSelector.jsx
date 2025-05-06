import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActionArea,
  Divider, Chip, Paper, Stack, Tooltip, Alert, IconButton
} from '@mui/material';
import MemoryIcon from '@mui/icons-material/Memory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SpeedIcon from '@mui/icons-material/Speed';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import QuantizationComparison from './QuantizationComparison';
import { estimateVramUsage } from '../../utils/modelUtils';

const QuantizationSelector = ({ 
  modelSize, 
  selectedQuantization, 
  onQuantizationChange, 
  availableVram,
  contextLength = 4096 
}) => {
  const [showComparison, setShowComparison] = useState(false);
  const [vramEstimates, setVramEstimates] = useState({
    q4: 0,
    q8: 0
  });

  useEffect(() => {
    // Calcular estimativas de VRAM para diferentes níveis de quantização
    setVramEstimates({
      q4: estimateVramUsage(modelSize, 'q4', contextLength),
      q8: estimateVramUsage(modelSize, 'q8', contextLength)
    });
  }, [modelSize, contextLength]);

  // Configurações de quantização com seus impactos em CL e CompL
  const quantizationOptions = [
    {
      id: 'q8',
      name: 'Q8 (8-bit)',
      description: 'Quantização moderada com bom equilíbrio entre qualidade e uso de recursos',
      vramImpact: 'Médio',
      stabilityImpact: 'Alta estabilidade',
      clImpact: 'Baixa carga cognitiva',
      vramEstimate: vramEstimates.q8,
      speedImpact: 'Velocidade moderada',
      suitable: 'Recomendado para tarefas complexas e sensíveis à qualidade',
      warning: false,
      severity: 'success',
      trade_off: 'Equilibra precisão e uso de memória'
    },
    {
      id: 'q4',
      name: 'Q4 (4-bit)',
      description: 'Quantização agressiva que economiza recursos significativos com potencial impacto na qualidade',
      vramImpact: 'Baixo',
      stabilityImpact: 'Estabilidade reduzida',
      clImpact: 'Alta carga cognitiva',
      vramEstimate: vramEstimates.q4,
      speedImpact: 'Velocidade maior',
      suitable: 'Melhor para tarefas simples ou quando recursos são muito limitados',
      warning: true,
      severity: 'warning',
      trade_off: 'Prioriza eficiência de recursos sobre precisão'
    }
  ];

  // Verificar se o modelo vai caber na VRAM disponível com a quantização selecionada
  const getVramWarning = (option) => {
    if (!availableVram) return null;
    
    const percentUsed = (option.vramEstimate / availableVram) * 100;
    
    if (percentUsed > 95) {
      return {
        message: 'Este modelo provavelmente não caberá na sua GPU com esta configuração',
        severity: 'error'
      };
    } else if (percentUsed > 80) {
      return {
        message: 'Este modelo usará grande parte da sua VRAM disponível',
        severity: 'warning'
      };
    }
    return null;
  };

  // Verificar se a opção atual é a selecionada
  const isSelected = (optionId) => selectedQuantization === optionId;

  // Renderizar um cartão de opção de quantização
  const renderQuantizationCard = (option) => {
    const vramWarning = getVramWarning(option);
    
    return (
      <Card 
        elevation={isSelected(option.id) ? 3 : 1} 
        sx={{ 
          height: '100%',
          borderColor: isSelected(option.id) ? 'primary.main' : 'transparent',
          borderWidth: 2,
          borderStyle: 'solid',
          transition: 'all 0.3s ease',
          bgcolor: isSelected(option.id) ? 'action.selected' : 'background.paper',
          position: 'relative'
        }}
      >
        {isSelected(option.id) && (
          <Chip 
            icon={<CheckCircleIcon />} 
            label="Selecionado" 
            color="primary" 
            size="small"
            sx={{ 
              position: 'absolute',
              top: 8,
              right: 8
            }} 
          />
        )}
        
        <CardActionArea 
          onClick={() => onQuantizationChange(option.id)}
          sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
        >
          <CardContent sx={{ flexGrow: 1, pb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" component="h3">
                {option.name}
              </Typography>
              {option.warning && (
                <Tooltip title="Maior risco de instabilidade e erros">
                  <WarningAmberIcon color="warning" />
                </Tooltip>
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {option.description}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Stack spacing={1.5}>
              {/* Impacto na VRAM */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MemoryIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="body2">Uso de VRAM:</Typography>
                </Box>
                <Chip 
                  label={option.vramImpact} 
                  size="small"
                  color={option.id === 'q4' ? 'success' : 'info'}
                  variant="outlined"
                />
              </Box>
              
              {/* Impacto na CL */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PsychologyIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2">Carga Cognitiva:</Typography>
                </Box>
                <Chip 
                  label={option.clImpact} 
                  size="small"
                  color={option.id === 'q4' ? 'error' : 'success'}
                  variant="outlined"
                />
              </Box>
              
              {/* Impacto na estabilidade */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ErrorIcon fontSize="small" sx={{ mr: 1, color: option.id === 'q4' ? 'warning.main' : 'success.main' }} />
                  <Typography variant="body2">Estabilidade:</Typography>
                </Box>
                <Chip 
                  label={option.stabilityImpact} 
                  size="small"
                  color={option.id === 'q4' ? 'warning' : 'success'}
                  variant="outlined"
                />
              </Box>
              
              {/* Impacto na velocidade */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SpeedIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2">Velocidade:</Typography>
                </Box>
                <Chip 
                  label={option.speedImpact} 
                  size="small"
                  color={option.id === 'q4' ? 'success' : 'primary'}
                  variant="outlined"
                />
              </Box>
            </Stack>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" fontWeight="medium" color={`${option.severity}.main`} sx={{ mt: 1 }}>
              {option.trade_off}
            </Typography>
            
            {/* Aviso de VRAM se necessário */}
            {vramWarning && (
              <Alert severity={vramWarning.severity} sx={{ mt: 2 }} icon={<WarningAmberIcon />}>
                {vramWarning.message}
              </Alert>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Configuração de Quantização
        </Typography>
        
        <Tooltip title="Comparar opções detalhadamente">
          <IconButton onClick={() => setShowComparison(!showComparison)}>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Equilibrando CL-CompL (H1)</AlertTitle>
        A quantização reduz o uso de VRAM (CompL), mas quantizações mais agressivas (Q4) 
        podem aumentar a carga cognitiva (CL) devido à maior instabilidade e necessidade de depuração.
      </Alert>
      
      <Grid container spacing={3}>
        {quantizationOptions.map((option) => (
          <Grid item xs={12} md={6} key={option.id}>
            {renderQuantizationCard(option)}
          </Grid>
        ))}
      </Grid>
      
      {showComparison && (
        <Paper elevation={1} sx={{ mt: 4, p: 2, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Comparação Detalhada
          </Typography>
          <QuantizationComparison 
            modelSize={modelSize} 
            contextLength={contextLength} 
          />
        </Paper>
      )}
    </Box>
  );
};

export default QuantizationSelector;
