/**
 * Stacked Histogram for cognitive task distribution
 */
export function createStackedHistogram(selector, data) {
  const container = d3.select(selector);
  const width = 320;
  const height = 240;
  const margin = { top: 20, right: 20, bottom: 70, left: 40 };
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
    
  // Calculate the max total value for each category
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
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em");
    
  svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(yScale));
    
  // Add bars for each series
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    
  // Draw bars
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
      
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`${seriesName}<br>${category}: ${value}`)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });
    
  // Add legend
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(0,${innerHeight + 35})`);
    
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
      .attr("font-size", "10px")
      .text(series.name);
  });
  
  // Return update function for filtering
  return {
    update(newData) {
      // Calculate new stacked data from updated dataset
      const updateStackedData = d3.stack()
        .keys(newData.series.map(d => d.name))
        .value((d, key) => {
          const seriesIndex = newData.series.findIndex(s => s.name === key);
          return newData.series[seriesIndex].data[newData.categories.indexOf(d)];
        })
        (newData.categories);
        
      // Update y scale domain
      yScale.domain([0, d3.max(updateStackedData[updateStackedData.length - 1], d => d[1])]);
      
      // Update y axis
      svg.select(".axis").transition().duration(500).call(d3.axisLeft(yScale));
      
      // Update bars
      const updatedLayers = svg.selectAll(".series")
        .data(updateStackedData);
        
      updatedLayers.selectAll("rect")
        .data(d => d)
        .transition()
        .duration(500)
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]));
    }
  };
}
