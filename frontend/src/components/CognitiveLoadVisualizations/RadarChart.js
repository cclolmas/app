import React, { useState, useEffect } from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Box, Typography, FormControl, InputLabel, MenuItem, Select, Tooltip as MUITooltip, IconButton } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Descriptions for tooltips based on CLT theory
const dimensionDescriptions = {
  complexity: "Complexidade Percebida: Relacionada à Carga Intrínseca (ICL), representa a dificuldade inerente do conteúdo.",
  usability: "Usabilidade da Interface: Relacionada à Carga Extrínseca (ECL), representa o esforço adicional causado pelo design da interface.",
  effort: "Esforço Mental Investido: Representa a Carga Cognitiva total experimentada durante a tarefa.",
  confidence: "Confiança na Solução: Indica a percepção do estudante sobre a qualidade/correção de seu trabalho.",
  frustration: "Nível de Frustração/Ansiedade: Componente afetivo que pode aumentar a Carga Extrínseca.",
  germane: "Carga Germânica: Representa o esforço produtivo dedicado à construção de esquemas mentais.",
  transfer: "Capacidade de Transferência: Indica a percepção do estudante sobre sua capacidade de aplicar o conhecimento em novos contextos."
};

const RadarChart = ({ userData, classData, filterOptions, onFilterChange, onRegionSelect }) => {
  const [comparisonMode, setComparisonMode] = useState('class'); // 'class', 'before', 'expertise'
  const [taskFilter, setTaskFilter] = useState('all');
  const [configFilter, setConfigFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  
  useEffect(() => {
    // Update parent component with filter changes
    if (onFilterChange) {
      onFilterChange({ taskFilter, configFilter, moduleFilter });
    }
  }, [taskFilter, configFilter, moduleFilter, onFilterChange]);

  // Process data based on filters
  const processedUserData = filterData(userData, taskFilter, configFilter, moduleFilter);
  const processedComparisonData = filterComparisonData(classData, comparisonMode, taskFilter, configFilter, moduleFilter);

  const chartData = {
    labels: ['Complexidade Percebida', 'Usabilidade da Interface', 'Esforço Mental', 'Confiança na Solução', 'Nível de Frustração', 'Carga Germânica', 'Capacidade de Transferência'],
    datasets: [
      {
        label: 'Seu Perfil',
        data: processedUserData,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointRadius: 4,
      },
      {
        label: getComparisonLabel(comparisonMode),
        data: processedComparisonData,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 9,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw || '';
            return `${label}: ${value}/9`;
          }
        }
      }
    },
    onClick: (event, elements) => {
      if (elements && elements.length > 0) {
        const index = elements[0].index;
        const dimensionKey = getDimensionKeyByIndex(index);
        if (onRegionSelect) {
          onRegionSelect(dimensionKey);
        }
      }
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Perfil de Carga Cognitiva
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Comparar com</InputLabel>
            <Select
              value={comparisonMode}
              onChange={(e) => setComparisonMode(e.target.value)}
              label="Comparar com"
            >
              <MenuItem value="class">Média da Turma</MenuItem>
              <MenuItem value="before">Antes da Intervenção</MenuItem>
              <MenuItem value="expertise">Por Nível de Expertise</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Tarefa</InputLabel>
            <Select
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
              label="Tarefa"
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="qlora">Ajuste QLoRA</MenuItem>
              <MenuItem value="lmas">Depuração LMAS</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Configuração</InputLabel>
            <Select
              value={configFilter}
              onChange={(e) => setConfigFilter(e.target.value)}
              label="Configuração"
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="q4">Quantização Q4</MenuItem>
              <MenuItem value="q8">Quantização Q8</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Box sx={{ position: 'relative', height: 400 }}>
        <Radar data={chartData} options={chartOptions} />
      </Box>
      
      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
        {Object.entries(dimensionDescriptions).map(([key, description]) => (
          <MUITooltip key={key} title={description} placement="top">
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {getLabelByKey(key)}
              </Typography>
              <IconButton size="small">
                <HelpOutlineIcon fontSize="inherit" />
              </IconButton>
            </Box>
          </MUITooltip>
        ))}
      </Box>
    </Box>
  );
};

// Helper functions
function filterData(data, taskFilter, configFilter, moduleFilter) {
  // Implement filtering logic based on the selected filters
  // Return filtered user data as array of values for radar chart
  // This is a placeholder
  return data || [5, 3, 7, 4, 6, 5, 4];
}

function filterComparisonData(data, comparisonMode, taskFilter, configFilter, moduleFilter) {
  // Implement comparison data filtering based on mode and filters
  // Return processed comparison data as array of values for radar chart
  // This is a placeholder
  return data || [4, 4, 5, 5, 3, 4, 3];
}

function getComparisonLabel(mode) {
  switch (mode) {
    case 'class': return 'Média da Turma';
    case 'before': return 'Antes da Intervenção';
    case 'expertise': return 'Seu Nível de Expertise';
    default: return 'Comparação';
  }
}

function getDimensionKeyByIndex(index) {
  const keys = ['complexity', 'usability', 'effort', 'confidence', 'frustration', 'germane', 'transfer'];
  return keys[index] || '';
}

function getLabelByKey(key) {
  const labels = {
    complexity: 'Complexidade',
    usability: 'Usabilidade',
    effort: 'Esforço Mental',
    confidence: 'Confiança',
    frustration: 'Frustração',
    germane: 'Carga Germânica', 
    transfer: 'Transferência'
  };
  return labels[key] || key;
}

export default RadarChart;
