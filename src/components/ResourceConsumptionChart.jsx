import React, { useRef, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import '../styles/barChart.css';

const ResourceConsumptionChart = ({ data, comparisonData, viewType, sortBy }) => {
  const chartRef = useRef(null);

  // Process data and prepare it for the chart
  const prepareChartData = () => {
    if (!data || data.length === 0) return null;
    
    // Sort data based on sortBy parameter
    const sortedData = [...data].sort((a, b) => {
      if (sortBy === 'total') {
        const totalA = Object.values(a.resources).reduce((sum, val) => sum + val, 0);
        const totalB = Object.values(b.resources).reduce((sum, val) => sum + val, 0);
        return totalB - totalA; // Descending order
      } else {
        return b.resources[sortBy] - a.resources[sortBy];
      }
    });
    
    // Prepare data for Chart.js
    const labels = sortedData.map(item => item.name);
    
    // Define the resource types and their colors
    const resourceTypes = [
      { key: 'vram', label: 'VRAM Usage (GB)', color: 'rgba(255, 99, 132, 0.8)' },
      { key: 'processingTime', label: 'Processing Time (s)', color: 'rgba(54, 162, 235, 0.8)' },
      { key: 'ram', label: 'RAM Usage (GB)', color: 'rgba(255, 206, 86, 0.8)' },
      { key: 'diskIO', label: 'Disk I/O (MB/s)', color: 'rgba(75, 192, 192, 0.8)' }
    ];
    
    // Create datasets for each resource type
    const datasets = resourceTypes.map(resource => {
      const resourceData = sortedData.map(item => {
        if (viewType === 'percentage') {
          const total = Object.values(item.resources).reduce((sum, val) => sum + val, 0);
          return (item.resources[resource.key] / total) * 100;
        } else {
          return item.resources[resource.key];
        }
      });
      
      return {
        label: resource.label,
        data: resourceData,
        backgroundColor: resource.color,
        borderColor: resource.color.replace('0.8', '1'),
        borderWidth: 1
      };
    });
    
    return { labels, datasets };
  };

  const chartData = prepareChartData();
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Configuration Scenarios'
        }
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: viewType === 'percentage' ? 'Resource Usage (%)' : 'Resource Usage'
        },
        ticks: {
          callback: function(value) {
            return viewType === 'percentage' ? `${value}%` : value;
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return viewType === 'percentage' 
              ? `${label}: ${value.toFixed(1)}%` 
              : `${label}: ${value}`;
          }
        }
      },
      annotation: {
        annotations: {
          // VRAM limit lines for common educational hardware
          line1: {
            type: 'line',
            mode: 'horizontal',
            scaleID: 'y',
            value: viewType === 'percentage' ? null : 6, // 6GB VRAM limit
            borderColor: 'rgba(255, 0, 0, 0.5)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              content: '6GB VRAM (Common Student GPU)',
              enabled: viewType === 'percentage' ? false : true,
              position: 'start'
            }
          },
          line2: {
            type: 'line',
            mode: 'horizontal',
            scaleID: 'y',
            value: viewType === 'percentage' ? null : 12, // 12GB VRAM limit
            borderColor: 'rgba(255, 165, 0, 0.5)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              content: '12GB VRAM (Lab GPU)',
              enabled: viewType === 'percentage' ? false : true,
              position: 'start'
            }
          }
        }
      }
    }
  };

  // Add plugin for reference lines (VRAM limits)
  useEffect(() => {
    // Register the annotation plugin if needed
    // This is only needed if we're not importing the plugin elsewhere
    const annotationPlugin = Chart.registry.getPlugin('annotation');
    if (!annotationPlugin) {
      import('chartjs-plugin-annotation').then(module => {
        Chart.register(module.default);
        if (chartRef.current) {
          chartRef.current.update();
        }
      });
    }
  }, []);

  return (
    <div className="resource-chart-container">
      {chartData ? (
        <Bar data={chartData} options={options} ref={chartRef} />
      ) : (
        <div className="no-data-message">No resource consumption data available</div>
      )}
      
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: 'rgba(255, 0, 0, 0.5)' }}></div>
          <div className="legend-text">6GB VRAM Limit (Common Student GPU)</div>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: 'rgba(255, 165, 0, 0.5)' }}></div>
          <div className="legend-text">12GB VRAM Limit (Lab GPU)</div>
        </div>
      </div>
    </div>
  );
};

export default ResourceConsumptionChart;
