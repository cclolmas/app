import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const RadarChart = ({ data, width = 320, height = 240 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const radius = Math.min(innerWidth, innerHeight) / 2;

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const features = ['Subjetiva', 'Intrínseca', 'Extrínseca', 'Germânica'];
    
    const angleSlice = (Math.PI * 2) / features.length;
    
    // Scale for the radius
    const rScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, radius]);

    // Draw the background circles
    const axisGrid = g.append('g').attr('class', 'axis-grid');
    
    axisGrid.selectAll('.levels')
      .data(d3.range(1, 6).reverse())
      .enter()
      .append('circle')
      .attr('r', d => radius * d / 5)
      .attr('fill', 'none')
      .attr('stroke', '#CDCDCD')
      .attr('stroke-width', 0.5);

    // Draw the axes
    const axes = g.selectAll('.axis')
      .data(features)
      .enter()
      .append('g')
      .attr('class', 'axis');
    
    axes.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d, i) => rScale(10) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y2', (d, i) => rScale(10) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('stroke', '#CDCDCD')
      .attr('stroke-width', 1);
      
    // Add the labels
    axes.append('text')
      .attr('class', 'legend')
      .attr('x', (d, i) => rScale(10.5) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y', (d, i) => rScale(10.5) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .text(d => d);

    // Draw the radar chart blobs
    const radarLine = d3.lineRadial()
      .curve(d3.curveLinearClosed)
      .radius(d => rScale(d.value))
      .angle((d, i) => i * angleSlice);
      
    // Create the actual polygon
    g.selectAll('.radar-area')
      .data([data])
      .enter()
      .append('path')
      .attr('class', 'radar-area')
      .attr('d', d => radarLine(features.map(f => ({ value: d[f.toLowerCase()] }))))
      .attr('fill', 'rgba(70, 130, 180, 0.6)')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2);

    // Add hover interaction for details
    features.forEach((feature, i) => {
      const x = rScale(data[feature.toLowerCase()]) * Math.cos(angleSlice * i - Math.PI / 2);
      const y = rScale(data[feature.toLowerCase()]) * Math.sin(angleSlice * i - Math.PI / 2);
      
      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 5)
        .attr('fill', 'steelblue')
        .on('mouseover', function(event) {
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
          tooltip.html(`<strong>${feature}:</strong> ${data[feature.toLowerCase()]}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
          d3.select('body').selectAll('.tooltip').remove();
        });
    });
  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default RadarChart;
