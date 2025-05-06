import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper, FormControl, Select, MenuItem, InputLabel, Button, Grid } from '@mui/material';
import { sankeyLinkHorizontal, sankey, sankeyJustify, sankeyLeft, sankeyRight, sankeyCenter } from 'd3-sankey';
import { scaleOrdinal } from 'd3-scale';
import { format } from 'd3-format';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestoreIcon from '@mui/icons-material/Restore';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

const SankeyDiagram = ({ 
  data, 
  width = 800, 
  height = 500, 
  comparisonData = null,
  onComparisonRequest 
}) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const wrapperRef = useRef(null);
  
  const [alignmentType, setAlignmentType] = useState('justify');
  const [showComparison, setShowComparison] = useState(false);
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
  const [error, setError] = useState(null);
  
  // Format for values in tooltips
  const formatNumber = format(",.2f");
  
  // Get alignment function based on selected type
  const getAlignmentMethod = (type) => {
    switch(type) {
      case 'left': return sankeyLeft;
      case 'right': return sankeyRight;
      case 'center': return sankeyCenter;
      case 'justify':
      default: return sankeyJustify;
    }
  };
  
  // Helper for time formatting in tooltips
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
    }
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${remainingMinutes}m`;
  };
  
  // Helper for memory formatting
  const formatMemory = (gb) => {
    if (gb < 0.1) return `${(gb * 1000).toFixed(2)}MB`;
    return `${gb.toFixed(2)}GB`;
  };

  // Debug logging
  useEffect(() => {
    if (!data) {
      console.log('SankeyDiagram: No data provided');
    } else {
      console.log('SankeyDiagram: Data received', {
        nodes: data.nodes?.length || 0,
        links: data.links?.length || 0
      });
    }
  }, [data]);

  // Set up the visualization
  useEffect(() => {
    try {
      if (!data || !svgRef.current || !tooltipRef.current) return;
      
      // Set up SVG container
      const svg = select(svgRef.current);
      svg.selectAll("*").remove();
      
      const mainGroup = svg.append("g")
        .attr("transform", `translate(${transform.x},${transform.y}) scale(${transform.k})`);
        
      // Set up tooltip
      const tooltip = select(tooltipRef.current)
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("border-radius", "4px")
        .style("padding", "10px")
        .style("box-shadow", "0 0 10px rgba(0,0,0,0.1)")
        .style("pointer-events", "none")
        .style("z-index", "1000");
      
      // Process sankey layout
      let processedData;
      let comparisonProcessedData;
      const displayWidth = showComparison ? width * 0.48 : width;
      
      // Set up the sankey generator
      const sankeyGenerator = sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[1, 1], [displayWidth - 1, height - 20]])
        .nodeAlign(getAlignmentMethod(alignmentType));
      
      // Process main data
      try {
        processedData = sankeyGenerator(data);
      } catch (error) {
        console.error("Error generating Sankey diagram:", error);
        mainGroup.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .attr("fill", "#666")
          .text("Erro ao gerar o diagrama. Verifique o formato dos dados.");
        return;
      }
      
      // Process comparison data if needed
      if (showComparison && comparisonData) {
        try {
          const comparisonSankeyGenerator = sankey()
            .nodeWidth(15)
            .nodePadding(10)
            .extent([[width * 0.52, 1], [width - 1, height - 20]])
            .nodeAlign(getAlignmentMethod(alignmentType));
            
          comparisonProcessedData = comparisonSankeyGenerator(comparisonData);
        } catch (error) {
          console.error("Error generating comparison Sankey diagram:", error);
        }
      }
      
      // Color scale for nodes
      const colorScale = scaleOrdinal(schemeCategory10);
      
      // Function to render a single Sankey diagram
      const renderSankey = (sankeyData, xOffset = 0, isComparison = false) => {
        const group = mainGroup.append("g")
          .attr("transform", isComparison ? `translate(${xOffset}, 0)` : "");
        
        // Add title
        if (isComparison) {
          group.append("text")
            .attr("x", displayWidth + 10)
            .attr("y", 15)
            .attr("fill", "#333")
            .attr("font-weight", "bold")
            .text("Comparação");
        } else if (showComparison) {
          group.append("text")
            .attr("x", 10)
            .attr("y", 15)
            .attr("fill", "#333")
            .attr("font-weight", "bold")
            .text("Principal");
        }
        
        // Create links
        group.append("g")
          .attr("fill", "none")
          .selectAll("path")
          .data(sankeyData.links)
          .enter()
          .append("path")
          .attr("d", sankeyLinkHorizontal())
          .attr("stroke", (d) => {
            // Use source node's color for link
            return colorScale(d.source.name.replace(/ .*/, ""));
          })
          .attr("stroke-width", (d) => Math.max(1, d.width))
          .attr("stroke-opacity", 0.5)
          .attr("class", "link")
          .on("mouseover", function(event, d) {
            select(this).attr("stroke-opacity", 0.8);
            
            // Get source and target node names
            const sourceName = d.source.name;
            const targetName = d.target.name;
            
            // Determine what the flow represents and format accordingly
            let flowValue = "";
            if (d.timeValue !== undefined) {
              flowValue = `Tempo: ${formatTime(d.timeValue)}`;
            } else if (d.dataValue !== undefined) {
              flowValue = `Dados: ${formatMemory(d.dataValue)}`;
            } else if (d.value !== undefined) {
              // Default value - determine unit based on context
              if (sourceName.includes("Carregamento") || targetName.includes("Carregamento")) {
                flowValue = `Dados: ${formatMemory(d.value)}`;
              } else {
                flowValue = `Tempo: ${formatTime(d.value)}`;
              }
            }
            
            tooltip
              .html(`
                <div style="font-weight: bold;">${sourceName} → ${targetName}</div>
                <div>${flowValue}</div>
                ${d.details ? `<div>${d.details}</div>` : ''}
              `)
              .style("visibility", "visible")
              .style("top", (event.pageY - 10) + "px")
              .style("left", (event.pageX + 10) + "px");
          })
          .on("mouseout", function() {
            select(this).attr("stroke-opacity", 0.5);
            tooltip.style("visibility", "hidden");
          });
        
        // Create nodes
        const nodeGroup = group.append("g");
        
        const node = nodeGroup
          .selectAll(".node")
          .data(sankeyData.nodes)
          .enter()
          .append("g")
          .attr("class", "node")
          .attr("transform", (d) => `translate(${d.x0},${d.y0})`);
        
        // Add node rectangles
        node.append("rect")
          .attr("height", (d) => d.y1 - d.y0)
          .attr("width", sankeyGenerator.nodeWidth())
          .attr("fill", (d) => colorScale(d.name.replace(/ .*/, "")))
          .attr("stroke", (d) => colorScale(d.name.replace(/ .*/, "")))
          .attr("stroke-width", 1)
          .on("mouseover", function(event, d) {
            // Count incoming and outgoing links
            const incoming = sankeyData.links.filter(link => link.target === d);
            const outgoing = sankeyData.links.filter(link => link.source === d);
            
            // Format node details for tooltip
            let incomingDetails = '';
            if (incoming.length) {
              incomingDetails = '<div style="margin-top: 5px;"><b>Entrada:</b></div>' +
                incoming.map(link => {
                  const value = link.timeValue ? formatTime(link.timeValue) : 
                               link.dataValue ? formatMemory(link.dataValue) :
                               formatNumber(link.value);
                  return `<div style="margin-left: 10px;">De ${link.source.name}: ${value}</div>`;
                }).join('');
            }
            
            let outgoingDetails = '';
            if (outgoing.length) {
              outgoingDetails = '<div style="margin-top: 5px;"><b>Saída:</b></div>' +
                outgoing.map(link => {
                  const value = link.timeValue ? formatTime(link.timeValue) : 
                               link.dataValue ? formatMemory(link.dataValue) :
                               formatNumber(link.value);
                  return `<div style="margin-left: 10px;">Para ${link.target.name}: ${value}</div>`;
                }).join('');
            }
            
            // Add special context info based on node type
            let contextInfo = '';
            if (d.name.includes("Quantização")) {
              contextInfo = `<div style="margin-top: 5px; color: #666;">
                A quantização afeta tanto a VRAM necessária quanto a qualidade dos resultados.
                </div>`;
            } else if (d.name.includes("Carregamento do Modelo")) {
              contextInfo = `<div style="margin-top: 5px; color: #666;">
                Esta etapa consome a maior parte da VRAM necessária.
                </div>`;
            }
            
            tooltip
              .html(`
                <div style="font-weight: bold;">${d.name}</div>
                <div>Valor: ${d.value ? formatNumber(d.value) : "N/A"}</div>
                ${d.details ? `<div>${d.details}</div>` : ''}
                ${incomingDetails}
                ${outgoingDetails}
                ${contextInfo}
              `)
              .style("visibility", "visible")
              .style("top", (event.pageY - 10) + "px")
              .style("left", (event.pageX + 10) + "px");
          })
          .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
          });
        
        // Add node labels
        node.append("text")
          .attr("x", (d) => (d.x0 < width / 2) ? sankeyGenerator.nodeWidth() + 6 : -6)
          .attr("y", (d) => (d.y1 - d.y0) / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", (d) => (d.x0 < width / 2) ? "start" : "end")
          .text((d) => d.name)
          .attr("font-size", "10px")
          .attr("fill", "#333");
      };
      
      // Render the main diagram
      renderSankey(processedData);
      
      // Render comparison diagram if needed
      if (showComparison && comparisonProcessedData) {
        renderSankey(comparisonProcessedData, width * 0.52, true);
        
        // Add a divider line
        mainGroup.append("line")
          .attr("x1", width * 0.5)
          .attr("y1", 0)
          .attr("x2", width * 0.5)
          .attr("y2", height)
          .attr("stroke", "#ddd")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5");
      }
      
      // Mouse leave handler for the entire chart
      svg.on("mouseleave", () => {
        tooltip.style("visibility", "hidden");
      });
      
    } catch (err) {
      console.error('Error rendering Sankey diagram:', err);
      setError(`Failed to render diagram: ${err.message}`);
    }
  }, [data, width, height, alignmentType, showComparison, comparisonData, transform]);

  // Register with chart initializer if available
  useEffect(() => {
    if (window.chartInitializer && data) {
      window.chartInitializer.register('sankeyDiagram', 
        (container) => {
          // This is just a registration, actual rendering happens in the useEffect above
          return true;
        }, 
        { 
          containerId: 'sankey-diagram-container',
          data: data,
          type: 'sankey'
        }
      );
    }
  }, [data]);

  // Toggle comparison view
  const handleComparisonToggle = () => {
    if (!showComparison && !comparisonData && onComparisonRequest) {
      onComparisonRequest();
    }
    setShowComparison(!showComparison);
  };
  
  // Zoom controls
  const handleZoomIn = () => {
    setTransform(prev => ({
      ...prev,
      k: prev.k * 1.2
    }));
  };
  
  const handleZoomOut = () => {
    setTransform(prev => ({
      ...prev,
      k: Math.max(0.1, prev.k / 1.2)
    }));
  };
  
  const handleReset = () => {
    setTransform({ k: 1, x: 0, y: 0 });
  };
  
  // Pan functionality
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  
  const handleMouseDown = (e) => {
    if (e.button === 0) { // left click
      setIsPanning(true);
      setStartPan({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - startPan.x;
      const dy = e.clientY - startPan.y;
      setStartPan({ x: e.clientX, y: e.clientY });
      setTransform(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      }));
    }
  };
  
  const handleMouseUp = () => {
    setIsPanning(false);
  };
  
  const handleMouseLeave = () => {
    setIsPanning(false);
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2">
          Fluxo de Processamento Computacional
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={handleZoomIn} 
            variant="outlined" 
            size="small"
            title="Aumentar Zoom"
          >
            <ZoomInIcon fontSize="small" />
          </Button>
          <Button 
            onClick={handleZoomOut} 
            variant="outlined" 
            size="small"
            title="Diminuir Zoom"
          >
            <ZoomOutIcon fontSize="small" />
          </Button>
          <Button 
            onClick={handleReset} 
            variant="outlined" 
            size="small"
            title="Restaurar Visualização"
          >
            <RestoreIcon fontSize="small" />
          </Button>
          <Button
            onClick={handleComparisonToggle}
            variant={showComparison ? "contained" : "outlined"}
            size="small"
            color={showComparison ? "primary" : "inherit"}
            title={showComparison ? "Ocultar Comparação" : "Mostrar Comparação"}
            disabled={!comparisonData && !onComparisonRequest}
          >
            <CompareArrowsIcon fontSize="small" />
            {showComparison ? " Ocultar" : " Comparar"}
          </Button>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="alignment-label">Alinhamento</InputLabel>
            <Select
              labelId="alignment-label"
              value={alignmentType}
              label="Alinhamento"
              onChange={(e) => setAlignmentType(e.target.value)}
            >
              <MenuItem value="justify">Justificado</MenuItem>
              <MenuItem value="left">Esquerda</MenuItem>
              <MenuItem value="right">Direita</MenuItem>
              <MenuItem value="center">Centro</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Box id="sankey-diagram-container" ref={wrapperRef} sx={{ 
        flexGrow: 1, 
        position: 'relative',
        overflow: 'hidden',
        cursor: isPanning ? 'grabbing' : 'grab'
      }}>
        {error ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: 2,
            color: 'error.main'
          }}>
            <WarningIcon color="error" fontSize="large" />
            <Typography color="error">{error}</Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => window.location.reload()}
              size="small"
            >
              Tentar Novamente
            </Button>
          </Box>
        ) : !data ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: 2
          }}>
            <InfoIcon color="info" fontSize="large" />
            <Typography>Sem dados de fluxo disponíveis</Typography>
          </Box>
        ) : (
          <>
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            ></svg>
            <div ref={tooltipRef} style={{ position: 'absolute', visibility: 'hidden' }}></div>
          </>
        )}
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Dica: Use o mouse para navegar pelo diagrama (arrastar para mover, botões para zoom).
          Passe o cursor sobre nós e conexões para ver detalhes.
        </Typography>
      </Box>
    </Paper>
  );
};

export default SankeyDiagram;
