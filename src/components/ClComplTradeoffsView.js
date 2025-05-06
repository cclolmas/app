import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Slider, 
  Box, 
  Card, 
  CardContent, 
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Switch
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, 
  BarsWithCurveChart, BarsWithCurve, ZAxis, Contour, Surface, Treemap } from 'recharts';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import FilterListIcon from '@mui/icons-material/FilterList';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import { HeatMapGrid } from 'react-grid-heatmap';

const TradeoffOption = ({ title, description, advantages, disadvantages, value, onChange }) => (
  <Card sx={{ mb: 2, height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>{description}</Typography>
      
      <Typography variant="subtitle2" sx={{ mt: 2 }}>Advantages:</Typography>
      <ul style={{ paddingLeft: '20px' }}>
        {advantages.map((advantage, idx) => (
          <li key={idx}><Typography variant="body2">{advantage}</Typography></li>
        ))}
      </ul>
      
      <Typography variant="subtitle2" sx={{ mt: 2 }}>Disadvantages:</Typography>
      <ul style={{ paddingLeft: '20px' }}>
        {disadvantages.map((disadvantage, idx) => (
          <li key={idx}><Typography variant="body2">{disadvantage}</Typography></li>
        ))}
      </ul>
      
      <Box sx={{ mt: 2 }}>
        <Typography gutterBottom>Preference</Typography>
        <Slider
          value={value}
          onChange={onChange}
          aria-labelledby="preference-slider"
          valueLabelDisplay="auto"
          step={1}
          marks
          min={0}
          max={10}
        />
      </Box>
    </CardContent>
  </Card>
);

const KDEHeatmap = ({ data, height, width, experienceFilter }) => {
  const [showIdealZone, setShowIdealZone] = useState(false);

  const vramRange = {
    min: 2,
    max: 32,
    steps: 10
  };

  const ccScoreRange = {
    min: 0,
    max: 10,
    steps: 6
  };

  const xLabels = Array(vramRange.steps).fill(0).map((_, i) => {
    const value = vramRange.min + (vramRange.max - vramRange.min) * (i / (vramRange.steps - 1));
    return `${value.toFixed(1)}GB`;
  });

  const ccScoreLabels = [
    { value: 0, label: 'Minimal', description: 'Negligible cognitive effort required' },
    { value: 2, label: 'Low', description: 'Easily manageable cognitive demand' },
    { value: 4, label: 'Moderate', description: 'Noticeable but manageable effort' },
    { value: 6, label: 'Significant', description: 'Substantial mental effort required' },
    { value: 8, label: 'High', description: 'Approaching cognitive limits' },
    { value: 10, label: 'Extreme', description: 'Maximum cognitive demand' }
  ];

  const yLabels = ccScoreLabels.map(item => `${item.value} - ${item.label}`);

  const idealZone = {
    vram: {
      min: 8,
      max: 18
    },
    cognitiveLoad: {
      min: 2,
      max: 5
    },
    getCellIndices: () => {
      const xStart = Math.floor((idealZone.vram.min - vramRange.min) / ((vramRange.max - vramRange.min) / vramRange.steps));
      const xEnd = Math.ceil((idealZone.vram.max - vramRange.min) / ((vramRange.max - vramRange.min) / vramRange.steps));
      const yIndices = ccScoreLabels
        .map((label, index) => ({ index, value: label.value }))
        .filter(item => item.value >= idealZone.cognitiveLoad.min && item.value <= idealZone.cognitiveLoad.max)
        .map(item => item.index);
      return {
        x: { start: xStart, end: xEnd },
        y: yIndices
      };
    }
  };

  const computationalModels = {
    novice: {
      name: 'Novice',
      vramPreference: -0.3,
      cognitiveLoadBias: 2.0,
      vramCognitiveCorrelation: 0.7
    },
    intermediate: {
      name: 'Intermediate',
      vramPreference: 0,
      cognitiveLoadBias: 1.0,
      vramCognitiveCorrelation: 0.5
    },
    advanced: {
      name: 'Advanced',
      vramPreference: 0.2,
      cognitiveLoadBias: 0,
      vramCognitiveCorrelation: 0.3
    },
    expert: {
      name: 'Expert',
      vramPreference: 0.5,
      cognitiveLoadBias: -1.0,
      vramCognitiveCorrelation: 0.1
    }
  };

  const colorGradient = {
    stops: [
      { value: 0, color: '#f7fbff' },
      { value: 10, color: '#deebf7' },
      { value: 25, color: '#9ecae1' },
      { value: 40, color: '#4292c6' },
      { value: 55, color: '#2171b5' },
      { value: 70, color: '#08519c' },
      { value: 85, color: '#6a51a3' },
      { value: 100, color: '#d94801' },
      { value: 115, color: '#a63603' },
      { value: 130, color: '#7f2704' }
    ],
    capHighValues: true,
    getColor: function(value) {
      if (this.capHighValues) {
        value = Math.min(value, this.stops[this.stops.length - 1].value);
      }
      let lowerStop = this.stops[0];
      let upperStop = this.stops[this.stops.length - 1];
      for (let i = 0; i < this.stops.length - 1; i++) {
        if (this.stops[i].value <= value && value <= this.stops[i + 1].value) {
          lowerStop = this.stops[i];
          upperStop = this.stops[i + 1];
          break;
        }
      }
      if (lowerStop.value === value) return lowerStop.color;
      if (upperStop.value === value) return upperStop.color;
      const ratio = (value - lowerStop.value) / (upperStop.value - lowerStop.value);
      const lowerRGB = this.hexToRgb(lowerStop.color);
      const upperRGB = this.hexToRgb(upperStop.color);
      const r = Math.round(lowerRGB.r + ratio * (upperRGB.r - lowerRGB.r));
      const g = Math.round(lowerRGB.g + ratio * (upperRGB.g - lowerRGB.g));
      const b = Math.round(lowerRGB.b + ratio * (upperRGB.b - lowerRGB.b));
      return `rgb(${r}, ${g}, ${b})`;
    },
    hexToRgb: function(hex) {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    }
  };

  const generateHeatmapData = () => {
    const heatmapData = Array(ccScoreRange.steps).fill(0)
      .map(() => Array(vramRange.steps).fill(0));
    Object.keys(experienceFilter).forEach(expLevel => {
      if (experienceFilter[expLevel]) {
        const model = computationalModels[expLevel];
        for (let y = 0; y < ccScoreRange.steps; y++) {
          for (let x = 0; x < vramRange.steps; x++) {
            const vramValue = vramRange.min + (vramRange.max - vramRange.min) * (x / (vramRange.steps - 1));
            const cognitiveValue = ccScoreLabels[y].value;
            const normalizedVram = (vramValue - vramRange.min) / (vramRange.max - vramRange.min);
            const expectedCognitiveLoad = 
              (normalizedVram * model.vramCognitiveCorrelation * ccScoreRange.max) + 
              model.cognitiveLoadBias;
            const diff = cognitiveValue - expectedCognitiveLoad;
            const sigma = 1.5;
            const density = Math.exp(-(diff * diff) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI));
            const vramPreferenceFactor = 1 - Math.abs(normalizedVram - (0.5 + model.vramPreference)) * 0.5;
            heatmapData[y][x] += density * 100 * vramPreferenceFactor;
          }
        }
      }
    });
    return heatmapData;
  };

  const [heatData, setHeatData] = useState([]);

  useEffect(() => {
    setHeatData(generateHeatmapData());
  }, [experienceFilter]);

  const Cell = ({ value, x, y }) => {
    const scaledValue = Math.pow(value, 0.7) * 10;
    const cellColor = colorGradient.getColor(scaledValue);
    const rgb = colorGradient.hexToRgb(cellColor);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    const textColor = brightness > 125 ? 'black' : 'white';
    const cognitiveDetails = ccScoreLabels[y];
    const zoneIndices = idealZone.getCellIndices();
    const isInIdealZone = showIdealZone && 
      (x >= zoneIndices.x.start && x <= zoneIndices.x.end) && 
      zoneIndices.y.includes(y);
    const cellStyle = {
      background: cellColor,
      fontSize: "11px",
      color: textColor,
      width: "100%",
      height: "100%",
      textAlign: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      boxShadow: isInIdealZone 
        ? "inset 0 0 0 2px #00ff00, inset 0 0 8px 2px rgba(0,255,0,0.4)"
        : "inset 0 0 0 1px rgba(0,0,0,0.05)",
      zIndex: isInIdealZone ? 2 : 1
    };

    return (
      <div 
        style={cellStyle}
        title={`VRAM: ${xLabels[x]}, CC Score: ${cognitiveDetails.value} (${cognitiveDetails.label}), Density: ${Math.round(value)}${isInIdealZone ? ' - IDEAL ZONE (H3)' : ''}`}
      >
        {Math.round(value)}
        {isInIdealZone && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 255, 0, 0.15)',
            border: '2px solid rgba(0, 255, 0, 0.7)',
            pointerEvents: 'none'
          }} />
        )}
      </div>
    );
  };

  return (
    <Box sx={{ height, position: "relative", overflow: "hidden" }}>
      <Box sx={{ 
        position: 'absolute',
        top: 5,
        left: 'calc(50% - 80px)',
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: '2px 8px',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Typography variant="caption" sx={{ mr: 1 }}>
          Show Ideal Zone (H3)
        </Typography>
        <Switch
          checked={showIdealZone}
          onChange={() => setShowIdealZone(!showIdealZone)}
          size="small"
          color="success"
        />
      </Box>

      <Box sx={{ position: "absolute", top: 40, left: 60, right: 10, bottom: 40 }}>
        <HeatMapGrid
          data={heatData}
          xLabels={xLabels}
          yLabels={yLabels}
          cellHeight="40px"
          cellRender={Cell}
          xLabelsStyle={() => ({
            fontSize: '12px',
            color: '#777',
            transform: 'rotate(-65deg)',
            transformOrigin: 'left',
            width: '40px',
            height: '150px',
            textAlign: 'left',
            paddingLeft: '10px'
          })}
          yLabelsStyle={() => ({
            fontSize: '12px',
            color: '#777',
            textAlign: 'right',
            paddingRight: '10px',
            width: '70px'
          })}
        />
      </Box>
      
      <Box sx={{ position: "absolute", bottom: 5, width: "100%", textAlign: "center" }}>
        <Typography variant="subtitle2">Peak VRAM Usage (GB)</Typography>
      </Box>
      
      <Box 
        sx={{ 
          position: "absolute", 
          left: 5, 
          top: "50%", 
          transform: "translateY(-50%) rotate(-90deg)",
          transformOrigin: "left center"
        }}
      >
        <Typography variant="subtitle2">Cognitive Load (CC Score)</Typography>
      </Box>
      
      <Box sx={{ 
        position: "absolute", 
        top: 10,
        left: 30,
        padding: "5px",
        backgroundColor: "rgba(255,255,255,0.8)",
        borderRadius: "4px",
        fontSize: "11px"
      }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
          CC Score Scale:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2, pt: 0.5 }}>
          {ccScoreLabels.map((label, idx) => (
            <Box component="li" key={idx} sx={{ fontSize: '10px', mb: 0.2 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                {`${label.value}: ${label.label}`}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      
      {showIdealZone && (
        <Box sx={{
          position: 'absolute',
          bottom: 45,
          right: 10,
          backgroundColor: 'rgba(255,255,255,0.95)',
          padding: '8px',
          borderRadius: '4px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          border: '1px solid rgba(0,255,0,0.7)',
          maxWidth: '200px',
          zIndex: 5
        }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#008800' }}>
            Ideal Zone (H3)
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontSize: '10px' }}>
            Per hypothesis H3, this area represents the optimal balance between computational 
            resources (8-18GB VRAM) and cognitive load (Low to Moderate). 
          </Typography>
        </Box>
      )}
      
      <Box sx={{ 
        position: "absolute", 
        top: 5, 
        right: 10,
        padding: "5px",
        backgroundColor: "rgba(255,255,255,0.9)",
        borderRadius: "4px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
      }}>
        <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>
          Density:
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          width: '100%',
          height: '120px',
        }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            mb: 0.5
          }}>
            <Typography variant="caption" sx={{ fontSize: '9px' }}>High</Typography>
            <Typography variant="caption" sx={{ fontSize: '9px' }}>130+</Typography>
          </Box>
          <Box sx={{ 
            flex: 1,
            background: 'linear-gradient(to bottom, #7f2704, #a63603, #d94801, #08519c, #2171b5, #4292c6, #9ecae1, #deebf7, #f7fbff)',
            width: '20px',
            borderRadius: '2px',
            mr: 1,
            boxShadow: 'inset 0 0 2px rgba(0,0,0,0.3)'
          }}/>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            mt: 0.5
          }}>
            <Typography variant="caption" sx={{ fontSize: '9px' }}>Low</Typography>
            <Typography variant="caption" sx={{ fontSize: '9px' }}>0</Typography>
          </Box>
        </Box>
        <Typography variant="caption" sx={{ display: 'block', mt: 1, fontSize: '8px', color: 'text.secondary' }}>
          Density represents frequency of cognitive load observations at given VRAM usage
        </Typography>
      </Box>
    </Box>
  );
};

const ClComplTradeoffsView = () => {
  const navigate = useNavigate();
  const [tradeoffs, setTradeoffs] = useState([
    {
      id: 1,
      option1: {
        title: "Brevity",
        description: "Focus on concise, straightforward argumentation",
        advantages: ["Clear and easy to follow", "Time-efficient", "Reduces cognitive load"],
        disadvantages: ["May oversimplify complex issues", "Less detailed exploration"],
        value: 5
      },
      option2: {
        title: "Elaboration",
        description: "Focus on detailed, comprehensive argumentation",
        advantages: ["Thorough exploration of issues", "More persuasive", "Better for complex topics"],
        disadvantages: ["Time-consuming", "May increase cognitive load"],
        value: 5
      }
    }
  ]);
  const [experienceFilter, setExperienceFilter] = useState({
    novice: true,
    intermediate: true,
    advanced: true,
    expert: true
  });
  const [viewMode, setViewMode] = useState('sideBySide');
  const [activeChartType, setActiveChartType] = useState('bar');

  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) {
      setActiveChartType(newChartType);
    }
  };

  const handleFilterClick = () => {
    // Logic for handling filter click
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <ToggleButtonGroup
            value={activeChartType}
            exclusive
            onChange={handleChartTypeChange}
            aria-label="chart type"
            size="small"
            sx={{ mr: 2 }}
          >
            <ToggleButton value="bar" aria-label="bar chart">
              Bar
            </ToggleButton>
            <ToggleButton value="violin" aria-label="violin plot">
              Violin
            </ToggleButton>
            <ToggleButton value="heatmap" aria-label="heatmap">
              Heatmap
            </ToggleButton>
            <ToggleButton value="radar" aria-label="radar chart">
              Radar
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mt: 1 }}>
        {activeChartType === 'heatmap' && (
          <Grid item xs={12} md={viewMode === 'sideBySide' ? 6 : 12}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Peak VRAM Usage vs. Cognitive Load (CC Score) Heatmap</Typography>
                <IconButton 
                  aria-label="filter by experience level" 
                  onClick={handleFilterClick}
                  color={Object.values(experienceFilter).some(v => !v) ? "primary" : "default"}
                  size="small"
                >
                  <FilterListIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This heatmap visualizes the relationship between computational resource requirements (VRAM) 
                and cognitive effort (CC Score). The Y-axis represents precise cognitive load measurements 
                from 0 (Minimal) to 10 (Extreme). Notice how expertise affects these relationships, 
                supporting hypothesis H4 that expertise reduces cognitive load.
              </Typography>
              <Box sx={{ height: 400, mt: 2 }}>
                <KDEHeatmap data={tradeoffs} height={350} experienceFilter={experienceFilter} />
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default ClComplTradeoffsView;
