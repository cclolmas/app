import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Alert, LinearProgress } from '@mui/material';
import RadarChart from './RadarChart';
import StackedHistogram from './StackedHistogram';
import { fetchUserCognitiveData, fetchClassCognitiveData } from '../../services/cognitiveLoadService';

const CognitiveLoadDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [classData, setClassData] = useState(null);
  const [selectedDimension, setSelectedDimension] = useState(null);
  const [selectedCLLevel, setSelectedCLLevel] = useState(null);
  const [filters, setFilters] = useState({
    taskFilter: 'all',
    configFilter: 'all',
    moduleFilter: 'all'
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch data for both visualizations
        const userDataResponse = await fetchUserCognitiveData();
        const classDataResponse = await fetchClassCognitiveData();
        
        setUserData(userDataResponse);
        setClassData(classDataResponse);
        setError(null);
      } catch (err) {
        console.error("Failed to load cognitive load data:", err);
        setError("Erro ao carregar dados de carga cognitiva. Por favor, tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleDimensionSelect = (dimension) => {
    setSelectedDimension(dimension);
    // Reset CL level when dimension changes
    setSelectedCLLevel(null);
  };

  const handleCLLevelSelect = (level) => {
    setSelectedCLLevel(level);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Dashboard de Carga Cognitiva
      </Typography>
      
      <Typography variant="body1" paragraph>
        Este painel permite visualizar e analisar sua carga cognitiva percebida durante as atividades do curso, 
        ajudando a identificar padrões e comparar seu perfil com referências relevantes. As visualizações são interativas - 
        clique em elementos de um gráfico para filtrar o outro.
      </Typography>
      
      {loading && <LinearProgress sx={{ my: 2 }} />}
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}
      
      {!loading && !error && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2}>
              <RadarChart 
                userData={userData?.radarData} 
                classData={classData?.radarData}
                onFilterChange={handleFilterChange}
                onRegionSelect={handleDimensionSelect}
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper elevation={2}>
              <StackedHistogram 
                data={classData?.histogramData}
                selectedDimension={selectedDimension}
                onSelectCLLevel={handleCLLevelSelect}
                filters={filters}
              />
            </Paper>
          </Grid>
          
          {(selectedDimension || selectedCLLevel) && (
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Análise de Seleção
                </Typography>
                <Box>
                  {selectedDimension && (
                    <Alert severity="info" sx={{ mb: 1 }}>
                      Dimensão selecionada: <strong>{getReadableDimension(selectedDimension)}</strong>. 
                      O histograma foi filtrado para mostrar apenas esta dimensão da carga cognitiva.
                    </Alert>
                  )}
                  {selectedCLLevel && (
                    <Alert severity="info">
                      Nível de CL selecionado: <strong>{selectedCLLevel}/9</strong>. 
                      {selectedCLLevel >= 7 && 
                        " Este é um nível de sobrecarga cognitiva que pode impactar negativamente o aprendizado."}
                    </Alert>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Clique em qualquer área vazia dos gráficos para limpar a seleção.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

function getReadableDimension(dimension) {
  const dimensionMap = {
    'complexity': 'Complexidade Percebida',
    'usability': 'Usabilidade da Interface',
    'effort': 'Esforço Mental',
    'confidence': 'Confiança na Solução',
    'frustration': 'Nível de Frustração',
    'germane': 'Carga Germânica',
    'transfer': 'Capacidade de Transferência'
  };
  return dimensionMap[dimension] || dimension;
}

export default CognitiveLoadDashboard;
