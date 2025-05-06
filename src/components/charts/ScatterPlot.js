import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ScatterPlot = ({ data, width = 320, height = 240 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 40, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.paramValue)])
      .range([0, innerWidth]);
      
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.cl, d.compl))])
      .range([innerHeight, 0]);
      
    // Create color scale for different models
    const models = Array.from(new Set(data.map(d => d.model)));
    const color = d3.scaleOrdinal()
      .domain(models)
      .range(d3.schemeCategory10);
      
    // Draw CL points
    g.selectAll('.cl-point')
      .data(data)
      .join('circle')
      .attr('class', 'cl-point')
      .attr('cx', d => x(d.paramValue))
      .attr('cy', d => y(d.cl))
      .attr('r', 4)
      .attr('fill', d => color(d.model))
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
      .style('opacity', 0.7)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', 6).style('opacity', 1);
        
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
          <strong>Modelo:</strong> ${d.model}<br>
          <strong>Parâmetro:</strong> ${d.paramValue.toFixed(2)}<br>
          <strong>CL:</strong> ${d.cl.toFixed(2)}<br>
          <strong>CompL:</strong> ${d.compl.toFixed(2)}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 4).style('opacity', 0.7);
        d3.select('body').selectAll('.tooltip').remove();
      });
      
    // Draw CompL points as triangles
    g.selectAll('.compl-point')
      .data(data)
      .join('path')
      .attr('class', 'compl-point')
      .attr('d', d3.symbol().type(d3.symbolTriangle).size(40))
      .attr('transform', d => `translate(${x(d.paramValue)},${y(d.compl)})`)
      .attr('fill', d => d3.color(color(d.model)).darker(0.5))
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
      .style('opacity', 0.7)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('d', d3.symbol().type(d3.symbolTriangle).size(80))
          .style('opacity', 1);
        
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
          <strong>Modelo:</strong> ${d.model}<br>
          <strong>Parâmetro:</strong> ${d.paramValue.toFixed(2)}<br>
          <strong>CL:</strong> ${d.cl.toFixed(2)}<br>
          <strong>CompL:</strong> ${d.compl.toFixed(2)}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('d', d3.symbol().type(d3.symbolTriangle).size(40))
          .style('opacity', 0.7);
        d3.select('body').selectAll('.tooltip').remove();
      });
      
    // Add trend lines for each model
    models.forEach(model => {
      const modelData = data.filter(d => d.model === model);
      
      // CL trend line
      const clLine = d3.line()
        .x(d => x(d.paramValue))
        .y(d => y(d.cl))
        .curve(d3.curveBasis);
        
      g.append('path')
        .datum(modelData)
        .attr('fill', 'none')
        .attr('stroke', color(model))
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,2')
        .attr('d', clLine);
        
      // CompL trend line
      const complLine = d3.line()
        .x(d => x(d.paramValue))
        .y(d => y(d.compl))
        .curve(d3.curveBasis);
        
      g.append('path')
        .datum(modelData)
        .attr('fill', 'none')
        .attr('stroke', d3.color(color(model)).darker(0.5))
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,2')
        .attr('d', complLine);
    });
      
    // Add axes
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x));
      
    g.append('g')
      .call(d3.axisLeft(y));
      
    // Add axis labels
    svg.append('text')
      .attr('transform', `translate(${width/2}, ${height - 5})`)
      .style('text-anchor', 'middle')
      .text('Valor do Parâmetro');
      
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 10)
      .attr('x', -(height / 2))
      .style('text-anchor', 'middle')
      .text('Carga (CL/CompL)');
      
    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${innerWidth + margin.left}, ${margin.top})`);
      
    models.forEach((model, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);
        
      legendRow.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', color(model));
        
      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 8)
        .attr('font-size', '10px')
        .text(model);
    });
    
    const typeLegend = svg.append('g')
      .attr('transform', `translate(${innerWidth + margin.left}, ${margin.top + (models.length * 20) + 10})`);
      
    typeLegend.append('circle')
      .attr('r', 4)
      .attr('cx', 5)
      .attr('cy', 5)
      .attr('fill', 'gray');
      
    typeLegend.append('text')
      .attr('x', 20)
      .attr('y', 8)
      .attr('font-size', '10px')
      .text('CL');
      
    typeLegend.append('path')
      .attr('d', d3.symbol().type(d3.symbolTriangle).size(40))
      .attr('transform', `translate(5, 25)`)
      .attr('fill', 'gray');
      
    typeLegend.append('text')
      .attr('x', 20)
      .attr('y', 28)
      .attr('font-size', '10px')
      .text('CompL');

  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default ScatterPlot;
