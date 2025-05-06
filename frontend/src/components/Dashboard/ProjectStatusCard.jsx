import React from 'react';
import { 
  Box, Typography, Paper, Divider, Chip, 
  Card, CardContent, Stack, Alert, Tooltip
} from '@mui/material';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import BalanceIcon from '@mui/icons-material/Balance';
import RecommendIcon from '@mui/icons-material/Recommend';
import { projectStatusCard } from './styles';

const ProjectStatusCard = ({ projectData, systemMetrics }) => {
  // Avalia se estamos próximos ao "ponto ideal" H3 com base nos dados atuais
  const evaluateOptimalPoint = () => {
    if (!projectData || !systemMetrics) return null;
    
    const vramUsagePercent = (systemMetrics.vram.used / systemMetrics.vram.total) * 100;
    
    // Condições simplificadas para ilustrar o conceito de "ponto ideal"
    if (vramUsagePercent > 85) {
      return {
        status: 'high-compl',
        message: 'Carga computacional (CompL) alta pode estar prejudicando o aprendizado. Considere reduzir a complexidade do modelo ou usar quantização mais agressiva (Q4).',
        severity: 'warning'
      };
    } else if (vramUsagePercent < 30 && projectData.modelConfig?.quantization === 'Q4') {
      return {
        status: 'low-compl',
        message: 'Recursos subutilizados. Considere aumentar a qualidade do modelo (Q8) para melhorar resultados sem prejudicar a carga cognitiva.',
        severity: 'info'
      };
    } else if (vramUsagePercent >= 40 && vramUsagePercent <= 75) {
      return {
        status: 'optimal',
        message: 'Você está próximo ao ponto ideal de equilíbrio CL-CompL (H3). Boa utilização dos recursos computacionais sem sobrecarga.',
        severity: 'success'
      };
    }
    
    return {
      status: 'neutral',
      message: 'Monitore o equilíbrio entre carga cognitiva e computacional conforme avança no projeto.',
      severity: 'info'
    };
  };

  const optimalPointEvaluation = evaluateOptimalPoint();

  return (
    <Card elevation={2} sx={projectStatusCard}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Status Atual
        </Typography>
        
        {/* Model Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Modelo em uso:
          </Typography>
          
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Chip 
              icon={<ModelTrainingIcon />} 
              label={projectData?.modelConfig?.name || 'Nenhum modelo carregado'}
              color="primary"
              variant="outlined"
              size="small" 
            />
            
            {projectData?.modelConfig?.quantization && (
              <Tooltip title="Nível de quantização" arrow>
                <Chip 
                  label={projectData.modelConfig.quantization} 
                  color={projectData.modelConfig.quantization === "Q4" ? "warning" : "success"}
                  size="small"
                />
              </Tooltip>
            )}
          </Stack>
          
          {projectData?.modelConfig && (
            <Typography variant="caption" color="text.secondary">
              Parâmetros: {projectData.modelConfig.parameters} • 
              Contexto: {projectData.modelConfig.contextSize} tokens
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* CL-CompL Balance Status */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <BalanceIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }}/>
            <Typography variant="body2" fontWeight="medium">
              Equilíbrio CL-CompL
            </Typography>
          </Box>
          
          {optimalPointEvaluation && (
            <Alert 
              severity={optimalPointEvaluation.severity} 
              icon={optimalPointEvaluation.status === 'optimal' ? <RecommendIcon /> : undefined}
              sx={{ mt: 1 }}
            >
              {optimalPointEvaluation.message}
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectStatusCard;
