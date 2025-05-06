import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { contourDensity } from 'd3-contour';
import '../styles/clCompDashboard.css';

const KdePlot = ({ 
  data, 
  selectedPoints, 
  selectedRegion, 
  compMetric, 
  drawMode, 
  onRegionSelect 
}) => {
  const kdeRef = useRef(null);
  const [drawStart, setDrawStart] = useState(null);
  
  // Labels for computational metrics
  const metricLabels = {
    'vramUsage': 'VRAM Usage (GB)',
    'executionTime': 'Execution Time (s)',
    'modelSize': 'Model Size (B params)'
  };

  // Draw KDE plot when data or filters change
  useEffect(() => {
    if (data.length === 0) return;
    
    drawKdePlot();
  }, [data, selectedPoints, selectedRegion, compMetric]);

  // Setup drawing mode
  useEffect(() => {
    const svg = d3.select(kdeRef.current).select("svg");
    
    if (!svg.empty()) {
      if (drawMode) {
        svg.style("cursor", "crosshair");
      } else {
        svg.style("cursor", "default");
      }
    }
  }, [drawMode]);

  const drawKdePlot = () => {
    // Clear previous chart
    d3.select(kdeRef.current).selectAll("*").remove();

    // Set dimensions
    const margin = { top: 40, right: 30, bottom: 60, left: 70 };
    const width = kdeRef.current.clientWidth - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(kdeRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Extract x and y values
    const xValues = data.map(d => d[compMetric]);
    const yValues = data.map(d => d.cognitiveLoad);

    // Set x-axis scale
    const x = d3.scaleLinear()
      .domain([
        Math.min(...xValues) * 0.8,
        Math.max(...xValues) * 1.2
      ])
      .range([0, width]);

    // Set y-axis scale
    const y = d3.scaleLinear()
      .domain([0, 10])  // Cognitive load scale 0-10
      .range([height, 0]);

    // Draw x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Add x-axis label
    svg.append("text")
      .attr("transform", `translate(${width/2},${height + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .text(metricLabels[compMetric] || compMetric);

    // Draw y-axis
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 15)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Cognitive Load (1-10)");

    // Compute 2D density
    const densityData = [];
    data.forEach(d => {
      densityData.push([x(d[compMetric]), y(d.cognitiveLoad)]);
    });

    // Generate contours
    const contours = contourDensity()
      .x(d => d[0])
      .y(d => d[1])
      .size([width, height])
      .bandwidth(20) // Adjust for smoother/rougher contours
      .thresholds(10)
      (densityData);

    // Color scale for contours
    const color = d3.scaleSequential(d3.interpolateYlOrRd)
      .domain([0, d3.max(contours, d => d.value)]);

    // Draw contours
    svg.append("g")
      .selectAll("path")
      .data(contours)
      .enter()
      .append("path")
      .attr("d", d3.geoPath())
      .attr("fill", d => color(d.value))
      .attr("opacity", 0.7)
      .attr("stroke", "#555")
      .attr("stroke-width", 0.5);

    // Draw individual points
    svg.append("g")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d[compMetric]))
      .attr("cy", d => y(d.cognitiveLoad))
      .attr("r", 3)
      .attr("fill", d => {
        // Check if point is in selectedPoints
        if (selectedPoints.includes(d)) {
          return "#FF5733";
        }
        return "#555";
      })
      .attr("opacity", d => selectedPoints.length > 0 ? 
        (selectedPoints.includes(d) ? 0.9 : 0.2) : 0.5)
      .attr("stroke", d => selectedPoints.includes(d) ? "black" : "none");

    // Add predefined regions of interest for hypotheses
    const regions = [
      {
        id: 'h1-region',
        label: 'H1: High CL, Low CompL',
        color: 'rgba(255, 0, 0, 0.2)',
        stroke: 'rgba(255, 0, 0, 0.8)',
        x1: x.domain()[0],
        y1: y(7),
        x2: x(x.domain()[0] + (x.domain()[1] - x.domain()[0]) * 0.3),
        y2: y.domain()[0]
      },
      {
        id: 'h3-region',
        label: 'H3: Optimal Point',
        color: 'rgba(0, 255, 0, 0.2)',
        stroke: 'rgba(0, 255, 0, 0.8)',
        x1: x(x.domain()[0] + (x.domain()[1] - x.domain()[0]) * 0.3),
        y1: y(7),
        x2: x(x.domain()[0] + (x.domain()[1] - x.domain()[0]) * 0.6),
        y2: y(3)
      },
      {
        id: 'h4-region',
        label: 'H4: Expertise Reversal',
        color: 'rgba(0, 0, 255, 0.2)',
        stroke: 'rgba(0, 0, 255, 0.8)',
        x1: x(x.domain()[0] + (x.domain()[1] - x.domain()[0]) * 0.6),
        y1: y(5),
        x2: x.domain()[1],
        y2: y.domain()[0]
      }
    ];

    // Draw regions
    svg.append("g")
      .selectAll(".region")
      .data(regions)
      .enter()
      .append("rect")
      .attr("class", "region")
      .attr("id", d => d.id)
      .attr("x", d => d.x1)
      .attr("y", d => d.y1)
      .attr("width", d => d.x2 - d.x1)
      .attr("height", d => d.y2 - d.y1)
      .attr("fill", d => d.color)
      .attr("stroke", d => d.stroke)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.7)
      .on("click", function(event, d) {
        // Convert to data values for filtering
        const region = {
          x1: x.invert(d.x1),
          y1: y.invert(d.y2), // Note: y is inverted in SVG
          x2: x.invert(d.x2),
          y2: y.invert(d.y1)  // Note: y is inverted in SVG
        };
        onRegionSelect(region);
        
        // Highlight this region
        d3.selectAll(".region").attr("stroke-width", 1);
        d3.select(this).attr("stroke-width", 3);
      })
      .append("title")
      .text(d => d.label);

    // Add region labels
    svg.append("g")
      .selectAll(".region-label")
      .data(regions)
      .enter()
      .append("text")
      .attr("class", "region-label")
      .attr("x", d => d.x1 + (d.x2 - d.x1) / 2)
      .attr("y", d => d.y1 + 15)
      .attr("text-anchor", "middle")
      .attr("fill", d => d.stroke)
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text(d => d.label.split(':')[0]);

    // If a selected region exists, highlight it
    if (selectedRegion) {
      svg.append("rect")
        .attr("class", "selected-region")
        .attr("x", x(selectedRegion.x1))
        .attr("y", y(selectedRegion.y2))
        .attr("width", x(selectedRegion.x2) - x(selectedRegion.x1))
        .attr("height", y(selectedRegion.y1) - y(selectedRegion.y2))
        .attr("fill", "none")
        .attr("stroke", "#FF5733")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
    }

    // Add drawing functionality for regions of interest
    if (drawMode) {
      const drawRect = svg.append("rect")
        .attr("class", "drawing-rect")
        .attr("fill", "rgba(255, 87, 51, 0.2)")
        .attr("stroke", "#FF5733")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .style("display", "none");
        
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mousedown", function(event) {
          if (!drawMode) return;
          
          // Get mouse position relative to the SVG
          const [mx, my] = d3.pointer(event);
          setDrawStart({x: mx, y: my});
          
          // Initialize drawing rectangle
          drawRect
            .attr("x", mx)
            .attr("y", my)
            .attr("width", 0)
            .attr("height", 0)
            .style("display", null);
        })
        .on("mousemove", function(event) {
          if (!drawMode || !drawStart) return;
          
          // Get mouse position
          const [mx, my] = d3.pointer(event);
          
          // Update rectangle dimensions
          const startX = Math.min(drawStart.x, mx);
          const startY = Math.min(drawStart.y, my);
          const width = Math.abs(mx - drawStart.x);
          const height = Math.abs(my - drawStart.y);
          
          drawRect
            .attr("x", startX)
            .attr("y", startY)
            .attr("width", width)
            .attr("height", height);
        })
        .on("mouseup", function(event) {
          if (!drawMode || !drawStart) return;
          
          // Get mouse position
          const [mx, my] = d3.pointer(event);
          
          // Calculate rectangle dimensions
          const startX = Math.min(drawStart.x, mx);
          const startY = Math.min(drawStart.y, my);
          const endX = Math.max(drawStart.x, mx);
          const endY = Math.max(drawStart.y, my);
          
          // Convert to data values for filtering
          const region = {
            x1: x.invert(startX),
            y1: y.invert(endY), // Note: y is inverted in SVG
            x2: x.invert(endX),
            y2: y.invert(startY)  // Note: y is inverted in SVG
          };
          
          onRegionSelect(region);
          
          // Clean up
          setDrawStart(null);
          drawRect.style("display", "none");
        });
    }

    // Add optimal point marker (H3 hypothesis)
    svg.append("circle")
      .attr("class", "optimal-point")
      .attr("cx", x(x.domain()[0] + (x.domain()[1] - x.domain()[0]) * 0.45))
      .attr("cy", y(5))
      .attr("r", 8)
      .attr("fill", "none")
      .attr("stroke", "rgba(0, 255, 0, 0.8)")
      .attr("stroke-width", 2)
      .append("title")
      .text("Theoretical Optimal Point (H3)");

    // Add pulsating animation to optimal point
    svg.append("circle")
      .attr("class", "pulse")
      .attr("cx", x(x.domain()[0] + (x.domain()[1] - x.domain()[0]) * 0.45))
      .attr("cy", y(5))
      .attr("r", 8)
      .attr("fill", "rgba(0, 255, 0, 0.3)")
      .attr("stroke", "none")
      .style("animation", "pulse 2s infinite");
  };

  return (
    <div className="kde-plot-container">
      <div ref={kdeRef} className="kde-chart"></div>
      
      <div className="chart-description">
        <p>
          This heat map shows the relationship between cognitive load and {metricLabels[compMetric].toLowerCase()}.
          Darker areas indicate higher density of observations. The optimal point (H3) represents the theoretical
          best balance between cognitive and computational efficiency.
        </p>
        {drawMode && (
          <p className="draw-instructions">
            <strong>Draw Mode:</strong> Click and drag to select a region of interest.
          </p>
        )}
      </div>
    </div>
  );
};

export default KdePlot;
