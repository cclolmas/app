import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Slider, Select, MenuItem, FormControl, InputLabel, Box, Button } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';

// Mock data - would be replaced with actual API calls
const initialCompData = Array(20).fill().map((_, i) => ({
  time: i,
  vramUsage: 4 + Math.random() * 8, // GB
  cpuUsage: 20 + Math.random() * 60, // %
  executionTime: 200 + Math.random() * 800 // ms
}));

const Dashboard = () => {
  const [compData, setCompData] = useState(initialCompData);
  const [cognitiveLoad, setCognitiveLoad] = useState(5); // 1-10 scale
  const [taskProgress, setTaskProgress] = useState(0); // 0-100%
  const [selectedModel, setSelectedModel] = useState('standard');
  const [optimalPoint, setOptimalPoint] = useState({ compL: 0, cogL: 0 });
  
  // Effect to simulate how model choice impacts computational load
  useEffect(() => {
    const modelFactors = {
      'lightweight': 0.6,
      'standard': 1.0,
      'advanced': 1.8,
    };
    
    const factor = modelFactors[selectedModel];
    const newData = initialCompData.map(point => ({
      ...point,
      vramUsage: point.vramUsage * factor,
      cpuUsage: point.cpuUsage * factor,
      executionTime: point.executionTime * factor
    }));
    
    setCompData(newData);
    
    // Update optimal point based on model selection (H3 visualization)
    setOptimalPoint({
      compL: selectedModel === 'lightweight' ? 3 : selectedModel === 'standard' ? 5 : 8,
      cogL: selectedModel === 'lightweight' ? 7 : selectedModel === 'standard' ? 5 : 3
    });
  }, [selectedModel]);

  // Calculate average computational load metrics
  const avgVram = compData.reduce((sum, item) => sum + item.vramUsage, 0) / compData.length;
  const avgCpu = compData.reduce((sum, item) => sum + item.cpuUsage, 0) / compData.length;
  const avgExecTime = compData.reduce((sum, item) => sum + item.executionTime, 0) / compData.length;
  
  // Generate data for the interdependence visualization
  const tradeoffData = [
    { compL: avgVram / 2, cogL: cognitiveLoad },
    { compL: optimalPoint.compL, cogL: optimalPoint.cogL },
    // Additional data points could be added here
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        CL-CompL Monitoring Dashboard
      </Typography>
      <Typography variant="body1" paragraph>
        This dashboard visualizes the dynamic interdependence between Cognitive Load (CL) and 
        Computational Load (CompL) as discussed in the research.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Model Selection */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6">Model Configuration</Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Model Complexity</InputLabel>
              <Select
                value={selectedModel}
                label="Model Complexity"
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <MenuItem value="lightweight">Lightweight (Low CompL, Higher CL)</MenuItem>
                <MenuItem value="standard">Standard (Balanced)</MenuItem>
                <MenuItem value="advanced">Advanced (High CompL, Lower CL)</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Adjust model complexity to observe how computational demands affect cognitive load.
              H1 & H2 hypotheses suggest an inverse relationship between these factors.
            </Typography>
          </Paper>
        </Grid>
        
        {/* Cognitive Load Input */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6">Subjective Cognitive Load Assessment</Typography>
            <Typography variant="body2">
              Rate your perceived mental effort (1-10 scale, based on Paas et al., 2003):
            </Typography>
            <Slider
              value={cognitiveLoad}
              onChange={(_, value) => setCognitiveLoad(value)}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="on"
              sx={{ mt: 3, mb: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2">Low Mental Effort</Typography>
              <Typography variant="body2">High Mental Effort</Typography>
            </Box>
            
            <Typography variant="body2" sx={{ mt: 2 }}>
              Task Progress:
            </Typography>
            <Slider
              value={taskProgress}
              onChange={(_, value) => setTaskProgress(value)}
              min={0}
              max={100}
              valueLabelDisplay="on"
              valueLabelFormat={(value) => `${value}%`}
              sx={{ mt: 1 }}
            />
          </Paper>
        </Grid>
        
        {/* Computational Load Metrics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Computational Load Metrics (CompL)</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={compData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" label={{ value: 'Time', position: 'bottom' }} />
                <YAxis yAxisId="left" label={{ value: 'VRAM (GB)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'RAM Usage (%)', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="vramUsage" name="VRAM Usage (GB)" stroke="#8884d8" />
                <Line yAxisId="right" type="monotone" dataKey="ramUsage" name="RAM Usage (%)" stroke="#82ca9d" />
                <Line yAxisId="right" type="monotone" dataKey="executionTime" name="Execution Time (ms)" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* CL-CompL Relationship Visualization */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>CL-CompL Interdependence (H1 & H2)</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid />
                <XAxis type="number" dataKey="compL" name="Computational Load" 
                       domain={[0, 10]} label={{ value: 'CompL', position: 'bottom' }} />
                <YAxis type="number" dataKey="cogL" name="Cognitive Load" 
                       domain={[0, 10]} label={{ value: 'CL', angle: -90, position: 'insideLeft' }} />
                <ZAxis range={[100, 500]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Current State" data={tradeoffData} fill="#8884d8" />
                <Scatter name="Optimal Point (H3)" data={[optimalPoint]} fill="#ff7300" />
              </ScatterChart>
            </ResponsiveContainer>
            <Typography variant="body2" sx={{ mt: 2 }}>
              This visualization shows the inverse relationship between CompL and CL, with the orange point
              representing the theoretical optimal balance point (H3) for effective learning.
            </Typography>
          </Paper>
        </Grid>
        
        {/* Summary Metrics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Learning Effectiveness Analysis</Typography>
            <Typography variant="body1" gutterBottom>
              Current Balance Statistics:
            </Typography>
            <Typography variant="body2">
              • Avg RAM Usage: {avgVram.toFixed(2)}%
            </Typography>
            <Typography variant="body2">
              • Avg Execution Time: {avgExecTime.toFixed(2)}ms
            </Typography>
            <Typography variant="body2">
              • Reported Cognitive Load: {cognitiveLoad}/10
            </Typography>
            <Typography variant="body2">
              • Task Completion: {taskProgress}%
            </Typography>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Model Efficiency Assessment:
              </Typography>
              <Typography variant="body2">
                {selectedModel === 'lightweight' && 
                  "Current model has low computational demands but may require higher cognitive effort from the user."}
                {selectedModel === 'standard' && 
                  "Current model provides balanced computational and cognitive demands - close to the optimal point (H3)."}
                {selectedModel === 'advanced' && 
                  "Current model has high computational demands but may reduce cognitive effort required from the user."}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
