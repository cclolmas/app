import React, { useState, useEffect } from 'react';
import { 
  Box, Stepper, Step, StepLabel, Button, Typography, 
  Paper, Container, Divider, Alert, IconButton, 
  FormControlLabel, Switch, Tooltip
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MemoryIcon from '@mui/icons-material/Memory';
import SettingsIcon from '@mui/icons-material/Settings';

import DatasetSelection from './DatasetSelection';
import ModelConfiguration from './ModelConfiguration';
import TrainingConfiguration from './TrainingConfiguration';
import EvaluationSettings from './EvaluationSettings';
import ResourceEstimator from './ResourceEstimator';

// Guia do processo de fine-tuning
const steps = [
  'Seleção de Dados',
  'Configuração do Modelo',
  'Parâmetros de Treinamento',
  'Configuração de Avaliação'
];

const FineTuningWizard = ({ projectId, onSave, systemMetrics }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [expertiseLevel, setExpertiseLevel] = useState('beginner'); // beginner, intermediate, advanced
  
  // Estado para armazenar todas as configurações do fine-tuning
  const [fineTuningConfig, setFineTuningConfig] = useState({
    // Seleção de dados
    dataset: null,
    dataFormat: 'json',
    validationSplit: 0.1,
    
    // Configuração do modelo
    baseModel: null,
    quantization: 'q8', // Padrão mais seguro para iniciantes (H1)
    adapter: 'lora',
    
    // Configuração de treinamento
    epochs: 3,
    batchSize: 4,
    learningRate: 0.0002,
    loraRank: 16,
    loraAlpha: 32,
    loraDropout: 0.05,
    maxLength: 512,
    
    // Configuração de avaliação
    evalStrategy: 'perplexity',
    evalSamples: 5,
    evalMetrics: ['accuracy'],
    
    // Metadados
    name: '',
    description: '',
    tags: []
  });
  
  // Estado para armazenar problemas de validação
  const [validationErrors, setValidationErrors] = useState({});
  
  // Estimativa de recursos
  const [resourceEstimate, setResourceEstimate] = useState({
    vramUsage: 0,
    trainingTime: 0,
    diskSpace: 0,
    stability: 'alta'
  });
  
  // Detectar automaticamente o nível de experiência do usuário
  useEffect(() => {
    // Lógica de detecção baseada em interações passadas, configurações salvas, etc.
    // Por enquanto, começamos com beginner
    
    // Lógica para ajustar a visualização avançada com base no nível de expertise
    if (expertiseLevel === 'advanced') {
      setAdvancedMode(true);
    }
  }, []);
  
  // Recalcular estimativas de recursos quando a configuração mudar
  useEffect(() => {
    updateResourceEstimates();
  }, [fineTuningConfig]);
  
  // Atualizar estimativas de uso de recursos
  const updateResourceEstimates = () => {
    // Esta função calcularia o uso de VRAM, tempo de treinamento, etc.
    // com base nos parâmetros selecionados
    
    // Cálculo simplificado para demonstração
    const baseVramUsage = fineTuningConfig.baseModel?.sizeInGB || 0;
    const quantizationFactor = fineTuningConfig.quantization === 'q8' ? 1.0 : 0.6;
    const loraOverhead = fineTuningConfig.loraRank * (fineTuningConfig.loraAlpha / 32) * 0.1;
    const batchSizeFactor = fineTuningConfig.batchSize / 4;
    
    const vramEstimate = (baseVramUsage * quantizationFactor) + loraOverhead + (batchSizeFactor * 0.5);
    const trainingTimeEstimate = ((fineTuningConfig.dataset?.samples || 1) / 100) * 
                               fineTuningConfig.epochs * 
                               (fineTuningConfig.baseModel?.sizeInGB || 1) * 
                               (fineTuningConfig.quantization === 'q8' ? 1.5 : 1.0);
                               
    const stability = fineTuningConfig.quantization === 'q8' ? 'alta' : 'moderada';
    
    setResourceEstimate({
      vramUsage: vramEstimate,
      trainingTime: trainingTimeEstimate,
      diskSpace: ((fineTuningConfig.baseModel?.sizeInGB || 0) * 0.1) + (fineTuningConfig.dataset?.sizeInGB || 0),
      stability
    });
  };
  
  // Manipulador para alternar entre modos simples e avançados
  const handleModeToggle = () => {
    setAdvancedMode(!advancedMode);
  };
  
  // Atualizar uma seção específica da configuração
  const updateConfig = (section, newValues) => {
    setFineTuningConfig(prev => ({
      ...prev,
      ...newValues
    }));
  };
  
  // Avançar para o próximo passo
  const handleNext = () => {
    // Validar o passo atual antes de avançar
    const errors = validateStep(activeStep);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors({});
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  // Retornar ao passo anterior
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setValidationErrors({});
  };
  
  // Salvar a configuração final
  const handleFinish = async () => {
    // Validação final
    const errors = validateStep(activeStep);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Adicionar timestamp e metadados finais
    const finalConfig = {
      ...fineTuningConfig,
      timestamp: new Date().toISOString(),
      projectId
    };
    
    if (onSave) {
      await onSave(finalConfig);
    }
    
    // Poderia redirecionar para uma página de monitoramento de treinamento aqui
  };
  
  // Validar o passo atual
  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 0: // Seleção de Dados
        if (!fineTuningConfig.dataset) {
          errors.dataset = 'Selecione um conjunto de dados para continuar';
        }
        break;
      case 1: // Configuração do Modelo
        if (!fineTuningConfig.baseModel) {
          errors.baseModel = 'Selecione um modelo base para continuar';
        }
        
        // Verificar se há VRAM suficiente
        if (resourceEstimate.vramUsage > (systemMetrics?.vram?.available || 0)) {
          errors.vram = 'Configuração atual excede a VRAM disponível';
        }
        break;
      case 2: // Parâmetros de Treinamento
        if (!fineTuningConfig.name) {
          errors.name = 'Defina um nome para o modelo ajustado';
        }
        if (fineTuningConfig.epochs < 1) {
          errors.epochs = 'O número de épocas deve ser pelo menos 1';
        }
        break;
      case 3: // Configuração de Avaliação
        // Validações específicas para avaliação
        if (fineTuningConfig.evalSamples < 1) {
          errors.evalSamples = 'Defina pelo menos 1 amostra para avaliação';
        }
        break;
      default:
        break;
    }
    
    return errors;
  };
  
  // Obter o conteúdo do passo atual
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <DatasetSelection
            config={fineTuningConfig}
            onConfigUpdate={(values) => updateConfig('dataset', values)}
            advancedMode={advancedMode}
            errors={validationErrors}
          />
        );
      case 1:
        return (
          <ModelConfiguration
            config={fineTuningConfig}
            onConfigUpdate={(values) => updateConfig('model', values)}
            advancedMode={advancedMode}
            errors={validationErrors}
            systemMetrics={systemMetrics}
            resourceEstimate={resourceEstimate}
          />
        );
      case 2:
        return (
          <TrainingConfiguration
            config={fineTuningConfig}
            onConfigUpdate={(values) => updateConfig('training', values)}
            advancedMode={advancedMode}
            errors={validationErrors}
          />
        );
      case 3:
        return (
          <EvaluationSettings
            config={fineTuningConfig}
            onConfigUpdate={(values) => updateConfig('evaluation', values)}
            advancedMode={advancedMode}
            errors={validationErrors}
          />
        );
      default:
        return 'Passo desconhecido';
    }
  };
  
  // Dicas contextuais baseadas no nível de expertise
  const getCurrentTip = () => {
    if (expertiseLevel === 'beginner') {
      switch (activeStep) {
        case 0:
          return "Para resultados melhores, escolha um dataset relacionado à sua tarefa específica.";
        case 1:
          return "A opção Q8 é mais estável e recomendada para iniciantes, mesmo usando mais VRAM.";
        case 2:
          return "Para começar, 3 épocas costumam ser suficientes para ver resultados iniciais.";
        case 3:
          return "A avaliação com perplexidade é uma boa métrica para verificar a qualidade do ajuste.";
        default:
          return "";
      }
    } else {
      // Dicas para usuários avançados seriam diferentes
      return "";
    }
  };

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
        <Box sx={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Alterne entre visualização simplificada e avançada">
            <FormControlLabel
              control={
                <Switch
                  checked={advancedMode}
                  onChange={handleModeToggle}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SettingsIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">Modo Avançado</Typography>
                </Box>
              }
            />
          </Tooltip>
        </Box>

        <Typography variant="h4" component="h1" gutterBottom>
          Configuração de Fine-Tuning (QLoRA)
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Configure o processo de ajuste fino do seu modelo usando QLoRA. Esta técnica permite
          ajustar modelos grandes com requisitos mínimos de VRAM.
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <PsychologyIcon color="primary" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              Carga Cognitiva: {fineTuningConfig.quantization === 'q4' ? 'Alta' : 'Moderada'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MemoryIcon 
              color={resourceEstimate.vramUsage > (systemMetrics?.vram?.available * 0.9) ? 'error' : 'success'} 
              sx={{ mr: 0.5 }} 
            />
            <Typography variant="body2">
              VRAM Estimada: {resourceEstimate.vramUsage.toFixed(1)} GB
            </Typography>
          </Box>
        </Box>
        
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Dica contextual */}
        {getCurrentTip() && (
          <Alert 
            severity="info" 
            icon={<TipsAndUpdatesIcon />} 
            sx={{ mb: 3, display: expertiseLevel === 'advanced' ? 'none' : 'flex' }}
          >
            {getCurrentTip()}
          </Alert>
        )}

        {/* Conteúdo do passo atual */}
        <Box sx={{ mt: 2, minHeight: '400px' }}>
          {getStepContent(activeStep)}
        </Box>

        {/* Estimativa de Recursos */}
        <Box sx={{ mt: 4, mb: 3 }}>
          <Divider />
          <ResourceEstimator 
            estimate={resourceEstimate} 
            systemMetrics={systemMetrics}
          />
        </Box>

        {/* Alertas sobre trade-offs CL-CompL baseados na configuração atual */}
        {fineTuningConfig.quantization === 'q4' && (
          <Alert severity="warning" sx={{ mt: 2, mb: 3 }}>
            <Typography variant="subtitle2">
              Trade-off CL-CompL detectado (H1)
            </Typography>
            <Typography variant="body2">
              A quantização Q4 reduz a Carga Computacional (CompL), mas pode aumentar significativamente 
              a Carga Cognitiva (CL) devido à necessidade de maior depuração e validação dos resultados.
            </Typography>
          </Alert>
        )}

        {/* Navegação entre etapas */}
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
                onClick={handleFinish}
                disabled={Object.keys(validationErrors).length > 0}
              >
                Iniciar Fine-Tuning
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleNext}
                endIcon={<NavigateNextIcon />}
                disabled={Object.keys(validationErrors).length > 0}
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

export default FineTuningWizard;
