import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  Rating,
  Autocomplete
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ExperimentType, QuantizationType } from '../../types/ExperimentTypes';
import { experimentSharingService } from '../../services/ExperimentSharingService';
import { useAuth } from '../../hooks/useAuth';
import CLMetricsInput from './CLMetricsInput';
import MetricsFileUploader from './MetricsFileUploader';

const ExperimentSharingForm = ({ initialData, experimentId, isEditing = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Estado principal do experimento
  const [formData, setFormData] = useState({
    title: '',
    type: ExperimentType.FINE_TUNING,
    description: '',
    tags: [],
    visibility: 'public',
    classroomId: '',
    
    // Configuração básica
    config: {
      baseModel: '',
      quantization: QuantizationType.Q8,
      // Outros campos serão preenchidos com base no tipo de experimento
    },
    
    // Métricas
    compLMetrics: {
      vramUsage: [],
      ramUsage: [],
      cpuUsage: [],
    },
    clMetrics: {
      subjectiveRatings: []
    },
    qualityMetrics: {
      loss: [],
      validationLoss: [],
      accuracy: null,
      perplexity: null
    },
    
    // Hardware
    hardwareSpecs: {
      gpu: '',
      vram: 0,
      ram: 0,
      cpu: ''
    },
    
    // Trade-offs
    clCompLTradeoffs: {
      description: '',
      recommendation: '',
      rating: 3
    },
    
    // Anotações
    annotations: []
  });
  
  // Tag input
  const [tagInput, setTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState([
    'q4', 'q8', 'lora', 'qlora', 'mistral', 'llama', 'phi', 'high-cl', 'low-compl', 'optimal'
  ]);
  
  // Carregar dados existentes em modo de edição
  useEffect(() => {
    if (isEditing && experimentId) {
      setLoading(true);
      experimentSharingService.getExperimentById(experimentId)
        .then(data => {
          setFormData(prev => ({
            ...prev,
            ...data
          }));
        })
        .catch(err => {
          setError('Falha ao carregar dados do experimento.');
          console.error(err);
        })
        .finally(() => setLoading(false));
    } else if (initialData) {
      // Preencher com dados iniciais (por exemplo, de um experimento existente)
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [isEditing, experimentId, initialData]);
  
  // Métodos auxiliares para atualizar partes específicas do estado
  const updateBasicInfo = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const updateConfig = (field, value) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }));
  };
  
  const updateHardwareSpecs = (field, value) => {
    setFormData(prev => ({
      ...prev,
      hardwareSpecs: {
        ...prev.hardwareSpecs,
        [field]: value
      }
    }));
  };
  
  const updateTradeoffs = (field, value) => {
    setFormData(prev => ({
      ...prev,
      clCompLTradeoffs: {
        ...prev.clCompLTradeoffs,
        [field]: value
      }
    }));
  };
  
  // Manipulador para adicionar tags
  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };
  
  // Manipulador para remover tags
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Manipulador para submeter o formulário
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      // Adicionar informações do usuário
      const finalData = {
        ...formData,
        userId: user.id,
        userName: user.name
      };
      
      if (isEditing) {
        response = await experimentSharingService.updateExperiment(experimentId, finalData);
      } else {
        response = await experimentSharingService.shareExperiment(finalData);
      }
      
      setSuccess(true);
      // Navegar para a página de detalhes após um breve intervalo
      setTimeout(() => {
        navigate(`/experiments/shared/${response.id}`);
      }, 1500);
    } catch (err) {
      setError('Falha ao salvar o experimento. Verifique os dados e tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Renderização condicional de campos específicos para tipo de experimento
  const renderTypeSpecificFields = () => {
    if (formData.type === ExperimentType.FINE_TUNING) {
      return (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Modelo Base"
              value={formData.config.baseModel || ''}
              onChange={(e) => updateConfig('baseModel', e.target.value)}
              required
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Quantização</InputLabel>
              <Select
                value={formData.config.quantization || QuantizationType.Q8}
                onChange={(e) => updateConfig('quantization', e.target.value)}
                label="Quantização"
              >
                <MenuItem value={QuantizationType.Q4}>Q4 (INT4)</MenuItem>
                <MenuItem value={QuantizationType.Q5}>Q5 (INT5)</MenuItem>
                <MenuItem value={QuantizationType.Q8}>Q8 (INT8)</MenuItem>
                <MenuItem value={QuantizationType.FP16}>FP16</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Taxa de Aprendizado"
              type="number"
              inputProps={{ step: 0.0001, min: 0, max: 1 }}
              value={formData.config.learningRate || 0.0002}
              onChange={(e) => updateConfig('learningRate', parseFloat(e.target.value))}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Épocas"
              type="number"
              inputProps={{ min: 1, max: 100 }}
              value={formData.config.epochs || 3}
              onChange={(e) => updateConfig('epochs', parseInt(e.target.value, 10))}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tamanho do Batch"
              type="number"
              inputProps={{ min: 1, max: 64 }}
              value={formData.config.batchSize || 4}
              onChange={(e) => updateConfig('batchSize', parseInt(e.target.value, 10))}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Rank LoRA"
              type="number"
              inputProps={{ min: 1, max: 256 }}
              value={formData.config.loraRank || 16}
              onChange={(e) => updateConfig('loraRank', parseInt(e.target.value, 10))}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Alpha LoRA"
              type="number"
              inputProps={{ min: 1, max: 256 }}
              value={formData.config.loraAlpha || 32}
              onChange={(e) => updateConfig('loraAlpha', parseInt(e.target.value, 10))}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Dataset (Nome)"
              value={formData.config.datasetName || ''}
              onChange={(e) => updateConfig('datasetName', e.target.value)}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tamanho do Dataset (amostras)"
              type="number"
              inputProps={{ min: 1 }}
              value={formData.config.datasetSize || 1000}
              onChange={(e) => updateConfig('datasetSize', parseInt(e.target.value, 10))}
              margin="normal"
            />
          </Grid>
        </Grid>
      );
    } else if (formData.type === ExperimentType.LMAS) {
      return (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Padrão de Interação"
              value={formData.config.interactionPattern || ''}
              onChange={(e) => updateConfig('interactionPattern', e.target.value)}
              margin="normal"
              helperText="Descreva como os agentes interagem entre si (ex: Mestre-Trabalhador, Corrente)"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Modo de Execução</InputLabel>
              <Select
                value={formData.config.executionMode || 'sequential'}
                onChange={(e) => updateConfig('executionMode', e.target.value)}
                label="Modo de Execução"
              >
                <MenuItem value="sequential">Sequencial</MenuItem>
                <MenuItem value="parallel">Paralelo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tipo de Tarefa"
              value={formData.config.taskType || ''}
              onChange={(e) => updateConfig('taskType', e.target.value)}
              margin="normal"
              helperText="Ex: Revisão de Código, Geração de Testes, etc."
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Configuração de Agentes
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              A configuração detalhada dos agentes pode ser carregada via arquivo de configuração abaixo.
            </Alert>
          </Grid>
        </Grid>
      );
    }
    
    return null;
  };

  if (loading && !formData.title) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informações Básicas
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Título do Experimento"
              value={formData.title}
              onChange={(e) => updateBasicInfo('title', e.target.value)}
              required
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Tipo de Experimento</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => updateBasicInfo('type', e.target.value)}
                label="Tipo de Experimento"
              >
                <MenuItem value={ExperimentType.FINE_TUNING}>Fine-Tuning (QLoRA)</MenuItem>
                <MenuItem value={ExperimentType.LMAS}>Sistema Multi-Agente (LMAS)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descrição"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => updateBasicInfo('description', e.target.value)}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => removeTag(tag)}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
              
              <Autocomplete
                freeSolo
                options={availableTags.filter(tag => !formData.tags.includes(tag))}
                inputValue={tagInput}
                onInputChange={(_, value) => setTagInput(value)}
                onChange={(_, value) => value && addTag(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    label="Adicionar tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                  />
                )}
                size="small"
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Visibilidade</InputLabel>
              <Select
                value={formData.visibility}
                onChange={(e) => updateBasicInfo('visibility', e.target.value)}
                label="Visibilidade"
              >
                <MenuItem value="public">Público</MenuItem>
                <MenuItem value="classroom">Sala de Aula</MenuItem>
                <MenuItem value="private">Privado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Configuração do Experimento
        </Typography>
        
        {renderTypeSpecificFields()}
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Hardware Utilizado
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="GPU"
              value={formData.hardwareSpecs.gpu}
              onChange={(e) => updateHardwareSpecs('gpu', e.target.value)}
              margin="normal"
              helperText="Ex: NVIDIA RTX 3060, AMD RX 6700 XT"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="VRAM (GB)"
              type="number"
              inputProps={{ min: 0, step: 0.5 }}
              value={formData.hardwareSpecs.vram}
              onChange={(e) => updateHardwareSpecs('vram', parseFloat(e.target.value))}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="RAM (GB)"
              type="number"
              inputProps={{ min: 0, step: 1 }}
              value={formData.hardwareSpecs.ram}
              onChange={(e) => updateHardwareSpecs('ram', parseInt(e.target.value, 10))}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="CPU"
              value={formData.hardwareSpecs.cpu}
              onChange={(e) => updateHardwareSpecs('cpu', e.target.value)}
              margin="normal"
              helperText="Ex: Intel i7-11700K, AMD Ryzen 5 5600X"
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Métricas e Resultados
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          Você pode carregar arquivos de log ou métricas para preencher automaticamente esta seção.
        </Alert>
        
        <MetricsFileUploader
          onMetricsLoaded={(metrics) => {
            setFormData(prev => ({
              ...prev,
              compLMetrics: {
                ...prev.compLMetrics,
                ...metrics.compL
              },
              qualityMetrics: {
                ...prev.qualityMetrics,
                ...metrics.quality
              }
            }));
          }}
        />
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Carga Cognitiva (CL)
        </Typography>
        
        <CLMetricsInput
          value={formData.clMetrics}
          onChange={(clMetrics) => {
            setFormData(prev => ({
              ...prev,
              clMetrics
            }));
          }}
        />
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Análise de Trade-offs CL-CompL
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descrição dos Trade-offs Observados"
              multiline
              rows={3}
              value={formData.clCompLTradeoffs.description}
              onChange={(e) => updateTradeoffs('description', e.target.value)}
              margin="normal"
              placeholder="Descreva os trade-offs entre Carga Cognitiva (CL) e Carga Computacional (CompL) que você observou neste experimento..."
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Recomendações"
              multiline
              rows={2}
              value={formData.clCompLTradeoffs.recommendation}
              onChange={(e) => updateTradeoffs('recommendation', e.target.value)}
              margin="normal"
              placeholder="Com base nos resultados, que recomendações você faria para outros estudantes que queiram replicar ou melhorar este experimento?"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography gutterBottom>
              Avalie o equilíbrio CL-CompL encontrado neste experimento:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating
                name="cl-compl-balance"
                value={formData.clCompLTradeoffs.rating}
                onChange={(_, value) => updateTradeoffs('rating', value)}
                precision={1}
              />
              <Typography variant="body2" sx={{ ml: 2 }}>
                {formData.clCompLTradeoffs.rating === 1 && 'Muito desequilibrado (alta CL, baixa CompL ou vice-versa)'}
                {formData.clCompLTradeoffs.rating === 2 && 'Desequilibrado'}
                {formData.clCompLTradeoffs.rating === 3 && 'Moderadamente equilibrado'}
                {formData.clCompLTradeoffs.rating === 4 && 'Bem equilibrado'}
                {formData.clCompLTradeoffs.rating === 5 && 'Perfeitamente equilibrado ("ponto ideal" H3)'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Experimento salvo com sucesso! Redirecionando para visualização...
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          type="submit"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : isEditing ? 'Atualizar Experimento' : 'Compartilhar Experimento'}
        </Button>
      </Box>
    </Box>
  );
};

export default ExperimentSharingForm;
