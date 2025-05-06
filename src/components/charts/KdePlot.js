import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const KdePlot = ({ data, width = 320, height = 240 }) => {
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

    // Create scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.cl)])
      .range([0, innerWidth]);
      
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.compl)])
      .range([innerHeight, 0]);
      
    // Generate 2D density data
    const densityData = generate2dDensity(data, x, y, 20);
    const colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain([0, d3.max(densityData, d => d.density)]);
      
    // Draw density points
    g.selectAll('.density-point')
      .data(densityData)
      .join('circle')
      .attr('class', 'density-point')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 3)
      .attr('fill', d => colorScale(d.density))
      .attr('opacity', 0.7)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', 5);
        
        const tooltip = d3.select('body')
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'white')
          .style('padding', '5px')
          .style('border', '1px solid #ddd')
          .style('border-radius', '3px')
          .style('pointer-events', 'none')
          .style('opacity', 0);
          
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip.html(`
          <strong>CL:</strong> ${x.invert(d.x).toFixed(2)}<br>
          <strong>CompL:</strong> ${y.invert(d.y).toFixed(2)}<br>
          <strong>Densidade:</strong> ${d.density.toFixed(4)}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 3);
        d3.select('body').selectAll('.tooltip').remove();
      });
      
    // Draw contour lines
    const contourThresholds = d3.range(0, d3.max(densityData, d => d.density), 
      d3.max(densityData, d => d.density) / 10);
    
    const contours = d3.contourDensity()
      .x(d => x(d.cl))
      .y(d => y(d.compl))
      .size([innerWidth, innerHeight])
      .bandwidth(20)
      .thresholds(contourThresholds)
      (data);
      
    g.append('g')
      .attr('class', 'contour-group')
      .selectAll('path')
      .data(contours)
      .join('path')
      .attr('d', d3.geoPath())
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-opacity', d => 0.2 + (d.value / d3.max(contours, c => c.value)) * 0.8)
      .attr('stroke-width', 0.5);
      
    // Add expert and beginner reference lines
    const expertCL = 3.5;  // Example value
    const beginnerCL = 6.0;  // Example value
    
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', y(expertCL))
      .attr('y2', y(expertCL))
      .attr('stroke', 'green')
      .attr('stroke-dasharray', '4,2')
      .attr('stroke-width', 1);
      
    g.append('text')
      .attr('x', 5)
      .attr('y', y(expertCL) - 5)
      .text('Especialista')
      .attr('fill', 'green')
      .attr('font-size', '10px');
      
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', y(beginnerCL))
      .attr('y2', y(beginnerCL))
      .attr('stroke', 'red')
      .attr('stroke-dasharray', '4,2')
      .attr('stroke-width', 1);
      
    g.append('text')
      .attr('x', 5)
      .attr('y', y(beginnerCL) - 5)
      .text('Iniciante')
      .attr('fill', 'red')
      .attr('font-size', '10px');
      
    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x));
      
    // Add y-axis
    g.append('g').call(d3.axisLeft(y));
      
    // Add axis labels
    svg.append('text')
      .attr('transform', `translate(${width/2}, ${height - 5})`)
      .style('text-anchor', 'middle')
      .text('Carga Cognitiva (CL)');
      
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 15)
      .attr('x', -(height / 2))
      .style('text-anchor', 'middle')
      .text('Carga Computacional (CompL)');

    // Function to generate 2D density data
    function generate2dDensity(data, xScale, yScale, resolution) {
      const result = [];
      
      // Create grid of points
      for (let i = 0; i <= resolution; i++) {
        for (let j = 0; j <= resolution; j++) {
          const x = (i / resolution) * innerWidth;
          const y = (j / resolution) * innerHeight;
          
          // Calculate density at this point
          const density = data.reduce((acc, d) => {
            const dx = xScale(d.cl) - x;
            const dy = yScale(d.compl) - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return acc + gaussian(distance, 20);
          }, 0);
          
          result.push({ x, y, density });
        }
      }
      
      return result;
    }
    
    function gaussian(distance, bandwidth) {
      return Math.exp(-(distance * distance) / (2 * bandwidth * bandwidth));
    }

  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default KdePlot;
