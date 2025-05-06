import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, Stepper, Step, 
  StepLabel, Button, Grid, Alert, Divider 
} from '@mui/material';
import ModelSelector from '../components/ModelConfiguration/ModelSelector';
import QuantizationSelector from '../components/Quantization/QuantizationSelector';
import ModelQuantizationDetails from '../components/ModelConfiguration/ModelQuantizationDetails';
import { getSystemMetrics } from '../services/api';
import { analyzeModelFitForHardware } from '../utils/modelUtils';

const ModelSetupView = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedQuantization, setSelectedQuantization] = useState('q8');  // Default Q8 for stability
  const [systemMetrics, setSystemMetrics] = useState({
    ram: { total: 0, used: 0 },
    vram: { total: 0, used: 0 },
    cpu: { usage: 0 },
    gpu: { usage: 0 }
  });
  const [modelFitAnalysis, setModelFitAnalysis] = useState(null);
  const [expertiseLevel, setExpertiseLevel] = useState('intermediate');
  const steps = ['Selecionar modelo', 'Configurar quantização', 'Revisar e aplicar'];

  // Carregar métricas do sistema ao montar o componente
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metrics = await getSystemMetrics();
        setSystemMetrics(metrics);
      } catch (error) {
        console.error('Erro ao carregar métricas do sistema:', error);
      }
    };
    
    fetchMetrics();
    const intervalId = setInterval(fetchMetrics, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Analisar a adequação do modelo ao hardware quando o modelo ou quantização mudam
  useEffect(() => {
    if (selectedModel) {
      const modelConfig = {
        modelSize: selectedModel.parameters,
        quantization: selectedQuantization,
        contextLength: selectedModel.contextSize || 4096
      };
      
      const analysis = analyzeModelFitForHardware(modelConfig, systemMetrics);
      setModelFitAnalysis(analysis);
    }
  }, [selectedModel, selectedQuantization, systemMetrics]);

  // Avançar para o próximo passo
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  // Voltar para o passo anterior
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Finalizar o processo
  const handleFinish = () => {
    // Implementação para salvar configurações e aplicar ao modelo
    console.log('Configuração finalizada:', {
      model: selectedModel,
      quantization: selectedQuantization
    });
    
    // Aqui você pode enviar a configuração para a API
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Configuração do Modelo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Configure seu modelo de linguagem local otimizando o equilíbrio entre Carga Cognitiva (CL) e Carga Computacional (CompL).
      </Typography>

      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2, minHeight: '400px' }}>
          {activeStep === 0 && (
            <ModelSelector 
              onModelSelect={setSelectedModel} 
              selectedModel={selectedModel}
              systemMetrics={systemMetrics}
            />
          )}
          
          {activeStep === 1 && (
            <QuantizationSelector
              modelSize={selectedModel?.parameters || 7}
              selectedQuantization={selectedQuantization}
              onQuantizationChange={setSelectedQuantization}
              availableVram={systemMetrics.vram.total - systemMetrics.vram.used}
              contextLength={selectedModel?.contextSize || 4096}
            />
          )}
          
          {activeStep === 2 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Revisar Configuração
              </Typography>
              
              {selectedModel && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Modelo Selecionado
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle1">{selectedModel.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedModel.parameters} bilhões de parâmetros • Contexto: {selectedModel.contextSize} tokens
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {selectedModel.description}
                    </Typography>
                  </Paper>
                  
                  <ModelQuantizationDetails
                    modelConfig={{
                      modelName: selectedModel.name,
                      modelSize: selectedModel.parameters,
                      quantization: selectedQuantization,
                      contextLength: selectedModel.contextSize || 4096
                    }}
                    systemMetrics={systemMetrics}
                    expertiseLevel={expertiseLevel}
                  />
                  
                  {modelFitAnalysis && !modelFitAnalysis.fits && (
                    <Alert severity="error" sx={{ mt: 3 }}>
                      Este modelo provavelmente não funcionará no seu hardware atual com a configuração selecionada.
                      Considere usar uma quantização mais agressiva ou um modelo menor.
                    </Alert>
                  )}
                  
                  {modelFitAnalysis && modelFitAnalysis.fits && modelFitAnalysis.adequacyLevel === 'tight' && (
                    <Alert severity="warning" sx={{ mt: 3 }}>
                      Este modelo está próximo do limite dos recursos disponíveis. O desempenho pode ser afetado.
                    </Alert>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Voltar
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleFinish}
                disabled={!selectedModel || (modelFitAnalysis && !modelFitAnalysis.fits)}
              >
                Finalizar
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleNext}
                disabled={(activeStep === 0 && !selectedModel)}
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

export default ModelSetupView;
