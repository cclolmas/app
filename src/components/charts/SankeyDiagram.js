import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

const SankeyDiagram = ({ data, width = 320, height = 240, onParameterChange }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Set up the Sankey generator
    const sankeyGen = sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[0, 0], [innerWidth, innerHeight]]);

    // Format the data for Sankey
    const graph = sankeyGen({
      nodes: data.nodes.map(d => Object.assign({}, d)),
      links: data.links.map(d => Object.assign({}, d))
    });

    // Add the links
    const link = g.append('g')
      .attr('class', 'links')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.3)
      .selectAll('path')
      .data(graph.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => d.color || '#000')
      .attr('stroke-width', d => Math.max(1, d.width))
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke-opacity', 0.6);
          
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
          <strong>${d.source.name} → ${d.target.name}:</strong><br>
          Valor: ${d.value.toFixed(2)}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke-opacity', 0.3);
        d3.select('body').selectAll('.tooltip').remove();
      });

    // Add the nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(graph.nodes)
      .join('g');

    node.append('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => d.color || '#69b3a2')
      .attr('stroke', '#000');

    node.append('text')
      .attr('x', d => d.x0 - 6)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .text(d => d.name)
      .filter(d => d.x0 < innerWidth / 2)
      .attr('x', d => d.x1 + 6)
      .attr('text-anchor', 'start');

    // Add parameter adjustment controls
    if (onParameterChange) {
      const controls = svg.append('g')
        .attr('transform', `translate(10, ${height - 30})`);
        
      controls.append('text')
        .text('Batch Size:')
        .attr('x', 0)
        .attr('y', 15);
        
      const sliderGroup = controls.append('g')
        .attr('transform', 'translate(70, 10)');
        
      const sliderWidth = 100;
      
      sliderGroup.append('line')
        .attr('x1', 0)
        .attr('x2', sliderWidth)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 4)
        .attr('stroke-linecap', 'round');
        
      const handle = sliderGroup.append('circle')
        .attr('r', 6)
        .attr('cx', sliderWidth / 2)
        .attr('fill', 'steelblue')
        .call(d3.drag()
          .on('drag', function(event) {
            const x = Math.max(0, Math.min(sliderWidth, event.x));
            d3.select(this).attr('cx', x);
            // Calculate batch size (1-64)
            const batchSize = Math.round((x / sliderWidth) * 63) + 1;
            sliderGroup.select('text').text(batchSize);
            onParameterChange('batchSize', batchSize);
          }));
          
      sliderGroup.append('text')
        .attr('x', sliderWidth / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .text('32');
    }

  }, [data, width, height, onParameterChange]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default SankeyDiagram;
