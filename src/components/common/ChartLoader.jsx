import React from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

/**
 * A consistent loader/error display component for charts
 */
const ChartLoader = ({ 
  isLoading, 
  error, 
  isEmpty, 
  height = 300,
  loadingText = "Carregando dados...",
  emptyText = "Sem dados disponíveis",
  errorText
}) => {
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          height,
          gap: 2
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          {loadingText}
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          height,
          gap: 2
        }}
      >
        <ReportProblemIcon color="error" fontSize="large" />
        <Typography color="error" align="center" sx={{ maxWidth: '80%' }}>
          {errorText || `Erro ao carregar o gráfico: ${error.message || error}`}
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => window.location.reload()}
          size="small"
        >
          Tentar Novamente
        </Button>
      </Box>
    );
  }
  
  if (isEmpty) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          height,
          gap: 2
        }}
      >
        <InfoIcon color="info" fontSize="large" />
        <Typography color="text.secondary" align="center">
          {emptyText}
        </Typography>
      </Box>
    );
  }
  
  return null;
};

export default ChartLoader;
