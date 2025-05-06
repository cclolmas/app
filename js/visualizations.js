/**
 * Funções de visualização para os diferentes gráficos
 */

const visualizations = {
  /**
   * Gráfico de radar para dimensões da carga cognitiva
   */
  renderRadarCL: function(elementId, data = mockData.radarCL) {
    const trace = {
      type: 'scatterpolar',
      r: data.values,
      theta: data.dimensions,
      fill: 'toself',
      fillcolor: 'rgba(19, 81, 180, 0.2)',
      line: {
        color: chartUtils.colors.primary,
        width: 2
      }
    };
    
    const layout = chartUtils.applyTheme({
      polar: {
        radialaxis: {
          visible: true,
          range: [0, 1]
        }
      },
      showlegend: false,
      hoverlabel: {
        bgcolor: "white",
        bordercolor: "black",
        font: {
          color: "black",
          size: 12
        }
      }
    });
    
    Plotly.newPlot(elementId, [trace], layout, chartUtils.defaultConfig);
  },

  /**
   * Histograma de Sobrecarga Cognitiva vs Expertise
   */
  renderHistogramOverload: function(elementId, data) {
    // Default data structure if data is undefined or incomplete
    const defaultData = {
      labels: ['Novato', 'Intermediário', 'Avançado'],
      values: [
        [0.1, 0.2, 0.3, 0.4, 0.5],
        [0.2, 0.3, 0.4, 0.5, 0.6],
        [0.4, 0.5, 0.6, 0.7, 0.8]
      ]
    };
    
    // Use provided data or fallback to default or mockData if available
    const safeData = data || (typeof mockData !== 'undefined' && mockData.histogramOverload) || defaultData;
    
    // Ensure labels and values exist
    const labels = safeData.labels || defaultData.labels;
    const values = safeData.values || defaultData.values;
    
    const traces = labels.map((label, index) => ({
      x: values[index] || [],
      type: 'histogram',
      name: label,
      opacity: 0.75,
      marker: { 
        color: chartUtils.colors && chartUtils.colors.expertise ? 
          chartUtils.colors.expertise[index] : 
          ['#ff7f0e', '#1f77b4', '#2ca02c'][index % 3] 
      }
    }));
    
    const layout = chartUtils.applyTheme({
      barmode: 'overlay',
      xaxis: { 
        title: 'Nível de Sobrecarga Cognitiva'
      },
      yaxis: { 
        title: 'Frequência' 
      },
      legend: {
        x: 0.7,
        y: 1
      }
    });
    
    Plotly.newPlot(elementId, traces, layout, chartUtils.defaultConfig);
  },

  /**
   * Gráfico de barras para uso de recursos vs tarefa
   */
  renderBarResources: function(elementId, data = mockData.barResources) {
    const traces = [
      {
        x: data.tasks,
        y: data.gpu, // Changed from data.cpu
        name: 'GPU', // Changed from 'CPU'
        type: 'bar',
        marker: { color: chartUtils.colors.resources[0] } // Keep color or adjust if needed
      },
      {
        x: data.tasks,
        y: data.vram, // Changed from data.memory
        name: 'VRAM', // Changed from 'Memória'
        type: 'bar',
        marker: { color: chartUtils.colors.resources[2] } // Changed color index
      },
      {
        x: data.tasks,
        y: data.ram, // Changed from data.gpu
        name: 'RAM', // Changed from 'GPU'
        type: 'bar',
        marker: { color: chartUtils.colors.resources[1] } // Changed color index
      }
    ];
    
    const layout = chartUtils.applyTheme({
      barmode: 'group',
      xaxis: {
        title: 'Tarefa'
      },
      yaxis: {
        title: 'Uso (%)',
        range: [0, 100]
      },
      legend: chartUtils.defaultLegend,
      hoverlabel: {
        bgcolor: "white",
        bordercolor: "black",
        font: {
          color: "black",
          size: 12
        }
      }
    });
    
    Plotly.newPlot(elementId, traces, layout, chartUtils.defaultConfig);
  },

  /**
   * Diagrama Sankey para fluxo de recursos
   */
  renderSankeyFlow: function(elementId, data = mockData.sankeyFlow) {
    const trace = {
      type: "sankey",
      orientation: "h",
      node: {
        pad: 15,
        thickness: 20,
        line: {
          color: "black",
          width: 0.5
        },
        label: data.nodes.map(d => d.name),
        color: data.nodes.map((_, i) => {
          const colorIndex = i % chartUtils.colors.gradient.length;
          return chartUtils.colors.gradient[colorIndex];
        })
      },
      link: {
        source: data.links.map(d => d.source),
        target: data.links.map(d => d.target),
        value: data.links.map(d => d.value)
      }
    };
    
    const layout = chartUtils.applyTheme({
      font: {
        size: 10
      },
      hoverlabel: {
        bgcolor: "white",
        bordercolor: "black",
        font: {
          color: "black",
          size: 12
        }
      }
    });
    
    Plotly.newPlot(elementId, [trace], layout, chartUtils.defaultConfig);
  },

  /**
   * Gráfico de violino para CL vs CompL por expertise
   */
  renderViolinCLCompL: function(elementId, data = mockData.violinCLCompL) {
    const traces = [];
    
    // Para cada nível de expertise, criar um par de violinos (CL e CompL)
    for (let i = 0; i < data.expertise.length; i++) {
      // Violino para CL
      traces.push({
        type: 'violin',
        x: Array(data.cl[i].length).fill(`${data.expertise[i]} - CL`),
        y: data.cl[i],
        name: `CL (${data.expertise[i]})`,
        box: {
          visible: true
        },
        line: {
          color: chartUtils.colors.primary
        },
        meanline: {
          visible: true
        }
      });
      
      // Violino para CompL
      traces.push({
        type: 'violin',
        x: Array(data.compl[i].length).fill(`${data.expertise[i]} - CompL`),
        y: data.compl[i],
        name: `CompL (${data.expertise[i]})`,
        box: {
          visible: true
        },
        line: {
          color: chartUtils.colors.tertiary
        },
        meanline: {
          visible: true
        }
      });
    }
    
    const layout = chartUtils.applyTheme({
      showlegend: false,
      yaxis: {
        title: 'Valor Normalizado',
        range: [0, 1]
      },
      hoverlabel: {
        bgcolor: "white",
        bordercolor: "black",
        font: {
          color: "black",
          size: 12
        }
      }
    });
    
    Plotly.newPlot(elementId, traces, layout, chartUtils.defaultConfig);
  },

  /**
   * Gráfico de densidade KDE para CL-CompL
   */
  renderKDECLCompL: function(elementId, data = mockData.kdeCLCompL) {
    // Criar contorno de densidade
    const trace = {
      type: 'histogram2dcontour',
      x: data.cl,
      y: data.compl,
      colorscale: 'Blues',
      reversescale: false,
      showscale: true,
      contours: {
        coloring: 'heatmap',
        showlabels: true
      },
      colorbar: {
        title: 'Densidade',
        titleside: 'right'
      }
    };
    
    // Adicionar pontos de dispersão
    const scatter = {
      type: 'scatter',
      mode: 'markers',
      x: data.cl,
      y: data.compl,
      marker: {
        color: 'rgba(19, 81, 180, 0.3)',
        size: 4
      },
      showlegend: false
    };
    
    const layout = chartUtils.applyTheme({
      xaxis: {
        title: 'Carga Cognitiva (CL)',
        range: [0, 1]
      },
      yaxis: {
        title: 'Carga Computacional (CompL)',
        range: [0, 1]
      },
      hoverlabel: {
        bgcolor: "white",
        bordercolor: "black",
        font: {
          color: "black",
          size: 12
        }
      }
    });
    
    Plotly.newPlot(elementId, [trace, scatter], layout, chartUtils.defaultConfig);
  },

  /**
   * Scatter plot para precisão vs CompL
   */
  renderScatterPrecisionCompL: function(elementId, data = mockData.scatterPrecisionCompL) {
    const trace = {
      type: 'scatter',
      mode: 'markers',
      x: data.x,
      y: data.y,
      marker: {
        size: data.size,
        color: data.x.map(val => val * 100),
        colorscale: 'Viridis',
        colorbar: {
          title: 'CompL (%)'
        },
        line: {
          color: 'white',
          width: 1
        }
      }
    };
    
    const layout = chartUtils.applyTheme({
      xaxis: {
        title: 'Carga Computacional (CompL)',
        range: [0, 1]
      },
      yaxis: {
        title: 'Precisão do Modelo',
        range: [0, 1]
      },
      showlegend: false,
      hoverlabel: {
        bgcolor: "white",
        bordercolor: "black",
        font: {
          color: "black",
          size: 12
        }
      }
    });
    
    Plotly.newPlot(elementId, [trace], layout, chartUtils.defaultConfig);
  }
};
