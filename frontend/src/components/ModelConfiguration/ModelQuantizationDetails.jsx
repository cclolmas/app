import React from 'react';
import { 
  Box, Typography, Paper, LinearProgress, Tooltip, 
  Grid, Chip, Alert, AlertTitle, Divider, Stack 
} from '@mui/material';
import MemoryIcon from '@mui/icons-material/Memory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { estimateVramUsage } from '../../utils/modelUtils';

const ModelQuantizationDetails = ({ 
  modelConfig, 
  systemMetrics,
  expertiseLevel = 'intermediate' // 'beginner', 'intermediate', 'advanced'
}) => {
  if (!modelConfig) return null;
  
  const { modelName, modelSize, quantization, contextLength } = modelConfig;
  const { vram } = systemMetrics || { vram: { total: 0, used: 0 } };

  // Estimar uso de VRAM específico para o modelo
  const modelVramUsage = estimateVramUsage(modelSize, quantization, contextLength);
  
  // Verificar se temos VRAM suficiente
  const availableVram = vram.total - vram.used;
  const vramSufficient = modelVramUsage < availableVram;
  const vramTightFit = modelVramUsage > (availableVram * 0.8);
  
  // Definir características da quantização
  const quantizationMap = {
    'q4': {
      label: 'Q4 (4-bit)',
      description: 'Quantização agressiva que economiza VRAM significativamente',
      clImpact: 'Alta', 
      clColor: 'error',
      stability: 'Baixa',
      stabilityColor: 'error',
      speed: 'Rápida',
      speedColor: 'success',
      vramUsage: 'Baixo',
      vramColor: 'success',
      warningLevel: 'warning',
      warningText: 'Esta quantização pode gerar instabilidade e exigir mais depuração.'
    },
    'q8': {
      label: 'Q8 (8-bit)',
      description: 'Quantização moderada com bom equilíbrio',
      clImpact: 'Baixa', 
      clColor: 'success',
      stability: 'Alta',
      stabilityColor: 'success',
      speed: 'Moderada',
      speedColor: 'info',
      vramUsage: 'Médio',
      vramColor: 'info',
      warningLevel: 'info',
      warningText: 'Boa escolha para equilíbrio entre qualidade e recursos.'
    }
  };
  
  const quantDetails = quantizationMap[quantization] || {
    label: quantization,
    description: 'Configuração de quantização personalizada',
    clImpact: 'Variável', 
    clColor: 'info',
    stability: 'Variável',
    stabilityColor: 'info',
    speed: 'Variável',
    speedColor: 'info',
    vramUsage: 'Variável',
    vramColor: 'info'
  };

  // Adaptar mensagens ao nível de expertise
  const getExpertiseAdaptedMessage = () => {
    switch(expertiseLevel) {
      case 'beginner':
        return quantization === 'q4' ? 
          'Para iniciantes, recomendamos Q8 para maior estabilidade e menos frustrações durante o aprendizado.' :
          'Boa escolha para iniciantes! Q8 oferece maior estabilidade, facilitando o aprendizado.';
      case 'advanced':
        return quantization === 'q4' ?
          'Você pode extrair o máximo do Q4 gerenciando suas instabilidades e aplicando técnicas avançadas de prompt engineering.' :
          'Para seu nível de expertise, Q4 poderia oferecer mais eficiência com o devido cuidado na validação.';
      default: // intermediate
        return quantization === 'q4' ?
          'Esta configuração exigirá atenção extra para validar resultados e tratar instabilidades.' :
          'Bom equilíbrio entre eficiência e estabilidade para seu nível de experiência.';
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Configuração de Quantização do Modelo
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Chip 
                label={quantDetails.label} 
                color={quantization === 'q4' ? 'warning' : 'primary'}
                sx={{ mr: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {quantDetails.description}
              </Typography>
            </Box>
            
            <Alert 
              severity={quantDetails.warningLevel} 
              sx={{ mt: 2, mb: 3 }}
              icon={quantization === 'q4' ? <WarningAmberIcon /> : <CheckCircleOutlineIcon />}
            >
              <AlertTitle>{quantization === 'q4' ? 'Atenção ao Trade-off CL-CompL' : 'Configuração Balanceada'}</AlertTitle>
              {quantDetails.warningText}
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  {getExpertiseAdaptedMessage()}
                </Typography>
              </Box>
            </Alert>
            
            <Divider sx={{ my: 2 }} />
            
            <Stack spacing={2}>
              {/* Uso estimado de VRAM */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Uso estimado de VRAM
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">
                    {(modelVramUsage / 1024 / 1024 / 1024).toFixed(1)} GB de {(availableVram / 1024 / 1024 / 1024).toFixed(1)} GB disponível
                  </Typography>
                  {!vramSufficient && (
                    <Chip 
                      label="Insuficiente" 
                      color="error" 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  )}
                  {vramSufficient && vramTightFit && (
                    <Chip 
                      label="Limite" 
                      color="warning" 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
                <Tooltip title={`${((modelVramUsage / availableVram) * 100).toFixed(1)}% da VRAM disponível`}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((modelVramUsage / availableVram) * 100, 100)} 
                    color={!vramSufficient ? 'error' : vramTightFit ? 'warning' : 'success'}
                    sx={{ height: 8, borderRadius: 5 }}
                  />
                </Tooltip>
              </Box>
              
              {!vramSufficient && (
                <Alert severity="error">
                  Este modelo provavelmente não funcionará com a VRAM disponível. Considere um modelo menor ou uma quantização mais agressiva.
                </Alert>
              )}
            </Stack>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" gutterBottom>
              Impacto da Quantização
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Stack spacing={1.5}>
                {/* Impacto na Carga Cognitiva */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PsychologyIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">Carga Cognitiva (CL):</Typography>
                  </Box>
                  <Chip 
                    label={quantDetails.clImpact} 
                    size="small"
                    color={quantDetails.clColor}
                    variant="outlined"
                  />
                </Box>
                
                {/* Estabilidade */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WarningAmberIcon fontSize="small" sx={{ 
                      mr: 1, 
                      color: quantization === 'q4' ? 'warning.main' : 'success.main' 
                    }} />
                    <Typography variant="body2">Estabilidade:</Typography>
                  </Box>
                  <Chip 
                    label={quantDetails.stability} 
                    size="small"
                    color={quantDetails.stabilityColor}
                    variant="outlined"
                  />
                </Box>
                
                {/* Velocidade */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SpeedIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="body2">Velocidade:</Typography>
                  </Box>
                  <Chip 
                    label={quantDetails.speed} 
                    size="small"
                    color={quantDetails.speedColor}
                    variant="outlined"
                  />
                </Box>
                
                {/* Uso de VRAM */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MemoryIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="body2">Uso de VRAM:</Typography>
                  </Box>
                  <Chip 
                    label={quantDetails.vramUsage} 
                    size="small"
                    color={quantDetails.vramColor}
                    variant="outlined"
                  />
                </Box>
              </Stack>
              
              <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                  Hipótese H1: A quantização Q4 reduz a Carga Computacional (CompL), mas pode aumentar 
                  significativamente a Carga Cognitiva (CL) devido à maior necessidade de depuração e validação.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ModelQuantizationDetails;
