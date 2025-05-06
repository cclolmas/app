import React, { useState, useEffect } from 'react';
import { Alert, Button, Box, Typography, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

/**
 * Componente para testar diferentes tipos de feedback da UI
 * Permite avaliar tempo de resposta, visibilidade e clareza de mensagens
 */
const FeedbackTester = () => {
  const [feedback, setFeedback] = useState(null);
  const [operation, setOperation] = useState('success');
  const [delay, setDelay] = useState(0);
  const [duration, setDuration] = useState(3000);
  const [message, setMessage] = useState('Operação realizada com sucesso!');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    triggered: 0,
    avgResponseTime: 0,
    totalResponseTime: 0,
  });

  const clearFeedback = () => {
    setFeedback(null);
  };

  const triggerFeedback = async () => {
    clearFeedback();
    setIsLoading(true);
    
    const startTime = performance.now();
    
    // Simular delay de rede/processamento
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    setFeedback({
      type: operation,
      message: message,
      timestamp: new Date().toISOString(),
    });
    
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    // Atualizar métricas
    setMetrics(prev => ({
      triggered: prev.triggered + 1,
      totalResponseTime: prev.totalResponseTime + responseTime,
      avgResponseTime: (prev.totalResponseTime + responseTime) / (prev.triggered + 1)
    }));
    
    setIsLoading(false);
    
    // Auto-limpar após a duração especificada
    if (duration > 0) {
      setTimeout(() => {
        clearFeedback();
      }, duration);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Testador de Feedback UI
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Tipo de Operação</InputLabel>
          <Select
            value={operation}
            label="Tipo de Operação"
            onChange={(e) => setOperation(e.target.value)}
          >
            <MenuItem value="success">Sucesso</MenuItem>
            <MenuItem value="error">Erro</MenuItem>
            <MenuItem value="warning">Aviso</MenuItem>
            <MenuItem value="info">Informação</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          margin="normal"
          label="Mensagem de Feedback"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        
        <TextField
          fullWidth
          margin="normal"
          type="number"
          label="Delay de Resposta (ms)"
          value={delay}
          onChange={(e) => setDelay(Number(e.target.value))}
        />
        
        <TextField
          fullWidth
          margin="normal"
          type="number"
          label="Duração do Alerta (ms)"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          helperText="0 para não ocultar automaticamente"
        />
      </Box>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={triggerFeedback}
        disabled={isLoading}
        fullWidth
      >
        {isLoading ? "Processando..." : "Testar Feedback"}
      </Button>
      
      <Box sx={{ mt: 3, mb: 3 }}>
        {feedback && (
          <Alert 
            severity={feedback.type} 
            onClose={duration === 0 ? clearFeedback : undefined}
            sx={{ mb: 2 }}
          >
            {feedback.message}
          </Alert>
        )}
      </Box>
      
      <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6">Métricas de Desempenho</Typography>
        <Typography variant="body2">Feedbacks disparados: {metrics.triggered}</Typography>
        <Typography variant="body2">
          Tempo médio de resposta: {metrics.avgResponseTime.toFixed(2)} ms
        </Typography>
      </Box>
    </Box>
  );
};

export default FeedbackTester;
