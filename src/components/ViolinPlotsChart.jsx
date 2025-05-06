import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import '../styles/clCompDashboard.css';

const ViolinPlotsChart = ({ 
  data, 
  selectedPoints, 
  categoryMapping, 
  categoryKey, 
  onPointSelect 
}) => {
  const violinRef = useRef(null);

  // Draw violin plots when data or filters change
  useEffect(() => {
    if (data.length === 0) return;
    
    drawViolinPlots();
  }, [data, selectedPoints, categoryMapping, categoryKey]);

  const drawViolinPlots = () => {
    // Clear previous chart
    d3.select(violinRef.current).selectAll("*").remove();

    // Set dimensions
    const margin = { top: 40, right: 30, bottom: 60, left: 50 };
    const width = violinRef.current.clientWidth - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(violinRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Group data by category
    const categories = Object.keys(categoryMapping);
    const groupedData = {};
    categories.forEach(category => {
      groupedData[category] = data.filter(d => d[categoryKey] === category);
    });

    // Set x-axis scale
    const x = d3.scaleBand()
      .domain(categories)
      .range([0, width])
      .padding(0.1);

    // Set y-axis scale
    const y = d3.scaleLinear()
      .domain([0, 10])  // Cognitive load scale 0-10
      .range([height, 0]);

    // Draw x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => categoryMapping[d]))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-30)")
      .style("text-anchor", "end");

    // Draw y-axis
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Cognitive Load (1-10)");

    // Function to compute kernel density estimation
    const kde = (kernel, thresholds, data) => {
      return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))]);
    };

    // Function to compute kernel
    const epanechnikov = (bandwidth) => {
      return x => Math.abs(x /= bandwidth) <= 1 ? 0.75 * (1 - x * x) / bandwidth : 0;
    };

    // Draw violin plots for each category
    categories.forEach(category => {
      const categoryData = groupedData[category];
      if (!categoryData || categoryData.length === 0) return;

      const clValues = categoryData.map(d => d.cognitiveLoad);
      
      // Compute kernel density estimation
      const bandwidth = 0.8; // Adjust for smoother/rougher violin
      const thresholds = y.ticks(100);
      const density = kde(epanechnikov(bandwidth), thresholds, clValues);
      
      // Scale density values
      const maxWidth = x.bandwidth() * 0.8;
      const xNum = d3.scaleLinear()
        .range([0, maxWidth])
        .domain([0, d3.max(density, d => d[1])]);

      // Draw right side of violin
      svg.append("path")
        .datum(density)
        .attr("fill", category === 'q4' ? "#FF9999" : category === 'q8' ? "#99FF99" : "#9999FF")
        .attr("opacity", 0.6)
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d", d3.line()
          .curve(d3.curveCatmullRom)
          .x(d => x(category) + xNum(d[1]))
          .y(d => y(d[0]))
        );

      // Draw left side of violin
      svg.append("path")
        .datum(density)
        .attr("fill", category === 'q4' ? "#FF9999" : category === 'q8' ? "#99FF99" : "#9999FF")
        .attr("opacity", 0.6)
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d", d3.line()
          .curve(d3.curveCatmullRom)
          .x(d => x(category) - xNum(d[1]))
          .y(d => y(d[0]))
        );

      // Compute quartiles for boxplot inside violin
      const q1 = d3.quantile(clValues.sort(d3.ascending), 0.25);
      const median = d3.quantile(clValues.sort(d3.ascending), 0.5);
      const q3 = d3.quantile(clValues.sort(d3.ascending), 0.75);

      // Draw box plot inside violin
      const boxWidth = maxWidth * 0.5;
      
      // Draw box
      svg.append("rect")
        .attr("x", x(category) - boxWidth/2)
        .attr("y", y(q3))
        .attr("height", y(q1) - y(q3))
        .attr("width", boxWidth)
        .attr("stroke", "black")
        .attr("fill", "none");
        
      // Draw median line
      svg.append("line")
        .attr("x1", x(category) - boxWidth/2)
        .attr("x2", x(category) + boxWidth/2)
        .attr("y1", y(median))
        .attr("y2", y(median))
        .attr("stroke", "black")
        .attr("stroke-width", 2);
    });

    // Add individual points for selected points
    if (selectedPoints && selectedPoints.length > 0) {
      svg.selectAll("circle")
        .data(selectedPoints)
        .enter()
        .append("circle")
        .attr("cx", d => x(d[categoryKey]))
        .attr("cy", d => y(d.cognitiveLoad))
        .attr("r", 4)
        .attr("fill", "#FF5733")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("opacity", 0.8);
    }

    // Add hypothesis annotations
    const annotationData = [
      {
        category: 'q4', 
        y: 7.5, 
        text: "H1: Higher CL with optimized computation",
        color: "rgba(255, 0, 0, 0.7)"
      },
      {
        category: 'q8', 
        y: 5, 
        text: "H3: Optimal balance point",
        color: "rgba(0, 255, 0, 0.7)"
      },
      {
        category: 'f16', 
        y: 8, 
        text: "Higher resource usage",
        color: "rgba(0, 0, 255, 0.7)"
      }
    ];

    // Only add annotations for quantization categories if they exist
    if (categories.includes('q4') && categories.includes('q8')) {
      svg.selectAll(".annotation")
        .data(annotationData.filter(d => categories.includes(d.category)))
        .enter()
        .append("g")
        .attr("class", "annotation")
        .each(function(d) {
          const g = d3.select(this);
          
          // Add text
          g.append("text")
            .attr("x", x(d.category))
            .attr("y", y(d.y) - 15)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .attr("fill", d.color)
            .text(d.text);
            
          // Add line to point at violin
          g.append("line")
            .attr("x1", x(d.category))
            .attr("y1", y(d.y) - 10)
            .attr("x2", x(d.category))
            .attr("y2", y(d.y))
            .attr("stroke", d.color)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3");
        });
    }

    // Add interaction to select points
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("opacity", 0)
      .on("click", function() {
        // Reset point selection
        onPointSelect([]);
      });
  };

  return (
    <div className="violin-plot-container">
      <div ref={violinRef} className="violin-chart"></div>
      
      <div className="chart-description">
        <p>
          These violin plots show how cognitive load is distributed across different 
          {categoryKey === 'quantization' ? ' quantization levels' : 
           categoryKey === 'modelSize' ? ' model sizes' : ' execution time categories'}.
          The width of each violin represents the density of observations at that cognitive load level.
        </p>
      </div>
    </div>
  );
};

export default ViolinPlotsChart;
