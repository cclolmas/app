import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent, Alert, Button, TextField, MenuItem, FormControl, InputLabel, Select, CircularProgress, Divider, Chip } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import MemoryIcon from '@mui/icons-material/Memory';
import TimerIcon from '@mui/icons-material/Timer';
import StackedResourceBarChart from './StackedResourceBarChart';
import SankeyDiagram from './SankeyDiagram';
import { 
  fetchResourceUsageData,
  fetchFlowData,
  fetchResourceComparisonData,
  fetchFlowComparisonData
} from '../../services/resourceMonitoringService';

const ResourceMonitorDashboard = () => {
  // State for dashboard data
  const [resourceData, setResourceData] = useState(null);
  const [flowData, setFlowData] = useState(null);
  const [comparisonResourceData, setComparisonResourceData] = useState(null);
  const [comparisonFlowData, setComparisonFlowData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Comparison configuration
  const [showComparisonPanel, setShowComparisonPanel] = useState(false);
  const [comparisonConfig, setComparisonConfig] = useState({
    modelName: '',
    quantization: 'Q8',
    taskType: 'Ajuste Fino'
  });
  
  // Resource stats summary
  const [resourceStats, setResourceStats] = useState({
    avgVRAM: 0,
    maxVRAM: 0,
    avgExecutionTime: 0,
    successRate: 0,
    avgRAM: 0 // Added average RAM
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch resource usage data
        const resourcesData = await fetchResourceUsageData();
        setResourceData(resourcesData);
        
        // Fetch flow data
        const flowData = await fetchFlowData();
        setFlowData(flowData);
        
        // Calculate summary statistics
        if (resourcesData && resourcesData.length > 0) {
          calculateStats(resourcesData);
        }
      } catch (err) {
        console.error("Error loading resource monitoring data:", err);
        setError("Falha ao carregar dados de monitoramento de recursos. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Calculate summary statistics
  const calculateStats = (data) => {
    if (!data || data.length === 0) return;
    
    const totalVRAM = data.reduce((sum, item) => sum + item.peakVRAM, 0);
    const maxVRAM = Math.max(...data.map(item => item.peakVRAM));
    const totalTime = data.reduce((sum, item) => sum + item.executionTime, 0);
    const successCount = data.filter(item => item.status === 'success').length;
    const totalRAM = data.reduce((sum, item) => sum + item.peakRAM, 0); // Added RAM calculation
    
    setResourceStats({
      avgVRAM: totalVRAM / data.length,
      maxVRAM: maxVRAM,
      avgExecutionTime: totalTime / data.length,
      successRate: (successCount / data.length) * 100,
      avgRAM: totalRAM / data.length // Added average RAM
    });
  };

  // Load comparison data
  const loadComparisonData = async () => {
    if (!comparisonConfig.modelName || !comparisonConfig.quantization || !comparisonConfig.taskType) {
      setError("Por favor, complete todas as configurações de comparação.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch comparison data for resource chart
      const resourcesComparisonData = await fetchResourceComparisonData({
        modelName: comparisonConfig.modelName,
        quantization: comparisonConfig.quantization,
        taskType: comparisonConfig.taskType
      });
      setComparisonResourceData(resourcesComparisonData);
      
      // Fetch comparison data for flow diagram
      const flowComparisonData = await fetchFlowComparisonData({
        modelName: comparisonConfig.modelName,
        quantization: comparisonConfig.quantization,
        taskType: comparisonConfig.taskType
      });
      setComparisonFlowData(flowComparisonData);
    } catch (err) {
      console.error("Error loading comparison data:", err);
      setError("Falha ao carregar dados de comparação. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle comparison panel toggle
  const toggleComparisonPanel = () => {
    setShowComparisonPanel(!showComparisonPanel);
    
    // If showing the panel and no comparison data, initialize with defaults
    if (!showComparisonPanel && !comparisonResourceData) {
      // Pre-select a different configuration than the current one
      if (resourceData && resourceData.length > 0) {
        const currentConfig = resourceData[0];
        // Choose a different quantization or model as default
        const alternativeQuantization = currentConfig.quantization === 'Q4' ? 'Q8' : 'Q4';
        setComparisonConfig({
          modelName: currentConfig.modelName,
          quantization: alternativeQuantization,
          taskType: currentConfig.taskType
        });
      }
    }
  };
  
  // Handle comparison config changes
  const handleComparisonConfigChange = (event) => {
    const { name, value } = event.target;
    setComparisonConfig({
      ...comparisonConfig,
      [name]: value
    });
  };
  
  // Available models and task types for comparison
  const availableModels = [
    'Mistral 7B',
    'Phi-3-mini',
    'Llama3 8B',
    'Deepseek-Coder',
    'GPT4All'
  ];
  
  const availableTaskTypes = [
    'Ajuste Fino',
    'Inferência',
    'Orquestração LMAS (2 agentes)',
    'Orquestração LMAS (4 agentes)',
    'Geração de Código'
  ];

  // Format large numbers for display
  const formatNumber = (num, decimals = 2) => {
    return num.toFixed(decimals).replace('.', ',');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Monitor de Recursos Computacionais
      </Typography>
      
      <Typography variant="body1" paragraph>
        Este painel permite visualizar e analisar o consumo de recursos computacionais 
        em diferentes cenários de execução de modelos de IA. Explore o impacto de suas 
        escolhas técnicas (modelo, quantização, arquitetura) nos recursos necessários.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MemoryIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Uso médio de VRAM
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'medium' }}>
                {isLoading ? <CircularProgress size={30} /> : `${formatNumber(resourceStats.avgVRAM)} GB`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MemoryIcon sx={{ color: 'error.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Pico de VRAM
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'medium' }}>
                {isLoading ? <CircularProgress size={30} /> : `${formatNumber(resourceStats.maxVRAM)} GB`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimerIcon sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Tempo médio de execução
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'medium' }}>
                {isLoading ? <CircularProgress size={30} /> : `${formatNumber(resourceStats.avgExecutionTime)} s`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" component="div">
                  Taxa de sucesso
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'medium' }}>
                {isLoading ? <CircularProgress size={30} /> : `${formatNumber(resourceStats.successRate)}%`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Comparison Panel */}
      <Paper sx={{ mb: 3, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CompareArrowsIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Comparação de Cenários
          </Typography>
        </Box>
        <Button 
          variant={showComparisonPanel ? "contained" : "outlined"} 
          onClick={toggleComparisonPanel}
          startIcon={<CompareArrowsIcon />}
        >
          {showComparisonPanel ? "Ocultar Painel de Comparação" : "Mostrar Painel de Comparação"}
        </Button>
      </Paper>
      
      {showComparisonPanel && (
        <Paper sx={{ mb: 3, p: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Configure o cenário para comparação:
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="model-label">Modelo</InputLabel>
                <Select
                  labelId="model-label"
                  name="modelName"
                  value={comparisonConfig.modelName}
                  onChange={handleComparisonConfigChange}
                  label="Modelo"
                >
                  {availableModels.map((model) => (
                    <MenuItem key={model} value={model}>{model}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="quantization-label">Quantização</InputLabel>
                <Select
                  labelId="quantization-label"
                  name="quantization"
                  value={comparisonConfig.quantization}
                  onChange={handleComparisonConfigChange}
                  label="Quantização"
                >
                  <MenuItem value="Q4">Q4 (mais compacto, menor qualidade)</MenuItem>
                  <MenuItem value="Q5">Q5</MenuItem>
                  <MenuItem value="Q8">Q8 (maior, melhor qualidade)</MenuItem>
                  <MenuItem value="F16">F16 (sem quantização)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="task-label">Tipo de Tarefa</InputLabel>
                <Select
                  labelId="task-label"
                  name="taskType"
                  value={comparisonConfig.taskType}
                  onChange={handleComparisonConfigChange}
                  label="Tipo de Tarefa"
                >
                  {availableTaskTypes.map((task) => (
                    <MenuItem key={task} value={task}>{task}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              onClick={loadComparisonData}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : "Carregar Dados de Comparação"}
            </Button>
          </Box>
          
          {comparisonResourceData && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  Comparando com: {comparisonConfig.modelName} {comparisonConfig.quantization} - {comparisonConfig.taskType}
                </Typography>
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Configuração Atual
                    </Typography>
                    <Typography variant="body2">
                      VRAM: {formatNumber(resourceStats.avgVRAM)} GB
                    </Typography>
                    <Typography variant="body2">
                      Tempo de Execução: {formatNumber(resourceStats.avgExecutionTime)} s
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Configuração Comparada
                    </Typography>
                    <Typography variant="body2">
                      VRAM: {formatNumber(comparisonResourceData.avgVRAM)} GB
                      <Chip 
                        size="small" 
                        label={`${comparisonResourceData.avgVRAM > resourceStats.avgVRAM ? '+' : ''}${formatNumber(comparisonResourceData.avgVRAM - resourceStats.avgVRAM)} GB`}
                        color={comparisonResourceData.avgVRAM > resourceStats.avgVRAM ? "error" : "success"}
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2">
                      Tempo de Execução: {formatNumber(comparisonResourceData.avgExecutionTime)} s
                      <Chip 
                        size="small" 
                        label={`${comparisonResourceData.avgExecutionTime > resourceStats.avgExecutionTime ? '+' : ''}${formatNumber(comparisonResourceData.avgExecutionTime - resourceStats.avgExecutionTime)} s`}
                        color={comparisonResourceData.avgExecutionTime > resourceStats.avgExecutionTime ? "error" : "success"}
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      )}
      
      {/* Main Visualizations */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StackedResourceBarChart 
            data={resourceData} 
            isLoading={isLoading}
            comparisonData={comparisonResourceData}
          />
        </Grid>
        
        <Grid item xs={12}>
          <SankeyDiagram 
            data={flowData} 
            comparisonData={comparisonFlowData}
            onComparisonRequest={() => {
              toggleComparisonPanel();
            }}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Interpretando os Resultados
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Trade-offs de Quantização
              </Typography>
              <Typography variant="body2" paragraph>
                A quantização reduz o tamanho do modelo e o consumo de VRAM, mas pode afetar a qualidade dos resultados:
              </Typography>
              <Typography variant="body2" component="ul">
                <li><strong>Q4</strong>: Mais compacto (~ 4 bits por peso), economiza ~75% de VRAM, mas pode gerar resultados instáveis.</li>
                <li><strong>Q8</strong>: Balanço intermediário (~ 8 bits por peso), economiza ~50% de VRAM com boa qualidade.</li>
                <li><strong>F16</strong>: Sem quantização (16 bits por peso), qualidade máxima, mas maior consumo de recursos.</li>
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Considerações de Arquitetura LMAS
              </Typography>
              <Typography variant="body2" paragraph>
                Sistemas Multi-agente Locais (LMAS) oferecem vantagens, mas considere:
              </Typography>
              <Typography variant="body2" component="ul">
                <li><strong>Paralelismo vs. Sequencial</strong>: Agentes paralelos aumentam o consumo de VRAM, mas podem reduzir o tempo total.</li>
                <li><strong>Especialização</strong>: Agentes menores especializados podem ser mais eficientes que um único modelo grande.</li>
                <li><strong>Overhead de Comunicação</strong>: A troca de mensagens entre agentes adiciona latência e processamento.</li>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ResourceMonitorDashboard;
