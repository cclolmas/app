/**
 * Radar Chart for multidimensional CL visualization
 */
export function createRadarChart(selector, data) {
  const container = d3.select(selector);
  const width = 320;
  const height = 240;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  
  // Clear previous chart if any
  container.selectAll("*").remove();
  
  // Create SVG
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width/2},${height/2})`);
  
  // Calculate radar chart parameters
  const radius = Math.min(width, height) / 2 - margin.top;
  const angleSlice = Math.PI * 2 / data.dimensions.length;
  
  // Scale for radius
  const rScale = d3.scaleLinear()
    .range([0, radius])
    .domain([0, 1]);
  
  // Create circular grid
  const axisGrid = svg.append("g").attr("class", "axis-grid");
  
  // Draw background circles
  const circles = [0.2, 0.4, 0.6, 0.8, 1];
  circles.forEach(d => {
    axisGrid.append("circle")
      .attr("r", rScale(d))
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "4,4");
  });
  
  // Draw axes
  data.dimensions.forEach((dim, i) => {
    const angle = i * angleSlice;
    const lineX = radius * Math.cos(angle - Math.PI/2);
    const lineY = radius * Math.sin(angle - Math.PI/2);
    
    axisGrid.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", lineX)
      .attr("y2", lineY)
      .attr("stroke", "#bbb");
    
    axisGrid.append("text")
      .attr("x", lineX * 1.15)
      .attr("y", lineY * 1.15)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .text(dim);
  });
  
  // Create radar line generator
  const radarLine = d3.lineRadial()
    .radius(d => rScale(d))
    .angle((d, i) => i * angleSlice)
    .curve(d3.curveLinearClosed);
  
  // Create radar areas
  data.values.forEach(series => {
    // Draw the path
    svg.append("path")
      .datum(series.values)
      .attr("d", radarLine)
      .attr("fill", series.color)
      .attr("fill-opacity", 0.3)
      .attr("stroke", series.color)
      .attr("stroke-width", 2);
    
    // Draw dots at each point
    series.values.forEach((d, i) => {
      const angle = i * angleSlice - Math.PI/2;
      svg.append("circle")
        .attr("cx", rScale(d) * Math.cos(angle))
        .attr("cy", rScale(d) * Math.sin(angle))
        .attr("r", 4)
        .attr("fill", series.color);
    });
  });
  
  // Create tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  
  // Add invisible circles for tooltips
  data.dimensions.forEach((dim, i) => {
    const angle = i * angleSlice - Math.PI/2;
    svg.append("circle")
      .attr("cx", rScale(0.9) * Math.cos(angle))
      .attr("cy", rScale(0.9) * Math.sin(angle))
      .attr("r", radius * 0.15)
      .attr("fill", "transparent")
      .on("mouseover", function(event) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(data.tooltips[i])
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  });
  
  // Add legend
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${-width/2 + margin.left},${-height/2 + margin.top})`);
  
  data.values.forEach((d, i) => {
    legend.append("rect")
      .attr("x", 0)
      .attr("y", i * 20)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", d.color);
      
    legend.append("text")
      .attr("x", 15)
      .attr("y", i * 20 + 9)
      .attr("font-size", "10px")
      .text(d.name);
  });
  
  return {
    update(newData) {
      // Update functionality can be added here
    }
  };
}
