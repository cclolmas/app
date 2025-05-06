import React, { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Box, Typography, FormControl, Select, MenuItem, FormControlLabel, Switch, InputLabel, Paper, Grid, Button } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CircularProgress from '@mui/material/CircularProgress';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StackedResourceBarChart = ({ 
  data, 
  isLoading = false, 
  onSortChange, 
  onDisplayModeChange, 
  onFilterChange 
}) => {
  // State for chart configuration
  const [sortBy, setSortBy] = useState('total');
  const [displayMode, setDisplayMode] = useState('absolute'); // 'absolute' or 'percentage'
  const [taskFilter, setTaskFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [error, setError] = useState(null);

  // Hardware reference limits in GB
  const commonVRamLimits = {
    "GTX 1060/1660": 6,
    "RTX 3060": 12,
    "RTX 4090": 24
  };

  // Process data for chart display with error handling
  const processedData = React.useMemo(() => {
    try {
      if (!data || data.length === 0) return null;
      
      // Filter data based on selected filters
      let filteredData = [...data];
      if (taskFilter !== 'all') {
        filteredData = filteredData.filter(item => item.taskType === taskFilter);
      }
      if (modelFilter !== 'all') {
        filteredData = filteredData.filter(item => item.modelName.includes(modelFilter));
      }

      // Sort data based on selection
      filteredData.sort((a, b) => {
        if (sortBy === 'total') {
          return (b.peakVRAM + b.executionTime + b.avgRAM) - 
                 (a.peakVRAM + a.executionTime + a.avgRAM);
        }
        return b[sortBy] - a[sortBy];
      });

      // Process for display
      const labels = filteredData.map(item => {
        const modelParts = item.modelName.split(' ');
        const modelShort = modelParts.length > 2 ? 
                          `${modelParts[0]} ${modelParts[1]}...` : 
                          item.modelName;
        return `${item.taskType} - ${modelShort} ${item.quantization}`;
      });

      // Calculate total resource consumption for percentage calculation
      const totals = filteredData.map(item => 
        item.peakVRAM + item.executionTime + item.avgRAM + item.totalTime
      );

      // Prepare datasets
      const datasets = [
        {
          label: 'Pico de VRAM (GB)',
          data: displayMode === 'absolute' ? 
                filteredData.map(item => item.peakVRAM) :
                filteredData.map((item, idx) => (item.peakVRAM / totals[idx]) * 100),
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1,
        },
        {
          label: 'Tempo de GPU (s)',
          data: displayMode === 'absolute' ? 
                filteredData.map(item => item.gpuTime) :
                filteredData.map((item, idx) => (item.gpuTime / totals[idx]) * 100),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1,
        },
        {
          label: 'Uso médio de RAM (GB)',
          data: displayMode === 'absolute' ? 
                filteredData.map(item => item.avgRAM) :
                filteredData.map((item, idx) => (item.avgRAM / totals[idx]) * 100),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1,
        },
        {
          label: 'Tempo total de execução (s)',
          data: displayMode === 'absolute' ? 
                filteredData.map(item => item.totalTime) :
                filteredData.map((item, idx) => (item.totalTime / totals[idx]) * 100),
          backgroundColor: 'rgba(153, 102, 255, 0.8)',
          borderColor: 'rgb(153, 102, 255)',
          borderWidth: 1,
        },
      ];

      // Original indices for reference
      const originalIndices = filteredData.map((_, idx) => idx);

      return {
        labels,
        datasets,
        originalData: filteredData,
        originalIndices
      };
    } catch (err) {
      console.error('Error processing chart data:', err);
      setError(`Failed to process chart data: ${err.message}`);
      return null;
    }
  }, [data, sortBy, displayMode, taskFilter, modelFilter]);

  // Debug logging to help diagnose issues
  useEffect(() => {
    if (!data) {
      console.log('StackedResourceBarChart: No data provided');
    } else {
      console.log(`StackedResourceBarChart: Received data with ${data.length} items`);
    }
    
    if (processedData) {
      console.log('StackedResourceBarChart: Successfully processed data');
    }
  }, [data, processedData]);

  // Register chart with initializer if available
  useEffect(() => {
    if (window.chartInitializer && processedData && !isLoading) {
      window.chartInitializer.register('stackedResourceBar', 
        (container, chartData) => {
          // This function will be called by the initializer
          // It's just a placeholder as the Bar component handles rendering
          return true;
        }, 
        { 
          containerId: 'stacked-resource-chart',
          data: processedData,
          type: 'bar'
        }
      );
    }
  }, [processedData, isLoading]);

  // Handle control changes
  const handleSortChange = (event) => {
    const newSortBy = event.target.value;
    setSortBy(newSortBy);
    if (onSortChange) onSortChange(newSortBy);
  };

  const handleDisplayModeChange = (event) => {
    const newMode = event.target.checked ? 'percentage' : 'absolute';
    setDisplayMode(newMode);
    if (onDisplayModeChange) onDisplayModeChange(newMode);
  };

  const handleTaskFilterChange = (event) => {
    setTaskFilter(event.target.value);
    if (onFilterChange) onFilterChange({ task: event.target.value, model: modelFilter });
  };

  const handleModelFilterChange = (event) => {
    setModelFilter(event.target.value);
    if (onFilterChange) onFilterChange({ task: taskFilter, model: event.target.value });
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        }
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: displayMode === 'absolute' ? 
                'Consumo de Recursos (GB ou segundos)' : 
                'Percentual do Consumo Total (%)'
        },
        // Add reference lines for VRAM limits if in absolute mode
        ...(displayMode === 'absolute' && {
          grid: {
            color: (context) => {
              const vramLimitValues = Object.values(commonVRamLimits);
              if (vramLimitValues.includes(context.tick.value)) {
                return 'rgba(255, 0, 0, 0.5)';
              }
              return 'rgba(0, 0, 0, 0.1)';
            },
            lineWidth: (context) => {
              const vramLimitValues = Object.values(commonVRamLimits);
              if (vramLimitValues.includes(context.tick.value)) {
                return 2;
              }
              return 1;
            },
          }
        })
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Consumo de Recursos Computacionais por Cenário'
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            if (!items.length) return '';
            const index = items[0].dataIndex;
            return processedData?.labels[index] || '';
          },
          label: (context) => {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y;
            if (displayMode === 'percentage') {
              return `${datasetLabel}: ${value.toFixed(1)}%`;
            }
            const unit = datasetLabel.includes('Tempo') ? 's' : 'GB';
            return `${datasetLabel}: ${value.toFixed(2)} ${unit}`;
          },
          afterBody: (items) => {
            if (!items.length || !processedData) return '';
            
            const index = items[0].dataIndex;
            const originalIndex = processedData.originalIndices[index];
            const item = processedData.originalData[originalIndex];
            
            // Check if VRAM usage exceeds common limits
            let warnings = [];
            for (const [gpu, limit] of Object.entries(commonVRamLimits)) {
              if (item.peakVRAM > limit) {
                warnings.push(`⚠️ Ultrapassa limite de ${gpu} (${limit}GB)`);
              }
            }
            
            return warnings.length ? '\n' + warnings.join('\n') : '';
          }
        }
      }
    }
  };

  // Determine available task types and models for filters
  const availableTaskTypes = React.useMemo(() => {
    if (!data) return [];
    return ['all', ...new Set(data.map(item => item.taskType))];
  }, [data]);

  const availableModels = React.useMemo(() => {
    if (!data) return [];
    
    // Extract model names and create a clean set
    const modelNames = new Set();
    data.forEach(item => {
      const modelBaseName = item.modelName.split(' ')[0];
      modelNames.add(modelBaseName);
    });
    
    return ['all', ...Array.from(modelNames)];
  }, [data]);

  // Render chart with controls
  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2">
          Consumo de Recursos Computacionais
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="sort-by-label">Ordenar por</InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortBy}
              label="Ordenar por"
              onChange={handleSortChange}
            >
              <MenuItem value="total">Consumo Total</MenuItem>
              <MenuItem value="peakVRAM">VRAM</MenuItem>
              <MenuItem value="gpuTime">Tempo de GPU</MenuItem>
              <MenuItem value="avgRAM">RAM</MenuItem>
              <MenuItem value="totalTime">Tempo Total</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch 
                checked={displayMode === 'percentage'} 
                onChange={handleDisplayModeChange}
              />
            }
            label="Percentual"
          />
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="task-filter-label">Tipo de Tarefa</InputLabel>
            <Select
              labelId="task-filter-label"
              value={taskFilter}
              label="Tipo de Tarefa"
              onChange={handleTaskFilterChange}
            >
              {availableTaskTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type === 'all' ? 'Todas as Tarefas' : type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="model-filter-label">Modelo Base</InputLabel>
            <Select
              labelId="model-filter-label"
              value={modelFilter}
              label="Modelo Base"
              onChange={handleModelFilterChange}
            >
              {availableModels.map(model => (
                <MenuItem key={model} value={model}>
                  {model === 'all' ? 'Todos os Modelos' : model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Reference lines legend */}
      {displayMode === 'absolute' && (
        <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            Limites de VRAM comuns:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {Object.entries(commonVRamLimits).map(([gpu, limit]) => (
              <Box key={gpu} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 2, 
                    bgcolor: 'rgba(255, 0, 0, 0.5)'
                  }}
                />
                <Typography variant="caption">
                  {gpu}: {limit}GB
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Chart container with ID for the initializer */}
      <Box id="stacked-resource-chart" sx={{ height: 400, position: 'relative' }}>
        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: 2
          }}>
            <CircularProgress />
            <Typography>Carregando dados de consumo...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: 2,
            color: 'error.main'
          }}>
            <WarningIcon color="error" fontSize="large" />
            <Typography color="error">{error}</Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => window.location.reload()}
              size="small"
            >
              Tentar Novamente
            </Button>
          </Box>
        ) : !processedData ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: 2
          }}>
            <InfoIcon color="info" fontSize="large" />
            <Typography>Sem dados disponíveis para exibição</Typography>
          </Box>
        ) : (
          <Bar 
            data={processedData} 
            options={options} 
            fallbackContent={
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography>Não foi possível renderizar o gráfico</Typography>
              </Box>
            }
          />
        )}
      </Box>

      {/* Warnings about resource usage */}
      {processedData?.originalData?.some(item => item.peakVRAM > 6) && (
        <Box 
          sx={{ 
            mt: 2, 
            p: 1, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            bgcolor: 'warning.light', 
            borderRadius: 1 
          }}
        >
          <WarningIcon color="warning" />
          <Typography variant="body2">
            Alguns cenários excedem os limites de VRAM de GPUs comuns em ambientes educacionais.
            Considere otimizar a quantização ou usar modelos menores.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default StackedResourceBarChart;
