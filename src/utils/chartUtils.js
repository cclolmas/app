export const calculateKDE = (data, bandwidth = 0.1) => {
  const points = [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const step = (max - min) / 100;
  
  for (let x = min; x <= max; x += step) {
    let density = 0;
    for (const point of data) {
      density += gaussian(x - point, bandwidth);
    }
    points.push({ x, density: density / data.length });
  }
  
  return points;
};

export const gaussian = (x, bandwidth) => {
  return Math.exp(-(x * x) / (2 * bandwidth * bandwidth)) / 
         (bandwidth * Math.sqrt(2 * Math.PI));
};

export const findOutliers = (data, field) => {
  const values = data.map(d => d[field]);
  const q1 = d3.quantile(values, 0.25);
  const q3 = d3.quantile(values, 0.75);
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return data.filter(d => d[field] < lowerBound || d[field] > upperBound);
};

export const generateSankeyData = (data) => {
  const nodes = [];
  const links = [];
  
  // Process data to generate nodes and links
  // Add logic here based on your data structure
  
  return { nodes, links };
};

/**
 * Chart utilities for consistent chart styling and configuration
 */

/**
 * Create chart colors with consistent palette
 */
export const getChartColors = (theme = 'default') => {
  const palettes = {
    default: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'],
    blue: ['#004c6d', '#0071a4', '#0294d8', '#52b7d8', '#8ed5e6', '#c9ecf6'],
    sequential: ['#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c'],
    categorical: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'],
  };
  
  return palettes[theme] || palettes.default;
};

/**
 * Common chart margin settings
 */
export const chartMargins = {
  default: { top: 5, right: 30, left: 20, bottom: 5 },
  withAxisLabels: { top: 10, right: 30, left: 40, bottom: 30 },
  compact: { top: 5, right: 5, left: 5, bottom: 5 },
  large: { top: 20, right: 30, left: 40, bottom: 40 }
};

/**
 * Format helper for tooltips
 */
export const formatTooltipValue = (value, type) => {
  if (value === null || value === undefined) return 'N/A';
  
  switch(type) {
    case 'percentage':
      return `${(value * 100).toFixed(1)}%`;
    case 'decimal':
      return value.toFixed(2);
    case 'integer':
      return Math.round(value);
    case 'memory':
      return value < 1024 ? `${value.toFixed(1)} MB` : `${(value/1024).toFixed(1)} GB`;
    case 'time':
      return value < 60 ? `${value.toFixed(1)}s` : `${(value/60).toFixed(1)}min`;
    default:
      return value.toString();
  }
};

/**
 * Common responsive breakpoint settings for charts
 */
export const chartBreakpoints = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200
};

/**
 * Determine appropriate chart height based on container width
 * to maintain good aspect ratio
 */
export const getResponsiveHeight = (containerWidth) => {
  if (containerWidth < chartBreakpoints.sm) return 250;
  if (containerWidth < chartBreakpoints.md) return 300;
  if (containerWidth < chartBreakpoints.lg) return 350;
  return 400;
};

/**
 * Check if chart container has valid dimensions
 */
export const validateChartContainer = (container) => {
  if (!container) return false;
  
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  return {
    valid: width > 0 && height > 0,
    width,
    height,
    message: width > 0 && height > 0 
      ? 'Valid container dimensions' 
      : `Invalid dimensions: ${width}×${height}`
  };
};
