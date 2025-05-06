import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Grid,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
  Stepper, Step, StepLabel, StepContent,
  Alert, Divider
} from '@mui/material';
import { learningProcessService } from '../../services/learningProcessService';
import TradeoffEvaluationSlider from './TradeoffEvaluationSlider';

/**
 * Componente de formulário para capturar justificativas de decisões
 * e reflexões sobre o processo de pensamento computacional
 * 
 * @param {Object} props
 * @param {string} props.sessionId - ID da sessão de aprendizagem
 * @param {string} props.taskType - Tipo de tarefa ('fine-tuning', 'lmas')
 * @param {Function} props.onComplete - Callback para quando o formulário for concluído
 */
const DecisionJustificationForm = ({ sessionId, taskType, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [responses, setResponses] = useState({
    decomposition: '',
    abstraction: '',
    algorithmStrategy: '',
    patternRecognition: '',
    clCompTradeoff: 3,
    clCompAnalysis: '',
    decisions: {
      keyDecision: '',
      alternative: '',
      rationale: ''
    },
    reflection: '',
    learningPoints: ''
  });
  const [submitted, setSubmitted] = useState(false);

  // Passos do formulário baseados nos elementos do Pensamento Computacional
  const steps = [
    {
      label: 'Decomposição',
      description: 'Como você dividiu o problema em partes menores e mais gerenciáveis?',
      field: 'decomposition',
      helper: 'Descreva como você dividiu a tarefa em subtarefas, quais aspectos você priorizou e por quê.'
    },
    {
      label: 'Abstração',
      description: 'Quais detalhes você escolheu ignorar ou destacar?',
      field: 'abstraction',
      helper: 'Explique quais aspectos do problema você considerou essenciais e quais foram secundários.'
    },
    {
      label: 'Algoritmo',
      description: 'Qual foi sua estratégia sequencial para resolver o problema?',
      field: 'algorithmStrategy',
      helper: 'Descreva os passos que você seguiu para atingir seu objetivo.'
    },
    {
      label: 'Reconhecimento de Padrões',
      description: 'Quais padrões você identificou durante o processo?',
      field: 'patternRecognition',
      helper: 'Compartilhe padrões que você observou nos resultados, comportamentos ou no consumo de recursos.'
    },
    {
      label: 'Trade-off CL-CompL',
      description: 'Como você gerenciou o equilíbrio entre Carga Cognitiva e Computacional?',
      field: 'clCompTradeoff',
      secondaryField: 'clCompAnalysis',
      isSpecial: true,
      helper: 'Reflita sobre como suas escolhas afetaram tanto o uso de recursos computacionais quanto seu esforço cognitivo.'
    },
    {
      label: 'Decisões-Chave',
      description: 'Qual foi a decisão mais importante que você tomou?',
      field: 'decisions',
      isComplex: true,
      helper: 'Explique uma decisão crítica, quais alternativas você considerou e por que fez essa escolha.'
    },
    {
      label: 'Reflexão Final',
      description: 'O que você aprendeu com este processo?',
      field: 'reflection',
      secondaryField: 'learningPoints',
      helper: 'Reflita sobre seu aprendizado e pontos que você levará para projetos futuros.'
    }
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    if (sessionId) {
      try {
        // Enviar todas as justificativas e reflexões coletadas
        await learningProcessService.recordDecisionJustification(sessionId, {
          type: 'comprehensive_reflection',
          responses,
          timestamp: new Date().toISOString()
        });
        
        // Registrar o marco de conclusão da reflexão
        await learningProcessService.recordMilestone(sessionId, {
          type: 'comprehensive_reflection_complete',
          timestamp: new Date().toISOString()
        });
        
        setSubmitted(true);
        
        if (onComplete) {
          onComplete(responses);
        }
      } catch (error) {
        console.error('Erro ao enviar reflexões:', error);
      }
    } else {
      // Se não tiver sessionId, considerar dummy success
      setSubmitted(true);
      if (onComplete) {
        onComplete(responses);
      }
    }
  };

  const updateResponse = (field, value) => {
    if (field.includes('.')) {
      // Para campos aninhados como 'decisions.rationale'
      const [parent, child] = field.split('.');
      setResponses(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      // Para campos simples
      setResponses(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Determinar se o passo atual está completo (para habilitar o botão "Próximo")
  const isStepComplete = (stepIndex) => {
    const step = steps[stepIndex];
    if (step.isComplex) {
      // Para campos complexos como 'decisions'
      return responses[step.field].keyDecision.length > 0 && 
             responses[step.field].rationale.length > 0;
    } else if (step.isSpecial) {
      // Para o passo de trade-off CL-CompL
      return responses[step.secondaryField]?.length > 0;
    } else {
      // Para campos simples
      return responses[step.field]?.length > 0;
    }
  };

  if (submitted) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="success">
          Suas reflexões foram enviadas com sucesso! Obrigado por compartilhar seu processo de pensamento.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent>
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>
                
                {!step.isComplex && !step.isSpecial ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    placeholder={`Digite sua resposta aqui...`}
                    helperText={step.helper}
                    value={responses[step.field] || ''}
                    onChange={(e) => updateResponse(step.field, e.target.value)}
                  />
                ) : step.isSpecial ? (
                  <Box>
                    <TradeoffEvaluationSlider
                      value={responses.clCompTradeoff}
                      onChange={(value) => updateResponse('clCompTradeoff', value)}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      placeholder="Descreva como você equilibrou os recursos computacionais com o esforço cognitivo..."
                      helperText={step.helper}
                      value={responses[step.secondaryField] || ''}
                      onChange={(e) => updateResponse(step.secondaryField, e.target.value)}
                      sx={{ mt: 2 }}
                    />
                  </Box>
                ) : (
                  <Box>
                    {/* Formulário para decisões-chave */}
                    <TextField
                      fullWidth
                      label="Decisão-chave"
                      variant="outlined"
                      placeholder="Qual foi a decisão mais importante que você tomou?"
                      value={responses.decisions.keyDecision}
                      onChange={(e) => updateResponse('decisions.keyDecision', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Alternativa considerada"
                      variant="outlined"
                      placeholder="Que alternativa você considerou?"
                      value={responses.decisions.alternative}
                      onChange={(e) => updateResponse('decisions.alternative', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Justificativa"
                      variant="outlined"
                      placeholder="Por que você fez esta escolha em vez da alternativa?"
                      helperText={step.helper}
                      value={responses.decisions.rationale}
                      onChange={(e) => updateResponse('decisions.rationale', e.target.value)}
                    />
                  </Box>
                )}

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!isStepComplete(index)}
                  >
                    {index === steps.length - 1 ? 'Finalizar' : 'Próximo'}
                  </Button>
                </Box>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default DecisionJustificationForm;
