import { useState, useEffect } from 'react';
import { 
  Box, Button, Paper, Typography, Stepper, Step, StepLabel, Alert,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField
} from '@mui/material';
import { useTaskMonitor } from '../../contexts/TaskMonitorContext';
import { taskService } from '../../services/taskService';
import { learningProcessService } from '../../services/learningProcessService';
import TaskProgressMonitor from '../../components/TaskMonitoring/TaskProgressMonitor';
import DecisionJustificationForm from '../../components/Evaluation/DecisionJustificationForm';
import TradeoffEvaluationSlider from '../../components/Evaluation/TradeoffEvaluationSlider';

const FineTuningPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [fineTuningConfig, setFineTuningConfig] = useState({/* initial config */});
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const { startTask, updateTask, completeTask, failTask, addTaskLog } = useTaskMonitor();

  const [configHistory, setConfigHistory] = useState([]);
  const [justificationDialogOpen, setJustificationDialogOpen] = useState(false);
  const [currentJustification, setCurrentJustification] = useState({
    decision: '',
    rationale: '',
    clCompTrade: 3, // 1-5 scale for CL-CompL trade-off evaluation
    pcStrategy: ''
  });
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const initSession = async () => {
      const newSessionId = await learningProcessService.createLearningSession('fine-tuning');
      setSessionId(newSessionId);
    };
    
    initSession();
  }, []);

  const handleConfigChange = (newConfig) => {
    setFineTuningConfig(newConfig);
    
    setConfigHistory(prev => [...prev, {
      timestamp: new Date().toISOString(),
      config: { ...newConfig }
    }]);
    
    if (shouldAskForJustification(newConfig)) {
      setCurrentJustification({
        decision: getSignificantChange(newConfig),
        rationale: '',
        clCompTrade: 3,
        pcStrategy: ''
      });
      setJustificationDialogOpen(true);
    }
    
    if (sessionId) {
      learningProcessService.recordConfigChange(sessionId, {
        type: 'config_change',
        data: newConfig
      });
    }
  };

  const shouldAskForJustification = (newConfig) => {
    if (configHistory.length === 0) return false;
    
    const lastConfig = configHistory[configHistory.length - 1].config;
    
    const significantChanges = [
      lastConfig.quantization !== newConfig.quantization,
      lastConfig.loraRank !== newConfig.loraRank && Math.abs(lastConfig.loraRank - newConfig.loraRank) > 4,
      lastConfig.baseModelSize !== newConfig.baseModelSize
    ];
    
    return significantChanges.some(change => change);
  };

  const getSignificantChange = (newConfig) => {
    const lastConfig = configHistory[configHistory.length - 1].config;
    
    if (lastConfig.quantization !== newConfig.quantization) {
      return `Mudança de quantização de ${lastConfig.quantization} para ${newConfig.quantization}`;
    }
    
    if (lastConfig.loraRank !== newConfig.loraRank && Math.abs(lastConfig.loraRank - newConfig.loraRank) > 4) {
      return `Alteração do rank LoRA de ${lastConfig.loraRank} para ${newConfig.loraRank}`;
    }
    
    if (lastConfig.baseModelSize !== newConfig.baseModelSize) {
      return `Mudança do tamanho do modelo base de ${lastConfig.baseModelSize}B para ${newConfig.baseModelSize}B`;
    }
    
    return 'Alteração de configuração';
  };

  const handleSaveJustification = () => {
    if (sessionId) {
      learningProcessService.recordDecisionJustification(sessionId, {
        timestamp: new Date().toISOString(),
        decision: currentJustification.decision,
        rationale: currentJustification.rationale,
        clCompTrade: currentJustification.clCompTrade,
        pcStrategy: currentJustification.pcStrategy,
        relatedConfig: { ...fineTuningConfig }
      });
    }
    
    setJustificationDialogOpen(false);
  };

  const handleStartFineTuning = async () => {
    try {
      if (sessionId) {
        learningProcessService.recordMilestone(sessionId, {
          type: 'execution_start',
          config: { ...fineTuningConfig },
          timestamp: new Date().toISOString()
        });
      }
      
      const taskId = startTask({
        id: `fine-tuning-${Date.now()}`,
        type: 'fine-tuning',
        title: `Fine-tuning: ${fineTuningConfig.modelName || 'Novo modelo'}`,
        estimatedDuration: calculateEstimatedDuration(fineTuningConfig)
      });

      setCurrentTaskId(taskId);

      await taskService.startFineTuning(
        fineTuningConfig,
        (progress, statusData) => {
          updateTask(taskId, { 
            progress,
            processedTokens: statusData.processedTokens,
            currentEpoch: statusData.currentEpoch
          });
          
          if (statusData.currentEpoch && 
              statusData.currentEpoch !== fineTuningConfig.currentEpoch && 
              sessionId) {
            learningProcessService.recordMilestone(sessionId, {
              type: 'epoch_completed',
              epochNumber: statusData.currentEpoch,
              metrics: {
                loss: statusData.loss,
                validationLoss: statusData.validationLoss
              },
              timestamp: new Date().toISOString()
            });
          }
        },
        (logEntry) => {
          addTaskLog(taskId, logEntry);
          
          if (sessionId && 
              (logEntry.type === 'error' || 
               logEntry.type === 'warning' || 
               logEntry.message.includes('loss'))) {
            learningProcessService.recordLog(sessionId, {
              ...logEntry,
              taskId
            });
          }
        },
        (result) => {
          completeTask(taskId, result);
          
          if (sessionId) {
            learningProcessService.recordMilestone(sessionId, {
              type: 'execution_complete',
              result,
              timestamp: new Date().toISOString()
            });
          }
          
          setActiveStep(activeStep + 1);
        },
        (error) => {
          failTask(taskId, error);
          
          if (sessionId) {
            learningProcessService.recordMilestone(sessionId, {
              type: 'execution_failed',
              error: error.message,
              timestamp: new Date().toISOString()
            });
          }
        }
      );
    } catch (error) {
      console.error("Erro ao iniciar fine-tuning:", error);
      
      if (sessionId) {
        learningProcessService.recordError(sessionId, {
          phase: 'startup',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  useEffect(() => {
    if (activeStep === 2 && currentTaskId) {
      const timer = setTimeout(() => {
        setCurrentJustification({
          decision: 'Reflexão pós-execução',
          rationale: '',
          clCompTrade: 3,
          pcStrategy: ''
        });
        setJustificationDialogOpen(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [activeStep, currentTaskId]);

  const calculateEstimatedDuration = (config) => {
    let baseTime = 60;

    if (config.baseModelSize > 10) {
      baseTime = 240;
    } else if (config.baseModelSize < 7) {
      baseTime = 45;
    }

    const datasetMultiplier = Math.max(1, Math.log10(config.datasetSize / 1000));
    const epochMultiplier = config.epochs / 3;

    return Math.round(baseTime * datasetMultiplier * epochMultiplier * 60);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        <Step>
          <StepLabel>Configuração</StepLabel>
        </Step>
        <Step>
          <StepLabel>Monitoramento</StepLabel>
        </Step>
        <Step>
          <StepLabel>Resultados</StepLabel>
        </Step>
      </Stepper>

      {activeStep === 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => setJustificationDialogOpen(true)}
            >
              Registrar justificativa para configuração atual
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartFineTuning}
              disabled={!fineTuningConfig || !!currentTaskId}
            >
              Iniciar Fine-Tuning
            </Button>
          </Box>
        </Paper>
      )}

      {activeStep === 1 && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Progresso do Fine-Tuning
            </Typography>
            <Typography paragraph>
              O processo de fine-tuning está em execução. Este processo pode levar de algumas 
              horas a dias, dependendo do tamanho do modelo e do dataset. Você pode continuar 
              navegando na plataforma enquanto o processo executa em segundo plano.
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Dica: Você pode utilizar o tempo de espera de forma produtiva explorando 
              os recursos sugeridos ou preparando outros aspectos do seu projeto.
            </Alert>
            {currentTaskId && (
              <TaskProgressMonitor
                taskId={currentTaskId}
                detailed={true}
                showSuggestions={true}
              />
            )}
          </Paper>
        </>
      )}

      {activeStep === 2 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Avaliação e Reflexão
          </Typography>
          
          <Typography paragraph></Typography>
            Reflita sobre o processo de fine-tuning que você acabou de realizar.
            Esta reflexão ajudará a consolidar seu aprendizado e permitirá que
            os instrutores compreendam melhor seu processo de pensamento.
          </Typography>
          
          <DecisionJustificationForm 
            sessionId={sessionId} 
            taskType="fine-tuning"
            onComplete={() => {
              if (sessionId) {
                learningProcessService.recordMilestone(sessionId, {
                  type: 'reflection_complete',
                  timestamp: new Date().toISOString()
                });
              }
            }}
          />
        </Paper>
      )}

      <Dialog 
        open={justificationDialogOpen} 
        onClose={() => setJustificationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Justifique sua decisão
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            {currentJustification.decision}
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            id="rationale"
            label="Por que você fez esta escolha?"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={currentJustification.rationale}
            onChange={(e) => setCurrentJustification({
              ...currentJustification,
              rationale: e.target.value
            })}
          />
          
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography gutterBottom>
              Como você avalia o trade-off entre Carga Cognitiva (CL) e Carga Computacional (CompL) nesta decisão?
            </Typography>
            <TradeoffEvaluationSlider
              value={currentJustification.clCompTrade}
              onChange={(value) => setCurrentJustification({
                ...currentJustification,
                clCompTrade: value
              })}
            />
          </Box>
          
          <TextField
            margin="dense"
            id="pcStrategy"
            label="Que estratégia de Pensamento Computacional você aplicou? (Decomposição, Abstração, Algoritmo, Reconhecimento de Padrões)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={currentJustification.pcStrategy}
            onChange={(e) => setCurrentJustification({
              ...currentJustification,
              pcStrategy: e.target.value
            })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJustificationDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveJustification} variant="contained">Salvar Justificativa</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FineTuningPage;