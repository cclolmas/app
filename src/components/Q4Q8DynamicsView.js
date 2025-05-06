import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, Grid, Paper, Button, IconButton, Slider, Tooltip, ToggleButton, ToggleButtonGroup, 
         Dialog, DialogTitle, DialogContent, DialogActions, Chip, Divider, Card, Switch, FormControlLabel } from '@mui/material';
import { PlayArrow, Pause, FastForward, FastRewind, RestartAlt, Timeline, GridOn, BubbleChart, 
         Memory, Psychology, Info, Close, CheckCircle, Cancel, Warning, Lightbulb, VisibilityOff } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  ZAxis, Tooltip as RechartsTooltip, Legend, Cell, ReferenceArea, LabelList, Line 
} from 'recharts';

const Q4Q8DynamicsView = ({ debateData, title = "Dinâmica de Ajuste Fino: Comparativo Q4 vs. Q8" }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const [timeStep, setTimeStep] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [data, setData] = useState([]);
  const [viewMode, setViewMode] = useState('realtime'); // 'realtime' or 'bars-with-curve'
  const [trailLength, setTrailLength] = useState(20); // Number of points to show in the trail
  const [barsWithCurveMode, setBarsWithCurveMode] = useState('points'); // 'points', 'heatmap', or 'bubbles'
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [xMetric, setXMetric] = useState('compC'); // computational load metric for x-axis
  const [yMetric, setYMetric] = useState('cogLoad'); // cognitive load metric for y-axis
  const [selectedPoint, setSelectedPoint] = useState(null); // For detailed point view
  const [showDetail, setShowDetail] = useState(false); // For detail dialog
  const [attemptFilter, setAttemptFilter] = useState('all'); // Filter points by success/failure
  const [colorBy, setColorBy] = useState('quantization'); // 'quantization', 'success', 'model'
  const [showAnnotation, setShowAnnotation] = useState(true); // To toggle annotation visibility
  
  // Define color schemes for different coloring options
  const colorSchemes = useMemo(() => ({
    quantization: {
      q4Dominant: theme.palette.error.main, // red for Q4
      q8Dominant: theme.palette.info.main,  // blue for Q8
      balanced: theme.palette.secondary.main // purple for balanced
    },
    success: {
      success: theme.palette.success.main,
      failed: theme.palette.error.main
    },
    model: {
      '7B': theme.palette.info.main,
      '13B': theme.palette.warning.main,
      '70B': theme.palette.error.main
    }
  }), [theme]);
  
  useEffect(() => {
    if (!debateData) {
      // Generate sample data with computational and cognitive metrics
      const sampleData = Array(100).fill().map((_, i) => {
        // Base oscillating pattern
        const q4 = Math.sin(i/10) * 0.5 + 0.5;
        const q8 = Math.cos(i/8) * 0.4 + 0.6;
        
        // Generate computational metrics
        const vramUsage = 4 + (q4 * q8 * 12) + (Math.random() * 2); // 4-18 GB range
        const execTime = 10 + (q4 * 30) + (q8 * 20) + (Math.random() * 15); // 10-75ms range
        const compC = (vramUsage / 20 * 50) + (execTime / 75 * 50); // 0-100 scale
        
        // Generate cognitive load metrics
        const complexity = Math.sin(i/15) * 30 + 50 + (Math.random() * 10); // Complexity 30-80
        const clarity = Math.cos(i/12) * 25 + 60 + (Math.random() * 15); // Clarity 35-100
        const cogLoad = (complexity * 0.6) + ((100 - clarity) * 0.4); // Higher complexity and lower clarity = higher cognitive load
        
        // Generate additional fine-tuning task attempt data
        const success = Math.random() > 0.25; // 75% success rate
        const convergenceRate = success ? (0.5 + Math.random() * 0.5) : (Math.random() * 0.4); // 0-1 for success, 0-0.4 for failed
        const iterationCount = Math.floor(10 + Math.random() * 90); // 10-100 iterations
        
        // Add model and task information
        const modelSize = ["7B", "13B", "70B"][Math.floor(Math.random() * 3)];
        const taskType = ["Classification", "Generation", "Translation", "Summarization"][Math.floor(Math.random() * 4)];
        
        // Generate quantization information
        const q4Percentage = q4 * 100; // 0-100%
        const q8Percentage = q8 * 100; // 0-100%
        const quantizationType = q4Percentage > q8Percentage + 20 ? 'q4Dominant' :
                                q8Percentage > q4Percentage + 20 ? 'q8Dominant' :
                                'balanced';
                                
        const memoryEfficiency = (q4Percentage * 0.7 + q8Percentage * 0.3) / 100; // Higher q4 = better memory efficiency
        const performanceEfficiency = (q8Percentage * 0.8 + q4Percentage * 0.2) / 100; // Higher q8 = better performance
        
        return {
          step: i,
          q4,
          q8,
          intensity: Math.random() * 0.5 + 0.5,
          vramUsage,
          execTime,
          compC,
          complexity,
          clarity,
          cogLoad,
          
          // Fine-tuning attempt details
          attemptId: `FT-${i.toString().padStart(4, '0')}`,
          timestamp: new Date(Date.now() - (100-i) * 24*60*60*1000).toISOString(),
          success,
          convergenceRate,
          iterationCount,
          modelSize,
          taskType,
          notes: success 
            ? "Successful fine-tuning with good convergence"
            : "Fine-tuning did not converge satisfactorily",
          warnings: Math.random() > 0.7 ? ["Potential overfitting detected", "High variance in validation"] : [],
          
          // Quantization details
          q4Percentage,
          q8Percentage,
          quantizationType,
          memoryEfficiency,
          performanceEfficiency
        };
      });
      setData(sampleData);
    } else {
      // If real data is provided, add quantization information
      const processedData = debateData.map((item, i) => {
        // Calculate missing computational metrics if needed
        const vramUsage = item.vramUsage || (4 + (item.q4 * item.q8 * 12) + (Math.random() * 2));
        const execTime = item.execTime || (10 + (item.q4 * 30) + (item.q8 * 20) + (Math.random() * 15));
        const compC = item.compC || ((vramUsage / 20 * 50) + (execTime / 75 * 50));
        
        // Calculate missing cognitive metrics if needed
        const complexity = item.complexity || (Math.sin(i/15) * 30 + 50 + (Math.random() * 10));
        const clarity = item.clarity || (Math.cos(i/12) * 25 + 60 + (Math.random() * 15));
        const cogLoad = item.cogLoad || ((complexity * 0.6) + ((100 - clarity) * 0.4));
        
        // Calculate quantization information
        const q4Percentage = item.q4Percentage || (item.q4 * 100);
        const q8Percentage = item.q8Percentage || (item.q8 * 100);
        const quantizationType = item.quantizationType || 
                                (q4Percentage > q8Percentage + 20 ? 'q4Dominant' :
                                q8Percentage > q4Percentage + 20 ? 'q8Dominant' :
                                'balanced');
        
        return {
          ...item,
          vramUsage,
          execTime,
          compC,
          complexity,
          clarity,
          cogLoad,
          q4Percentage,
          q8Percentage,
          quantizationType,
          memoryEfficiency: item.memoryEfficiency || ((q4Percentage * 0.7 + q8Percentage * 0.3) / 100),
          performanceEfficiency: item.performanceEfficiency || ((q8Percentage * 0.8 + q4Percentage * 0.2) / 100)
        };
      });
      setData(processedData);
    }
  }, [debateData]);
  
  const handleColorByChange = (_, newColorBy) => {
    if (newColorBy !== null) {
      setColorBy(newColorBy);
    }
  };
  
  const getPointColor = (point) => {
    switch (colorBy) {
      case 'quantization':
        return colorSchemes.quantization[point.quantizationType];
      case 'success':
        return point.success ? colorSchemes.success.success : colorSchemes.success.failed;
      case 'model':
        return colorSchemes.model[point.modelSize];
      default:
        return theme.palette.primary.main;
    }
  };
  
  const enhancedScatterData = useMemo(() => {
    return data.map((item, index) => {
      const isCurrentPoint = index === timeStep;
      const isHovered = hoveredPoint && hoveredPoint.step === index;
      const baseColor = getPointColor(item);
      
      return {
        xValue: getXAxisValue(item),
        yValue: getYAxisValue(item),
        q4: item.q4 * 100,
        q8: item.q8 * 100,
        q4Percentage: item.q4Percentage,
        q8Percentage: item.q8Percentage,
        quantizationType: item.quantizationType,
        memoryEfficiency: item.memoryEfficiency,
        performanceEfficiency: item.performanceEfficiency,
        intensity: item.intensity * 100,
        step: index,
        isCurrentPoint,
        isHovered,
        vramUsage: item.vramUsage,
        execTime: item.execTime,
        compC: item.compC,
        complexity: item.complexity,
        clarity: item.clarity,
        cogLoad: item.cogLoad,
        success: item.success,
        convergenceRate: item.convergenceRate,
        iterationCount: item.iterationCount,
        modelSize: item.modelSize,
        taskType: item.taskType,
        notes: item.notes,
        warnings: item.warnings,
        fillColor: isCurrentPoint 
          ? theme.palette.secondary.dark 
          : isHovered 
            ? theme.palette.info.dark 
            : baseColor,
        opacity: isCurrentPoint || isHovered 
          ? 1 
          : Math.max(0.3, 1 - (timeStep - index) / data.length)
      };
    });
  }, [data, timeStep, hoveredPoint, theme, xMetric, yMetric, colorBy, colorSchemes, getPointColor]);
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <Paper elevation={3} sx={{ p: 1.5, bgcolor: 'background.paper', minWidth: '220px' }}>
          <Box sx={{ mb: 1, pb: 1, borderBottom: '1px solid #eee' }}>
            <Typography variant="subtitle2">Frame: {data.step}</Typography>
          </Box>
          
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>Quantização:</Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Q4:</Typography>
            <Typography variant="body2" component="span" fontWeight="bold">
              {data.q4Percentage.toFixed(1)}%
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="body2">Q8:</Typography>
            <Typography variant="body2" component="span" fontWeight="bold">
              {data.q8Percentage.toFixed(1)}%
            </Typography>
          </Box>
          
          <Box 
            sx={{ 
              height: 8, 
              width: '100%', 
              mb: 2, 
              borderRadius: 1, 
              display: 'flex',
            }}
          >
            <Box 
              sx={{ 
                height: '100%', 
                width: `${data.q4Percentage}%`,
                bgcolor: colorSchemes.quantization.q4Dominant,
                borderTopLeftRadius: 4,
                borderBottomLeftRadius: 4,
              }}
            />
            <Box 
              sx={{ 
                height: '100%', 
                width: `${data.q8Percentage}%`, 
                bgcolor: colorSchemes.quantization.q8Dominant,
                borderTopRightRadius: 4,
                borderBottomRightRadius: 4,
              }}
            />
          </Box>
          
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>Métricas Computacionais:</Typography>
        </Paper>
      );
    }
    return null;
  };
  
  const renderCustomPoint = (props) => {
    const { cx, cy, r, payload } = props;
    const isCurrentPoint = payload.isCurrentPoint;
    
    const shape = payload.success ? (
      <circle 
        cx={cx} cy={cy} r={r} 
        fill={payload.fillColor} 
        opacity={payload.opacity}
        stroke={isCurrentPoint ? theme.palette.secondary.dark : 'none'}
        strokeWidth={isCurrentPoint ? 2 : 0}
      />
    ) : (
      <polygon
        points={`${cx},${cy-r} ${cx+r*0.866},${cy+r*0.5} ${cx-r*0.866},${cy+r*0.5}`}
        fill={payload.fillColor}
        opacity={payload.opacity}
        stroke={isCurrentPoint ? theme.palette.secondary.dark : 'none'}
        strokeWidth={isCurrentPoint ? 2 : 0}
      />
    );
    
    return (
      <g onClick={() => handlePointClick(payload)} style={{ cursor: 'pointer' }}>
        {shape}
        {payload.warnings && payload.warnings.length > 0 && (
          <circle 
            cx={cx + r*0.7} 
            cy={cy - r*0.7} 
            r={r*0.4} 
            fill={theme.palette.warning.main}
          />
        )}
      </g>
    );
  };
  
  const renderDetailDialog = () => {
    if (!selectedPoint) return null;
    
    return (
      <Dialog 
        open={showDetail} 
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Detalhes da Tentativa: {selectedPoint.attemptId}
            </Typography>
            <IconButton onClick={handleCloseDetail} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" gutterBottom>Detalhes de Quantização</Typography>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              mb: 1 
            }}>
              <Typography variant="body2">Tipo de Quantização:</Typography>
              <Chip 
                label={
                  selectedPoint.quantizationType === 'q4Dominant' ? 'Q4 Dominante' :
                  selectedPoint.quantizationType === 'q8Dominant' ? 'Q8 Dominante' : 
                  'Equilibrado'
                }
                color={
                  selectedPoint.quantizationType === 'q4Dominant' ? 'error' :
                  selectedPoint.quantizationType === 'q8Dominant' ? 'info' : 
                  'secondary'
                }
                size="small"
              />
            </Box>
            
            <Grid container spacing={2} sx={{ mb: 1 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Percentual Q4</Typography>
                <Typography variant="body1">{selectedPoint.q4Percentage.toFixed(1)}%</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Percentual Q8</Typography>
                <Typography variant="body1">{selectedPoint.q8Percentage.toFixed(1)}%</Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ width: '100%', height: 10, borderRadius: 1, overflow: 'hidden', display: 'flex', mb: 2 }}>
              <Box sx={{ 
                width: `${selectedPoint.q4Percentage}%`, 
                bgcolor: colorSchemes.quantization.q4Dominant,
                height: '100%' 
              }} />
              <Box sx={{ 
                width: `${selectedPoint.q8Percentage}%`, 
                bgcolor: colorSchemes.quantization.q8Dominant,
                height: '100%' 
              }} />
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Eficiência de Memória</Typography>
                <Typography variant="body1">{(selectedPoint.memoryEfficiency * 100).toFixed(1)}%</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Eficiência de Desempenho</Typography>
                <Typography variant="body1">{(selectedPoint.performanceEfficiency * 100).toFixed(1)}%</Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Divider sx={{ my: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Fechar</Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Function to calculate statistics from data to show in annotation
  const dataStatistics = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // Group by quantization type
    const q4Data = data.filter(item => item.quantizationType === 'q4Dominant');
    const q8Data = data.filter(item => item.quantizationType === 'q8Dominant');
    
    if (q4Data.length === 0 || q8Data.length === 0) return null;
    
    // Calculate averages for current x and y metrics
    const calcAverage = (arr, metric) => {
      const sum = arr.reduce((acc, item) => {
        const value = metric === 'xValue' ? getXAxisValue(item) : 
                      metric === 'yValue' ? getYAxisValue(item) : 
                      item[metric] || 0;
        return acc + value;
      }, 0);
      return sum / arr.length;
    };
    
    // Calculate specific statistics
    const q4XAvg = calcAverage(q4Data, 'xValue');
    const q8XAvg = calcAverage(q8Data, 'xValue');
    const q4YAvg = calcAverage(q4Data, 'yValue');
    const q8YAvg = calcAverage(q8Data, 'yValue');
    
    // Success rates
    const q4SuccessRate = q4Data.filter(item => item.success).length / q4Data.length * 100;
    const q8SuccessRate = q8Data.filter(item => item.success).length / q8Data.length * 100;
    
    // Memory and cognitive load metrics
    const q4VramAvg = calcAverage(q4Data, 'vramUsage');
    const q8VramAvg = calcAverage(q8Data, 'vramUsage');
    const q4CogLoadAvg = calcAverage(q4Data, 'cogLoad');
    const q8CogLoadAvg = calcAverage(q8Data, 'cogLoad');
    
    // Determine which is better for different metrics
    const q4BetterMemory = q4VramAvg < q8VramAvg;
    const q8BetterPerformance = q8CogLoadAvg < q4CogLoadAvg;
    
    return {
      q4XAvg, q8XAvg, q4YAvg, q8YAvg,
      q4SuccessRate, q8SuccessRate,
      q4VramAvg, q8VramAvg,
      q4CogLoadAvg, q8CogLoadAvg,
      q4BetterMemory, q8BetterPerformance,
      q4Count: q4Data.length,
      q8Count: q8Data.length
    };
  }, [data, getXAxisValue, getYAxisValue]);
  
  // Generate annotation text based on current metrics and statistics
  const getAnnotationText = useCallback(() => {
    if (!dataStatistics) return { title: "Análise Indisponível", text: "Dados insuficientes para análise comparativa." };
    
    let title = "Comparativo Q4 vs. Q8:";
    let text = "";
    
    // Memory efficiency observation
    if (dataStatistics.q4BetterMemory) {
      text += `• Q4 usa ${(dataStatistics.q8VramAvg - dataStatistics.q4VramAvg).toFixed(1)}GB menos VRAM em média.\n`;
    } else {
      text += `• Q8 apresenta melhor eficiência de memória neste caso.\n`;
    }
    
    // Performance/cognitive load observation
    if (dataStatistics.q8BetterPerformance) {
      text += `• Q8 apresenta menor carga cognitiva (${(dataStatistics.q4CogLoadAvg - dataStatistics.q8CogLoadAvg).toFixed(1)} pontos de diferença).\n`;
    } else {
      text += `• Q4 surpreendentemente apresenta menor carga cognitiva neste cenário.\n`;
    }
    
    // Success rate comparison
    if (Math.abs(dataStatistics.q8SuccessRate - dataStatistics.q4SuccessRate) > 5) {
      const better = dataStatistics.q8SuccessRate > dataStatistics.q4SuccessRate ? 'Q8' : 'Q4';
      const diff = Math.abs(dataStatistics.q8SuccessRate - dataStatistics.q4SuccessRate).toFixed(1);
      text += `• ${better} tem taxa de sucesso ${diff}% maior em ajustes finos.\n`;
    } else {
      text += `• Taxas de sucesso similares entre Q4 e Q8.\n`;
    }
    
    // Trade-off summary
    if (xMetric === 'compC' && yMetric === 'cogLoad') {
      text += `\nTrade-off: Q4 economiza recursos computacionais mas pode exigir maior esforço cognitivo na interpretação dos resultados.`;
    } else if (xMetric === 'vramUsage') {
      text += `\nTrade-off: Menor uso de VRAM (Q4) frequentemente implica em maior variabilidade na qualidade dos resultados.`;
    }
    
    return { title, text };
  }, [dataStatistics, xMetric, yMetric]);
  
  // Toggle annotation visibility
  const handleToggleAnnotation = () => {
    setShowAnnotation(!showAnnotation);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, maxWidth: '100%', overflow: 'hidden' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ 
            p: 2, 
            borderRadius: 2, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                {viewMode === 'realtime' ? 'Dinâmica Q4/Q8 em Tempo Real' : 'Gráfico de Dispersão'}
              </Typography>
              
              {viewMode === 'scatter' && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <ToggleButtonGroup
                    value={colorBy}
                    exclusive
                    onChange={handleColorByChange}
                    size="small"
                    sx={{ mr: 0.5 }}
                  >
                    <ToggleButton value="quantization" aria-label="color by quantization">
                      <Tooltip title="Colorir por Quantização">
                        <span>Q4/Q8</span>
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="success" aria-label="color by success">
                      <Tooltip title="Colorir por Sucesso">
                        <CheckCircle fontSize="small" />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="model" aria-label="color by model">
                      <Tooltip title="Colorir por Modelo">
                        <span>Modelo</span>
                      </Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                  
                  {/* Add annotation toggle */}
                  <Tooltip title={showAnnotation ? "Ocultar Resumo" : "Mostrar Resumo"}>
                    <IconButton 
                      onClick={handleToggleAnnotation} 
                      color={showAnnotation ? "primary" : "default"}
                      size="small"
                    >
                      {showAnnotation ? <Lightbulb /> : <VisibilityOff />}
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
            
            {viewMode === 'scatter' && barsWithCurveMode !== 'heatmap' && (
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
                {colorBy === 'quantization' ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: colorSchemes.quantization.q4Dominant,
                        mr: 1 
                      }}/>
                      <Typography variant="caption">Q4 Dominante</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: colorSchemes.quantization.q8Dominant,
                        mr: 1 
                      }}/>
                      <Typography variant="caption">Q8 Dominante</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: colorSchemes.quantization.balanced,
                        mr: 1 
                      }}/>
                      <Typography variant="caption">Equilibrado</Typography>
                    </Box>
                  </>
                ) : colorBy === 'success' ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: colorSchemes.success.success,
                        mr: 1 
                      }}/>
                      <Typography variant="caption">Sucesso</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: colorSchemes.success.failed,
                        mr: 1 
                      }}/>
                      <Typography variant="caption">Falha</Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: colorSchemes.model['7B'],
                        mr: 1 
                      }}/>
                      <Typography variant="caption">Modelo 7B</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: colorSchemes.model['13B'],
                        mr: 1 
                      }}/>
                      <Typography variant="caption">Modelo 13B</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: colorSchemes.model['70B'],
                        mr: 1 
                      }}/>
                      <Typography variant="caption">Modelo 70B</Typography>
                    </Box>
                  </>
                )}
              </Box>
            )}
            
            <Box sx={{ flexGrow: 1, height: '300px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  margin={{ top: 20, right: 20, bottom: 25, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey={(payload) => getXAxisValue(payload)} 
                    name={xMetric} 
                    unit="" 
                    tick={{ fontSize: 12 }} 
                  />
                  <YAxis 
                    type="number" 
                    dataKey={(payload) => getYAxisValue(payload)} 
                    name={yMetric} 
                    unit="" 
                    tick={{ fontSize: 12 }} 
                  />
                  <ZAxis type="number" dataKey="intensity" range={[0, 100]} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar 
                    name="Q4/Q8 Dynamics" 
                    data={enhancedScatterData} 
                    fill="#8884d8" 
                    shape={renderCustomPoint} 
                  />
                </BarChart>
              </ResponsiveContainer>
              
              {/* Annotation box */}
              {viewMode === 'scatter' && showAnnotation && (
                <Card
                  elevation={3}
                  sx={{
                    position: 'absolute',
                    bottom: 35,
                    right: 25,
                    width: '250px',
                    p: 1.5,
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    border: `1px solid ${theme.palette.divider}`,
                    borderLeft: `4px solid ${theme.palette.warning.main}`,
                    zIndex: 5,
                    fontSize: '0.85rem',
                    transition: 'opacity 0.3s',
                    '&:hover': {
                      opacity: 0.95
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <Lightbulb color="warning" fontSize="small" sx={{ mr: 1, mt: 0.2 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                      {getAnnotationText().title}
                    </Typography>
                  </Box>
                  
                  {getAnnotationText().text.split('\n').map((line, i) => (
                    <Typography 
                      key={i} 
                      variant="body2" 
                      sx={{ 
                        mb: 0.7, 
                        color: line.startsWith('Trade-off:') ? theme.palette.warning.dark : 'inherit',
                        fontWeight: line.startsWith('Trade-off:') ? 'medium' : 'normal',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {line}
                    </Typography>
                  ))}
                </Card>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {renderDetailDialog()}
    </Paper>
  );
};

export default Q4Q8DynamicsView;
