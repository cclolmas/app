import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Tabs, Tab, Grid, Chip, 
  Alert, LinearProgress, Divider, Button,
  Card, CardContent
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MemoryIcon from '@mui/icons-material/Memory';
import PsychologyIcon from '@mui/icons-material/Psychology';

import FineTuningVisualizer from './FineTuningVisualizer';
import LMASVisualizer from './LMASVisualizer';
import ResourceMonitor from './ResourceMonitor';
import CognitiveLoadInput from './CognitiveLoadInput';
import ResultsSummary from './ResultsSummary';

// Status constants
const STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  ERROR: 'error',
};

const TaskMonitor = ({ 
  taskId, 
  taskType,  // 'fine-tuning' or 'lmas'
  initialStatus = STATUS.PENDING,
  onCognitiveLoadSubmit
}) => {
  const [status, setStatus] = useState(initialStatus);
  const [currentTab, setCurrentTab] = useState(0);
  const [taskData, setTaskData] = useState(null);
  const [resourceData, setResourceData] = useState({
    vram: { used: 0, total: 0, history: [] },
    ram: { used: 0, total: 0, history: [] },
    cpu: { usage: 0, history: [] }
  });
  const [cognitiveLoadData, setCognitiveLoadData] = useState({
    entries: [],
    average: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);

  // Simula a recuperação de dados de tarefa e recursos
  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        // Em uma implementação real, estes seriam chamadas de API
        // Exemplo: const response = await api.getTaskData(taskId);
        
        // Dados simulados
        setTimeout(() => {
          if (taskType === 'fine-tuning') {
            const mockData = {
              id: taskId,
              name: "Fine-tuning Mistral-7B",
              type: "fine-tuning",
              modelName: "Mistral-7B",
              quantization: "q8",
              startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
              status: status,
              currentEpoch: 2,
              totalEpochs: 3,
              trainingLoss: [0.8, 0.6, 0.5, 0.45, 0.42],
              validationLoss: [0.85, 0.7, 0.65, 0.63, 0.62],
              learningRate: 0.00002,
              batchSize: 8,
              samplesProcessed: 1200,
              totalSamples: 2000
            };
            setTaskData(mockData);
            setStartTime(new Date(mockData.startTime));
          } else if (taskType === 'lmas') {
            const mockData = {
              id: taskId,
              name: "Code Review LMAS",
              type: "lmas",
              status: status,
              startTime: new Date(Date.now() - 1800000).toISOString(), // 30 min atrás
              agentsConfig: [
                { id: "reviewer", name: "Code Reviewer", model: "Mistral-7B" },
                { id: "fixer", name: "Bug Fixer", model: "CodeLlama-7B" },
                { id: "tester", name: "Test Generator", model: "Mistral-7B" }
              ],
              interactions: [
                { from: "user", to: "reviewer", content: "Review this code for bugs", timestamp: new Date(Date.now() - 1700000).toISOString() },
                { from: "reviewer", to: "fixer", content: "Found 3 potential issues in the code", timestamp: new Date(Date.now() - 1600000).toISOString() },
                { from: "fixer", to: "tester", content: "Fixed issues. Please generate tests", timestamp: new Date(Date.now() - 1500000).toISOString() },
                { from: "tester", to: "user", content: "Generated 5 test cases. All pass.", timestamp: new Date(Date.now() - 1400000).toISOString() }
              ],
              result: "Code review completed with 3 fixes and 5 new tests"
            };
            setTaskData(mockData);
            setStartTime(new Date(mockData.startTime));
          }
          
          setLoading(false);
          
          // Simular dados de recursos
          const mockResourceData = {
            vram: { 
              used: 6.2 * 1024 * 1024 * 1024, // 6.2 GB em bytes
              total: 8 * 1024 * 1024 * 1024,  // 8 GB em bytes
              history: generateResourceHistory(24, 4, 8) // 24 pontos entre 4-8 GB
            },
            ram: { 
              used: 12.5 * 1024 * 1024 * 1024, 
              total: 16 * 1024 * 1024 * 1024,
              history: generateResourceHistory(24, 10, 14)
            },
            cpu: { 
              usage: 65, 
              history: generateResourceHistory(24, 40, 80, '%') 
            }
          };
          setResourceData(mockResourceData);
        }, 1000);
      } catch (err) {
        setError("Erro ao carregar dados da tarefa");
        setLoading(false);
      }
    };

    fetchTaskData();

    // Simular mudanças de status para demonstração
    if (status === STATUS.PENDING) {
      const timer = setTimeout(() => setStatus(STATUS.RUNNING), 2000);
      return () => clearTimeout(timer);
    } else if (status === STATUS.RUNNING) {
      const timer = setTimeout(() => setStatus(STATUS.SUCCESS), 15000);
      return () => clearTimeout(timer);
    }

    // Atualizar tempo decorrido
    const interval = setInterval(() => {
      if (startTime && (status === STATUS.RUNNING || status === STATUS.SUCCESS)) {
        const now = new Date();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [taskId, taskType, status, startTime]);

  // Função auxiliar para gerar histórico simulado de recursos
  const generateResourceHistory = (points, min, max, unit = 'GB') => {
    const history = [];
    for (let i = 0; i < points; i++) {
      const time = new Date(Date.now() - (points - i) * 5 * 60 * 1000); // A cada 5 minutos
      const value = unit === '%' 
        ? Math.round(min + Math.random() * (max - min)) 
        : (min + Math.random() * (max - min)) * 1024 * 1024 * 1024; // Converter para bytes
      history.push({ time, value });
    }
    return history;
  };

  // Manipulador para mudança de tab
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Manipulador para envio de carga cognitiva
  const handleCognitiveLoadSubmit = (value, notes) => {
    const newEntry = {
      value,
      notes,
      timestamp: new Date().toISOString(),
      taskProgress: taskType === 'fine-tuning' 
        ? `Epoch ${taskData?.currentEpoch}/${taskData?.totalEpochs}` 
        : `Interação ${taskData?.interactions?.length || 0}`
    };
    
    const updatedEntries = [...cognitiveLoadData.entries, newEntry];
    const average = updatedEntries.reduce((acc, entry) => acc + entry.value, 0) / updatedEntries.length;
    
    setCognitiveLoadData({
      entries: updatedEntries,
      average
    });
    
    if (onCognitiveLoadSubmit) {
      onCognitiveLoadSubmit(newEntry);
    }
  };

  // Formatar tempo decorrido
  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Renderiza o chip de status com cor e ícone apropriados
  const renderStatusChip = () => {
    const statusConfig = {
      [STATUS.PENDING]: { 
        color: 'default', 
        icon: <HourglassTopIcon />, 
        label: 'Pendente' 
      },
      [STATUS.RUNNING]: { 
        color: 'primary', 
        icon: <AccessTimeIcon />, 
        label: 'Em execução' 
      },
      [STATUS.SUCCESS]: { 
        color: 'success', 
        icon: <CheckCircleIcon />, 
        label: 'Concluído com sucesso' 
      },
      [STATUS.ERROR]: { 
        color: 'error', 
        icon: <ErrorIcon />, 
        label: 'Erro' 
      }
    };

    const config = statusConfig[status] || statusConfig[STATUS.PENDING];

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        variant="outlined"
        size="medium"
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <Typography variant="h6" gutterBottom>Carregando dados da tarefa...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
              {taskData?.name || `Tarefa ${taskId}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {taskType === 'fine-tuning' ? 'Ajuste fino de modelo' : 'Sistema Multi-Agente Local'}
              {taskData?.modelName && ` • ${taskData.modelName}`}
              {taskData?.quantization && ` • ${taskData.quantization.toUpperCase()}`}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center', gap: 2 }}>
            {renderStatusChip()}
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Tempo: {formatElapsedTime(elapsedTime)}
              </Typography>
            </Box>
          </Grid>
          
          {status === STATUS.RUNNING && taskType === 'fine-tuning' && (
            <Grid item xs={12}>
              <Box sx={{ width: '100%', mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">
                    Progresso: Época {taskData?.currentEpoch}/{taskData?.totalEpochs}
                  </Typography>
                  <Typography variant="body2">
                    {Math.round((taskData?.samplesProcessed / taskData?.totalSamples) * 100)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(taskData?.samplesProcessed / taskData?.totalSamples) * 100} 
                  sx={{ height: 8, borderRadius: 4 }} 
                />
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Tabs 
        value={currentTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        <Tab label="Visualização" />
        <Tab label="Uso de Recursos" />
        <Tab label="Carga Cognitiva" />
        {status === STATUS.SUCCESS && <Tab label="Resultados" />}
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {/* Tab de visualização específica para o tipo de tarefa */}
        {currentTab === 0 && (
          <>
            {taskType === 'fine-tuning' ? (
              <FineTuningVisualizer data={taskData} status={status} />
            ) : (
              <LMASVisualizer data={taskData} status={status} />
            )}
          </>
        )}

        {/* Tab de monitoramento de recursos */}
        {currentTab === 1 && (
          <ResourceMonitor data={resourceData} status={status} />
        )}

        {/* Tab de carga cognitiva */}
        {currentTab === 2 && (
          <Box sx={{ width: '100%' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <CognitiveLoadInput 
                  onSubmit={handleCognitiveLoadSubmit} 
                  disabled={status === STATUS.PENDING}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Histórico de Carga Cognitiva</Typography>
                    </Box>
                    
                    {cognitiveLoadData.entries.length > 0 ? (
                      <>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            Média de CL: 
                            <Typography component="span" fontWeight="bold" sx={{ ml: 1 }}>
                              {cognitiveLoadData.average ? cognitiveLoadData.average.toFixed(1) : '-'}/5
                            </Typography>
                          </Typography>
                        </Box>
                        
                        <Divider sx={{ mb: 2 }} />
                        
                        {cognitiveLoadData.entries.map((entry, index) => (
                          <Box key={index} sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight="medium">
                              Valor: {entry.value}/5 
                              <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                ({new Date(entry.timestamp).toLocaleTimeString()}, {entry.taskProgress})
                              </Typography>
                            </Typography>
                            
                            {entry.notes && (
                              <Typography variant="body2" color="text.secondary">
                                "{entry.notes}"
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </>
                    ) : (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        Nenhum registro de carga cognitiva. Registre sua percepção durante a tarefa.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {cognitiveLoadData.entries.length > 0 && resourceData && (
                <Grid item xs={12}>
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Correlação CL-CompL
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Analisando a relação entre Carga Cognitiva (CL) e Carga Computacional (CompL) para encontrar o "ponto ideal" (H3).
                    </Typography>
                    
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                          <Typography variant="body2">
                            Carga Cognitiva Média: {cognitiveLoadData.average ? cognitiveLoadData.average.toFixed(1) : '-'}/5
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <MemoryIcon sx={{ mr: 1, color: 'secondary.main' }} fontSize="small" />
                          <Typography variant="body2">
                            VRAM Média: {(resourceData.vram.used / (1024 * 1024 * 1024)).toFixed(1)} GB
                          </Typography>
                        </Box>
                        
                        {taskType === 'fine-tuning' && taskData?.quantization && (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              A quantização {taskData.quantization.toUpperCase()} demonstra um equilíbrio onde 
                              {taskData.quantization === 'q8' ? 
                                ' a maior estabilidade reduz a carga cognitiva, mesmo com maior uso de VRAM.' :
                                ' o menor uso de VRAM é compensado por maior carga cognitiva devido à maior instabilidade.'
                              }
                            </Typography>
                          </Alert>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Alert severity="success" icon={<CheckCircleIcon />}>
                          <Typography variant="body2">
                            <strong>Análise do "Ponto Ideal" (H3):</strong>
                            {cognitiveLoadData.average && cognitiveLoadData.average < 3 ?
                              " A configuração atual parece estar próxima do ponto ideal, com baixa carga cognitiva." :
                              " A configuração atual pode estar distante do ponto ideal, com carga cognitiva elevada."
                            }
                          </Typography>
                        </Alert>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Tab de resultados (visível apenas quando a tarefa for concluída) */}
        {currentTab === 3 && status === STATUS.SUCCESS && (
          <ResultsSummary data={taskData} type={taskType} />
        )}
      </Box>
    </Box>
  );
};

export default TaskMonitor;
