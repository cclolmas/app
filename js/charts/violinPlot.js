/**
 * Violin Plot for CL x CompL distribution visualization
 */
export function createViolinPlot(selector, data) {
  const container = d3.select(selector);
  const width = 320;
  const height = 240;
  const margin = { top: 10, right: 30, bottom: 40, left: 40 };
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
    
  // Get all group names
  const groups = data.map(d => d.group);

  // Build X scale
  const x = d3.scaleBand()
    .domain(groups)
    .range([0, innerWidth])
    .padding(0.05);
    
  // Add X axis
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-15)")
    .style("text-anchor", "end");
    
  // Create dual Y scales for CL and CompL
  const y1 = d3.scaleLinear()
    .domain([0, 1])
    .range([innerHeight, innerHeight/2 + 10]);
    
  const y2 = d3.scaleLinear()
    .domain([0, 1])
    .range([innerHeight/2 - 10, 0]);
    
  // Add Y axes
  svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y1).ticks(5));
    
  svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y2).ticks(5));
    
  // Add separator line
  svg.append("line")
    .attr("x1", 0)
    .attr("x2", innerWidth)
    .attr("y1", innerHeight/2)
    .attr("y2", innerHeight/2)
    .attr("stroke", "#bbb")
    .attr("stroke-dasharray", "3,3");
    
  // Add axis labels
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 10)
    .attr("x", -innerHeight * 3/4)
    .attr("font-size", "10px")
    .attr("text-anchor", "middle")
    .text("CL");
    
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 10)
    .attr("x", -innerHeight/4)
    .attr("font-size", "10px")
    .attr("text-anchor", "middle")
    .text("CompL");
    
  // Compute kernel density estimation
  function kernelDensityEstimator(kernel, X) {
    return function(V) {
      return X.map(function(x) {
        return [x, d3.mean(V, function(v) { return kernel(x - v); })];
      });
    };
  }
  
  function kernelEpanechnikov(k) {
    return function(v) {
      return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
  }
  
  // Create tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    
  // Draw violin plots for CL
  const kde = kernelDensityEstimator(kernelEpanechnikov(0.05), y1.ticks(20));
  
  data.forEach(function(d) {
    // Compute CL density
    let clDensity = kde(d.CL);
    let clMaxDensity = d3.max(clDensity, d => d[1]);
    
    // Scale density to fit in the allocated bandwidth
    const xNum = x.bandwidth() / (2 * clMaxDensity);
    
    // Create CL violin path
    const clArea = svg.append("g")
      .attr("transform", `translate(${x(d.group) + x.bandwidth()/2}, 0)`);
      
    clArea.append("path")
      .datum(clDensity)
      .attr("fill", "#3498db")
      .attr("opacity", 0.6)
      .attr("stroke", "#2980b9")
      .attr("stroke-width", 1)
      .attr("d", d3.area()
        .x0(d => -d[1] * xNum)
        .x1(d => d[1] * xNum)
        .y(d => y1(d[0]))
        .curve(d3.curveCatmullRom)
      )
      .on("mouseover", function(event) {
        const mean = d3.mean(d.CL);
        const std = d3.deviation(d.CL);
        
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`${d.group}<br>CL: ${mean.toFixed(2)} ± ${std.toFixed(2)}<br>Samples: ${d.CL.length}`)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
      
    // Compute CompL density
    let compLDensity = kernelDensityEstimator(kernelEpanechnikov(0.05), y2.ticks(20))(d.CompL);
    let compLMaxDensity = d3.max(compLDensity, d => d[1]);
    
    // Scale density to fit in the allocated bandwidth
    const xNumCompL = x.bandwidth() / (2 * compLMaxDensity);
    
    // Create CompL violin path
    const compLArea = svg.append("g")
      .attr("transform", `translate(${x(d.group) + x.bandwidth()/2}, 0)`);
      
    compLArea.append("path")
      .datum(compLDensity)
      .attr("fill", "#e74c3c")
      .attr("opacity", 0.6)
      .attr("stroke", "#c0392b")
      .attr("stroke-width", 1)
      .attr("d", d3.area()
        .x0(d => -d[1] * xNumCompL)
        .x1(d => d[1] * xNumCompL)
        .y(d => y2(d[0]))
        .curve(d3.curveCatmullRom)
      )
      .on("mouseover", function(event) {
        const mean = d3.mean(d.CompL);
        const std = d3.deviation(d.CompL);
        
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`${d.group}<br>CompL: ${mean.toFixed(2)} ± ${std.toFixed(2)}<br>Samples: ${d.CompL.length}`)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  });
  
  // Add a legend
  const legend = svg.append("g")
    .attr("transform", `translate(${innerWidth - 70}, 5)`);
    
  legend.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", "#3498db");
    
  legend.append("text")
    .attr("x", 15)
    .attr("y", 9)
    .attr("font-size", "9px")
    .text("CL");
    
  legend.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("y", 15)
    .attr("fill", "#e74c3c");
    
  legend.append("text")
    .attr("x", 15)
    .attr("y", 24)
    .attr("font-size", "9px")
    .text("CompL");
    
  return {
    update(newData) {
      // Update functionality could be added here
    }
  };
}
