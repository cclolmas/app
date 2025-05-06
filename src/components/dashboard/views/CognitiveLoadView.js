import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Grid,
  Divider 
} from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import '../../styles/chartReset.css'; // Import our chart reset styles

/**
 * Component to visualize and monitor cognitive load metrics
 */
const CognitiveLoadView = ({ data, timeRange, onFilterChange }) => {
  const [metrics, setMetrics] = useState([]);
  const [selectedView, setSelectedView] = useState('combined');
  const [chartData, setChartData] = useState([]);
  const [aggregatedData, setAggregatedData] = useState(null);
  const [timeFilter, setTimeFilter] = useState('1h');
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (data && data.length > 0) {
      processData(data);
    }
  }, [data, timeFilter]);

  // Use an effect to check chart container dimensions after rendering
  useEffect(() => {
    if (chartContainerRef.current) {
      const container = chartContainerRef.current;
      // Log dimensions to help debug
      console.log('Chart container dimensions:', {
        width: container.clientWidth,
        height: container.clientHeight,
        offsetHeight: container.offsetHeight,
        style: window.getComputedStyle(container)
      });
    }
  }, [chartData]);

  const processData = (rawData) => {
    // Filter data based on time range
    const filteredData = filterByTimeRange(rawData, timeFilter);
    
    // Generate chart data
    const formattedData = filteredData.map(item => ({
      timestamp: formatTimestamp(item.timestamp),
      cognitiveLoad: item.cognitiveLoad,
      computationalLoad: item.computationalLoad,
      combinedLoad: item.combinedLoad
    }));
    
    setChartData(formattedData);
    
    // Calculate aggregated metrics
    setAggregatedData({
      avgCognitiveLoad: calculateAverage(filteredData, 'cognitiveLoad'),
      maxCognitiveLoad: findMax(filteredData, 'cognitiveLoad'),
      avgCompLoad: calculateAverage(filteredData, 'computationalLoad'),
      maxCompLoad: findMax(filteredData, 'computationalLoad'),
      clCompLRatio: calculateRatio(filteredData)
    });
  };

  const filterByTimeRange = (data, range) => {
    const now = new Date();
    let cutoff = new Date();
    
    switch(range) {
      case '1h':
        cutoff.setHours(now.getHours() - 1);
        break;
      case '24h':
        cutoff.setDate(now.getDate() - 1);
        break;
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(now.getDate() - 30);
        break;
      default:
        cutoff.setHours(now.getHours() - 1);
    }
    
    return data.filter(item => new Date(item.timestamp) >= cutoff);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const calculateAverage = (data, field) => {
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + item[field], 0);
    return (sum / data.length).toFixed(2);
  };

  const findMax = (data, field) => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map(item => item[field])).toFixed(2);
  };

  const calculateRatio = (data) => {
    if (!data || data.length === 0) return 0;
    const cogSum = data.reduce((acc, item) => acc + item.cognitiveLoad, 0);
    const compSum = data.reduce((acc, item) => acc + item.computationalLoad, 0);
    return compSum !== 0 ? (cogSum / compSum).toFixed(2) : "N/A";
  };

  const handleTimeFilterChange = (event) => {
    const newFilter = event.target.value;
    setTimeFilter(newFilter);
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  const handleViewChange = (event) => {
    setSelectedView(event.target.value);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        Cognitive Load Monitoring
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeFilter}
            onChange={handleTimeFilterChange}
            label="Time Range"
          >
            <MenuItem value="1h">Last Hour</MenuItem>
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>View</InputLabel>
          <Select
            value={selectedView}
            onChange={handleViewChange}
            label="View"
          >
            <MenuItem value="combined">Combined</MenuItem>
            <MenuItem value="cognitive">Cognitive Only</MenuItem>
            <MenuItem value="computational">Computational Only</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {aggregatedData && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Avg. Cognitive Load
              </Typography>
              <Typography variant="h4">
                {aggregatedData.avgCognitiveLoad}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Avg. Computational Load
              </Typography>
              <Typography variant="h4">
                {aggregatedData.avgCompLoad}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                CL/CompL Ratio
              </Typography>
              <Typography variant="h4">
                {aggregatedData.clCompLRatio}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Fixed height container to ensure chart is visible */}
      <Box 
        ref={chartContainerRef}
        sx={{ 
          height: 400, 
          width: '100%', 
          position: 'relative',
          '& .recharts-wrapper': { 
            width: '100% !important',
            height: '100% !important'
          }
        }}
        className="chart-wrapper"
      >
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedView === 'combined' || selectedView === 'cognitive' ? (
                <Line type="monotone" dataKey="cognitiveLoad" stroke="#8884d8" name="Cognitive Load" />
              ) : null}
              {selectedView === 'combined' || selectedView === 'computational' ? (
                <Line type="monotone" dataKey="computationalLoad" stroke="#82ca9d" name="Computational Load" />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="body1" color="text.secondary">
              No data available for the selected time range.
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default CognitiveLoadView;
