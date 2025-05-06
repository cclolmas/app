import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Radar } from 'react-chartjs-2';
import '../styles/radar.css';
import Tooltip from './Tooltip';

const RadarChart = ({ studentData, classData, filters, onDimensionSelect }) => {
  const chartRef = useRef(null);
  
  // Define cognitive load dimensions based on CLT
  const dimensions = [
    { id: 'complexity', label: 'Perceived Complexity', description: 'Reflects the intrinsic cognitive load (ICL) from the inherent complexity of the task' },
    { id: 'interface', label: 'Interface Usability', description: 'Reflects extraneous cognitive load (ECL) from how the task is presented' },
    { id: 'effort', label: 'Mental Effort', description: 'Overall mental effort invested, related to germane cognitive load (GCL)' },
    { id: 'confidence', label: 'Solution Confidence', description: 'How confident the learner feels about their solution' },
    { id: 'frustration', label: 'Frustration Level', description: 'Emotional response to the task difficulty' }
  ];
  
  // Calculate average values for student data
  const calculateAverages = (data) => {
    const sums = dimensions.reduce((acc, dim) => {
      acc[dim.id] = 0;
      return acc;
    }, {});
    
    data.forEach(student => {
      dimensions.forEach(dim => {
        sums[dim.id] += student[dim.id] || 0;
      });
    });
    
    return dimensions.map(dim => (
      data.length > 0 ? sums[dim.id] / data.length : 0
    ));
  };
  
  const studentAverages = calculateAverages(studentData);
  const classAverages = calculateAverages(classData);
  
  const chartData = {
    labels: dimensions.map(dim => dim.label),
    datasets: [
      {
        label: filters.view === 'individual' ? 'Your Profile' : 'Selected Students',
        data: studentAverages,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointHoverRadius: 5
      }
    ]
  };
  
  // Add class average dataset for comparison
  if (filters.view === 'comparison') {
    chartData.datasets.push({
      label: 'Class Average',
      data: classAverages,
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgb(255, 99, 132)',
      pointBackgroundColor: 'rgb(255, 99, 132)',
      pointHoverRadius: 5
    });
  }
  
  const options = {
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: function(tooltipItems) {
            const index = tooltipItems[0].dataIndex;
            return dimensions[index].label;
          },
          label: function(context) {
            return `Value: ${context.parsed.r}`;
          },
          afterLabel: function(context) {
            const index = context.dataIndex;
            return dimensions[index].description;
          }
        }
      },
      legend: {
        position: 'bottom'
      }
    },
    onClick: (event, elements) => {
      if (elements && elements.length > 0) {
        const index = elements[0].index;
        onDimensionSelect(dimensions[index]);
      }
    }
  };
  
  return (
    <div className="radar-chart">
      <Radar data={chartData} options={options} ref={chartRef} />
      
      <div className="radar-legend">
        {dimensions.map((dim) => (
          <div key={dim.id} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: 'rgb(54, 162, 235)' }}></div>
            <div className="legend-text">{dim.label}</div>
            <Tooltip content={dim.description} />
          </div>
        ))}
      </div>
      
      <div className="chart-instructions">
        <p>Click on any axis to filter the histogram by that dimension</p>
      </div>
    </div>
  );
};

export default RadarChart;
