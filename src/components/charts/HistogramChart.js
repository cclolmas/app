import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const HistogramChart = ({ data, width = 320, height = 240, filters = { period: 'hour', expertise: 'all' } }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 40, bottom: 60, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Filter the data based on filters
    const filteredData = data.filter(d => {
      let match = true;
      if (filters.period === 'hour') {
        match = match && d.timestamp > Date.now() - 3600000;
      } else if (filters.period === 'session') {
        match = match && d.isCurrentSession;
      }
      
      if (filters.expertise !== 'all') {
        match = match && d.expertise === filters.expertise;
      }
      
      return match;
    });

    // Group data by category
    const categories = Array.from(new Set(filteredData.map(d => d.category)));
    const taskCounts = categories.map(category => {
      return {
        category,
        count: filteredData.filter(d => d.category === category).length
      };
    });
    
    // Create x scale
    const x = d3.scaleBand()
      .domain(categories)
      .range([0, innerWidth])
      .padding(0.2);
      
    // Create y scale
    const maxCount = d3.max(taskCounts, d => d.count);
    const y = d3.scaleLinear()
      .domain([0, maxCount || 10])
      .range([innerHeight, 0]);

    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');
      
    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(y));
      
    // Create color scale
    const color = d3.scaleOrdinal()
      .domain(categories)
      .range(d3.schemeCategory10);
      
    // Add the bars
    g.selectAll('.bar')
      .data(taskCounts)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.category))
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.count))
      .attr('fill', d => color(d.category))
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.8);
        
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
        tooltip.html(`<strong>${d.category}:</strong> ${d.count} tasks`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
        d3.select('body').selectAll('.tooltip').remove();
      });
      
    // Add labels
    svg.append('text')
      .attr('transform', `translate(${width/2}, ${height - 5})`)
      .style('text-anchor', 'middle')
      .text('Categorias de Tarefas');
      
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 15)
      .attr('x', -(height / 2))
      .style('text-anchor', 'middle')
      .text('Número de Tarefas');

  }, [data, filters, width, height]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default HistogramChart;
