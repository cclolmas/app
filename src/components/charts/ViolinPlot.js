import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ViolinPlot = ({ data, width = 320, height = 240 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Group data by configuration
    const configurations = Array.from(new Set(data.map(d => d.configuration)));
    
    // Create scales
    const x = d3.scaleBand()
      .domain(configurations)
      .range([0, innerWidth])
      .padding(0.2);
      
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.cl, d.compl))])
      .range([innerHeight, 0]);
      
    // Prepare the data for violin plots
    const violinData = configurations.map(config => {
      const configData = data.filter(d => d.configuration === config);
      return {
        configuration: config,
        clValues: configData.map(d => d.cl),
        complValues: configData.map(d => d.compl)
      };
    });
      
    // Compute kernel density estimation
    const kde = kernelDensityEstimator(kernelEpanechnikov(7), y.ticks(20));
    
    // Draw the violins
    violinData.forEach(vd => {
      const clDensity = kde(vd.clValues);
      const complDensity = kde(vd.complValues);
      
      // Scale density to fit the width
      const xNum = x(vd.configuration);
      const bandwidth = x.bandwidth() / 2;
      
      // Draw CL violin (left side)
      const clArea = d3.area()
        .x0(xNum)
        .x1(d => xNum - d[1] * bandwidth * 0.8)
        .y(d => d[0])
        .curve(d3.curveBasis);
        
      g.append('path')
        .datum(clDensity)
        .attr('class', 'violin cl-violin')
        .attr('d', clArea)
        .attr('fill', '#ff7f0e')
        .attr('opacity', 0.6)
        .attr('stroke', '#ff7f0e')
        .attr('stroke-width', 1);
        
      // Draw CompL violin (right side)
      const complArea = d3.area()
        .x0(xNum)
        .x1(d => xNum + d[1] * bandwidth * 0.8)
        .y(d => d[0])
        .curve(d3.curveBasis);
        
      g.append('path')
        .datum(complDensity)
        .attr('class', 'violin compl-violin')
        .attr('d', complArea)
        .attr('fill', '#1f77b4')
        .attr('opacity', 0.6)
        .attr('stroke', '#1f77b4')
        .attr('stroke-width', 1);
        
      // Draw median lines
      const clMedian = d3.median(vd.clValues);
      const complMedian = d3.median(vd.complValues);
      
      g.append('line')
        .attr('x1', xNum - (bandwidth * 0.8) / 2)
        .attr('x2', xNum)
        .attr('y1', y(clMedian))
        .attr('y2', y(clMedian))
        .attr('stroke', 'black')
        .attr('stroke-width', 2);
        
      g.append('line')
        .attr('x1', xNum)
        .attr('x2', xNum + (bandwidth * 0.8) / 2)
        .attr('y1', y(complMedian))
        .attr('y2', y(complMedian))
        .attr('stroke', 'black')
        .attr('stroke-width', 2);
    });
      
    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');
      
    // Add y-axis
    g.append('g').call(d3.axisLeft(y));
      
    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right - 80}, ${margin.top})`);
      
    legend.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', '#ff7f0e')
      .attr('opacity', 0.6);
      
    legend.append('text')
      .attr('x', 20)
      .attr('y', 9)
      .attr('dy', '0.01em')
      .text('CL');
      
    legend.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('y', 20)
      .attr('fill', '#1f77b4')
      .attr('opacity', 0.6);
      
    legend.append('text')
      .attr('x', 20)
      .attr('y', 29)
      .attr('dy', '0.01em')
      .text('CompL');
      
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Distribuição CL vs CompL');
      
    // Helper functions for KDE calculation
    function kernelDensityEstimator(kernel, X) {
      return function(V) {
        return X.map(x => [x, d3.mean(V, v => kernel(x - v))]);
      };
    }
      
    function kernelEpanechnikov(k) {
      return function(v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
      };
    }
      
  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default ViolinPlot;
