/**
 * Sankey Diagram for computation flow visualization
 */
export function createSankeyDiagram(selector, data) {
  const container = d3.select(selector);
  const width = 320;
  const height = 240;
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  // Clear previous chart if any
  container.selectAll("*").remove();

  // Create SVG
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create Sankey generator
  const sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .size([innerWidth, innerHeight]);

  // Format data for d3-sankey
  const graph = {
    nodes: data.nodes.map(d => Object.assign({}, d)),
    links: data.links.map(d => Object.assign({}, d))
  };

  // Generate the sankey diagram
  const sankeyData = sankey(graph);
  
  // Create tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Draw the links
  const link = svg.append("g")
    .selectAll(".link")
    .data(graph.links)
    .enter().append("path")
    .attr("class", "link")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke-width", d => Math.max(1, d.width))
    .attr("stroke", "#aaa")
    .attr("fill", "none")
    .attr("opacity", 0.5)
    .on("mouseover", function(event, d) {
      d3.select(this).attr("opacity", 0.8);
      
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`${d.source.name} → ${d.target.name}<br>Flow: ${d.value}`)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).attr("opacity", 0.5);
      
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  // Draw the nodes
  const node = svg.append("g")
    .selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  // Add node rectangles
  node.append("rect")
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", (d, i) => d3.schemeCategory10[i % 10])
    .attr("opacity", 0.8)
    .on("mouseover", function(event, d) {
      // Get all links connected to this node
      const connectedLinks = graph.links.filter(l => 
        l.source.id === d.id || l.target.id === d.id
      );
      
      // Highlight connected links
      svg.selectAll(".link")
        .attr("opacity", l => 
          connectedLinks.includes(l) ? 0.8 : 0.2
        );
        
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`${d.name}<br>Value: ${d.value}`)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      // Reset link opacity
      svg.selectAll(".link")
        .attr("opacity", 0.5);
        
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  // Add node labels
  node.append("text")
    .attr("x", d => d.x0 < innerWidth / 2 ? 6 + (d.x1 - d.x0) : -6)
    .attr("y", d => (d.y1 - d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => d.x0 < innerWidth / 2 ? "start" : "end")
    .attr("font-size", "10px")
    .text(d => d.name);
    
  return {
    update(newData) {
      // Format updated data
      const updatedGraph = {
        nodes: newData.nodes.map(d => Object.assign({}, d)),
        links: newData.links.map(d => Object.assign({}, d))
      };
      
      // Regenerate the sankey diagram
      sankey(updatedGraph);
      
      // Update links
      svg.selectAll(".link")
        .data(updatedGraph.links)
        .transition()
        .duration(500)
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke-width", d => Math.max(1, d.width));
        
      // Update nodes
      const nodeGroup = svg.selectAll(".node")
        .data(updatedGraph.nodes);
        
      nodeGroup.transition()
        .duration(500)
        .attr("transform", d => `translate(${d.x0},${d.y0})`);
        
      nodeGroup.select("rect")
        .transition()
        .duration(500)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0);
        
      nodeGroup.select("text")
        .transition()
        .duration(500)
        .attr("x", d => d.x0 < innerWidth / 2 ? 6 + (d.x1 - d.x0) : -6)
        .attr("y", d => (d.y1 - d.y0) / 2);
    }
  };
}
