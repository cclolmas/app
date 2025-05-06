/**
 * Stacked Bar Chart for resource allocation
 */
export function createStackedBarChart(selector, data) {
  const container = d3.select(selector);
  const width = 320;
  const height = 240;
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
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

  // Setup scales
  const xScale = d3.scaleBand()
    .domain(data.categories)
    .range([0, innerWidth])
    .padding(0.2);
    
  // Stack the data
  const stackedData = d3.stack()
    .keys(data.series.map(d => d.name))
    .value((d, key) => {
      const seriesIndex = data.series.findIndex(s => s.name === key);
      return data.series[seriesIndex].data[data.categories.indexOf(d)];
    })
    (data.categories);
    
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])])
    .range([innerHeight, 0]);

  // Create axes
  const xAxis = svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale));
    
  svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(yScale));

  // Create tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  
  // Draw stacked bars
  const layers = svg.selectAll(".series")
    .data(stackedData)
    .enter().append("g")
    .attr("class", "series")
    .style("fill", (d, i) => data.series[i].color);
    
  layers.selectAll("rect")
    .data(d => d)
    .enter().append("rect")
    .attr("x", d => xScale(d.data))
    .attr("y", d => yScale(d[1]))
    .attr("height", d => yScale(d[0]) - yScale(d[1]))
    .attr("width", xScale.bandwidth())
    .on("mouseover", function(event, d) {
      const seriesName = d3.select(this.parentNode).datum().key;
      const value = d[1] - d[0];
      const category = d.data;
      const q4Value = data.comparison.q4[data.categories.indexOf(category)];
      const q8Value = data.comparison.q8[data.categories.indexOf(category)];
      const savings = Math.round((q8Value - q4Value) / q8Value * 100);
      
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`${seriesName} - ${category}<br>Value: ${value}<br>Q4 vs Q8: ${savings}% saved`)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });
    
  // Add comparison indicators (Q4 vs Q8)
  data.categories.forEach((category, i) => {
    const q4Value = data.comparison.q4[i];
    const q8Value = data.comparison.q8[i];
    
    svg.append("line")
      .attr("x1", xScale(category) + xScale.bandwidth() * 0.1)
      .attr("x2", xScale(category) + xScale.bandwidth() * 0.9)
      .attr("y1", yScale(q8Value))
      .attr("y2", yScale(q8Value))
      .attr("stroke", "#e74c3c")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,3");
  });
  
  // Add legend
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(0,${innerHeight + 20})`);
    
  data.series.forEach((series, i) => {
    const lg = legend.append("g")
      .attr("transform", `translate(${i * (innerWidth / data.series.length)}, 0)`);
      
    lg.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", series.color);
      
    lg.append("text")
      .attr("x", 15)
      .attr("y", 9)
      .attr("font-size", "9px")
      .text(series.name);
  });
  
  return {
    update(newData) {
      // Update functionality could be added here
    }
  };
}
