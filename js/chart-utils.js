/**
 * Utilitários para criação segura de gráficos com Chart.js e outras bibliotecas
 */
const ChartUtils = {
  /**
   * Lista de gráficos instanciados
   */
  instances: {},

  /**
   * Verifica se Chart.js está disponível e carrega se necessário
   * @return Promessa que resolve quando Chart.js estiver disponível
   */
  ensureChartJsLoaded: function() {
    return new Promise((resolve, reject) => {
      if (window.Chart) {
        resolve(window.Chart);
        return;
      }
      
      DOMUtils.log.info('Carregando Chart.js dinamicamente');
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {
        DOMUtils.log.success('Chart.js carregado com sucesso');
        resolve(window.Chart);
      };
      script.onerror = () => {
        const error = 'Falha ao carregar Chart.js';
        DOMUtils.log.error(error);
        reject(new Error(error));
      };
      
      document.head.appendChild(script);
    });
  },

  /**
   * Prepare a chart container with fallback mechanism
   * @param containerId - The ID of the container (with or without #)
   * @param [options={}] - Additional options
   * @param [options.parent] - Selector for the parent element.
   * @param [options.width] - Container width.
   * @param [options.height] - Container height.
   * @param [options.placeholder] - Placeholder text.
   * @returns Object with container, canvas, and context
   */
  prepareChartContainer: function(containerId, options = {}) {
    const id = containerId.startsWith('#') ? containerId : `#${containerId}`;
    
    const validParents = ['main', '.content', '.container', '.chart-container', 'body', 'html'];
    let parentSelector = options.parent || validParents[0];
    
    const container = DOMUtils.getOrCreateContainer(id, parentSelector);
    
    if (options.width) {
      container.style.width = typeof options.width === 'number' ? `${options.width}px` : options.width;
    } else if (!container.style.width) {
      container.style.width = '100%';
    }
    
    if (options.height) {
      container.style.height = typeof options.height === 'number' ? `${options.height}px` : options.height;
    } else if (!container.style.height) {
      container.style.height = '300px';
    }
    
    const oldMessages = container.querySelectorAll('.chart-fallback, .chart-error');
    oldMessages.forEach(node => node.remove());
    
    const placeholderText = options.placeholder || 'Visualização gráfica de dados. Ative JavaScript para ver.';
    
    const fallbackText = document.createElement('p');
    fallbackText.className = 'chart-fallback';
    fallbackText.textContent = placeholderText;
    container.appendChild(fallbackText);
    
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    if (typeof window.initializeDesignSystem === 'function') {
      console.info('ℹ️ Reinicializando Design System GOV.BR após criar canvas');
      window.initializeDesignSystem();
    }
    
    let context = null;
    try {
      context = canvas.getContext('2d');
    } catch (e) {
      console.error('❌ Erro ao obter contexto 2d para o canvas:', e);
      const errorMsg = document.createElement('div');
      errorMsg.className = 'chart-error';
      errorMsg.textContent = 'Não foi possível criar o gráfico. Seu navegador pode não suportar canvas.';
      container.appendChild(errorMsg);
    }
    
    return { container, canvas, context };
  },

  /**
   * Cria um gráfico Chart.js de forma segura
   * @param type - The type of chart (e.g., 'bar', 'line')
   * @param containerId - The container ID
   * @param data - The chart data
   * @param options - Chart.js options
   * @param containerOptions - Container options (passed to prepareChartContainer)
   * @returns - The created chart instance or null
   */
  createChart: async function(type, containerId, data, options = {}, containerOptions = {}) {
    // Garante que Chart.js foi carregado
    try {
      await this.ensureChartJsLoaded();
    } catch (e) {
      console.error('❌ Falha ao carregar Chart.js:', e);
      return null;
    }
    
    const { container, canvas, context } = this.prepareChartContainer(containerId, containerOptions);
    
    if (!context) {
      return null;
    }
    
    let chart = null;
    try {
      chart = new Chart(context, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...options
        }
      });
      
      console.info(`✅ Gráfico ${type} criado em ${containerId}`);
    } catch (e) {
      console.error(`❌ Erro ao criar gráfico ${type}:`, e);
      const errorMsg = document.createElement('div');
      errorMsg.className = 'chart-error';
      errorMsg.textContent = `Erro ao criar o gráfico: ${e.message}`;
      container.appendChild(errorMsg);
    }
    
    return chart;
  },

  /**
   * Cores para gráficos com tema consistente
   */
  colors: {
    primary: '#1351B4',
    secondary: '#2670E8',
    tertiary: '#3F9BF7',
    success: '#168821',
    warning: '#FFCD07',
    danger: '#E52207',
    info: '#00B8D4',
    light: '#E5E5E5',
    dark: '#333333',
    expertise: ['#1351B4', '#2670E8', '#3F9BF7'],
    resources: ['#1351B4', '#168821', '#FFCD07'],
    gradient: [
      '#1351B4', '#1F5FC2', '#2A6ED1', '#357DDF', '#408DEE',
      '#4C9CFD', '#57ACFF', '#63BCFF', '#6ECBFF', '#7ADBFF'
    ]
  },

  /**
   * Configuração de layout padrão para gráficos (e.g., Plotly)
   */
  defaultLayout: {
    font: {
      family: 'Rawline, sans-serif',
      size: 12
    },
    margin: {
      l: 50,
      r: 20,
      t: 30,
      b: 50
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    colorway: ['#1351B4', '#2670E8', '#3F9BF7', '#168821', '#FFCD07', '#E52207'],
    hovermode: 'closest'
  },

  /**
   * Configuração para legendas padrão (e.g., Plotly)
   */
  defaultLegend: {
    orientation: 'h',
    y: -0.2,
    x: 0.5,
    xanchor: 'center'
  },

  /**
   * Configuração de interatividade padrão (e.g., Plotly)
   */
  defaultConfig: Object.freeze({
    responsive: true,
    displayModeBar: false
  }),

  /**
   * Default Plotly light theme layout settings
   */
  plotlyLightTheme: {
    paper_bgcolor: 'var(--chart-bg-color, #ffffff)', // Use CSS var with fallback
    plot_bgcolor: 'var(--chart-bg-color, #ffffff)',
    font: {
      color: 'var(--chart-text-color, #333333)'
    },
    title: {
      font: {
        color: 'var(--chart-text-color, #333333)'
      }
    },
    xaxis: {
      gridcolor: 'var(--chart-grid-color, #e0e0e0)',
      linecolor: 'var(--chart-axis-color, #666666)',
      zerolinecolor: 'var(--chart-grid-color, #e0e0e0)',
      tickfont: {
        color: 'var(--chart-text-color, #333333)'
      },
      titlefont: {
        color: 'var(--chart-text-color, #333333)'
      }
    },
    yaxis: {
      gridcolor: 'var(--chart-grid-color, #e0e0e0)',
      linecolor: 'var(--chart-axis-color, #666666)',
      zerolinecolor: 'var(--chart-grid-color, #e0e0e0)',
      tickfont: {
        color: 'var(--chart-text-color, #333333)'
      },
      titlefont: {
        color: 'var(--chart-text-color, #333333)'
      }
    },
    legend: {
      bgcolor: 'rgba(255,255,255,0.5)',
      bordercolor: 'var(--chart-grid-color, #e0e0e0)',
      font: {
        color: 'var(--chart-text-color, #333333)'
      }
    }
  },

  /**
   * Apply consistent theme/styling to a chart layout (Plotly) or defaults (Chart.js)
   * @param {object} layoutOrOptions - Plotly layout object or Chart.js options
   * @param {string} library - 'plotly' or 'chartjs' (defaults to 'plotly')
   * @returns {object} - Themed layout or options object
   */
  applyTheme: function(layoutOrOptions = {}, library = 'plotly') {
    if (library === 'chartjs') {
      // Apply theme to Chart.js defaults if Chart is available
      if (typeof window.Chart !== 'undefined' && window.Chart.defaults) {
        window.Chart.defaults.font.family = 'var(--chart-font-family, Arial, sans-serif)';
        window.Chart.defaults.color = 'var(--chart-text-color, #333333)';
        window.Chart.defaults.borderColor = 'var(--chart-grid-color, #e0e0e0)';
        
        // Specific scale styling
        if (window.Chart.defaults.scale) {
          window.Chart.defaults.scale.grid.color = 'var(--chart-grid-color, #e0e0e0)';
          window.Chart.defaults.scale.ticks.color = 'var(--chart-text-color, #333333)';
        }
        if (window.Chart.defaults.plugins && window.Chart.defaults.plugins.title) {
          window.Chart.defaults.plugins.title.color = 'var(--chart-text-color, #333333)';
        }
        if (window.Chart.defaults.plugins && window.Chart.defaults.plugins.legend) {
          window.Chart.defaults.plugins.legend.labels.color = 'var(--chart-text-color, #333333)';
        }
      } else {
        // console.warn('ChartUtils.applyTheme: Chart.js object not found. Cannot apply theme.');
      }
      // Return Chart.js options potentially merged with defaults elsewhere
      return layoutOrOptions; 
    }

    // Plotly theme application (existing logic)
    const themeLayout = {
      margin: { l: 50, r: 20, t: 40, b: 50 },
      paper_bgcolor: 'var(--chart-bg-color, #ffffff)', // Use CSS var with fallback
      plot_bgcolor: 'var(--chart-bg-color, #ffffff)',
      font: {
        color: 'var(--chart-text-color, #333333)'
      },
      title: {
        font: {
          color: 'var(--chart-text-color, #333333)'
        }
      },
      xaxis: {
        gridcolor: 'var(--chart-grid-color, #e0e0e0)',
        linecolor: 'var(--chart-axis-color, #666666)',
        zerolinecolor: 'var(--chart-grid-color, #e0e0e0)',
        tickfont: {
          color: 'var(--chart-text-color, #333333)'
        },
        titlefont: {
          color: 'var(--chart-text-color, #333333)'
        }
      },
      yaxis: {
        gridcolor: 'var(--chart-grid-color, #e0e0e0)',
        linecolor: 'var(--chart-axis-color, #666666)',
        zerolinecolor: 'var(--chart-grid-color, #e0e0e0)',
        tickfont: {
          color: 'var(--chart-text-color, #333333)'
        },
        titlefont: {
          color: 'var(--chart-text-color, #333333)'
        }
      },
      legend: {
        bgcolor: 'rgba(255, 255, 255, 0.5)',
        bordercolor: 'var(--chart-grid-color, #e0e0e0)',
        font: {
          color: 'var(--chart-text-color, #333333)'
        }
      }
      // Add more theme elements as needed
    };
    
    // Deep merge layout options
    return { ...themeLayout, ...layoutOrOptions };
  },

  /**
   * Safely initializes a chart using a provided initialization function.
   * Ensures Chart.js is loaded and the target element exists.
   * @param {string} elementId - The ID of the canvas element.
   * @param {function} initFunction - The function to call to initialize the chart (e.g., initBarChart).
   * @param {object} data - The data for the chart.
   * @param {object} [options={}] - Options for the chart initialization function.
   * @returns {Promise<Chart|null>} A promise that resolves with the chart instance or null on failure.
   */
  safeInitChart: async function(elementId, initFunction, data, options = {}) {
    try {
      await this.ensureChartJsLoaded();
    } catch (e) {
      console.error(`❌ Chart.js failed to load for chart #${elementId}:`, e);
      return Promise.reject(e);
    }

    const element = document.getElementById(elementId);

    if (!element) {
      const error = new Error(`Chart canvas element not found: #${elementId}`);
      console.error(error.message);
      return Promise.reject(error);
    }

    if (!(element instanceof HTMLCanvasElement)) {
      const error = new Error(`Element #${elementId} is not a canvas element.`);
      console.error(error.message);
      return Promise.reject(error);
    }

    try {
      this.clearExistingChart(elementId);

      const chart = initFunction.call(this, element, data, options);
      this.instances[elementId] = chart;
      console.info(`✅ Chart initialized successfully on #${elementId}`);
      return Promise.resolve(chart);
    } catch (error) {
      console.error(`❌ Error initializing chart on #${elementId}:`, error);
      const container = element.parentElement;
      if (container) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'chart-error';
        errorMsg.textContent = `Erro ao renderizar gráfico: ${error.message}`;
        if (!container.querySelector('.chart-error')) {
          container.appendChild(errorMsg);
        }
      }
      return Promise.reject(error);
    }
  },

  /**
   * Clears any existing Chart.js chart from a canvas element
   * @param elementId - ID of the canvas element
   */
  clearExistingChart: function(elementId) {
    if (this.instances[elementId]) {
      try {
        this.instances[elementId].destroy();
        console.info(`🧹 Destroyed previous chart instance for #${elementId} (internal)`);
        delete this.instances[elementId];
      } catch (e) {
        console.warn(`⚠️ Could not destroy internal chart instance for #${elementId}:`, e);
      }
    }
    if (typeof Chart !== 'undefined' && Chart.getChart) {
      const chartInstance = Chart.getChart(elementId);
      if (chartInstance) {
        try {
          chartInstance.destroy();
          console.info(`🧹 Destroyed previous chart instance for #${elementId} (global)`);
        } catch (e) {
          console.warn(`⚠️ Could not destroy global chart instance for #${elementId}:`, e);
        }
      }
    }
  },

  /**
   * Initializes a histogram chart (using Chart.js bar type)
   * @param element - Canvas element
   * @param data - Chart data (Chart.js format)
   * @param options - Chart.js options
   * @returns - The chart instance
   */
  initHistogramChart: function(element, data, options = {}) {
    const ctx = element.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Distribuição de Carga'
        },
        legend: {
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Valor'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Frequência'
          }
        }
      }
    };

    const mergedOptions = { ...defaultOptions, ...options };

    return new Chart(ctx, {
      type: 'bar',
      data: data,
      options: mergedOptions
    });
  },

  /**
   * Initializes a bar chart using Chart.js
   * @param element - Canvas element
   * @param data - Chart data (Chart.js format)
   * @param options - Chart.js options
   * @returns - The chart instance
   */
  initBarChart: function(element, data, options = {}) {
    const ctx = element.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Comparação CL-CompL'
        },
        legend: {
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Categoria'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Valor'
          }
        }
      }
    };

    const mergedOptions = { ...defaultOptions, ...options };

    return new Chart(ctx, {
      type: 'bar',
      data: data,
      options: mergedOptions
    });
  }
};

// Export the consolidated object globally
window.ChartUtils = ChartUtils;
window.chartUtils = ChartUtils; // Alias for compatibility
