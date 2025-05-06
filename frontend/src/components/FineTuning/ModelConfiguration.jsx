import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Grid, FormControl,
  InputLabel, Select, MenuItem, Button, Chip, Alert,
  RadioGroup, Radio, FormControlLabel, Paper, Slider,
  Divider, Tooltip, IconButton, Stack, LinearProgress
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import MemoryIcon from '@mui/icons-material/Memory';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SpeedIcon from '@mui/icons-material/Speed';
import ModelQuantizationDetails from '../Dashboard/ModelQuantizationDetails';

const ModelConfiguration = ({ 
  config, 
  onConfigUpdate, 
  advancedMode, 
  errors,
  systemMetrics,
  resourceEstimate
}) => {
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(config.baseModel);
  const [quantization, setQuantization] = useState(config.quantization);
  const [adapter, setAdapter] = useState(config.adapter);
  
  // Efeito para carregar modelos disponíveis
  useEffect(() => {
    // Em uma implementação real, isso seria uma chamada de API
    const fetchAvailableModels = async () => {
      // Dados simulados
      const models = [
        {
          id: 'mistral-7b',
          name: 'Mistral 7B',
          description: 'Modelo Mistral de 7 bilhões de parâmetros',
          sizeInGB: 7,
          contextSize: 4096,
          tags: ['general', '7B']
        },
        {
          id: 'llama2-7b',
          name: 'Llama 2 7B',
          description: 'Segunda geração do modelo Llama de 7 bilhões de parâmetros',
          sizeInGB: 7,
          contextSize: 4096,
          tags: ['general', '7B']
        },
        {
          id: 'codellama-7b',
          name: 'CodeLlama 7B',
          description: 'Variante do Llama 2 otimizada para código',
          sizeInGB: 7,
          contextSize: 4096,
          tags: ['code', '7B']
        },
        {
          id: 'mistral-7b-instruct',
          name: 'Mistral 7B Instruct',
          description: 'Modelo Mistral com ajuste fino para seguir instruções',
          sizeInGB: 7,
          contextSize: 4096,
          tags: ['instruct', '7B']
        },
        {
          id: 'llama2-13b',
          name: 'Llama 2 13B',
          description: 'Segunda geração do modelo Llama com 13 bilhões de parâmetros',
          sizeInGB: 13,
          contextSize: 4096,
          tags: ['general', '13B']
        }
      ];
      
      setAvailableModels(models);
      
      // Se não houver modelo selecionado, selecionar o primeiro
      if (!selectedModel && models.length > 0) {
        setSelectedModel(models[0]);
        onConfigUpdate({ baseModel: models[0] });
      }
    };
    
    fetchAvailableModels();
  }, []);
  
  // Função para selecionar um modelo
  const handleModelSelect = (model) => {
    setSelectedModel(model);
    onConfigUpdate({ baseModel: model });
  };
  
  // Função para alterar a quantização
  const handleQuantizationChange = (event) => {
    const newValue = event.target.value;
    setQuantization(newValue);
    onConfigUpdate({ quantization: newValue });
  };
  
  // Função para alterar o tipo de adapter
  const handleAdapterChange = (event) => {
    const newValue = event.target.value;
    setAdapter(newValue);
    onConfigUpdate({ adapter: newValue });
  };
  
  // Verificar se o modelo é compatível com o hardware
  const isModelCompatible = () => {
    if (!selectedModel || !systemMetrics || !systemMetrics.vram) return true;
    
    const modelSize = selectedModel.sizeInGB;
    const quantFactor = quantization === 'q8' ? 1.0 : 0.6;
    const requiredVram = modelSize * quantFactor;
    
    return requiredVram < (systemMetrics.vram.total / (1024 * 1024 * 1024));
  };
  
  // Cálculo da porcentagem de uso de VRAM
  const calculateVramUsagePercent = () => {
    if (!selectedModel || !systemMetrics || !systemMetrics.vram) return 0;
    
    const modelSize = selectedModel.sizeInGB;
    const quantFactor = quantization === 'q8' ? 1.0 : 0.6;
    const requiredVram = modelSize * quantFactor;
    const availableVram = systemMetrics.vram.total / (1024 * 1024 * 1024);
    
    return (requiredVram / availableVram) * 100;
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configuração do Modelo Base
      </Typography>
      
      <Typography variant="body2" paragraph color="text.secondary">
        Selecione o modelo base para ajuste fino e configure as opções de quantização.
        A quantização reduz o tamanho do modelo, economizando memória, mas pode afetar a qualidade.
      </Typography>
      
      {errors && errors.baseModel && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.baseModel}
        </Alert>
      )}
      
      {errors && errors.vram && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.vram}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Typography variant="subtitle2" gutterBottom>
            Modelos Disponíveis
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {availableModels.map((model) => (
              <Card 
                key={model.id} 
                variant="outlined"
                onClick={() => handleModelSelect(model)}
                sx={{ 
                  cursor: 'pointer',
                  border: selectedModel && selectedModel.id === model.id ? '2px solid' : '1px solid',
                  borderColor: selectedModel && selectedModel.id === model.id ? 'primary.main' : 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1">
                      {model.name}
                    </Typography>
                    <Chip label={`${model.sizeInGB}B`} color="primary" size="small" />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {model.description}
                  </Typography>
                  
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {model.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Opções de Quantização
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" paragraph color="text.secondary">
                A quantização afeta tanto a Carga Computacional (CompL) quanto a Carga Cognitiva (CL).
              </Typography>
              
              <FormControl component="fieldset">
                <RadioGroup
                  name="quantization"
                  value={quantization}
                  onChange={handleQuantizationChange}
                >
                  <FormControlLabel 
                    value="q8" 
                    control={<Radio />} 
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 'medium' }}>Q8 (8-bit)</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Tooltip title="Uso moderado de memória">
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                              <MemoryIcon sx={{ fontSize: '0.9rem', mr: 0.5, color: 'info.main' }} />
                              <Typography variant="caption">Médio</Typography>
                            </Box>
                          </Tooltip>
                          <Tooltip title="Alta estabilidade, menos depuração necessária">
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                              <PsychologyIcon sx={{ fontSize: '0.9rem', mr: 0.5, color: 'success.main' }} />
                              <Typography variant="caption">Baixa CL</Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                      </Box>
                    } 
                  />
                  
                  <FormControlLabel 
                    value="q4" 
                    control={<Radio />} 
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 'medium' }}>Q4 (4-bit)</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Tooltip title="Uso reduzido de memória">
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                              <MemoryIcon sx={{ fontSize: '0.9rem', mr: 0.5, color: 'success.main' }} />
                              <Typography variant="caption">Baixo</Typography>
                            </Box>
                          </Tooltip>
                          <Tooltip title="Maior instabilidade, requer mais depuração (H1)">
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                              <PsychologyIcon sx={{ fontSize: '0.9rem', mr: 0.5, color: 'error.main' }} />
                              <Typography variant="caption">Alta CL</Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                      </Box>
                    } 
                  />
                </RadioGroup>
              </FormControl>
            </Box>
            
            {/* Alerta sobre trade-off CL-CompL */}
            {quantization === 'q4' && (
              <Alert 
                severity="warning" 
                icon={<WarningIcon />}
                sx={{ mb: 2 }}
              >
                <Typography variant="body2">
                  <strong>Trade-off CL-CompL (H1):</strong> A quantização Q4 reduz significativamente o uso
                  de memória, mas pode exigir mais esforço mental para lidar com possíveis instabilidades
                  durante o treinamento e avaliação.
                </Typography>
              </Alert>
            )}
            
            {isModelCompatible() ? (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Uso estimado de VRAM: {(calculateVramUsagePercent()).toFixed(1)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={calculateVramUsagePercent()} 
                  color={calculateVramUsagePercent() > 80 ? 'warning' : 'primary'}
                  sx={{ height: 8, borderRadius: 5 }}
                />
              </Box>
            ) : (
              <Alert severity="error" sx={{ mb: 2 }}>
                Este modelo provavelmente não funcionará com o hardware disponível.
                Considere usar uma quantização mais agressiva ou um modelo menor.
              </Alert>
            )}
            
            {advancedMode && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Tipo de Adapter
                </Typography>
                
                <FormControl fullWidth size="small">
                  <InputLabel id="adapter-label">Método de Adapter</InputLabel>
                  <Select
                    labelId="adapter-label"
                    value={adapter}
                    label="Método de Adapter"
                    onChange={handleAdapterChange}
                  >
                    <MenuItem value="lora">LoRA</MenuItem>
                    <MenuItem value="qlora">QLoRA</MenuItem>
                    <MenuItem value="adalora">AdaLoRA</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </Paper>
          
          {selectedModel && (
            <Alert severity="info" icon={<InfoIcon />}>
              <Typography variant="body2">
                O modelo {selectedModel.name} tem {selectedModel.sizeInGB} bilhões de parâmetros
                e tamanho de contexto de {selectedModel.contextSize} tokens.
              </Typography>
            </Alert>
          )}
        </Grid>
      </Grid>
      
      {/* Componente detalhado de informações sobre quantização */}
      {selectedModel && (
        <Box sx={{ mt: 3 }}>
          <ModelQuantizationDetails
            modelConfig={{
              modelName: selectedModel.name,
              modelSize: selectedModel.sizeInGB,
              quantization: quantization,
              contextLength: selectedModel.contextSize
            }}
            systemMetrics={systemMetrics}
            expertiseLevel="intermediate"
          />
        </Box>
      )}
    </Box>
  );
};

export default ModelConfiguration;
