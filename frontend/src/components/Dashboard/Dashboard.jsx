import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Paper, Box, CircularProgress } from '@mui/material';
import CognitiveLoadWidget from './CognitiveLoadWidget';
import ComputationalLoadWidget from './ComputationalLoadWidget';
import ProjectStatusCard from './ProjectStatusCard';
import { getSystemMetrics, getProjectStatus } from '../../services/api';
import { dashboardContainer, headerSection, loadBalanceSection } from './styles';

const Dashboard = ({ projectId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState({
    ram: { used: 0, total: 0 },
    vram: { used: 0, total: 0 },
    cpu: { usage: 0 },
    gpu: { usage: 0 },
    activeTasksEstimatedTime: 0,
  });
  const [cognitiveLoad, setCognitiveLoad] = useState({ 
    current: 3, // Valor médio padrão na escala de 1-5
    history: [] 
  });

  // Carrega dados iniciais
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [metricsData, projectDetails] = await Promise.all([
          getSystemMetrics(),
          getProjectStatus(projectId)
        ]);
        
        setSystemMetrics(metricsData);
        setProjectData(projectDetails);
      } catch (err) {
        setError('Falha ao carregar dados do dashboard. Por favor, tente novamente.');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    
    // Atualiza métricas do sistema a cada 10 segundos
    const metricsInterval = setInterval(() => {
      getSystemMetrics()
        .then(setSystemMetrics)
        .catch(err => console.error('Error updating metrics:', err));
    }, 10000);
    
    return () => clearInterval(metricsInterval);
  }, [projectId]);

  // Handler para atualizações da carga cognitiva
  const handleCognitiveLoadChange = (newValue) => {
    setCognitiveLoad(prev => ({
      current: newValue,
      history: [...prev.history, { value: newValue, timestamp: Date.now() }]
    }));
    
    // Aqui você poderia enviar o valor para o backend para armazenamento
    // saveCognitiveLoadRating(projectId, newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 3, textAlign: 'center', color: 'error.main' }}>
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={dashboardContainer}>
      <Box sx={headerSection}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard do Projeto: {projectData?.name || 'Carregando...'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gerencie o equilíbrio entre carga cognitiva e computacional para otimizar seu aprendizado.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Status Card Section */}
        <Grid item xs={12} md={6}>
          <ProjectStatusCard 
            projectData={projectData} 
            systemMetrics={systemMetrics} 
          />
        </Grid>

        {/* Load Balance Section - CL vs CompL */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={loadBalanceSection}>
            <Typography variant="h6" gutterBottom>
              Equilíbrio de Cargas (CL-CompL)
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <CognitiveLoadWidget 
                  value={cognitiveLoad.current} 
                  onChange={handleCognitiveLoadChange} 
                  history={cognitiveLoad.history}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <ComputationalLoadWidget 
                  metrics={systemMetrics}
                  estimatedTime={systemMetrics.activeTasksEstimatedTime} 
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Additional dashboard widgets can be added here */}
      </Grid>
    </Container>
  );
};

export default Dashboard;
