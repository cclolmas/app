import React from 'react';
import { Box, Typography, Paper, LinearProgress, Chip, Grid, Tooltip } from '@mui/material';
import MemoryIcon from '@mui/icons-material/Memory';
import TimerIcon from '@mui/icons-material/Timer';
import { computationalLoadContainer, resourceMeter } from './styles';

const ComputationalLoadWidget = ({ metrics, estimatedTime }) => {
  const { ram, vram, cpu, gpu } = metrics;
  
  // Função para formatar bytes em GB
  const formatMemoryToGB = (bytes) => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  
  // Função para formatar o tempo estimado
  const formatEstimatedTime = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  // Determina o nível de severidade com base no uso percentual
  const getSeverityLevel = (percentage) => {
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'primary';
  };

  // Calcula o percentual de uso
  const ramUsagePercent = (ram.used / ram.total) * 100;
  const vramUsagePercent = (vram.used / vram.total) * 100;
  
  return (
    <Paper elevation={1} sx={computationalLoadContainer}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <MemoryIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Carga Computacional (CompL)
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {/* RAM Usage */}
          <Grid item xs={12}>
            <Box sx={resourceMeter}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">RAM</Typography>
                <Typography variant="body2">
                  {formatMemoryToGB(ram.used)} / {formatMemoryToGB(ram.total)}
                </Typography>
              </Box>
              <Tooltip title={`${ramUsagePercent.toFixed(1)}% utilizado`} arrow>
                <LinearProgress 
                  variant="determinate" 
                  value={ramUsagePercent} 
                  color={getSeverityLevel(ramUsagePercent)}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Tooltip>
            </Box>
          </Grid>

          {/* VRAM Usage */}
          <Grid item xs={12}>
            <Box sx={resourceMeter}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">VRAM (GPU)</Typography>
                <Typography variant="body2">
                  {formatMemoryToGB(vram.used)} / {formatMemoryToGB(vram.total)}
                </Typography>
              </Box>
              <Tooltip title={`${vramUsagePercent.toFixed(1)}% utilizado`} arrow>
                <LinearProgress 
                  variant="determinate" 
                  value={vramUsagePercent} 
                  color={getSeverityLevel(vramUsagePercent)}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Tooltip>
            </Box>
          </Grid>

          {/* RAM Usage instead of CPU & GPU */}
          <Grid item xs={6}>
            <Tooltip title={`Utilização da RAM: ${(ram.used / ram.total * 100).toFixed(1)}%`} arrow>
              <Chip 
                icon={<MemoryIcon fontSize="small" />}
                label={`RAM: ${(ram.used / ram.total * 100).toFixed(1)}%`} 
                color={getSeverityLevel((ram.used / ram.total * 100))}
                variant="outlined"
                size="small"
              />
            </Tooltip>
          </Grid>

          <Grid item xs={6}>
            <Tooltip title={`Utilização da GPU: ${gpu.usage.toFixed(1)}%`} arrow>
              <Chip 
                icon={<MemoryIcon fontSize="small" />}
                label={`GPU: ${gpu.usage.toFixed(1)}%`} 
                color={getSeverityLevel(gpu.usage)}
                variant="outlined"
                size="small"
              />
            </Tooltip>
          </Grid>
        </Grid>

        {/* Estimated Time for Tasks */}
        {estimatedTime > 0 && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <TimerIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">
              Tempo estimado para tarefas ativas: {formatEstimatedTime(estimatedTime)}
            </Typography>
          </Box>
        )}
        
      </Box>
    </Paper>
  );
};

export default ComputationalLoadWidget;
