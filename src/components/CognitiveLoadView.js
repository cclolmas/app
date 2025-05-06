import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend,
         BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import './CognitiveLoadView.css'; // Import CSS for styling

// Placeholder data - replace with actual data fetching and processing
const radarChartData = [
  { subject: 'Complexidade', student: 7, average: 6 },
  { subject: 'Esforço Mental', student: 8, average: 5 },
  { subject: 'Frustração', student: 6, average: 7 },
  { subject: 'Desempenho', student: 7, average: 6 },
  { subject: 'Demanda Temporal', student: 5, average: 4 },
];

// Placeholder data for histogram
const histogramData = [
  { level: 'Muito Baixa', novice: 5, intermediate: 10, expert: 15 },
  { level: 'Baixa', novice: 10, intermediate: 15, expert: 25 },
  { level: 'Média', novice: 20, intermediate: 25, expert: 20 },
  { level: 'Alta', novice: 25, intermediate: 20, expert: 10 },
  { level: 'Muito Alta', novice: 15, intermediate: 5, expert: 5 },
];

// Debugging function to log object structures
const debugData = (label, data) => {
  console.log(`DEBUG [${label}]:`, data);
  
  // Check for empty objects or arrays
  if (Array.isArray(data) && data.length === 0) {
    console.warn(`DEBUG [${label}]: Array is empty`);
  } else if (typeof data === 'object' && data !== null && Object.keys(data).length === 0) {
    console.warn(`DEBUG [${label}]: Object is empty`);
  }
  
  return data;
};

function CognitiveLoadView() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chartContainersCreated = useRef(false);
  const [chartContainerDimensions, setChartContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [chartInitStatus, setChartInitStatus] = useState({
    chartjsLoaded: false,
    containersReady: false,
    dataReady: false,
    chartsInitialized: false
  });

  // Reference for container DOM elements
  const chartGridRef = useRef(null);
  const chartRefs = {
    'graph-radar-cl': useRef(null),
    'graph-histogram-cl': useRef(null),
    'graph-bars-compl': useRef(null)
  };

  // Simulate data loading
  useEffect(() => {
    console.log('CognitiveLoadView component mounted');
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Data loading complete');
      setIsLoading(false);
      
      // Debug data
      debugData('radarChartData', radarChartData);
      debugData('histogramData', histogramData);
      
      // Uncomment to test error state
      // setError("Erro ao carregar dados de carga cognitiva");
    }, 1000);
    
    // Clean up 
    return () => {
      console.log('CognitiveLoadView component unmounting');
    };
  }, []);

  // Monitor and log container dimensions
  useEffect(() => {
    console.log('Container monitoring effect triggered', { isLoading, error });
    
    if (!isLoading && !error) {
      console.log('Setting up ResizeObserver for chart containers');
      
      const observer = new ResizeObserver(entries => {
        console.log(`ResizeObserver triggered: ${entries.length} entries`);
        
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          console.log(`Container ${entry.target.id} dimensions: ${width}x${height}`);
          
          if (width === 0 || height === 0) {
            console.warn(`Container ${entry.target.id} has zero dimension! This will prevent charts from rendering.`);
          }

          // Update state with dimensions of first chart container to help debugging
          if (entry.target.id === 'graph-radar-cl') {
            setChartContainerDimensions({ width, height });
          }
        }
      });

      // Log container refs before observing
      Object.entries(chartRefs).forEach(([id, ref]) => {
        console.log(`Chart container ref [${id}]:`, ref.current);
      });

      // Observe each chart container
      Object.values(chartRefs).forEach(ref => {
        if (ref.current) {
          console.log('Observing container:', ref.current.id);
          observer.observe(ref.current);
        } else {
          console.warn('Container ref is null, cannot observe');
        }
      });

      return () => {
        console.log('Disconnecting ResizeObserver');
        observer.disconnect();
      };
    }
  }, [isLoading, error]);

  // Create chart containers and initialize them after component mounts
  useEffect(() => {
    if (!isLoading && !error && !chartContainersCreated.current) {
      console.log('Chart initialization effect triggered');
      chartContainersCreated.current = true;
      
      console.log("Setting up chart containers and initializing Chart.js");
      
      // Ensure container elements exist in the DOM first
      const ensureChartContainers = () => {
        let containersCreated = false;
        
        Object.entries(chartRefs).forEach(([id, ref]) => {
          if (!ref.current) {
            console.warn(`Container ref for [${id}] is null. Creating fallback container.`);
            // If container doesn't exist, create it
            const containerElement = document.getElementById(id);
            if (!containerElement) {
              console.log(`Creating fallback DOM element for #${id}`);
              const newContainer = document.createElement('div');
              newContainer.id = id;
              newContainer.className = 'chart-container';
              newContainer.style.position = 'relative';
              newContainer.style.height = '400px';
              newContainer.style.minHeight = '300px';
              
              // Add title to the container
              const title = document.createElement('h3');
              title.textContent = id === 'graph-radar-cl' 
                ? 'Perfil de Carga Cognitiva (Radar)' 
                : id === 'graph-histogram-cl'
                ? 'Distribuição da Carga Cognitiva (Histograma)'
                : 'Carga Computacional por Modelo';
              newContainer.appendChild(title);
              
              // Find chart grid or create fallback
              let chartGrid = document.querySelector('.chart-grid');
              if (!chartGrid) {
                chartGrid = document.createElement('div');
                chartGrid.className = 'chart-grid';
                const cognitiveView = document.querySelector('.cognitive-load-view');
                if (cognitiveView) {
                  cognitiveView.appendChild(chartGrid);
                } else {
                  // Last resort - append to body if cognitive view not found
                  console.warn('Cognitive load view not found, attaching to body');
                  document.body.appendChild(chartGrid);
                }
              }
              
              chartGrid.appendChild(newContainer);
              ref.current = newContainer;
              containersCreated = true;
            } else {
              ref.current = containerElement;
            }
          }
        });
        
        setChartInitStatus(prev => ({...prev, containersReady: true}));
        return containersCreated;
      };
      
      // Call container initialization before creating canvases
      const newContainersCreated = ensureChartContainers();
      if (newContainersCreated) {
        console.log('New chart containers were created, waiting to initialize canvases');
        // Wait a moment for the DOM to update
        setTimeout(createCanvases, 100);
      } else {
        createCanvases();
      }
      
      // Create canvas elements within the containers
      function createCanvases() {
        // Create canvas elements within the containers if they don't exist
        Object.entries(chartRefs).forEach(([id, ref]) => {
          if (ref.current) {
            console.log(`Setting up canvas for container [${id}]`, ref.current);
            // Check if a canvas already exists
            const existingCanvas = ref.current.querySelector('canvas');
            if (!existingCanvas) {
              // Create a new canvas element for Chart.js
              const canvas = document.createElement('canvas');
              canvas.id = `${id}-canvas`;
              canvas.style.width = '100%';
              canvas.style.height = '85%';
              // Add the canvas as a direct child after the h3 title
              if (ref.current.querySelector('h3')) {
                ref.current.querySelector('h3').insertAdjacentElement('afterend', canvas);
              } else {
                ref.current.appendChild(canvas);
              }
              console.log(`Created canvas #${canvas.id} in container #${id}`);
            } else {
              console.log(`Canvas already exists in container [${id}]`);
            }
          } else {
            console.error(`Container ref for [${id}] is still null after initialization`);
          }
        });
        
        // Set data ready status
        setChartInitStatus(prev => ({...prev, dataReady: true}));
        
        // Small timeout to ensure DOM is fully rendered and canvases are properly sized
        setTimeout(() => {
          console.log("Checking for Chart.js and initializing charts");
          loadChartJsIfNeeded();
        }, 500);
      }
    }
  }, [isLoading, error]);

  // First check if Chart.js is loaded, if not load it
  const loadChartJsIfNeeded = () => {
    if (typeof window.Chart === 'undefined') {
      console.log('Chart.js not found, attempting to load dynamically');
      
      // Create a simple fallback renderer first to ensure user sees something
      renderFallbackCharts();
      
      // Try loading from multiple CDNs without integrity checks
      const loadScript = (src) => {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          // Remove integrity and crossorigin attributes that might cause loading failures
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      };
      
      // Try multiple CDNs in sequence - with no integrity attributes
      loadScript('https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js')
        .then(() => {
          console.log('Chart.js loaded successfully from jsdelivr');
          setChartInitStatus(prev => ({...prev, chartjsLoaded: true}));
          initializeChartJs();
        })
        .catch(() => {
          console.log('Primary CDN failed, trying alternative CDN for Chart.js');
          return loadScript('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js');
        })
        .then(() => {
          console.log('Chart.js loaded successfully from cdnjs');
          setChartInitStatus(prev => ({...prev, chartjsLoaded: true}));
          initializeChartJs();
        })
        .catch(() => {
          console.log('Second CDN failed, trying third CDN for Chart.js');
          return loadScript('https://unpkg.com/chart.js@3.9.1/dist/chart.min.js');
        })
        .then(() => {
          console.log('Chart.js loaded successfully from unpkg');
          setChartInitStatus(prev => ({...prev, chartjsLoaded: true}));
          initializeChartJs();
        })
        .catch((err) => {
          console.error('All CDNs failed to load Chart.js', err);
          showChartErrors();
        });
    } else {
      console.log('Chart.js already loaded, initializing charts');
      setChartInitStatus(prev => ({...prev, chartjsLoaded: true}));
      initializeChartJs();
    }
  };
  
  // Initialize Chart.js charts
  const initializeChartJs = () => {
    console.log('Initializing Chart.js charts');
    try {
      // Initialize radar chart
      if (chartRefs['graph-radar-cl'].current) {
        const canvas = document.getElementById('graph-radar-cl-canvas');
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const radarData = {
              labels: ['Mental Demand', 'Temporal Demand', 'Performance', 'Effort', 'Frustration'],
              datasets: [{
                label: 'Student',
                data: [7, 5, 6, 8, 6],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
              }, {
                label: 'Class Average',
                data: [6, 4, 7, 5, 7],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              }]
            };
            
            // Destroy existing chart if needed
            if (window.chartInstances && window.chartInstances['graph-radar-cl']) {
              window.chartInstances['graph-radar-cl'].destroy();
            }
            
            if (!window.chartInstances) window.chartInstances = {};
            
            window.chartInstances['graph-radar-cl'] = new window.Chart(ctx, {
              type: 'radar',
              data: radarData,
              options: {
                responsive: true,
                maintainAspectRatio: false
              }
            });
            console.log('Radar chart created');
          }
        }
      }
      
      // Initialize histogram chart
      if (chartRefs['graph-histogram-cl'].current) {
        const canvas = document.getElementById('graph-histogram-cl-canvas');
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const histogramData = {
              labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
              datasets: [
                {
                  label: 'Novice',
                  data: [1, 2, 3, 8, 12, 10, 8, 5, 3],
                  backgroundColor: 'rgba(255, 99, 132, 0.7)',
                },
                {
                  label: 'Intermediate',
                  data: [2, 4, 8, 12, 10, 8, 5, 2, 1],
                  backgroundColor: 'rgba(54, 162, 235, 0.7)',
                },
                {
                  label: 'Advanced',
                  data: [3, 5, 7, 9, 10, 6, 3, 1, 0],
                  backgroundColor: 'rgba(75, 192, 192, 0.7)',
                }
              ]
            };
            
            // Destroy existing chart if needed
            if (window.chartInstances && window.chartInstances['graph-histogram-cl']) {
              window.chartInstances['graph-histogram-cl'].destroy();
            }
            
            window.chartInstances['graph-histogram-cl'] = new window.Chart(ctx, {
              type: 'bar',
              data: histogramData,
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    stacked: true,
                  },
                  y: {
                    stacked: true
                  }
                }
              }
            });
            console.log('Histogram chart created');
          }
        }
      }
      
      // Initialize bar chart
      if (chartRefs['graph-bars-compl'].current) {
        const canvas = document.getElementById('graph-bars-compl-canvas');
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const barData = {
              labels: ['Model A', 'Model B', 'Model C', 'Model D'],
              datasets: [{
                label: 'VRAM Usage (GB)',
                data: [4, 8, 12, 24],
                backgroundColor: 'rgba(75, 192, 192, 0.7)'
              }]
            };
            
            // Destroy existing chart if needed
            if (window.chartInstances && window.chartInstances['graph-bars-compl']) {
              window.chartInstances['graph-bars-compl'].destroy();
            }
            
            window.chartInstances['graph-bars-compl'] = new window.Chart(ctx, {
              type: 'bar',
              data: barData,
              options: {
                responsive: true,
                maintainAspectRatio: false
              }
            });
            console.log('Bar chart created');
          }
        }
      }
      
      setChartInitStatus(prev => ({...prev, chartsInitialized: true}));
    } catch (e) {
      console.error('Error initializing charts:', e);
      showChartErrors();
    }
  };
  
  // Show errors in chart containers
  const showChartErrors = () => {
    console.error('Showing chart errors due to initialization failure');
    Object.entries(chartRefs).forEach(([id, ref]) => {
      if (ref.current) {
        // Keep the original h3 title if it exists
        const title = ref.current.querySelector('h3')?.cloneNode(true);
        ref.current.innerHTML = '';
        if (title) ref.current.appendChild(title);
        
        const errorContainer = document.createElement('div');
        errorContainer.style.display = 'flex';
        errorContainer.style.justifyContent = 'center';
        errorContainer.style.alignItems = 'center';
        errorContainer.style.height = '100%';
        errorContainer.style.color = '#d32f2f';
        errorContainer.style.backgroundColor = '#ffebee';
        errorContainer.style.border = '1px solid #d32f2f';
        errorContainer.style.padding = '15px';
        errorContainer.style.borderRadius = '4px';
        errorContainer.style.flexDirection = 'column';
        
        const errorTitle = document.createElement('div');
        errorTitle.style.fontSize = '1.2em';
        errorTitle.style.fontWeight = 'bold';
        errorTitle.style.marginBottom = '10px';
        errorTitle.textContent = '⚠️ Erro ao carregar gráfico';
        
        const errorMessage = document.createElement('div');
        errorMessage.style.fontSize = '0.9em';
        errorMessage.style.color = '#b71c1c';
        errorMessage.textContent = 'Biblioteca Chart.js não disponível ou problemas de dimensionamento';
        
        const retryButton = document.createElement('button');
        retryButton.style.marginTop = '10px';
        retryButton.style.padding = '5px 10px';
        retryButton.style.cursor = 'pointer';
        retryButton.textContent = 'Tentar novamente';
        retryButton.onclick = () => window.location.reload();
        
        errorContainer.appendChild(errorTitle);
        errorContainer.appendChild(errorMessage);
        errorContainer.appendChild(retryButton);
        ref.current.appendChild(errorContainer);
      }
    });
  };
  
  // Render simple fallback placeholder charts
  const renderFallbackCharts = () => {
    Object.entries(chartRefs).forEach(([id, ref]) => {
      if (ref.current) {
        // Keep the existing title if it exists
        const existingTitle = ref.current.querySelector('h3');
        const titleText = existingTitle ? existingTitle.textContent : '';
        
        // Simple SVG-based chart placeholder
        const fallbackSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        fallbackSvg.setAttribute('width', '100%');
        fallbackSvg.setAttribute('height', '85%');
        fallbackSvg.style.background = '#f9f9f9';
        
        // Add placeholder content based on chart type
        if (id === 'graph-radar-cl') {
          // Simple radar placeholder
          fallbackSvg.innerHTML = `
            <polygon points="150,50 75,150 150,250 225,150" stroke="#8884d8" fill="#8884d8" fill-opacity="0.2" />
            <text x="150" y="30" text-anchor="middle">Perfil de Carga Cognitiva</text>
          `;
        } else if (id === 'graph-histogram-cl') {
          // Simple histogram placeholder
          fallbackSvg.innerHTML = `
            <rect x="10" y="50" width="30" height="200" fill="#8884d8" fill-opacity="0.6" />
            <rect x="50" y="100" width="30" height="150" fill="#82ca9d" fill-opacity="0.6" />
            <rect x="90" y="150" width="30" height="100" fill="#ffc658" fill-opacity="0.6" />
            <text x="150" y="30" text-anchor="middle">Distribuição da Carga Cognitiva</text>
          `;
        } else {
          // Simple bar chart placeholder
          fallbackSvg.innerHTML = `
            <rect x="10" y="50" width="50" height="50" fill="#8884d8" />
            <rect x="70" y="25" width="50" height="75" fill="#8884d8" />
            <rect x="130" y="10" width="50" height="90" fill="#8884d8" />
            <text x="150" y="30" text-anchor="middle">Carga Computacional</text>
          `;
        }
        
        // Clear container while preserving title
        ref.current.innerHTML = '';
        if (existingTitle) {
          ref.current.appendChild(existingTitle);
        } else {
          const newTitle = document.createElement('h3');
          newTitle.textContent = titleText || 'Chart';
          ref.current.appendChild(newTitle);
        }
        
        ref.current.appendChild(fallbackSvg);
        
        // Add message about fallback
        const fallbackMsg = document.createElement('div');
        fallbackMsg.style.textAlign = 'center';
        fallbackMsg.style.fontSize = '12px';
        fallbackMsg.style.color = '#666';
        fallbackMsg.textContent = 'Visualização simplificada (carregando biblioteca)';
        ref.current.appendChild(fallbackMsg);
      }
    });
  }

  const renderDebugInfo = () => {
    // Only show in development or when there are issues
    if (process.env.NODE_ENV !== 'production' || chartContainerDimensions.width === 0 || chartContainerDimensions.height === 0) {
      return (
        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.7)', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999,
          maxWidth: '300px',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          <div><strong>Chart Container Debug:</strong></div>
          <div>Width: {chartContainerDimensions.width}px</div>
          <div>Height: {chartContainerDimensions.height}px</div>
          <div>Chart.js Loaded: {typeof window.Chart !== 'undefined' ? 'Yes' : 'No'}</div>
          <div>ChartUtils: {window.chartUtils ? 'Available' : 'Not Available'}</div>
          <div style={{marginTop: '10px'}}><strong>Init Status:</strong></div>
          <div>ChartJS Loaded: {chartInitStatus.chartjsLoaded ? 'Yes' : 'No'}</div>
          <div>Containers Ready: {chartInitStatus.containersReady ? 'Yes' : 'No'}</div>
          <div>Data Ready: {chartInitStatus.dataReady ? 'Yes' : 'No'}</div>
          <div>Charts Initialized: {chartInitStatus.chartsInitialized ? 'Yes' : 'No'}</div>
          <div style={{marginTop: '10px'}}><strong>Container Details:</strong></div>
          {Object.entries(chartRefs).map(([id, ref]) => (
            <div key={id}>
              {id}: {ref.current ? `${ref.current.clientWidth}x${ref.current.clientHeight}px` : 'Not found'}
            </div>
          ))}
          <button 
            onClick={() => {
              console.log('Forcing chart initialization');
              if (typeof window.Chart !== 'undefined') {
                initializeChartJs();
              } else {
                loadChartJsIfNeeded();
              }
            }}
            style={{ marginTop: '5px', padding: '3px 8px' }}
          >
            Retry Charts
          </button>
          <button onClick={() => window.location.reload()} style={{ marginTop: '5px', marginLeft: '5px', padding: '3px 8px' }}>
            Reload Page
          </button>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    // Debug log React component lifecycle
    console.log('CognitiveLoadView rendered', {
      isLoading,
      error,
      containerDimensions: chartContainerDimensions,
      chartjsAvailable: typeof window.Chart !== 'undefined',
      containersCreated: chartContainersCreated.current
    });
    
    // Check if chart containers exist in DOM after render
    Object.entries(chartRefs).forEach(([id, ref]) => {
      if (!ref.current) {
        console.warn(`Chart container for ${id} not found in DOM after render`);
      } else {
        console.log(`Chart container for ${id} found in DOM`, {
          width: ref.current.clientWidth,
          height: ref.current.clientHeight
        });
      }
    });
  });

  if (isLoading) {
    return <div className="loading">Carregando dados de carga cognitiva...</div>;
  }

  if (error) {
    return <div className="error">Erro: {error}</div>;
  }

  return (
    <div className="cognitive-load-view">
      <Link to="/" className="back-button">
        &larr; Voltar ao Painel
      </Link>
      <h2>Análise de Carga Cognitiva</h2>

      {/* Add Filters Here */}
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="expertise-filter">Nível de Expertise:</label>
          <select id="expertise-filter" className="filter-select">
            <option>Todos</option>
            <option>Novato</option>
            <option>Intermediário</option>
            <option>Avançado</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="task-filter">Tipo de Tarefa:</label>
          <select id="task-filter" className="filter-select">
            <option>Todas</option>
            <option>Ajuste Fino</option>
            <option>Inferência</option>
            <option>RAG</option>
          </select>
        </div>
      </div>

      <div className="chart-grid" ref={chartGridRef}>
        {/* Chart containers for Chart.js charts with explicit dimensions */}
        <div 
          id="graph-radar-cl" 
          ref={chartRefs['graph-radar-cl']} 
          className="chart-container"
          style={{ position: 'relative', height: '400px', minHeight: '300px' }}
        >
          <h3>Perfil de Carga Cognitiva (Radar)</h3>
          {/* Canvas will be added here programmatically */}
        </div>

        <div 
          id="graph-histogram-cl" 
          ref={chartRefs['graph-histogram-cl']} 
          className="chart-container"
          style={{ position: 'relative', height: '400px', minHeight: '300px' }}
        >
          <h3>Distribuição da Carga Cognitiva (Histograma)</h3>
          {/* Canvas will be added here programmatically */}
        </div>

        {/* React-based charts */}
        <div className="chart-container" style={{ height: '400px', minHeight: '300px' }}>
          <h3>Perfil de Carga Cognitiva (React)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 10]} />
              <Radar name="Estudante" dataKey="student" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Radar name="Média Turma" dataKey="average" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container" style={{ height: '400px', minHeight: '300px' }}>
          <h3>Distribuição da Carga Cognitiva (React)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={histogramData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="novice" name="Novato" fill="#8884d8" />
              <Bar dataKey="intermediate" name="Intermediário" fill="#82ca9d" />
              <Bar dataKey="expert" name="Especialista" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="insights-container">
        <h3>Insights sobre Carga Cognitiva</h3>
        <div className="insight-card">
          <h4>Padrões Observados</h4>
          <p>Os dados indicam maior carga cognitiva em tarefas de ajuste fino para usuários novatos, 
             com redução significativa para usuários experientes (evidência para H4: Reversão de Expertise).</p>
        </div>
        <div className="insight-card">
          <h4>Recomendações</h4>
          <p>Considere ajustar os parâmetros de quantização para reduzir a carga computacional, mantendo
             a carga cognitiva dentro de níveis gerenciáveis para todos os níveis de experiência.</p>
        </div>
      </div>

      {/* Link to computational load view */}
      <div 
        id="graph-bars-compl" 
        ref={chartRefs['graph-bars-compl']} 
        className="chart-container full-width"
        style={{ position: 'relative', height: '400px', minHeight: '300px' }}
      >
        <h3>Carga Computacional por Modelo</h3>
        {/* Canvas will be added here programmatically */}
      </div>
      
      {/* Debug information overlay */}
      {renderDebugInfo()}
    </div>
  );
}

export default CognitiveLoadView;
