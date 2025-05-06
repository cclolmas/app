import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const StackedBarChart = ({ data, width = 320, height = 240, compareQ4Q8 = false }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Process the data for stacking
    const resources = ['GPU', 'RAM', 'VRAM'];
    const tasks = Array.from(new Set(data.map(d => d.task)));
    
    const stackedData = d3.stack()
      .keys(resources)
      .value((d, key) => d[key])
      (tasks.map(task => {
        const taskData = data.find(d => d.task === task);
        return {
          task,
          GPU: taskData.GPU,
          RAM: taskData.RAM,
          VRAM: taskData.VRAM,
          model: taskData.model
        };
      }));

    // Create scales
    const x = d3.scaleBand()
      .domain(tasks)
      .range([0, innerWidth])
      .padding(0.2);
      
    const maxValue = d3.max(stackedData, layer => d3.max(layer, d => d[1]));
    const y = d3.scaleLinear()
      .domain([0, maxValue])
      .range([innerHeight, 0]);
      
    const color = d3.scaleOrdinal()
      .domain(resources)
      .range(['#ff7f0e', '#2ca02c', '#1f77b4']);

    // Add the bars
    const layers = g.selectAll('.layer')
      .data(stackedData)
      .join('g')
      .attr('class', 'layer')
      .attr('fill', (d, i) => color(d.key));

    layers.selectAll('rect')
      .data(d => d)
      .join('rect')
      .attr('x', d => x(d.data.task))
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth())
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.8);
        
        const resourceType = d3.select(this.parentNode).datum().key;
        const resourceValue = d[1] - d[0];
        const taskName = d.data.task;
        const modelType = d.data.model;
        
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
          <strong>Tarefa:</strong> ${taskName}<br>
          <strong>Modelo:</strong> ${modelType}<br>
          <strong>${resourceType}:</strong> ${resourceValue.toFixed(2)}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
        d3.select('body').selectAll('.tooltip').remove();
      });

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
      
    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${innerWidth + margin.left}, ${margin.top})`)
      .selectAll('g')
      .data(resources)
      .join('g')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);
      
    legend.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => color(d));
      
    legend.append('text')
      .attr('x', 20)
      .attr('y', 9)
      .attr('dy', '0.01em')
      .text(d => d);

    // Add Q4 vs Q8 comparison if enabled
    if (compareQ4Q8) {
      const q4Data = data.filter(d => d.model.includes('Q4'));
      const q8Data = data.filter(d => d.model.includes('Q8'));
      
      if (q4Data.length > 0 && q8Data.length > 0) {
        // Highlight comparison
        const vramSavedText = svg.append('text')
          .attr('x', margin.left)
          .attr('y', margin.top - 5)
          .attr('fill', 'green')
          .text('VRAM economizada em Q4 vs Q8');
      }
    }
      
  }, [data, width, height, compareQ4Q8]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default StackedBarChart;
