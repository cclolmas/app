import React, { useState, useEffect } from 'react';
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
import { Box, Typography, FormControl, InputLabel, MenuItem, Select, Switch, FormControlLabel, Card, CardContent } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StackedHistogram = ({ data, selectedDimension, onSelectCLLevel, filters }) => {
  const [stackMode, setStackMode] = useState('components'); // components, expertise, errors
  const [normalized, setNormalized] = useState(false);
  const [period, setPeriod] = useState('all');
  
  // Stats calculation
  const stats = calculateStats(data);

  // Process data based on filters
  const filteredData = filterHistogramData(data, stackMode, filters);
  
  // Prepare chart data
  const chartData = prepareChartData(filteredData, stackMode, normalized);

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Nível de Carga Cognitiva (1-9)'
        }
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: normalized ? 'Percentual de Estudantes (%)' : 'Número de Estudantes'
        },
        ticks: {
          precision: 0
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          footer: function(tooltipItems) {
            if (normalized) {
              return 'Percentual em relação ao total de estudantes';
            }
            return '';
          }
        }
      },
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: getChartTitle(stackMode, selectedDimension)
      }
    },
    onClick: (event, elements) => {
      if (elements && elements.length > 0) {
        const index = elements[0].index;
        const clLevel = index + 1; // CL levels are 1-9
        if (onSelectCLLevel) {
          onSelectCLLevel(clLevel);
        }
      }
    }
  };

  useEffect(() => {
    // Additional processing when filters or selected dimension changes
  }, [filters, selectedDimension]);

  return (
    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Distribuição da Carga Cognitiva
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Visualizar por</InputLabel>
            <Select
              value={stackMode}
              onChange={(e) => setStackMode(e.target.value)}
              label="Visualizar por"
            >
              <MenuItem value="components">Componentes da CL (ICL, ECL, GCL)</MenuItem>
              <MenuItem value="expertise">Nível de Expertise</MenuItem>
              <MenuItem value="errors">Tipo de Erro/Desafio</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              label="Período"
            >
              <MenuItem value="all">Todo o Curso</MenuItem>
              <MenuItem value="module1">Módulo Inicial</MenuItem>
              <MenuItem value="module2">Módulo Intermediário</MenuItem>
              <MenuItem value="module3">Módulo Avançado</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={normalized}
                onChange={(e) => setNormalized(e.target.checked)}
                name="normalized"
                color="primary"
              />
            }
            label="Normalizar (%)"
          />
        </Box>
      </Box>
      
      <Box sx={{ position: 'relative', height: 400, mb: 3 }}>
        <Bar data={chartData} options={chartOptions} />
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
        <StatCard title="Média" value={stats.mean.toFixed(2)} />
        <StatCard title="Mediana" value={stats.median.toFixed(2)} />
        <StatCard title="Desvio Padrão" value={stats.stdDev.toFixed(2)} />
        <StatCard title="Sobrecarga (CL ≥ 7)" value={`${stats.overload}%`} color={stats.overload > 30 ? 'error.main' : 'success.main'} />
      </Box>
    </Box>
  );
};

// Helper Components
const StatCard = ({ title, value, color }) => (
  <Card sx={{ minWidth: 120 }}>
    <CardContent sx={{ py: 1, textAlign: 'center' }}>
      <Typography color="text.secondary" gutterBottom variant="caption">
        {title}
      </Typography>
      <Typography variant="h6" component="div" color={color || 'text.primary'}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

// Helper functions
function filterHistogramData(data, stackMode, filters) {
  // Implement filtering logic
  // Return filtered data appropriate for the histogram
  // Add a basic check for data validity
  if (!data || !Array.isArray(data)) {
      console.warn("Invalid or missing data passed to filterHistogramData:", data);
      return []; // Return empty array if data is invalid
  }
  return data; // Placeholder return
}

function prepareChartData(filteredData, stackMode, normalized) {
  // Placeholder - actual implementation would process the real data

  // Add validation for filteredData
  if (!filteredData || !Array.isArray(filteredData)) {
      console.warn("Invalid or missing filteredData in prepareChartData:", filteredData);
      // Return a default structure to prevent chart errors
      return {
          labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
          datasets: []
      };
  }

  // This simulates histogram data with 9 bins (CL levels 1-9)
  const labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let datasets = [];

  // --- Data Generation Logic based on stackMode ---
  // (Assuming this part correctly generates datasets if filteredData is valid)
  // Example structure (replace with actual logic based on filteredData)
  if (stackMode === 'components') {
    datasets = [
      {
        label: 'Carga Intrínseca (ICL)',
        data: [2, 5, 8, 12, 15, 10, 7, 4, 2],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
      },
      {
        label: 'Carga Extrínseca (ECL)',
        data: [1, 3, 6, 9, 11, 8, 5, 3, 1],
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
      },
      {
        label: 'Carga Germânica (GCL)',
        data: [1, 2, 4, 6, 8, 7, 4, 2, 1],
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
      }
    ];
  } else if (stackMode === 'expertise') {
    datasets = [
      {
        label: 'Novato',
        data: [1, 2, 3, 8, 12, 10, 8, 5, 3],
        backgroundColor: 'rgba(255, 159, 64, 0.7)',
      },
      {
        label: 'Intermediário',
        data: [2, 4, 8, 12, 10, 8, 5, 2, 1],
        backgroundColor: 'rgba(153, 102, 255, 0.7)',
      },
      {
        label: 'Avançado',
        data: [3, 5, 7, 9, 10, 6, 3, 1, 0],
        backgroundColor: 'rgba(255, 205, 86, 0.7)',
      }
    ];
  } else if (stackMode === 'errors') {
    datasets = [
      {
        label: 'Erros Conceituais',
        data: [1, 3, 5, 8, 10, 7, 5, 3, 1],
        backgroundColor: 'rgba(201, 203, 207, 0.7)',
      },
      {
        label: 'Erros Procedurais',
        data: [2, 4, 6, 9, 11, 8, 6, 4, 2],
        backgroundColor: 'rgba(255, 159, 64, 0.7)',
      },
      {
        label: 'Desafios Técnicos',
        data: [1, 2, 5, 8, 12, 9, 6, 3, 1],
        backgroundColor: 'rgba(153, 102, 255, 0.7)',
      }
    ];
  } else {
      // Default or fallback dataset structure if stackMode is unrecognized
      datasets = [{
          label: 'Data',
          data: new Array(9).fill(0), // Default to zeros
          backgroundColor: 'rgba(200, 200, 200, 0.7)',
      }];
  }
  // --- End Data Generation Logic ---

  // Normalize if requested
  if (normalized && datasets.length > 0 && datasets[0].data.length > 0) {
    // Calculate totals for each bin
    const totals = datasets[0].data.map((_, i) =>
      datasets.reduce((sum, dataset) => sum + (dataset.data[i] || 0), 0) // Add safety check for data[i]
    );

    // Convert to percentages
    datasets.forEach(dataset => {
      // Add safety check for dataset.data
      if (dataset.data && Array.isArray(dataset.data)) {
          dataset.data = dataset.data.map((val, i) =>
            totals[i] ? Math.round((val / totals[i]) * 100) : 0
          );
      } else {
          console.warn("Dataset missing or has invalid data array:", dataset);
          dataset.data = new Array(labels.length).fill(0); // Fallback
      }
    });
  }

  return { labels, datasets };
}

function calculateStats(data) {
  // Add validation for input data
  if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn("Invalid or missing data for calculateStats:", data);
      return { mean: 0, median: 0, stdDev: 0, overload: 0 }; // Return default stats
  }
  // Placeholder - actual implementation would calculate real stats
  // Example: Calculate mean effort if data structure is known
  // const efforts = data.map(item => item.effort || 0);
  // const mean = efforts.reduce((sum, val) => sum + val, 0) / efforts.length;
  // const overloadCount = efforts.filter(e => e >= 7).length;
  // const overload = (overloadCount / efforts.length) * 100;

  return {
    mean: 5.2, // Replace with actual calculation
    median: 5,   // Replace with actual calculation
    stdDev: 1.8, // Replace with actual calculation
    overload: 25 // Replace with actual calculation
  };
}

function getChartTitle(stackMode, selectedDimension) {
  let title = 'Distribuição da Carga Cognitiva Total';
  
  if (selectedDimension) {
    const dimensionMap = {
      'complexity': 'Complexidade Percebida',
      'usability': 'Usabilidade da Interface',
      'effort': 'Esforço Mental',
      'confidence': 'Confiança na Solução',
      'frustration': 'Nível de Frustração',
      'germane': 'Carga Germânica',
      'transfer': 'Capacidade de Transferência'
    };
    
    title += ` - Filtrado por ${dimensionMap[selectedDimension] || selectedDimension}`;
  }
  
  return title;
}

export default StackedHistogram;
