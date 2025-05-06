import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Chip, 
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MemoryIcon from '@mui/icons-material/Memory';

import { experimentSharingService } from '../../services/ExperimentSharingService';
import { SharedExperiment, ExperimentType } from '../../types/ExperimentTypes';
import ExperimentCharts from './ExperimentCharts';
import ExperimentComparisonTable from './ExperimentComparisonTable';
import ExperimentCorrelationChart from './ExperimentCorrelationChart';
import ExperimentSelectDialog from './ExperimentSelectDialog';
import PatternInsightCard from './PatternInsightCard';

// Cores para diferentes experimentos
const CHART_COLORS = [
  '#1976d2',  // azul
  '#e53935',  // vermelho
  '#43a047',  // verde
  '#fb8c00',  // laranja
  '#8e24aa',  // roxo
  '#00acc1',  // ciano
  '#ffb300',  // âmbar
  '#546e7a',  // azul-cinza
];

// Dimensões que podem ser comparadas
const COMPARISON_DIMENSIONS = {
  VRAM: 'vram_usage',
  RAM: 'ram_usage',
  TRAINING_TIME: 'training_time',
  LOSS: 'loss',
  VAL_LOSS: 'validation_loss',
  COGNITIVE_LOAD: 'cognitive_load',
  ACCURACY: 'accuracy',
  PERPLEXITY: 'perplexity'
};

// Parâmetros que podem ser correlacionados
const CORRELATION_PARAMETERS = {
  FINE_TUNING: [
    { key: 'loraRank', label: 'Rank LoRA' },
    { key: 'loraAlpha', label: 'Alpha LoRA' },
    { key: 'batchSize', label: 'Tamanho do Batch' },
    { key: 'epochs', label: 'Épocas' },
    { key: 'quantization', label: 'Quantização' }
  ],
  LMAS: [
    { key: 'agentCount', label: 'Número de Agentes' },
    { key: 'executionMode', label: 'Modo de Execução' },
    { key: 'avgModelSize', label: 'Tamanho Médio de Modelo' },
    { key: 'quantization', label: 'Quantização' }
  ]
};

/**
 * Componente para comparar múltiplos experimentos e visualizar padrões
 */
const ExperimentComparison = ({ 
  initialExperiments = [], 
  showPatternInsights = true,
  showAddExperiment = true
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [experiments, setExperiments] = useState(initialExperiments);
  const [selectDialogOpen, setSelectDialogOpen] = useState(false);
  
  const [viewMode, setViewMode] = useState('charts');
  const [chartDimension, setChartDimension] = useState(COMPARISON_DIMENSIONS.VRAM);
  const [correlationParameter, setCorrelationParameter] = useState('');
  const [correlationMetric, setCorrelationMetric] = useState('');
  const [patternInsights, setPatternInsights] = useState([]);
  
  // Determinar tipo de experimento predominante
  const experimentType = useMemo(() => {
    if (experiments.length === 0) return null;
    
    const types = experiments.map(exp => exp.type);
    // Retorna o tipo mais comum
    return types.sort((a, b) => 
      types.filter(t => t === a).length - types.filter(t => t === b).length
    ).pop();
  }, [experiments]);
  
  // Atualizar parâmetro de correlação quando o tipo de experimento mudar
  useEffect(() => {
    if (experimentType) {
      const params = experimentType === ExperimentType.FINE_TUNING 
        ? CORRELATION_PARAMETERS.FINE_TUNING 
        : CORRELATION_PARAMETERS.LMAS;
      
      if (params.length > 0 && !correlationParameter) {
        setCorrelationParameter(params[0].key);
      }
      
      if (!correlationMetric) {
        setCorrelationMetric(COMPARISON_DIMENSIONS.VRAM);
      }
    }
  }, [experimentType, correlationParameter, correlationMetric]);
  
  // Carregar insights de padrões baseados nos experimentos selecionados
  useEffect(() => {
    if (experiments.length >= 2 && showPatternInsights) {
      setLoading(true);
      experimentSharingService.getExperimentPatterns({ 
        type: experimentType,
        parameter: correlationParameter || undefined,
        metric: correlationMetric || undefined
      })
        .then(data => {
          setPatternInsights(data.patterns || []);
        })
        .catch(err => {
          console.error('Failed to load pattern insights:', err);
          setError('Não foi possível carregar análises de padrões.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [experiments, experimentType, showPatternInsights, correlationParameter, correlationMetric]);
  
  // Remover um experimento da comparação
  const handleRemoveExperiment = (experimentId) => {
    setExperiments(prev => prev.filter(exp => exp.id !== experimentId));
  };
  
  // Adicionar um experimento à comparação
  const handleAddExperiment = (experiment) => {
    // Verificar se o experimento já está na lista
    if (experiments.some(exp => exp.id === experiment.id)) {
      return;
    }
    
    // Verificar compatibilidade de tipo se já houver experimentos
    if (experiments.length > 0 && experiment.type !== experimentType) {
      setError('Só é possível comparar experimentos do mesmo tipo.');
      return;
    }
    
    setExperiments(prev => [...prev, experiment]);
  };
  
  // Manipulação da seleção de experimentos
  const handleSelectExperiment = (selectedExperiments) => {
    if (selectedExperiments && selectedExperiments.length > 0) {
      // Filtrar para não adicionar duplicatas
      const newExperiments = selectedExperiments.filter(
        selected => !experiments.some(exp => exp.id === selected.id)
      );
      
      setExperiments(prev => [...prev, ...newExperiments]);
    }
    setSelectDialogOpen(false);
  };
  
  // Manipular mudança de modo de visualização
  const handleViewModeChange = (_, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };
  
  // Renderização condicional para os diferentes modos de visualização
  const renderVisualization = () => {
    if (experiments.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, height: 300 }}>
          <Typography color="text.secondary" align="center">
            Selecione pelo menos um experimento para visualizar.
          </Typography>
        </Box>
      );
    }
    
    switch (viewMode) {
      case 'charts':
        return (
          <ExperimentCharts
            experiments={experiments}
            dimension={chartDimension}
            colors={CHART_COLORS.slice(0, experiments.length)}
            height={400}
          />
        );
      case 'table':
        return (
          <ExperimentComparisonTable
            experiments={experiments}
            experimentType={experimentType}
          />
        );
      case 'correlation':
        return (
          <ExperimentCorrelationChart
            experiments={experiments}
            parameter={correlationParameter}
            metric={correlationMetric}
            colors={CHART_COLORS.slice(0, experiments.length)}
            height={400}
            experimentType={experimentType}
          />
        );
      default:
        return null;
    }
  };
  
  // Renderizar controles específicos do modo de visualização
  const renderViewControls = () => {
    switch (viewMode) {
      case 'charts':
        return (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="chart-dimension-label">Dimensão</InputLabel>
            <Select
              labelId="chart-dimension-label"
              value={chartDimension}
              label="Dimensão"
              onChange={(e) => setChartDimension(e.target.value)}
            >
              <MenuItem value={COMPARISON_DIMENSIONS.VRAM}>Uso de VRAM</MenuItem>
              <MenuItem value={COMPARISON_DIMENSIONS.RAM}>Uso de RAM</MenuItem>
              <MenuItem value={COMPARISON_DIMENSIONS.TRAINING_TIME}>Tempo de Treinamento</MenuItem>
              <MenuItem value={COMPARISON_DIMENSIONS.LOSS}>Loss</MenuItem>
              <MenuItem value={COMPARISON_DIMENSIONS.VAL_LOSS}>Validation Loss</MenuItem>
              <MenuItem value={COMPARISON_DIMENSIONS.COGNITIVE_LOAD}>Carga Cognitiva</MenuItem>
              {experimentType === ExperimentType.FINE_TUNING && (
                <>
                  <MenuItem value={COMPARISON_DIMENSIONS.ACCURACY}>Acurácia</MenuItem>
                  <MenuItem value={COMPARISON_DIMENSIONS.PERPLEXITY}>Perplexidade</MenuItem>
                </>
              )}
            </Select>
          </FormControl>
        );
      case 'correlation':
        return (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="correlation-param-label">Parâmetro</InputLabel>
              <Select
                labelId="correlation-param-label"
                value={correlationParameter}
                label="Parâmetro"
                onChange={(e) => setCorrelationParameter(e.target.value)}
              >
                {(experimentType === ExperimentType.FINE_TUNING
                  ? CORRELATION_PARAMETERS.FINE_TUNING
                  : CORRELATION_PARAMETERS.LMAS
                ).map(param => (
                  <MenuItem key={param.key} value={param.key}>{param.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="correlation-metric-label">Métrica</InputLabel>
              <Select
                labelId="correlation-metric-label"
                value={correlationMetric}
                label="Métrica"
                onChange={(e) => setCorrelationMetric(e.target.value)}
              >
                <MenuItem value={COMPARISON_DIMENSIONS.VRAM}>Uso de VRAM</MenuItem>
                <MenuItem value={COMPARISON_DIMENSIONS.RAM}>Uso de RAM</MenuItem>
                <MenuItem value={COMPARISON_DIMENSIONS.TRAINING_TIME}>Tempo de Execução</MenuItem>
                <MenuItem value={COMPARISON_DIMENSIONS.COGNITIVE_LOAD}>Carga Cognitiva</MenuItem>
                {experimentType === ExperimentType.FINE_TUNING && (
                  <>
                    <MenuItem value={COMPARISON_DIMENSIONS.LOSS}>Loss Final</MenuItem>
                    <MenuItem value={COMPARISON_DIMENSIONS.ACCURACY}>Acurácia</MenuItem>
                    <MenuItem value={COMPARISON_DIMENSIONS.PERPLEXITY}>Perplexidade</MenuItem>
                  </>
                )}
              </Select>
            </FormControl>
          </Box>
        );
      default:
        return null;
    }
  };
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CompareArrowsIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Comparação de Experimentos
              {experimentType && (
                <Chip 
                  label={experimentType === ExperimentType.FINE_TUNING ? 'Fine-Tuning' : 'LMAS'} 
                  size="small" 
                  color="primary"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
          </Box>
          
          {showAddExperiment && (
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={() => setSelectDialogOpen(true)}
              disabled={loading}
            >
              Adicionar Experimento
            </Button>
          )}
        </Box>
        
        {/* Experimentos selecionados */}
        <Grid container spacing={1} sx={{ mb: 3 }}>
          {experiments.map((experiment, index) => (
            <Grid item key={experiment.id}>
              <Chip
                label={experiment.title}
                onDelete={() => handleRemoveExperiment(experiment.id)}
                sx={{ 
                  backgroundColor: CHART_COLORS[index % CHART_COLORS.length] + '20',
                  borderLeft: `4px solid ${CHART_COLORS[index % CHART_COLORS.length]}`,
                  pl: 1
                }}
              />
            </Grid>
          ))}
          
          {experiments.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="info">
                Selecione experimentos para comparar seus parâmetros e resultados.
              </Alert>
            </Grid>
          )}
        </Grid>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Controles de visualização */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="charts">
              <TimelineIcon sx={{ mr: 1 }} />
              Gráficos
            </ToggleButton>
            <ToggleButton value="table">
              <TableChartIcon sx={{ mr: 1 }} />
              Tabela
            </ToggleButton>
            <ToggleButton value="correlation">
              <BubbleChartIcon sx={{ mr: 1 }} />
              Correlação
            </ToggleButton>
          </ToggleButtonGroup>
          
          {renderViewControls()}
        </Box>
        
        {/* Visualização principal */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          renderVisualization()
        )}
      </Paper>
      
      {/* Insights de Padrões */}
      {showPatternInsights && experiments.length >= 2 && patternInsights.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <InfoOutlinedIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Insights e Padrões Identificados
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {patternInsights.map((insight, index) => (
              <Grid item xs={12} md={6} key={index}>
                <PatternInsightCard insight={insight} />
              </Grid>
            ))}
          </Grid>
          
          {/* CL-CompL Trade-off Analysis */}
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Análise de Trade-offs CL-CompL
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PsychologyIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1">Impacto na Carga Cognitiva (CL)</Typography>
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                      {experimentType === ExperimentType.FINE_TUNING
                        ? "A análise mostra que configurações com Q4 (para reduzir CompL) tipicamente resultam em maior carga cognitiva reportada devido à instabilidade e necessidade de mais depuração (H1)."
                        : "Sistemas com mais de 3 agentes paralelos aumentam tanto CompL quanto CL devido à complexidade de gerenciar interações e depurar problemas (H2)."}
                    </Typography>
                    
                    <Alert severity="info" sx={{ mt: 1 }}>
                      {correlationParameter === 'quantization' 
                        ? "Ao comparar Q8 vs Q4, usuários reportam em média 27% mais esforço cognitivo com Q4 apesar do menor uso de recursos."
                        : "Os experimentos mostram uma relação não-linear entre parâmetros técnicos e esforço cognitivo percebido."}
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <MemoryIcon color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1">Recomendações para o "Ponto Ideal" (H3)</Typography>
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                      {experimentType === ExperimentType.FINE_TUNING
                        ? "Baseado nos experimentos comparados, o ponto de equilíbrio parece ser alcançado usando rank LoRA entre 16-32 com quantização Q8 para usuários iniciantes, enquanto usuários avançados conseguem gerenciar melhor configurações Q4."
                        : "Para LMAS, o ponto ideal parece ser 2-3 agentes em execução sequencial ou com paralelismo limitado, especialmente em hardware com restrições."}
                    </Typography>
                    
                    <Alert severity="success" sx={{ mt: 1 }}>
                      As configurações com melhor avaliação de equilíbrio CL-CompL focam em estabilidade e previsibilidade em vez de otimização máxima de recursos.
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}
      
      {/* Dialog para selecionar experimentos */}
      <ExperimentSelectDialog
        open={selectDialogOpen}
        onClose={() => setSelectDialogOpen(false)}
        onSelect={handleSelectExperiment}
        type={experimentType || undefined}
        excludeIds={experiments.map(e => e.id)}
        multiSelect={true}
      />
    </Box>
  );
};

export default ExperimentComparison;
