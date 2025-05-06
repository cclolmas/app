import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useError } from '../../contexts/ErrorContext';
import ErrorAlert from './ErrorAlert';

/**
 * Componente para exibir uma lista de erros ativos com opções de gerenciamento
 */
const ErrorList = () => {
  const { errors, hasErrors, dismissError, dismissAllErrors } = useError();
  
  if (!hasErrors) {
    return null;
  }
  
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h6">
          Problemas Detectados ({errors.length})
        </Typography>
        
        {errors.length > 1 && (
          <Button 
            startIcon={<ClearAllIcon />} 
            onClick={dismissAllErrors}
            color="primary"
            size="small"
          >
            Limpar Todos
          </Button>
        )}
      </Box>
      
      {errors.map((error) => (
        <ErrorAlert
          key={error.id}
          {...error}
          onClose={() => dismissError(error.id)}
        />
      ))}
    </Box>
  );
};

export default ErrorList;
