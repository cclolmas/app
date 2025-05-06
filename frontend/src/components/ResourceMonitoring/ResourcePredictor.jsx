import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  Divider,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import MemoryIcon from '@mui/icons-material/Memory';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import TimerIcon from '@mui/icons-material/Timer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SyncIcon from '@mui/icons-material/Sync';
import SpeedIcon from '@mui/icons-material/Speed';
import PsychologyIcon from '@mui/icons-material/Psychology';
import LabelImportantIcon from '@mui/icons-material/LabelImportant';

import { 
  evaluateViability,
  generateOptimizationSuggestions
} from '../../utils/resourceEstimator';

/**
 * Componente que prevê uso de recursos e fornece alertas e sugestões para otimização
 * 
 * @param {Object} props
 * @param {Object} props.taskParams - Parâmetros da tarefa (fine-tuning ou LMAS)
 * @param {Object} props.systemResources - Recursos disponíveis do sistema
 * @param {string} props.taskType - Tipo de tarefa ('fine-tuning' ou 'lmas')
 * @param {Function} props.onSuggestionApply - Função chamada quando uma sugestão é aplicada
 * @param {boolean} props.compact - Exibir versão compacta do componente
 */
const ResourcePredictor = ({
  taskParams,
  systemResources,
  taskType,
  onSuggestionApply,
  compact = false
}) => {
  const [expanded, setExpanded] = useState(true);
  const [suggestionsExpanded, setSuggestionsExpanded] = useState(true);
  const [viabilityResult, setViabilityResult] = useState(null);
  
  // Calcular viabilidade e sugestões quando parâmetros ou recursos mudam
  useEffect(() => {
    if (taskParams && systemResources) {
      const result = evaluateViability(taskParams, systemResources, taskType);
      setViabilityResult(result);
    }
  }, [taskParams, systemResources, taskType]);
  
  // Formatar bytes para exibição legível
  const formatBytes = (bytes, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  // Formatar tempo estimado
  const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)} segundos`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutos`;
    return `${Math.round(seconds / 3600 * 10) / 10} horas`;
  };
  
  // Determinar cor baseada no nível de utilização
  const getUtilizationColor = (utilization) => {
    if (utilization > 0.9) return 'error';
    if (utilization > 0.7) return 'warning';
    return 'success';
  };
  
  // Determinar ícone baseado na viabilidade
  const getStatusIcon = () => {
    if (!viabilityResult) return <SyncIcon />;
    if (!viabilityResult.viable) return <ErrorIcon color="error" />;
    if (viabilityResult.performanceCategory === 'risky') return <WarningIcon color="warning" />;
    return <CheckCircleIcon color="success" />;
  };
  
  // Determinar título do status
  const getStatusTitle = () => {
    if (!viabilityResult) return 'Analisando...';
    if (!viabilityResult.viable) return 'Não viável com recursos atuais';
    if (viabilityResult.performanceCategory === 'risky') return 'Viável, mas recursos limitados';
    if (viabilityResult.performanceCategory === 'high') return 'Viável, com utilização alta';
    return 'Viável, recursos adequados';
  };
  
  // Determinar cor do status
  const getStatusSeverity = () => {
    if (!viabilityResult) return 'info';
    if (!viabilityResult.viable) return 'error';
    if (viabilityResult.performanceCategory === 'risky') return 'warning';
    return 'success';
  };

  // Se não há dados para previsão
  if (!viabilityResult) {
    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
          <SyncIcon sx={{ mr: 1 }} />
          Analisando requisitos de recursos...
        </Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Paper>
    );
  }
  
  // Versão compacta
  if (compact) {
    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
            {getStatusIcon()}
            <Box sx={{ ml: 1 }}>Previsão de Recursos</Box>
          </Typography>
          
          <Chip 
            label={getStatusTitle()} 
            color={getStatusSeverity()}
            size="small"
            variant="outlined"
          />
        </Box>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                VRAM Estimada:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {formatBytes(viabilityResult.estimatedVram)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  ({(viabilityResult.vramUtilization * 100).toFixed(0)}% disponível)
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(viabilityResult.vramUtilization * 100, 100)}
                color={getUtilizationColor(viabilityResult.vramUtilization)}
                sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tempo Estimado:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimerIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {formatTime(viabilityResult.estimatedTime)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {!viabilityResult.viable && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Esta configuração excede os recursos disponíveis. Veja sugestões para otimização.
          </Alert>
        )}
        
        {viabilityResult.suggestions.length > 0 && (
          <Button 
            size="small" 
            sx={{ mt: 1 }}
            onClick={() => setExpanded(!expanded)}
            startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {expanded ? 'Ocultar sugestões' : `Ver ${viabilityResult.suggestions.length} sugestões de otimização`}
          </Button>
        )}
        
        <Collapse in={expanded && viabilityResult.suggestions.length > 0}>
          <Box sx={{ mt: 1 }}>
            {viabilityResult.suggestions.slice(0, 2).map((suggestion, index) => (
              <Alert 
                key={suggestion.id} 
                severity={suggestion.clComplBalanced ? "info" : "warning"}
                icon={suggestion.clComplBalanced ? <LightbulbIcon /> : <PsychologyIcon />}
                action={
                  onSuggestionApply && (
                    <Button 
                      size="small" 
                      onClick={() => onSuggestionApply(suggestion)}
                      color="inherit"
                    >
                      Aplicar
                    </Button>
                  )
                }
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" fontWeight="medium">
                  {suggestion.title}
                </Typography>
                <Typography variant="caption">
                  {suggestion.description}
                </Typography>
              </Alert>
            ))}
            
            {viabilityResult.suggestions.length > 2 && (
              <Button 
                size="small"
                color="primary"
                sx={{ mt: 0.5 }}
                onClick={() => setSuggestionsExpanded(!suggestionsExpanded)}
              >
                {suggestionsExpanded 
                  ? 'Mostrar menos' 
                  : `+${viabilityResult.suggestions.length - 2} sugestões`}
              </Button>
            )}
            
            <Collapse in={suggestionsExpanded && viabilityResult.suggestions.length > 2}>
              {viabilityResult.suggestions.slice(2).map((suggestion) => (
                <Alert 
                  key={suggestion.id} 
                  severity={suggestion.clComplBalanced ? "info" : "warning"}
                  icon={suggestion.clComplBalanced ? <LightbulbIcon /> : <PsychologyIcon />}
                  action={
                    onSuggestionApply && (
                      <Button 
                        size="small" 
                        onClick={() => onSuggestionApply(suggestion)}
                        color="inherit"
                      >
                        Aplicar
                      </Button>
                    )
                  }
                  sx={{ mb: 1, mt: 1 }}
                >
                  <Typography variant="body2" fontWeight="medium">
                    {suggestion.title}
                  </Typography>
                  <Typography variant="caption">
                    {suggestion.description}
                  </Typography>
                </Alert>
              ))}
            </Collapse>
          </Box>
        </Collapse>
      </Paper>
    );
  }
  
  // Versão completa com detalhes
  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <MemoryIcon sx={{ mr: 1 }} />
          Previsão de Recursos Computacionais
        </Typography>
        
        <Chip 
          label={getStatusTitle()} 
          color={getStatusSeverity()}
          size="medium"
          icon={getStatusIcon()}
        />
      </Box>
      
      <Alert severity={getStatusSeverity()} sx={{ mb: 3 }}>
        <AlertTitle>
          {!viabilityResult.viable 
            ? 'Esta configuração excede os recursos disponíveis' 
            : viabilityResult.performanceCategory === 'risky'
              ? 'Recursos próximos do limite' 
              : 'Recursos adequados para esta tarefa'}
        </AlertTitle>
        {!viabilityResult.viable ? (
          <Typography variant="body2">
            Com base nas estimativas, sua configuração necessita mais recursos do que o disponível.
            Veja as sugestões de otimização abaixo para tornar a tarefa viável.
          </Typography>
        ) : viabilityResult.performanceCategory === 'risky' ? (
          <Typography variant="body2">
            A configuração atual é tecnicamente viável, mas está próxima do limite dos recursos disponíveis.
            Considere as sugestões de otimização para melhorar a estabilidade.
          </Typography>
        ) : (
          <Typography variant="body2">
            Recursos suficientes para executar a tarefa com a configuração atual.
            {viabilityResult.vramUtilization > 0.5 && " Ainda assim, monitor o uso de VRAM durante a execução."}
          </Typography>
        )}
      </Alert>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Recursos Computacionais Estimados
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">
                  VRAM Necessária:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatBytes(viabilityResult.estimatedVram)}
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    ({formatBytes(systemResources.vram)} disponível)
                  </Typography>
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(viabilityResult.vramUtilization * 100, 100)}
                color={getUtilizationColor(viabilityResult.vramUtilization)}
                sx={{ height: 8, borderRadius: 3 }}
              />
              {!viabilityResult.vramViable && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                  Excede a VRAM disponível em {formatBytes(viabilityResult.estimatedVram - systemResources.vram)}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">
                  RAM Necessária:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatBytes(viabilityResult.estimatedRam)}
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    ({formatBytes(systemResources.ram)} disponível)
                  </Typography>
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(viabilityResult.ramUtilization * 100, 100)}
                color={getUtilizationColor(viabilityResult.ramUtilization)}
                sx={{ height: 8, borderRadius: 3 }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
              <TimerIcon sx={{ mr: 1.5 }} />
              <Box>
                <Typography variant="body2" gutterBottom>
                  Tempo estimado de execução:
                </Typography>
                <Typography variant="h6">
                  {formatTime(viabilityResult.estimatedTime)}
                </Typography>
                {taskType === 'lmas' && (
                  <Typography variant="caption" color="text.secondary">
                    Varia com base no número e complexidade das interações entre agentes
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
          
          {/* Trade-off CL-CompL */}
          <Box sx={{ mt: 3 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <PsychologyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">
                  Relação Carga Cognitiva - Carga Computacional (H3)
                </Typography>
              </Box>
              
              <Typography variant="body2" paragraph>
                {taskType === 'fine-tuning' ? (
                  <>
                    A configuração {!viabilityResult.viable ? 'excede' : 'utiliza'} {(viabilityResult.vramUtilization * 100).toFixed(0)}% da 
                    VRAM disponível. {!viabilityResult.viable || viabilityResult.performanceCategory === 'risky' ? 
                      'Otimizações como redução de rank LoRA ou quantização Q4 reduzem CompL, mas podem aumentar CL devido à maior instabilidade (H1).' :
                      'Esta configuração parece próxima do "ponto ideal" (H3) para equilíbrio entre recursos computacionais e carga cognitiva.'}
                  </>
                ) : (
                  <>
                    Sistemas Multi-agente impõem alta carga computacional (CompL) e cognitiva (CL) simultaneamente (H2).
                    {!viabilityResult.viable ? 
                      ' Esta configuração não é viável com os recursos atuais e requer ajustes.' :
                      ' Busque o "ponto ideal" (H3) entre recursos e complexidade.'}
                  </>
                )}
              </Typography>
            </Paper>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <LightbulbIcon sx={{ mr: 1 }} color="info" />
            Sugestões de Otimização
          </Typography>
          
          {viabilityResult.suggestions.length === 0 ? (
            <Alert severity="success" icon={<CheckCircleIcon />}>
              Sua configuração parece otimizada para os recursos disponíveis.
            </Alert>
          ) : (
            <List sx={{ bgcolor: 'background.paper' }} component={Paper} variant="outlined">
              {viabilityResult.suggestions.map((suggestion) => (
                <React.Fragment key={suggestion.id}>
                  <ListItem
                    alignItems="flex-start"
                    secondaryAction={
                      onSuggestionApply && (
                        <Button 
                          variant={suggestion.impact === 'high' ? "contained" : "outlined"}
                          color={suggestion.clComplBalanced ? "primary" : "warning"}
                          size="small"
                          onClick={() => onSuggestionApply(suggestion)}
                          sx={{ mt: 1 }}
                        >
                          Aplicar
                        </Button>
                      )
                    }
                  >
                    <ListItemIcon>
                      {suggestion.clComplBalanced ? (
                        <SpeedIcon color="info" />
                      ) : (
                        <PsychologyIcon color="warning" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          {suggestion.title}
                          {suggestion.impact === 'high' && (
                            <Chip 
                              label="Alto impacto" 
                              size="small" 
                              color="success" 
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{ mt: 0.5 }}
                          >
                            {suggestion.description}
                          </Typography>
                          
                          {suggestion.reduction && (
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                              <LabelImportantIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                              <Typography variant="body2" color="success.main">
                                Economia: {formatBytes(suggestion.reduction)} de VRAM
                              </Typography>
                            </Box>
                          )}
                          
                          {!suggestion.clComplBalanced && (
                            <Alert severity="warning" sx={{ mt: 1 }} icon={<PsychologyIcon />}>
                              <Typography variant="caption">
                                Esta otimização foca apenas na CompL e pode aumentar a Carga Cognitiva (CL)
                              </Typography>
                            </Alert>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ResourcePredictor;
