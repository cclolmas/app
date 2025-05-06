import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import '../styles/sankeyDiagram.css';

const ComputationalFlowDiagram = ({ data, comparisonData, config, comparisonConfig }) => {
  const sankeyRef = useRef(null);
  
  useEffect(() => {
    if (!data || !data.nodes || !data.links || data.nodes.length === 0) {
      return;
    }
    
    drawSankey();
  }, [data, comparisonData]);

  const drawSankey = () => {
    // Clear previous diagram
    d3.select(sankeyRef.current).selectAll('*').remove();
    
    // Set dimensions
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width = sankeyRef.current.clientWidth - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(sankeyRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create Sankey generator
    const sankeyGenerator = sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[0, 0], [width, height]]);
    
    // Generate layout
    const { nodes, links } = sankeyGenerator(data);
    
    // Add color scale
    const colorScale = d3.scaleOrdinal()
      .domain([...new Set(data.nodes.map(d => d.category))])
      .range([
        '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', 
        '#ff7f00', '#ffff33', '#a65628', '#f781bf'
      ]);
    
    // Add links (flows)
    svg.append('g')
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => d3.color(colorScale(d.source.category)).darker(0.5))
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('fill', 'none')
      .attr('opacity', 0.7)
      .on('mouseover', function(event, d) {
        // Highlight on hover
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke-width', d => Math.max(1, d.width + 2));
        
        // Show tooltip
        const tooltip = d3.select('.sankey-tooltip');
        tooltip.style('visibility', 'visible')
          .html(`
            <strong>From:</strong> ${d.source.name}<br>
            <strong>To:</strong> ${d.target.name}<br>
            <strong>Value:</strong> ${d.value} ${d.unit || ''}<br>
            ${d.description ? `<strong>Info:</strong> ${d.description}` : ''}
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.7)
          .attr('stroke-width', d => Math.max(1, d.width));
        
        d3.select('.sankey-tooltip').style('visibility', 'hidden');
      });
    
    // Add nodes
    svg.append('g')
      .selectAll('rect')
      .data(nodes)
      .enter()
      .append('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => colorScale(d.category))
      .attr('stroke', d => d3.color(colorScale(d.category)).darker(0.5))
      .on('mouseover', function(event, d) {
        // Show tooltip
        const tooltip = d3.select('.sankey-tooltip');
        tooltip.style('visibility', 'visible')
          .html(`
            <strong>${d.name}</strong><br>
            <strong>Category:</strong> ${d.category}<br>
            <strong>Time:</strong> ${d.time || 'N/A'} ms<br>
            <strong>Memory:</strong> ${d.memory || 'N/A'} MB<br>
            ${d.description ? `<strong>Info:</strong> ${d.description}` : ''}
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select('.sankey-tooltip').style('visibility', 'hidden');
      });
    
    // Add node labels
    svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
      .text(d => d.name)
      .attr('font-size', '10px')
      .attr('font-weight', 'bold');
    
    // Add comparison data if available
    if (comparisonData && comparisonData.nodes && comparisonData.links) {
      // Would implement side-by-side or overlay comparison visualization
      // This would be an extended implementation
    }
  };

  // Add zoom functionality
  useEffect(() => {
    if (!sankeyRef.current) return;
    
    const svg = d3.select(sankeyRef.current).select('svg');
    if (!svg.empty()) {
      const zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
          svg.select('g').attr('transform', event.transform);
        });
      
      svg.call(zoom);
    }
  }, [data]);

  return (
    <div className="sankey-container">
      {/* Container for the Sankey diagram */}
      <div ref={sankeyRef} className="sankey-diagram"></div>
      
      {/* Tooltip div */}
      <div className="sankey-tooltip"></div>
      
      {/* Zoom controls */}
      <div className="sankey-controls">
        <button onClick={() => {
          const svg = d3.select(sankeyRef.current).select('svg');
          const currentTransform = d3.zoomTransform(svg.node());
          svg.transition().call(
            d3.zoom().transform,
            d3.zoomIdentity.scale(currentTransform.k * 1.2)
          );
        }}>
          <span role="img" aria-label="Zoom In">➕</span>
        </button>
        <button onClick={() => {
          const svg = d3.select(sankeyRef.current).select('svg');
          const currentTransform = d3.zoomTransform(svg.node());
          svg.transition().call(
            d3.zoom().transform,
            d3.zoomIdentity.scale(currentTransform.k * 0.8)
          );
        }}>
          <span role="img" aria-label="Zoom Out">➖</span>
        </button>
        <button onClick={() => {
          const svg = d3.select(sankeyRef.current).select('svg');
          svg.transition().call(
            d3.zoom().transform,
            d3.zoomIdentity
          );
        }}>
          <span role="img" aria-label="Reset">🔄</span>
        </button>
      </div>
    </div>
  );
};

export default ComputationalFlowDiagram;
