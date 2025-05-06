/**
 * KDE Plot for density probabilistic visualization
 */
export function createKdePlot(selector, data) {
  const container = d3.select(selector);
  const width = 320;
  const height = 240;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
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

  // Create scales
  const xScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, innerWidth]);
    
  const yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([innerHeight, 0]);

  // Add axes
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.format(".1f")));
    
  svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(".1f")));
    
  // Add axis labels
  svg.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + margin.bottom - 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .text("Cognitive Load (CL)");
    
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 15)
    .attr("x", -innerHeight / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .text("Computational Load (CompL)");

  // Compute the density contours
  const densityData = data.points;
  
  // Create a color scale for density
  const colorScale = d3.scaleSequential(d3.interpolateYlGnBu)
    .domain([0, 0.1]); // Adjust based on your density range
    
  // Generate random data for the heatmap
  const numCellsX = 20;
  const numCellsY = 20;
  const cellWidth = innerWidth / numCellsX;
  const cellHeight = innerHeight / numCellsY;
  
  // Create 2D array for density estimation
  const densityGrid = Array(numCellsX).fill().map(() => Array(numCellsY).fill(0));
  
  // Simple density estimation (counts in cells)
  densityData.forEach(point => {
    const xIndex = Math.floor(point.CL * numCellsX);
    const yIndex = Math.floor(point.CompL * numCellsY);
    
    if (xIndex >= 0 && xIndex < numCellsX && yIndex >= 0 && yIndex < numCellsY) {
      densityGrid[xIndex][yIndex] += 1;
    }
  });
  
  // Normalize the density grid
  const maxDensity = d3.max(densityGrid.flat());
  for (let i = 0; i < numCellsX; i++) {
    for (let j = 0; j < numCellsY; j++) {
      densityGrid[i][j] /= maxDensity;
    }
  }
  
  // Create tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  
  // Draw the density heatmap
  svg.selectAll("rect")
    .data(d3.cross(d3.range(numCellsX), d3.range(numCellsY)))
    .enter().append("rect")
    .attr("x", d => d[0] * cellWidth)
    .attr("y", d => innerHeight - (d[1] + 1) * cellHeight)
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("fill", d => {
      const density = densityGrid[d[0]][d[1]];
      return colorScale(density);
    })
    .attr("opacity", d => {
      const density = densityGrid[d[0]][d[1]];
      return density > 0.05 ? 0.8 : density * 8;
    })
    .on("mouseover", function(event, d) {
      const density = densityGrid[d[0]][d[1]];
      const cl = (d[0] + 0.5) / numCellsX;
      const compL = (d[1] + 0.5) / numCellsY;
      
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`CL: ${cl.toFixed(2)}<br>CompL: ${compL.toFixed(2)}<br>Density: ${(density * 100).toFixed(0)}%`)
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  // Add expertise level reference lines
  const expertiseLevels = data.expertiseLevels;
  
  // Add beginner reference point
  svg.append("circle")
    .attr("cx", xScale(expertiseLevels.beginner.x))
    .attr("cy", yScale(expertiseLevels.beginner.y))
    .attr("r", 5)
    .attr("fill", "#e74c3c")
    .attr("stroke", "white");
    
  svg.append("text")
    .attr("x", xScale(expertiseLevels.beginner.x) + 7)
    .attr("y", yScale(expertiseLevels.beginner.y) - 7)
    .attr("font-size", "9px")
    .text("Iniciante");
    
  // Add expert reference point
  svg.append("circle")
    .attr("cx", xScale(expertiseLevels.expert.x))
    .attr("cy", yScale(expertiseLevels.expert.y))
    .attr("r", 5)
    .attr("fill", "#2ecc71")
    .attr("stroke", "white");
    
  svg.append("text")
    .attr("x", xScale(expertiseLevels.expert.x) + 7)
    .attr("y", yScale(expertiseLevels.expert.y) - 7)
    .attr("font-size", "9px")
    .text("Especialista");
    
  // Add a contour around the highest density area
  const contourThreshold = 0.7; // Top 30% density
  
  // Create a flattened array of [x, y, density] data points
  const contourData = [];
  for (let i = 0; i < numCellsX; i++) {
    for (let j = 0; j < numCellsY; j++) {
      const density = densityGrid[i][j];
      if (density > contourThreshold) {
        contourData.push([
          (i + 0.5) * cellWidth, 
          innerHeight - (j + 0.5) * cellHeight,
          density
        ]);
      }
    }
  }
  
  // Draw contour if we have enough data points
  if (contourData.length > 3) {
    const hull = d3.polygonHull(contourData.map(d => [d[0], d[1]]));
    if (hull) {
      svg.append("path")
        .attr("d", "M" + hull.join("L") + "Z")
        .attr("stroke", "#3498db")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("stroke-dasharray", "5,5");
    }
  }
  
  return {
    update(newData) {
      // Update functionality could be added here
    }
  };
}
