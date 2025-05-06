import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ModelTuningPreview = () => {
  const svgRef = useRef();
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Limpar SVG existente
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Dados de exemplo para visualização não linear
    const data = Array.from({ length: 50 }, (_, i) => ({
      x: i / 50,
      y: Math.sin(i / 5) * 0.5 + 0.5 + Math.random() * 0.1
    }));
    
    // Dimensões
    const width = 600;
    const height = 250;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Criar SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
      
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Escalas
    const xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0]);
    
    // Linha
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveNatural);
    
    // Desenhar linha
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#6610f2")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Pontos interativos
    g.selectAll(".dot")
      .data(data.filter((d, i) => i % 5 === 0))
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 5)
      .attr("fill", "#6610f2")
      .attr("cursor", "pointer")
      .on("mouseover", function() {
        d3.select(this).attr("r", 8);
      })
      .on("mouseout", function() {
        d3.select(this).attr("r", 5);
      });
    
    // Eixos
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));
    
    g.append("g")
      .call(d3.axisLeft(yScale));
      
    // Título
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("Ajuste Não Linear de Parâmetros");
  }, []);
  
  return (
    <div className="model-tuning-preview">
      <svg ref={svgRef} className="w-100"></svg>
    </div>
  );
};

export default ModelTuningPreview;
