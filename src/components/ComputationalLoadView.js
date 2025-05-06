import React, { useState, useEffect, useCallback } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Handle,
  Position,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import './ComputationalLoadView.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

const CustomNode = ({ data }) => {
  return (
    <div className={`sankey-node ${data.type}`}>
      <Handle type="target" position={Position.Left} className="handle-input" />
      <div className="sankey-header">
        <div className="sankey-label">{data.label}</div>
        {data.icon && <div className="sankey-icon">{data.icon}</div>}
      </div>
      <div className="sankey-metrics">
        {data.metrics && data.metrics.map((metric, index) => (
          <div key={index} className="sankey-metric">
            <span className="metric-label">{metric.label}:</span>
            <span className="metric-value">{metric.value}</span>
          </div>
        ))}
      </div>
      <div className="sankey-value">{data.value}</div>
      <Handle type="source" position={Position.Right} className="handle-output" />
    </div>
  );
};

const nodeTypes = {
  sankeyNode: CustomNode
};

const ComputationalLoadView = () => {
  const navigate = useNavigate();
  
  // AI model scenarios for our charts
  const scenarios = [
    "Ajuste Fino Mistral 7B Q4",
    "Inferência Llama3 70B Q5",
    "Orquestração LMAS com 3 Agentes Phi-4-mini Q8",
    "RAG com Embeddings Nomic",
    "Mamba-2.8B E2E",
  ];
  
  // Filter options
  const baseModels = ["Todos", "Mistral 7B", "Llama3 70B", "Phi-4-mini", "Mamba-2.8B"];
  const taskTypes = ["Todos", "Ajuste Fino", "Inferência", "Orquestração", "RAG"];
  const quantizationLevels = ["Todos", "Q4", "Q5", "Q8", "Sem Quantização"];
  
  // Filter states
  const [selectedModel, setSelectedModel] = useState("Todos");
  const [selectedTask, setSelectedTask] = useState("Todos");
  const [selectedQuantization, setSelectedQuantization] = useState("Todos");
  const [filteredScenarios, setFilteredScenarios] = useState(scenarios);
  
  // Resource types for stacked bars
  const resourceTypes = {
    vram: "Pico de VRAM (GB)",
    gpuTime: "Tempo de GPU (s)",
    ramUsage: "Uso médio de RAM (GB)",
    cpuCores: "Núcleos de CPU utilizados"
  };
  
  // Color palette for different resources
  const resourceColors = {
    vram: { backgroundColor: 'rgba(255, 99, 132, 0.7)', borderColor: 'rgb(255, 99, 132)' },
    gpuTime: { backgroundColor: 'rgba(54, 162, 235, 0.7)', borderColor: 'rgb(54, 162, 235)' },
    ramUsage: { backgroundColor: 'rgba(75, 192, 192, 0.7)', borderColor: 'rgb(75, 192, 192)' },
    cpuCores: { backgroundColor: 'rgba(153, 102, 255, 0.7)', borderColor: 'rgb(153, 102, 255)' }
  };
  
  // Color palette for different scenarios
  const scenarioColors = [
    { borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.5)' },
    { borderColor: 'rgb(153, 102, 255)', backgroundColor: 'rgba(153, 102, 255, 0.5)' },
    { borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)' },
    { borderColor: 'rgb(54, 162, 235)', backgroundColor: 'rgba(54, 162, 235, 0.5)' },
    { borderColor: 'rgb(255, 159, 64)', backgroundColor: 'rgba(255, 159, 64, 0.5)' },
  ];
  
  const [resourceData, setResourceData] = useState({
    labels: scenarios,
    datasets: [
      {
        label: resourceTypes.vram,
        data: [],
        backgroundColor: resourceColors.vram.backgroundColor,
        borderColor: resourceColors.vram.borderColor,
        borderWidth: 1
      },
      {
        label: resourceTypes.gpuTime,
        data: [],
        backgroundColor: resourceColors.gpuTime.backgroundColor,
        borderColor: resourceColors.gpuTime.borderColor,
        borderWidth: 1
      },
      {
        label: resourceTypes.ramUsage,
        data: [],
        backgroundColor: resourceColors.ramUsage.backgroundColor,
        borderColor: resourceColors.ramUsage.borderColor,
        borderWidth: 1
      },
      {
        label: resourceTypes.cpuCores,
        data: [],
        backgroundColor: resourceColors.cpuCores.backgroundColor,
        borderColor: resourceColors.cpuCores.borderColor,
        borderWidth: 1
      }
    ],
  });
  
  const [ramData, setRAMData] = useState({
    labels: scenarios,
    datasets: [
      {
        label: 'RAM Usage (MB)',
        data: [],
        backgroundColor: scenarioColors.map(color => color.backgroundColor),
        borderColor: scenarioColors.map(color => color.borderColor),
        borderWidth: 1
      }
    ],
  });
  
  const [memoryData, setMemoryData] = useState({
    labels: scenarios,
    datasets: [
      {
        label: 'Memory Usage (MB)',
        data: [],
        backgroundColor: scenarioColors.map(color => color.backgroundColor),
        borderColor: scenarioColors.map(color => color.borderColor),
        borderWidth: 1
      }
    ],
  });

  const [timeSeriesRamData, setTimeSeriesRamData] = useState({
    labels: [],
    datasets: scenarios.map((scenario, index) => ({
      label: scenario,
      data: [],
      borderColor: scenarioColors[index].borderColor,
      backgroundColor: scenarioColors[index].backgroundColor,
      tension: 0.4,
    })),
  });

  const [sankeyNodes, setSankeyNodes] = useState([]);
  const [sankeyEdges, setSankeyEdges] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hardware threshold reference values
  const hardwareThresholds = {
    vram6GB: { value: 6, label: 'VRAM 6GB (GTX 1660)' },
    vram8GB: { value: 8, label: 'VRAM 8GB (RTX 3070 Mobile)' },
    vram12GB: { value: 12, label: 'VRAM 12GB (RTX 3060)' },
    vram24GB: { value: 24, label: 'VRAM 24GB (RTX 3090)' },
    ram16GB: { value: 16, label: 'RAM 16GB' },
    ram32GB: { value: 32, label: 'RAM 32GB' },
  };

  // Apply filters to scenarios
  useEffect(() => {
    let results = [...scenarios];
    
    if (selectedModel !== "Todos") {
      results = results.filter(scenario => scenario.includes(selectedModel));
    }
    
    if (selectedTask !== "Todos") {
      results = results.filter(scenario => scenario.includes(selectedTask));
    }
    
    if (selectedQuantization !== "Todos") {
      results = results.filter(scenario => scenario.includes(selectedQuantization));
    }
    
    // If no scenarios match the filters, keep all scenarios but show a warning
    if (results.length === 0) {
      setFilteredScenarios(scenarios);
      alert("Nenhum cenário corresponde aos filtros selecionados. Mostrando todos os cenários.");
    } else {
      setFilteredScenarios(results);
    }
  }, [selectedModel, selectedTask, selectedQuantization]);

  // Helper function to calculate edge thickness based on data volume
  const calculateEdgeThickness = (type, value) => {
    const baseThickness = 2;
    
    switch(type) {
      case 'data':
        return baseThickness + Math.min(Math.round(value * 0.8), 8); 
      case 'tokens':
        return baseThickness + Math.min(Math.round(value * 0.5), 10);
      case 'vram':
        return baseThickness + Math.min(Math.round(value * 0.7), 12);
      case 'time':
        return baseThickness + Math.min(Math.round(value / 20), 6);
      default:
        return baseThickness;
    }
  };

  // Edge styling with resource flow information
  const getEdgeStyle = (type, value, color) => {
    return {
      stroke: color,
      strokeWidth: calculateEdgeThickness(type, value),
      strokeOpacity: 0.8,
      transition: 'stroke-width 0.3s ease-in-out',
      cursor: 'pointer'
    };
  };

  const generateSankeyData = () => {
    const resourceFlows = {
      dataInput: { type: 'data', value: 3.2, label: '3.2 GB' },
      corpusInput: { type: 'data', value: 8.5, label: '8.5 GB' },
      tokens: { type: 'tokens', value: 2.1, label: '2.1M tokens' },
      embeddingVram: { type: 'vram', value: 4.8, label: '4.8 GB VRAM' },
      finetuningVram: { type: 'vram', value: 12, label: '12 GB VRAM' },
      mistralVram: { type: 'vram', value: 7.4, label: '7.4 GB VRAM' },
      phiVram: { type: 'vram', value: 4.2, label: '4.2 GB VRAM' },
      llamaVram: { type: 'vram', value: 28.5, label: '28.5 GB VRAM' },
      inferenceTime: { type: 'time', value: 40, label: '40s per request' },
      finetuningTime: { type: 'time', value: 180, label: '3m per epoch' },
      quantizationReduction: { type: 'data', value: 6.4, label: '6.4 GB reduction' }
    };

    const nodes = [
      { 
        id: 'data1', 
        position: { x: 50, y: 50 }, 
        data: { 
          label: 'Carregar Dados',
          icon: '📂',
          value: 'Etapa 1: Entrada',
          type: 'input',
          metrics: [
            { label: 'Tamanho', value: '3.8GB' },
            { label: 'Formato', value: 'JSON/CSV' }
          ]
        }, 
        type: 'sankeyNode' 
      },
      { 
        id: 'data2', 
        position: { x: 50, y: 200 }, 
        data: { 
          label: 'Carregar Modelo Base',
          icon: '🧠',
          value: 'Etapa 1: Entrada',
          type: 'input',
          metrics: [
            { label: 'Tamanho', value: '13.5GB' },
            { label: 'Formato', value: 'GGUF/Safetensors' }
          ]
        }, 
        type: 'sankeyNode' 
      },
      { 
        id: 'prep1', 
        position: { x: 350, y: 50 }, 
        data: { 
          label: 'Tokenizar Dados',
          icon: '🔣',
          value: 'Etapa 2: Pré-processamento',
          type: 'process',
          metrics: [
            { label: 'Tokens', value: '1.2M' },
            { label: 'RAM', value: '2.4GB' }
          ]
        }, 
        type: 'sankeyNode' 
      },
      { 
        id: 'prep2', 
        position: { x: 350, y: 175 }, 
        data: { 
          label: 'Preparar Modelo',
          icon: '⚙️',
          value: 'Etapa 2: Pré-processamento',
          type: 'process',
          metrics: [
            { label: 'VRAM', value: '8.2GB' },
            { label: 'Tempo', value: '45s' }
          ]
        }, 
        type: 'sankeyNode' 
      },
      { 
        id: 'prep3', 
        position: { x: 350, y: 300 }, 
        data: { 
          label: 'Quantização do Modelo',
          icon: '📉',
          value: 'Etapa 2: Pré-processamento',
          type: 'process',
          metrics: [
            { label: 'Redução', value: '70%' },
            { label: 'Formato', value: 'GPTQ/AWQ' }
          ]
        }, 
        type: 'sankeyNode' 
      },
      { 
        id: 'comp1', 
        position: { x: 650, y: 50 }, 
        data: { 
          label: 'Inferência',
          icon: '🔮',
          value: 'Etapa 3: Computação',
          type: 'compute',
          metrics: [
            { label: 'VRAM', value: '5.7GB' },
            { label: 'Vel.', value: '12 tok/s' }
          ]
        }, 
        type: 'sankeyNode' 
      },
      { 
        id: 'comp2', 
        position: { x: 650, y: 175 }, 
        data: { 
          label: 'Ajuste Fino',
          icon: '🔧',
          value: 'Etapa 3: Computação',
          type: 'compute',
          metrics: [
            { label: 'VRAM', value: '14.2GB' },
            { label: 'Épocas', value: '3' }
          ]
        }, 
        type: 'sankeyNode' 
      },
      { 
        id: 'comp3', 
        position: { x: 650, y: 300 }, 
        data: { 
          label: 'Orquestração',
          icon: '🎭',
          value: 'Etapa 3: Computação',
          type: 'compute',
          metrics: [
            { label: 'Agentes', value: '3' },
            { label: 'RAM', value: '16GB' }
          ]
        }, 
        type: 'sankeyNode' 
      },
      { 
        id: 'out1', 
        position: { x: 950, y: 100 }, 
        data: { 
          label: 'Geração de Texto',
          icon: '📝',
          value: 'Etapa 4: Saída',
          type: 'output',
          metrics: [
            { label: 'Tokens', value: '512 max' },
            { label: 'Tempo', value: '~40s' }
          ]
        }, 
        type: 'sankeyNode' 
      },
      { 
        id: 'out2', 
        position: { x: 950, y: 250 }, 
        data: { 
          label: 'Modelo Ajustado',
          icon: '💾',
          value: 'Etapa 4: Saída',
          type: 'output',
          metrics: [
            { label: 'Tamanho', value: '4.2GB' },
            { label: 'Formato', value: 'Safetensors' }
          ]
        }, 
        type: 'sankeyNode' 
      }
    ];

    const edges = [
      { 
        id: 'e-d1-p1', 
        source: 'data1', 
        target: 'prep1', 
        animated: true, 
        label: resourceFlows.dataInput.label,
        style: getEdgeStyle('data', resourceFlows.dataInput.value, '#ff6b6b'), 
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { type: 'Data Volume', value: resourceFlows.dataInput.label }
      },
      { 
        id: 'e-d1-p2', 
        source: 'data1', 
        target: 'prep2', 
        animated: true, 
        label: resourceFlows.dataInput.label,
        style: getEdgeStyle('data', resourceFlows.dataInput.value * 0.7, '#ff6b6b'), 
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { type: 'Data Volume', value: resourceFlows.dataInput.label }
      },
      { 
        id: 'e-d2-p3', 
        source: 'data2', 
        target: 'prep2', 
        animated: true, 
        label: resourceFlows.corpusInput.label,
        style: getEdgeStyle('data', resourceFlows.corpusInput.value, '#1c7ed6'), 
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { type: 'Training Data', value: resourceFlows.corpusInput.label }
      },
      { 
        id: 'e-p1-c1', 
        source: 'prep1', 
        target: 'comp1', 
        animated: true, 
        label: resourceFlows.tokens.label,
        style: getEdgeStyle('tokens', resourceFlows.tokens.value, '#ff6b6b'), 
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { type: 'Token Count', value: resourceFlows.tokens.label }
      },
      { 
        id: 'e-p2-c1', 
        source: 'prep2', 
        target: 'comp1', 
        animated: true, 
        label: resourceFlows.mistralVram.label,
        style: getEdgeStyle('vram', resourceFlows.mistralVram.value, '#1c7ed6'), 
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { type: 'VRAM Usage', value: resourceFlows.mistralVram.label }
      },
      { 
        id: 'e-p2-c2', 
        source: 'prep2', 
        target: 'comp2', 
        animated: true, 
        label: resourceFlows.finetuningVram.label,
        style: getEdgeStyle('vram', resourceFlows.finetuningVram.value, '#1c7ed6'), 
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { type: 'VRAM Usage', value: resourceFlows.finetuningVram.label }
      },
      { 
        id: 'e-p3-c3', 
        source: 'prep3', 
        target: 'comp3', 
        animated: true, 
        label: resourceFlows.phiVram.label,
        style: getEdgeStyle('vram', resourceFlows.phiVram.value, '#1c7ed6'), 
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { type: 'VRAM Usage', value: resourceFlows.phiVram.label }
      },
      { 
        id: 'e-c1-o1', 
        source: 'comp1', 
        target: 'out1', 
        animated: true, 
        label: resourceFlows.inferenceTime.label,
        style: getEdgeStyle('time', resourceFlows.inferenceTime.value, '#37b24d'), 
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { type: 'Processing Time', value: resourceFlows.inferenceTime.label }
      },
      { 
        id: 'e-c2-o2', 
        source: 'comp2', 
        target: 'out2', 
        animated: true, 
        label: resourceFlows.finetuningTime.label,
        style: getEdgeStyle('time', resourceFlows.finetuningTime.value, '#37b24d'), 
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { type: 'Processing Time', value: resourceFlows.finetuningTime.label }
      },
      { 
        id: 'e-c3-o1', 
        source: 'comp3', 
        target: 'out1', 
        animated: true, 
        label: '60s',
        style: getEdgeStyle('time', 60, '#37b24d'), 
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { type: 'Processing Time', value: '60s' }
      }
    ];
    
    return { nodes, edges };
  };

  const fetchComputationalLoadData = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate data only for filtered scenarios
      const scenarioIndices = filteredScenarios.map(scenario => scenarios.indexOf(scenario));
      
      const ramValues = scenarios.map((_, i) => 
        scenarioIndices.includes(i) ? Math.floor(Math.random() * 8000) + 2000 : null
      ).filter((_, i) => scenarioIndices.includes(i));
      
      const memoryValues = scenarios.map((_, i) => 
        scenarioIndices.includes(i) ? Math.floor(Math.random() * 8000) + 2000 : null
      ).filter((_, i) => scenarioIndices.includes(i));
      
      const vramValues = scenarios.map((scenario, i) => {
        if (!scenarioIndices.includes(i)) return null;
        
        if (scenario.includes("70B")) return Math.floor(Math.random() * 10) + 25;
        if (scenario.includes("7B")) return Math.floor(Math.random() * 5) + 8;
        if (scenario.includes("Phi-4")) return Math.floor(Math.random() * 3) + 4;
        return Math.floor(Math.random() * 4) + 2;
      }).filter((_, i) => scenarioIndices.includes(i));
      
      const gpuTimeValues = scenarios.map((scenario, i) => {
        if (!scenarioIndices.includes(i)) return null;
        
        if (scenario.includes("Ajuste Fino")) return Math.floor(Math.random() * 50) + 150;
        if (scenario.includes("Inferência")) return Math.floor(Math.random() * 30) + 20;
        if (scenario.includes("Orquestração")) return Math.floor(Math.random() * 40) + 60;
        return Math.floor(Math.random() * 20) + 10;
      }).filter((_, i) => scenarioIndices.includes(i));
      
      const ramUsageValues = scenarios.map((scenario, i) => {
        if (!scenarioIndices.includes(i)) return null;
        
        if (scenario.includes("RAG")) return Math.floor(Math.random() * 8) + 16;
        if (scenario.includes("Orquestração")) return Math.floor(Math.random() * 6) + 12;
        return Math.floor(Math.random() * 4) + 8;
      }).filter((_, i) => scenarioIndices.includes(i));
      
      const cpuCoresValues = scenarios.map((scenario, i) => {
        if (!scenarioIndices.includes(i)) return null;
        
        if (scenario.includes("Orquestração")) return Math.floor(Math.random() * 4) + 12;
        if (scenario.includes("RAG")) return Math.floor(Math.random() * 2) + 8;
        return Math.floor(Math.random() * 2) + 4;
      }).filter((_, i) => scenarioIndices.includes(i));
      
      setRAMData({
        labels: filteredScenarios,
        datasets: [
          {
            label: 'RAM Usage (MB)',
            data: memoryValues,
            backgroundColor: scenarioColors.map(color => color.backgroundColor).slice(0, filteredScenarios.length),
            borderColor: scenarioColors.map(color => color.borderColor).slice(0, filteredScenarios.length),
            borderWidth: 1
          }
        ],
      });
      
      setMemoryData({
        labels: filteredScenarios,
        datasets: [
          {
            label: 'Memory Usage (MB)',
            data: memoryValues,
            backgroundColor: scenarioColors.map(color => color.backgroundColor).slice(0, filteredScenarios.length),
            borderColor: scenarioColors.map(color => color.borderColor).slice(0, filteredScenarios.length),
            borderWidth: 1
          }
        ],
      });
      
      setResourceData({
        labels: filteredScenarios,
        datasets: [
          {
            label: resourceTypes.vram,
            data: vramValues,
            backgroundColor: resourceColors.vram.backgroundColor,
            borderColor: resourceColors.vram.borderColor,
            borderWidth: 1
          },
          {
            label: resourceTypes.gpuTime,
            data: gpuTimeValues,
            backgroundColor: resourceColors.gpuTime.backgroundColor,
            borderColor: resourceColors.gpuTime.backgroundColor,
            borderWidth: 1
          },
          {
            label: resourceTypes.ramUsage,
            data: ramUsageValues,
            backgroundColor: resourceColors.ramUsage.backgroundColor,
            borderColor: resourceColors.ramUsage.backgroundColor,
            borderWidth: 1
          },
          {
            label: resourceTypes.cpuCores,
            data: cpuCoresValues,
            backgroundColor: resourceColors.cpuCores.backgroundColor,
            borderColor: resourceColors.cpuCores.borderColor,
            borderWidth: 1
          }
        ]
      });
      
      const timestamps = Array.from({ length: 10 }, (_, i) => 
        new Date(Date.now() - (9 - i) * 60000).toLocaleTimeString()
      );
      
      setTimeSeriesRamData({
        labels: timestamps,
        datasets: filteredScenarios.map((scenario, index) => {
          const baseValue = Math.floor(Math.random() * 30) + 20;
          const variation = Math.floor(Math.random() * 20) + 5;
          const scenarioIndex = scenarios.indexOf(scenario);
          
          return {
            label: scenario,
            data: Array.from({ length: 10 }, () => 
              Math.floor(baseValue + (Math.random() * variation) - (variation / 2))
            ),
            borderColor: scenarioColors[scenarioIndex % scenarioColors.length].borderColor,
            backgroundColor: scenarioColors[scenarioIndex % scenarioColors.length].backgroundColor,
            tension: 0.4,
          };
        }),
      });
      
      const { nodes, edges } = generateSankeyData();
      setSankeyNodes(nodes);
      setSankeyEdges(edges);
      
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch computational load data');
      setIsLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComputationalLoadData();
    
    const intervalId = setInterval(() => {
      fetchComputationalLoadData();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [filteredScenarios]);

  const onNodeClick = useCallback((event, node) => {
    alert(`${node.data.label}: ${node.data.value}`);
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    if (edge.data) {
      alert(`${edge.data.type}: ${edge.data.value}`);
    }
  }, []);

  const onEdgeMouseEnter = useCallback((event, edge) => {
    const edgeElement = event.target;
    if (edgeElement) {
      edgeElement.style.strokeWidth = parseInt(edgeElement.style.strokeWidth) * 1.5 + 'px';
      edgeElement.style.strokeOpacity = "1";
    }
  }, []);

  const onEdgeMouseLeave = useCallback((event, edge) => {
    const edgeElement = event.target;
    if (edgeElement) {
      edgeElement.style.strokeWidth = parseInt(edgeElement.style.strokeWidth) / 1.5 + 'px';
      edgeElement.style.strokeOpacity = "0.8";
    }
  }, []);

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Computational Load By Model Scenario',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
  };
  
  const stackedBarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Recursos Computacionais por Cenário',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: ${value}`;
          }
        }
      },
      annotation: {
        annotations: {
          vram6GB: {
            type: 'line',
            yMin: hardwareThresholds.vram6GB.value,
            yMax: hardwareThresholds.vram6GB.value,
            borderColor: 'rgba(255, 0, 0, 0.7)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              display: true,
              content: hardwareThresholds.vram6GB.label,
              position: 'start',
              backgroundColor: 'rgba(255, 0, 0, 0.7)',
              font: {
                size: 11
              }
            }
          },
          vram12GB: {
            type: 'line',
            yMin: hardwareThresholds.vram12GB.value,
            yMax: hardwareThresholds.vram12GB.value,
            borderColor: 'rgba(255, 165, 0, 0.7)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              display: true,
              content: hardwareThresholds.vram12GB.label,
              position: 'start',
              backgroundColor: 'rgba(255, 165, 0, 0.7)',
              font: {
                size: 11
              }
            }
          },
          vram24GB: {
            type: 'line',
            yMin: hardwareThresholds.vram24GB.value,
            yMax: hardwareThresholds.vram24GB.value,
            borderColor: 'rgba(0, 128, 0, 0.7)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              display: true,
              content: hardwareThresholds.vram24GB.label,
              position: 'start',
              backgroundColor: 'rgba(0, 128, 0, 0.7)',
              font: {
                size: 11
              }
            }
          },
          ram16Zone: {
            type: 'box',
            yMin: hardwareThresholds.ram16GB.value,
            yMax: hardwareThresholds.ram32GB.value,
            backgroundColor: 'rgba(128, 128, 128, 0.1)',
            borderColor: 'rgba(128, 128, 128, 0.3)',
            borderWidth: 1,
            label: {
              display: true,
              content: '16-32GB RAM Zone',
              position: 'end',
              backgroundColor: 'rgba(128, 128, 128, 0.7)',
              font: {
                size: 11
              }
            }
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Uso de Recursos (unidades normalizadas)'
        }
      }
    },
  };
  
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'RAM Usage Over Time By Scenario',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'RAM Usage (MB)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
    },
  };

  if (isLoading) {
    return <div className="loading">Carregando dados de carga computacional...</div>;
  }

  if (error) {
    return <div className="error">Erro: {error}</div>;
  }

  return (
    <div className="computational-load-container">
      <div className="header-with-nav">
        <h2>Métricas de Carga Computacional</h2>
        <button 
          className="back-button" 
          onClick={() => navigate('/')}
        >
          Voltar
        </button>
      </div>
      
      {/* Add filter controls */}
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="model-filter">Modelo Base:</label>
          <select 
            id="model-filter" 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="filter-select"
          >
            {baseModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="task-filter">Tipo de Tarefa:</label>
          <select 
            id="task-filter" 
            value={selectedTask} 
            onChange={(e) => setSelectedTask(e.target.value)}
            className="filter-select"
          >
            {taskTypes.map(task => (
              <option key={task} value={task}>{task}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="quant-filter">Nível de Quantização:</label>
          <select 
            id="quant-filter" 
            value={selectedQuantization} 
            onChange={(e) => setSelectedQuantization(e.target.value)}
            className="filter-select"
          >
            {quantizationLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        
        <button 
          className="reset-filters-button" 
          onClick={() => {
            setSelectedModel("Todos");
            setSelectedTask("Todos");
            setSelectedQuantization("Todos");
          }}
        >
          Limpar Filtros
        </button>
      </div>
      
      {/* Display active filters if any */}
      {(selectedModel !== "Todos" || selectedTask !== "Todos" || selectedQuantization !== "Todos") && (
        <div className="active-filters">
          <span className="active-filters-label">Filtros ativos:</span>
          {selectedModel !== "Todos" && (
            <span className="active-filter">Modelo: {selectedModel}</span>
          )}
          {selectedTask !== "Todos" && (
            <span className="active-filter">Tarefa: {selectedTask}</span>
          )}
          {selectedQuantization !== "Todos" && (
            <span className="active-filter">Quantização: {selectedQuantization}</span>
          )}
          <span className="scenarios-count">Exibindo {filteredScenarios.length} de {scenarios.length} cenários</span>
        </div>
      )}
      
      <div className="chart-container full-width">
        <h3>Fluxo Computacional e Dependências</h3>
        <div className="sankey-legend">
          <div className="sankey-legend-item input">
            <span className="legend-box"></span>
            <span>Dados de Entrada</span>
          </div>
          <div className="sankey-legend-item process">
            <span className="legend-box"></span>
            <span>Processamento</span>
          </div>
          <div className="sankey-legend-item model">
            <span className="legend-box"></span>
            <span>Modelos</span>
          </div>
          <div className="sankey-legend-item output">
            <span className="legend-box"></span>
            <span>Saída</span>
          </div>
          <div className="sankey-legend-item flow">
            <span className="legend-flow"></span>
            <span>Magnitude do Fluxo</span>
          </div>
        </div>
        <div style={{ height: 450 }} className="sankey-container">
          <ReactFlow
            nodes={sankeyNodes}
            edges={sankeyEdges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onEdgeMouseEnter={onEdgeMouseEnter}
            onEdgeMouseLeave={onEdgeMouseLeave}
            fitView
          >
            <Background variant="dots" gap={12} size={1} />
            <Controls />
            <MiniMap 
              nodeStrokeColor={(n) => {
                if (n.data.type === 'input') return '#ff6b6b';
                if (n.data.type === 'process') return '#1c7ed6';
                if (n.data.type === 'model') return '#37b24d';
                return '#f59f00';
              }}
              nodeColor={(n) => {
                if (n.data.type === 'input') return '#ffdeeb';
                if (n.data.type === 'process') return '#d0ebff';
                if (n.data.type === 'model') return '#d3f9d8';
                return '#fff3bf';
              }}
            />
          </ReactFlow>
        </div>
        <div className="flow-thickness-legend">
          <div className="thickness-label">Menor fluxo</div>
          <div className="thickness-line small"></div>
          <div className="thickness-line medium"></div>
          <div className="thickness-line large"></div>
          <div className="thickness-label">Maior fluxo</div>
        </div>
      </div>
      
      <div className="chart-container full-width">
        <h3>Recursos Computacionais por Cenário de Modelo</h3>
        <div className="reference-legend">
          <div className="reference-item vram-6gb">
            <span className="reference-line"></span>
            <span className="reference-label">VRAM 6GB</span>
          </div>
          <div className="reference-item vram-12gb">
            <span className="reference-line"></span>
            <span className="reference-label">VRAM 12GB</span>
          </div>
          <div className="reference-item vram-24gb">
            <span className="reference-line"></span>
            <span className="reference-label">VRAM 24GB</span>
          </div>
          <div className="reference-item ram-zone">
            <span className="reference-zone"></span>
            <span className="reference-label">Zona RAM 16-32GB</span>
          </div>
        </div>
        <Bar data={resourceData} options={stackedBarOptions} />
      </div>
      
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Uso de RAM por Cenário</h3>
          <Bar data={ramData} options={barOptions} />
        </div>
        
        <div className="chart-container">
          <h3>Uso de Memória por Cenário</h3>
          <Bar data={memoryData} options={barOptions} />
        </div>
      </div>
      
      <div className="chart-container full-width"> 
        <h3>Monitoramento de RAM ao Longo do Tempo</h3>
        <Line data={timeSeriesRamData} options={lineOptions} />
      </div>

      <div className="stats-container"> 
        {filteredScenarios.map((scenario, index) => (
          <div key={scenario} className="stat-card">
            <h4>{scenario}</h4>
            <p className="stat-value">
              {resourceData.datasets[0].data[index]} GB VRAM
            </p>
            <p className="stat-subvalue">
              {resourceData.datasets[1].data[index]}s GPU | {resourceData.datasets[2].data[index]} GB RAM
            </p>
          </div>
        ))}
      </div>
      
      <button className="refresh-button" onClick={fetchComputationalLoadData}>
        Atualizar Dados
      </button>
    </div>
  );
};

export default ComputationalLoadView;
