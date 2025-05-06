import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import '../styles/histogram.css';

const StackedHistogram = ({ studentData, classData, filters, selectedDimension, onBarSelect }) => {
  const [stackingMode, setStackingMode] = useState('expertise'); // expertise, clTypes, errors
  const [normalized, setNormalized] = useState(false);
  
  // Define cognitive load levels (1-9 scale)
  const loadLevels = Array.from({ length: 9 }, (_, i) => i + 1);
  
  // Count students for each load level based on selected dimension
  const calculateLoadDistribution = () => {
    const dimension = selectedDimension ? selectedDimension.id : 'effort'; // Default to mental effort
    
    // Initialize counts for each level
    const counts = loadLevels.reduce((acc, level) => {
      acc[level] = {
        novice: 0,
        intermediate: 0,
        advanced: 0
      };
      return acc;
    }, {});
    
    // Count students by load level and expertise
    studentData.forEach(student => {
      const loadValue = Math.round(student[dimension] || 0);
      
      if (loadValue > 0 && loadValue <= 9) {
        counts[loadValue][student.expertise || 'novice']++;
      }
    });
    
    return counts;
  };
  
  const loadDistribution = calculateLoadDistribution();
  
  // Prepare data for Chart.js
  const prepareChartData = () => {
    const noviceData = loadLevels.map(level => loadDistribution[level].novice);
    const intermediateData = loadLevels.map(level => loadDistribution[level].intermediate);
    const advancedData = loadLevels.map(level => loadDistribution[level].advanced);
    
    // For normalized view, convert to percentages
    if (normalized) {
      loadLevels.forEach((level, index) => {
        const total = noviceData[index] + intermediateData[index] + advancedData[index];
        if (total > 0) {
          noviceData[index] = (noviceData[index] / total) * 100;
          intermediateData[index] = (intermediateData[index] / total) * 100;
          advancedData[index] = (advancedData[index] / total) * 100;
        }
      });
    }
    
    return {
      labels: loadLevels.map(level => level.toString()),
      datasets: [
        {
          label: 'Novice',
          data: noviceData,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          stack: 'Stack 0'
        },
        {
          label: 'Intermediate',
          data: intermediateData,
          backgroundColor: 'rgba(255, 206, 86, 0.7)',
          stack: 'Stack 0'
        },
        {
          label: 'Advanced',
          data: advancedData,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          stack: 'Stack 0'
        }
      ]
    };
  };
  
  const calculateStatistics = () => {
    const dimension = selectedDimension ? selectedDimension.id : 'effort';
    const values = studentData
      .map(student => student[dimension])
      .filter(val => val !== undefined);
    
    if (values.length === 0) return { mean: 0, median: 0, stdDev: 0 };
    
    // Calculate mean
    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / values.length;
    
    // Calculate median
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
    
    // Calculate standard deviation
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
    const stdDev = Math.sqrt(avgSquaredDiff);
    
    return { mean, median, stdDev };
  };
  
  const stats = calculateStatistics();
  const chartData = prepareChartData();
  
  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: selectedDimension 
            ? `${selectedDimension.label} Level (1-9)`
            : 'Cognitive Load Level (1-9)'
        }
      },
      y: {
        title: {
          display: true,
          text: normalized ? 'Percentage of Students (%)' : 'Number of Students'
        },
        beginAtZero: true
      }
    },
    plugins: {
      title: {
        display: true,
        text: `Distribution of ${selectedDimension ? selectedDimension.label : 'Mental Effort'}`
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const label = context.dataset.label;
            return normalized 
              ? `${label}: ${value.toFixed(1)}%`
              : `${label}: ${value} students`;
          }
        }
      }
    },
    onClick: (event, elements) => {
      if (elements && elements.length > 0) {
        const index = elements[0].index;
        onBarSelect(loadLevels[index]);
      }
    }
  };

  return (
    <div className="stacked-histogram">
      <div className="histogram-controls">
        <div className="control-group">
          <label>Stacking Mode:</label>
          <select 
            value={stackingMode}
            onChange={(e) => setStackingMode(e.target.value)}
          >
            <option value="expertise">By Expertise Level</option>
            <option value="clTypes">By Cognitive Load Type</option>
            <option value="errors">By Error Type</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>
            <input 
              type="checkbox" 
              checked={normalized}
              onChange={() => setNormalized(!normalized)}
            />
            Show as Percentage
          </label>
        </div>
      </div>
      
      <div className="histogram-chart">
        <Bar data={chartData} options={options} />
      </div>
      
      <div className="statistics-panel">
        <h3>Statistics</h3>
        <div className="stat-item">
          <span className="stat-label">Mean:</span>
          <span className="stat-value">{stats.mean.toFixed(2)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Median:</span>
          <span className="stat-value">{stats.median.toFixed(2)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Std Dev:</span>
          <span className="stat-value">{stats.stdDev.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default StackedHistogram;
