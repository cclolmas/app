import React, { useState, useRef, useEffect } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  LinearProgress, 
  Chip, 
  IconButton,
  Button,
  Divider,
  Collapse,
  Alert,
  Tooltip,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import MaximizeIcon from '@mui/icons-material/Maximize';
import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';
import ScheduleIcon from '@mui/icons-material/Schedule';
import MemoryIcon from '@mui/icons-material/Memory';
import SyncIcon from '@mui/icons-material/Sync';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

import { useTaskMonitor } from '../../contexts/TaskMonitorContext';
import WaitTimeSuggestion from './WaitTimeSuggestion';

/**
 * Componente para monitorar o progresso de uma tarefa de longa duração
 * como fine-tuning ou execução de LMAS
 * 
 * @param {Object} props
 * @param {string} props.taskId - ID da tarefa a ser monitorada
 * @param {boolean} props.detailed - Se deve mostrar detalhes completos
 * @param {Function} props.onClose - Função chamada quando o usuário fecha o monitor
 * @param {boolean} props.showSuggestions - Se deve mostrar sugestões de atividades
 */
const TaskProgressMonitor = ({ 
  taskId, 
  detailed = true, 
  onClose,
  showSuggestions = true,
}) => {
  const { tasks, updateTask, dismissTask, toggleMinimize } = useTaskMonitor();
  const [showLogs, setShowLogs] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(null);
  const [speedMetric, setSpeedMetric] = useState(null);
  
  const logsEndRef = useRef(null);
  const task = tasks[taskId];
  
  // Se não houver tarefa, não renderize nada
  if (!task) return null;
  
  // Calcular tempo decorrido e restante
  useEffect(() => {
    if (!task) return;
    
    const timer = setInterval(() => {
      if (task.status === 'running') {
        // Atualizar tempo decorrido
        const elapsed = Math.floor((Date.now() - task.startTime) / 1000);
        setElapsedTime(elapsed);
        
        // Calcular tempo restante se houver estimativa
        if (task.estimatedEndTime) {
          const remaining = Math.max(0, Math.floor((task.estimatedEndTime - Date.now()) / 1000));
          setRemainingTime(remaining);
        }
        
        // Calcular métricas de velocidade com base no tipo de tarefa
        if (task.type === 'fine-tuning' && task.progress > 0) {
          const tokensPerSecond = task.processedTokens ? 
            (task.processedTokens / elapsed).toFixed(1) : null;
            
          if (tokensPerSecond) {
            setSpeedMetric(`${tokensPerSecond} tokens/s`);
          }
        } else if (task.type === 'lmas' && task.processedSteps) {
          setSpeedMetric(`${task.processedSteps} passos concluídos`);
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [task]);
  
  // Auto-scroll para os logs mais recentes
  useEffect(() => {
    if (showLogs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showLogs, task?.logs]);
  
  // Se a tarefa estiver minimizada e não for detalhada, renderizar versão compacta
  if (task.minimized && detailed) {
    return (
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16, 
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: 3,
          p: 1.5
        }}
      >
        <Box sx={{ mr: 1 }}>
          {task.status === 'running' && <SyncIcon color="primary" sx={{ animation: 'spin 2s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />}
          {task.status === 'completed' && <DoneIcon color="success" />}
          {task.status === 'failed' && <ErrorIcon color="error" />}
        </Box>
        <Box sx={{ mr: 2 }}>
          <Typography variant="body2">{task.title}</Typography>
          <Typography variant="caption" color="text.secondary">
            {task.status === 'running' ? `${task.progress}% concluído` : 
             task.status === 'completed' ? 'Concluído' : 'Falhou'}
          </Typography>
        </Box>
        <IconButton 
          size="small" 
          onClick={() => toggleMinimize(taskId)}
          aria-label="Maximizar"
        >
          <MaximizeIcon />
        </IconButton>
      </Box>
    );
  }
  
  // Formatar tempo para exibição
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '---';
    
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m ${secs}s`;
  };
  
  // Determinar cor da progress bar
  const getProgressColor = () => {
    if (task.status === 'completed') return 'success';
    if (task.status === 'failed') return 'error';
    return 'primary';
  };
  
  return (
    <Paper 
      elevation={detailed ? 3 : 1}
      sx={{ 
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        border: task.status === 'failed' ? '1px solid #f44336' : undefined
      }}
    >
      {/* Cabeçalho */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: task.status === 'failed' ? '#ffebee' : undefined
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {task.type === 'fine-tuning' && <MemoryIcon sx={{ mr: 1 }} color="primary" />}
          {task.type === 'lmas' && <AutorenewIcon sx={{ mr: 1 }} color="primary" />}
          <Typography variant="h6">{task.title}</Typography>
          <Chip 
            size="small" 
            label={
              task.status === 'running' ? 'Em execução' :
              task.status === 'completed' ? 'Concluído' : 'Falhou'
            }
            color={
              task.status === 'running' ? 'primary' :
              task.status === 'completed' ? 'success' : 'error'
            }
            sx={{ ml: 2 }}
          />
        </Box>
        
        <Box>
          {detailed && (
            <IconButton 
              size="small" 
              onClick={() => toggleMinimize(taskId)}
              aria-label="Minimizar"
              sx={{ mr: 1 }}
            >
              <MinimizeIcon />
            </IconButton>
          )}
          
          {onClose && (
            <IconButton 
              size="small" 
              onClick={() => {
                if (task.status === 'running') {
                  if (window.confirm('Esta tarefa ainda está em execução. Deseja realmente fechar o monitor?')) {
                    onClose();
                  }
                } else {
                  onClose();
                }
              }}
              aria-label="Fechar"
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Box>
      
      {/* Barra de progresso */}
      <LinearProgress 
        variant={task.progress !== undefined ? "determinate" : "indeterminate"}
        value={task.progress || 0} 
        color={getProgressColor()}
        sx={{ height: 6 }}
      />
      
      {/* Detalhes de Progresso */}
      <Box sx={{ p: 2 }}>
        {/* Indicadores principais */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Progresso
            </Typography>
            <Typography variant="h6">
              {task.status === 'running' ? `${task.progress || 0}%` : 
               task.status === 'completed' ? '100%' : 
               task.status === 'failed' ? 'Erro' : '---'}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">
              Tempo Decorrido
            </Typography>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
              {formatTime(elapsedTime)}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">
              Tempo Restante (est.)
            </Typography>
            <Typography variant="h6">
              {task.status === 'running' 
                ? (remainingTime !== null ? formatTime(remainingTime) : '---')
                : '---'}
            </Typography>
          </Box>
          
          {speedMetric && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Velocidade
              </Typography>
              <Typography variant="h6">
                {speedMetric}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Mensagem de erro se houver falha */}
        {task.status === 'failed' && task.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Erro</Typography>
            <Typography variant="body2">{task.error.message || 'Erro desconhecido'}</Typography>
          </Alert>
        )}
        
        {/* Mensagem de sucesso se completado */}
        {task.status === 'completed' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Tarefa concluída com sucesso!</Typography>
            <Typography variant="body2">
              Tempo total: {formatTime(elapsedTime)}
            </Typography>
            
            {task.result && (
              <Button 
                size="small" 
                variant="outlined" 
                color="success" 
                sx={{ mt: 1 }}
                onClick={() => {
                  // Navegação para resultado ou exibição em modal
                  if (task.result.url) {
                    window.location.href = task.result.url;
                  }
                }}
              >
                Ver Resultado
              </Button>
            )}
          </Alert>
        )}
      </Box>
      
      {/* Sugestões de atividades durante o tempo de espera */}
      {detailed && showSuggestions && task.status === 'running' && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TipsAndUpdatesIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="subtitle1">Enquanto Aguarda</Typography>
          </Box>
          <WaitTimeSuggestion 
            taskType={task.type} 
            elapsedTime={elapsedTime}
            estimatedTotalTime={
              remainingTime !== null 
                ? elapsedTime + remainingTime 
                : null
            }
          />
        </Box>
      )}
      
      {/* Botão para logs detalhados */}
      {detailed && task.logs && task.logs.length > 0 && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Button 
            size="small" 
            onClick={() => setShowLogs(!showLogs)}
            variant="text"
            startIcon={showLogs ? <MinimizeIcon /> : <MaximizeIcon />}
          >
            {showLogs ? 'Ocultar Logs' : 'Mostrar Logs'}
          </Button>
          
          <Collapse in={showLogs}>
            <Paper
              variant="outlined"
              sx={{
                mt: 1,
                maxHeight: 200,
                overflow: 'auto',
                bgcolor: '#f5f5f5',
                p: 1,
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              }}
            >
              {task.logs.map((log, index) => (
                <Box 
                  key={index}
                  sx={{
                    color: log.type === 'error' ? 'error.main' : 
                           log.type === 'warning' ? 'warning.main' : 
                           log.type === 'success' ? 'success.main' : 
                           'text.primary',
                    py: 0.3,
                  }}
                >
                  <Typography variant="caption" sx={{ mr: 1, color: 'text.secondary' }}>
                    {new Date(log.time).toLocaleTimeString()}
                  </Typography>
                  {log.message}
                </Box>
              ))}
              <div ref={logsEndRef} />
            </Paper>
          </Collapse>
        </Box>
      )}
    </Paper>
  );
};

export default TaskProgressMonitor;
