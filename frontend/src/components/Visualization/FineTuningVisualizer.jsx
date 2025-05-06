import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, 
  FormControlLabel, Switch, Tooltip, 
  Card, CardContent, Divider, Alert
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const FineTuningVisualizer = ({ data, status }) => {
  const [chartData, setChartData] = useState([]);
  const [showMovingAverage, setShowMovingAverage] = useState(false);
  const [patterns, setPatterns] = useState({
    overfitting: false,
    convergence: false,
    instability: false
  });
  
  // Preparar dados para visualização
  useEffect(() => {
    if (data && data.trainingLoss && data.validationLoss) {
      const processedData = [];
      
      // Calcular média móvel (janela de 3)
      const calculateMovingAverage = (arr, windowSize = 3) => {
        const result = [];
        for (let i = 0; i < arr.length; i++) {
          if (i < windowSize - 1) {
            result.push(null);
            continue;
          }
          
          let sum = 0;
          for (let j = 0; j < windowSize; j++) {
            sum += arr[i - j];
          }
          result.push(sum / windowSize);
        }
        return result;
      };
      
      // Calcular médias móveis
      const trainingMA = calculateMovingAverage(data.trainingLoss);
      const validationMA = calculateMovingAverage(data.validationLoss);
      
      // Construir array de dados para o gráfico
      for (let i = 0; i < Math.max(data.trainingLoss.length, data.validationLoss.length); i++) {
        processedData.push({
          step: i + 1,
          trainingLoss: data.trainingLoss[i] || null,
          validationLoss: data.validationLoss[i] || null,
          trainingMA: trainingMA[i],
          validationMA: validationMA[i]
        });
      }
      
      setChartData(processedData);
      
      // Detectar padrões nos dados
      detectPatterns(data.trainingLoss, data.validationLoss);
    }
  }, [data]);
  
  // Detectar padrões nos dados de perda
  const detectPatterns = (trainingLoss, validationLoss) => {
    // Verificar overfitting
    let overfitting = false;
    if (trainingLoss.length > 3 && validationLoss.length > 3) {
      const trainTrend = trainingLoss[trainingLoss.length - 1] - trainingLoss[trainingLoss.length - 3];
      const valTrend = validationLoss[validationLoss.length - 1] - validationLoss[validationLoss.length - 3];
      
      if (trainTrend < -0.05 && valTrend > 0.05) {
        overfitting = true;
      }
    }
    
    // Verificar convergência
    let convergence = false;
    if (trainingLoss.length > 5) {
      const recentTrainChange = Math.abs(trainingLoss[trainingLoss.length - 1] - trainingLoss[trainingLoss.length - 5]);
      const recentValChange = Math.abs(validationLoss[validationLoss.length - 1] - validationLoss[validationLoss.length - 5]);
      
      if (recentTrainChange < 0.03 && recentValChange < 0.03) {
        convergence = true;
      }
    }
    
    // Verificar instabilidade
    let instability = false;
    if (trainingLoss.length > 4) {
      let fluctuationCount = 0;
      for (let i = 2; i < trainingLoss.length; i++) {
        const prev = trainingLoss[i - 1];
        const current = trainingLoss[i];
        const prevDelta = prev - trainingLoss[i - 2];
        const currentDelta = current - prev;
        
        // Se a direção mudou (de subindo para descendo ou vice-versa)
        if (prevDelta * currentDelta < 0 && Math.abs(currentDelta) > 0.05) {
          fluctuationCount++;
        }
      }
      
      instability = fluctuationCount > 2;
    }
    
    setPatterns({ overfitting, convergence, instability });
  };
  
  // Alternar exibição de média móvel
  const handleToggleMovingAverage = () => {
    setShowMovingAverage(!showMovingAverage);
  };
  
  // Formatar o tooltip do gráfico
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1, bgcolor: 'background.paper', boxShadow: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Passo: {label}</Typography>
          {payload.map((entry, index) => (
            <Typography 
              key={`tooltip-${index}`}
              variant="body2"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value.toFixed(4)}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // Exibir análise de perda mínima
  const renderLossAnalysis = () => {
    if (!data || !data.trainingLoss || !data.validationLoss) return null;
    
    const minTrainLoss = Math.min(...data.trainingLoss);
    const minTrainIndex = data.trainingLoss.indexOf(minTrainLoss);
    
    const minValLoss = Math.min(...data.validationLoss);
    const minValIndex = data.validationLoss.indexOf(minValLoss);
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Perda de Treino Mínima</Typography>
              <Typography variant="h5">{minTrainLoss.toFixed(4)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Alcançada no passo {minTrainIndex + 1}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Perda de Validação Mínima</Typography>
              <Typography variant="h5">{minValLoss.toFixed(4)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Alcançada no passo {minValIndex + 1}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  // Renderizar alertas de padrões detectados
  const renderPatternAlerts = () => {
    const alerts = [];
    
    if (patterns.overfitting) {
      alerts.push(
        <Alert severity="warning" sx={{ mb: 2 }} key="overfitting">
          <Typography variant="body2">
            <strong>Overfitting Detectado:</strong> A perda de treino continua diminuindo enquanto a perda 
            de validação aumenta. Considere parar o treinamento ou aplicar regularização.
          </Typography>
        </Alert>
      );
    }
    
    if (patterns.convergence) {
      alerts.push(
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }} key="convergence">
          <Typography variant="body2">
            <strong>Convergência Detectada:</strong> As perdas de treino e validação estabilizaram,
            indicando que o modelo convergiu. O treinamento adicional pode ter retornos diminutos.
          </Typography>
        </Alert>
      );
    }
    
    if (patterns.instability) {
      alerts.push(
        <Alert severity="info" sx={{ mb: 2 }} key="instability">
          <Typography variant="body2">
            <strong>Instabilidade Detectada:</strong> Os valores de perda mostram flutuações significativas.
            Isso pode ser normal para quantizações mais agressivas (Q4) ou taxas de aprendizado altas.
          </Typography>
        </Alert>
      );
    }
    
    return alerts.length > 0 ? (
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Análise de Padrões
        </Typography>
        {alerts}
      </Box>
    ) : null;
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Curvas de Perda de Treinamento
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showMovingAverage}
                      onChange={handleToggleMovingAverage}
                      size="small"
                    />
                  }
                  label="Média Móvel"
                />
                
                <Tooltip title="A média móvel ajuda a suavizar flutuações e visualizar tendências" arrow>
                  <HelpOutlineIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
            </Box>
            
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                  <XAxis 
                    dataKey="step" 
                    label={{ value: 'Passos', position: 'insideBottomRight', offset: -10 }}
                  />
                  <YAxis 
                    label={{ value: 'Perda', angle: -90, position: 'insideLeft' }}
                    domain={['auto', 'auto']}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  
                  {/* Linhas principais */}
                  <Line 
                    type="monotone" 
                    dataKey="trainingLoss" 
                    name="Perda de Treino" 
                    stroke="#2196f3" 
                    dot={{ r: 2 }} 
                    activeDot={{ r: 5 }} 
                    strokeWidth={2}
                    connectNulls
                  />
                  <Line 
                    type="monotone" 
                    dataKey="validationLoss" 
                    name="Perda de Validação" 
                    stroke="#f50057" 
                    dot={{ r: 2 }} 
                    activeDot={{ r: 5 }}
                    strokeWidth={2}
                    connectNulls
                  />
                  
                  {/* Médias móveis */}
                  {showMovingAverage && (
                    <>
                      <Line 
                        type="monotone" 
                        dataKey="trainingMA" 
                        name="MA Treino" 
                        stroke="#2196f3" 
                        strokeDasharray="5 5" 
                        dot={false} 
                        strokeWidth={1.5}
                        connectNulls
                      />
                      <Line 
                        type="monotone" 
                        dataKey="validationMA" 
                        name="MA Validação" 
                        stroke="#f50057" 
                        strokeDasharray="5 5" 
                        dot={false}
                        strokeWidth={1.5}
                        connectNulls
                      />
                    </>
                  )}
                  
                  {/* Linha de referência para mínimo de validação */}
                  {data && data.validationLoss && (
                    <ReferenceLine 
                      y={Math.min(...data.validationLoss)} 
                      stroke="green" 
                      strokeDasharray="3 3"
                      label={{ value: 'Mínimo', position: 'insideTopRight', fill: 'green' }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Box>
            
            {/* Legendas de Reconhecimento de Padrões */}
            <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingDownIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="body2">Diminuição constante: Aprendizado adequado</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingFlatIcon sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="body2">Platô: Possível convergência</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 1 }}>
                  <Box sx={{ height: '2px', width: '20px', bgcolor: '#2196f3', mb: 0.5 }} />
                  <Box sx={{ height: '2px', width: '20px', bgcolor: '#f50057' }} />
                </Box>
                <Typography variant="body2">Divergência: Possível overfitting</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Análise de Perdas */}
        <Grid item xs={12}>
          {renderLossAnalysis()}
        </Grid>
        
        {/* Alertas de Padrões */}
        <Grid item xs={12}>
          {renderPatternAlerts()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default FineTuningVisualizer;
