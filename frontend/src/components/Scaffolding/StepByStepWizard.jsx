import React, { useState, useEffect } from 'react';
import { 
  Box, Stepper, Step, StepLabel, StepContent, 
  Button, Typography, Paper, Checkbox, FormControlLabel,
  List, ListItem, ListItemIcon, ListItemText, 
  Collapse, Divider, Alert, Link
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import SchoolIcon from '@mui/icons-material/School';
import { useScaffolding, SCAFFOLDING_LEVELS } from '../../contexts/ScaffoldingContext';

/**
 * Componente de Wizard passo a passo com scaffolding adaptativo
 * 
 * @param {Object} props
 * @param {string} props.flowId - Identificador único do fluxo (para rastrear progresso)
 * @param {Array} props.steps - Array de passos do wizard
 * @param {Function} props.onComplete - Função chamada ao finalizar o wizard
 * @param {boolean} props.allowSkipSteps - Se permite pular passos (avançados)
 * @param {string} props.orientation - Orientação do stepper ('vertical' ou 'horizontal')
 */
const StepByStepWizard = ({
  flowId,
  steps,
  onComplete,
  allowSkipSteps = false,
  orientation = 'vertical'
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});
  const [expandedHelp, setExpandedHelp] = useState({});
  const { 
    scaffoldingLevel, 
    expertiseLevel, 
    markStepComplete,
    isStepComplete
  } = useScaffolding();

  // Verificar steps já completados anteriormente
  useEffect(() => {
    const newCompleted = {};
    steps.forEach((step, index) => {
      if (isStepComplete(flowId, step.id)) {
        newCompleted[index] = true;
      }
    });
    setCompleted(newCompleted);
  }, [flowId, steps, isStepComplete]);

  const handleNext = () => {
    const newActiveStep = activeStep + 1;
    setActiveStep(newActiveStep);
    
    // Marca o passo atual como completo
    const currentStep = steps[activeStep];
    if (currentStep && currentStep.id) {
      markStepComplete(flowId, currentStep.id);
      setCompleted((prev) => ({ ...prev, [activeStep]: true }));
    }
    
    // Se é o último passo, chamar callback de conclusão
    if (newActiveStep >= steps.length && onComplete) {
      onComplete();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleStep = (step) => () => {
    // Apenas usuários avançados ou passos já completados podem ser pulados
    if (allowSkipSteps || scaffoldingLevel === SCAFFOLDING_LEVELS.MINIMAL || completed[step]) {
      setActiveStep(step);
    }
  };

  const handleToggleHelp = (id) => {
    setExpandedHelp(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleChecklistItemToggle = (stepIndex, itemIndex) => {
    // Implementação simplificada: apenas marca visualmente
    // Em uma implementação real, você pode querer persistir estes dados
    console.log(`Item ${itemIndex} do passo ${stepIndex} marcado/desmarcado`);
  };

  // Renderiza as etapas do checklist para um passo específico
  const renderChecklist = (checklist, stepIndex) => {
    // Se não há checklist ou usuário é avançado e prefere menos detalhes
    if (!checklist || (scaffoldingLevel === SCAFFOLDING_LEVELS.MINIMAL && !expandedHelp[`step-${stepIndex}`])) {
      return null;
    }

    return (
      <List dense sx={{ mt: 1, bgcolor: 'background.paper' }}>
        {checklist.map((item, idx) => (
          <ListItem key={idx} dense>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Checkbox
                edge="start"
                size="small"
                onChange={() => handleChecklistItemToggle(stepIndex, idx)}
              />
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              secondary={scaffoldingLevel !== SCAFFOLDING_LEVELS.MINIMAL ? item.description : null}
            />
          </ListItem>
        ))}
      </List>
    );
  };

  // Renderizar recursos e exemplos para um passo
  const renderResources = (resources) => {
    if (!resources || resources.length === 0) return null;
    
    // Para nível mínimo, mostrar menos recursos
    const filteredResources = scaffoldingLevel === SCAFFOLDING_LEVELS.MINIMAL 
      ? resources.filter(r => r.essential) 
      : resources;
    
    if (filteredResources.length === 0) return null;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <SchoolIcon fontSize="small" sx={{ mr: 0.5 }} />
          Recursos e exemplos
        </Typography>
        <List dense>
          {filteredResources.map((resource, idx) => (
            <ListItem key={idx} dense sx={{ py: 0.5 }}>
              <Link href={resource.url} target="_blank" rel="noopener">
                {resource.title}
              </Link>
              {resource.description && scaffoldingLevel === SCAFFOLDING_LEVELS.DETAILED && (
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  {resource.description}
                </Typography>
              )}
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  // Obter instruções adaptadas ao nível de expertise
  const getStepInstructions = (step) => {
    if (!step) return '';
    
    if (scaffoldingLevel === SCAFFOLDING_LEVELS.DETAILED) {
      return step.detailedInstructions || step.instructions;
    } else if (scaffoldingLevel === SCAFFOLDING_LEVELS.MINIMAL) {
      return step.minimalInstructions || step.instructions;
    }
    return step.instructions;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} orientation={orientation}>
        {steps.map((step, index) => {
          const stepProps = {};
          const labelProps = {};
          
          if (completed[index]) {
            stepProps.completed = true;
          }
          
          return (
            <Step key={step.label} {...stepProps} onClick={handleStep(index)}>
              <StepLabel {...labelProps}>
                {step.label}
                {step.optional && scaffoldingLevel !== SCAFFOLDING_LEVELS.MINIMAL && (
                  <Typography variant="caption" color="text.secondary"> (Opcional)</Typography>
                )}
              </StepLabel>
              
              {orientation === 'vertical' && (
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography>{getStepInstructions(step)}</Typography>
                    
                    {step.tip && scaffoldingLevel !== SCAFFOLDING_LEVELS.MINIMAL && (
                      <Alert 
                        icon={<TipsAndUpdatesIcon fontSize="inherit" />}
                        severity="info"
                        sx={{ mt: 2, mb: 2 }}
                      >
                        {step.tip}
                      </Alert>
                    )}
                    
                    {/* Checklist de tarefas */}
                    {renderChecklist(step.checklist, index)}
                    
                    {/* Recursos e exemplos */}
                    {renderResources(step.resources)}
                    
                    {/* Botões de navegação */}
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        startIcon={<NavigateBeforeIcon />}
                      >
                        Voltar
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<NavigateNextIcon />}
                      >
                        {index === steps.length - 1 ? 'Concluir' : 'Avançar'}
                      </Button>
                    </Box>
                  </Box>
                </StepContent>
              )}
            </Step>
          );
        })}
      </Stepper>
      
      {/* Para stepper horizontal, mostra o conteúdo abaixo dos passos */}
      {orientation === 'horizontal' && activeStep < steps.length && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Typography sx={{ mb: 2 }}>{getStepInstructions(steps[activeStep])}</Typography>
          
          {/* Botão para expandir/colapsar detalhes (apenas para intermediário/avançado) */}
          {scaffoldingLevel !== SCAFFOLDING_LEVELS.DETAILED && steps[activeStep].checklist && (
            <Button
              size="small"
              startIcon={expandedHelp[`step-${activeStep}`] ? <ExpandLess /> : <ExpandMore />}
              onClick={() => handleToggleHelp(`step-${activeStep}`)}
              sx={{ mb: 1 }}
            >
              {expandedHelp[`step-${activeStep}`] ? 'Menos detalhes' : 'Mais detalhes'}
            </Button>
          )}
          
          <Collapse in={scaffoldingLevel === SCAFFOLDING_LEVELS.DETAILED || expandedHelp[`step-${activeStep}`]}>
            {steps[activeStep].tip && (
              <Alert 
                icon={<TipsAndUpdatesIcon fontSize="inherit" />}
                severity="info"
                sx={{ mt: 1, mb: 2 }}
              >
                {steps[activeStep].tip}
              </Alert>
            )}
            
            {/* Checklist de tarefas */}
            {renderChecklist(steps[activeStep].checklist, activeStep)}
            
            {/* Recursos e exemplos */}
            {renderResources(steps[activeStep].resources)}
          </Collapse>
          
          {/* Botões de navegação */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<NavigateBeforeIcon />}
            >
              Voltar
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<NavigateNextIcon />}
            >
              {activeStep === steps.length - 1 ? 'Concluir' : 'Avançar'}
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Mensagem de conclusão */}
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3, mt: 3, borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
            <Typography variant="h6">Todas as etapas foram concluídas!</Typography>
          </Box>
          <Typography>
            Você completou com sucesso todas as etapas necessárias.
          </Typography>
          <Button 
            onClick={() => setActiveStep(0)} 
            sx={{ mt: 2 }}
          >
            Reiniciar
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default StepByStepWizard;
