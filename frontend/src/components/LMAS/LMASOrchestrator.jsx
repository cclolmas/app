import React, { useState, useEffect } from 'react';
import { 
  Box, Stepper, Step, StepLabel, Button, Typography, 
  Paper, Container, Divider, Alert, Card, IconButton,
  Tooltip
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SaveIcon from '@mui/icons-material/Save';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MemoryIcon from '@mui/icons-material/Memory';

import AgentDefinition from './AgentDefinition';
import WorkflowDefinition from './WorkflowDefinition';
import GlobalParameters from './GlobalParameters';
import LMASPreview from './LMASPreview';
import CompLSummary from './CompLSummary';

import { calculateTotalCompL, validateLMASConfiguration } from '../../utils/lmasUtils';
import { useSystemMetrics } from '../../hooks/useSystemMetrics';

const steps = [
  'Definição de Agentes',
  'Fluxo de Trabalho',
  'Parâmetros Globais',
  'Revisão e Implantação'
];

const LMASOrchestrator = ({ projectId, onSave }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [lmasConfig, setLmasConfig] = useState({
    agents: [],
    workflow: {
      type: 'sequential', // sequential, hierarchical, debate
      connections: [],
      startNode: null,
      endCriteria: 'iterations'
    },
    globalParams: {
      maxIterations: 5,
      temperature: 0.7,
      stopCriteria: {
        type: 'iterations', // iterations, convergence, custom
        value: 5,
        customFunction: null
      },
      metadata: {
        name: 'Novo Sistema Multi-Agente',
        description: '',
        tags: []
      }
    }
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [totalCompL, setTotalCompL] = useState({ 
    vram: 0, 
    complexity: 'baixa', 
    bottlenecks: [] 
  });
  
  // Obter métricas do sistema para avaliar restrições de recursos
  const { metrics: systemMetrics, loading: metricsLoading } = useSystemMetrics();

  // Recalcular CompL sempre que a configuração mudar
  useEffect(() => {
    const compL = calculateTotalCompL(lmasConfig, systemMetrics);
    setTotalCompL(compL);
    
    // Validar a configuração atual
    const errors = validateLMASConfiguration(lmasConfig, activeStep);
    setValidationErrors(errors);
  }, [lmasConfig, activeStep, systemMetrics]);

  const handleNext = () => {
    // Validar antes de prosseguir
    const errors = validateLMASConfiguration(lmasConfig, activeStep);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    // Limpar erros de validação ao voltar
    setValidationErrors({});
  };

  const handleSave = async () => {
    // Validação final antes de salvar
    const errors = validateLMASConfiguration(lmasConfig, steps.length - 1);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (onSave) {
      await onSave(lmasConfig);
    }
  };

  const updateAgents = (agents) => {
    setLmasConfig(prev => ({ ...prev, agents }));
  };

  const updateWorkflow = (workflow) => {
    setLmasConfig(prev => ({ ...prev, workflow }));
  };

  const updateGlobalParams = (globalParams) => {
    setLmasConfig(prev => ({ ...prev, globalParams }));
  };

  const getTitleByStep = () => {
    switch (activeStep) {
      case 0:
        return "Defina os Agentes do Sistema";
      case 1:
        return "Configure o Fluxo de Trabalho";
      case 2:
        return "Defina os Parâmetros Globais";
      case 3:
        return "Revise seu Sistema Multi-Agente";
      default:
        return "Orquestração de LMAS";
    }
  };

  const getDescriptionByStep = () => {
    switch (activeStep) {
      case 0:
        return "Defina os papéis, modelos LLM e ferramentas para cada agente do seu sistema.";
      case 1:
        return "Determine como os agentes colaboram e se comunicam (sequencial, hierárquico ou debate).";
      case 2:
        return "Configure parâmetros globais como limites de iteração e critérios de parada.";
      case 3:
        return "Revise a configuração completa e faça ajustes finais antes de implantar.";
      default:
        return "";
    }
  };

  // Componente para cada passo
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <AgentDefinition 
            agents={lmasConfig.agents}
            onUpdate={updateAgents}
            systemMetrics={systemMetrics}
            validationErrors={validationErrors}
          />
        );
      case 1:
        return (
          <WorkflowDefinition 
            workflow={lmasConfig.workflow}
            agents={lmasConfig.agents}
            onUpdate={updateWorkflow}
            validationErrors={validationErrors}
          />
        );
      case 2:
        return (
          <GlobalParameters 
            globalParams={lmasConfig.globalParams}
            agents={lmasConfig.agents}
            workflow={lmasConfig.workflow}
            onUpdate={updateGlobalParams}
            validationErrors={validationErrors}
          />
        );
      case 3:
        return (
          <LMASPreview 
            config={lmasConfig} 
            compL={totalCompL}
            systemMetrics={systemMetrics}
          />
        );
      default:
        return 'Passo desconhecido';
    }
  };

  // Verificar se o passo atual tem erros de validação
  const hasStepErrors = Object.keys(validationErrors).length > 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          position: 'relative'
        }}
      >
        <Box sx={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <PsychologyIcon color="primary" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              ICL: Alta
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MemoryIcon color={totalCompL.complexity === 'alta' ? 'error' : 'success'} sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              CompL: {totalCompL.complexity.charAt(0).toUpperCase() + totalCompL.complexity.slice(1)}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h4" component="h1" gutterBottom>
          {getTitleByStep()}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {getDescriptionByStep()}
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ pt: 4, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {hasStepErrors && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Existem problemas na configuração atual que precisam ser resolvidos antes de prosseguir.
          </Alert>
        )}

        <Box sx={{ mt: 3, minHeight: '400px' }}>
          {getStepContent(activeStep)}
        </Box>

        {/* Resumo da CompL sempre visível */}
        <Box sx={{ mt: 4, mb: 3 }}>
          <Divider />
          <CompLSummary 
            compL={totalCompL} 
            systemMetrics={systemMetrics}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<NavigateBeforeIcon />}
          >
            Voltar
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSave}
                startIcon={<SaveIcon />}
                disabled={hasStepErrors}
              >
                Salvar e Implantar
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleNext}
                endIcon={<NavigateNextIcon />}
                disabled={hasStepErrors}
              >
                Próximo
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LMASOrchestrator;
