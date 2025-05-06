import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { PlotData } from 'plotly.js'; // Import PlotData type

// Placeholder data - replace with actual data
// Dados para Q4+LMAS - alguns valores atípicos incluídos para demonstrar outliers
const q4lmasData = [60, 70, 75, 80, 82, 85, 90, 95, 100, 130, 135];

// Dados para Q8 - distribuição mais consistente
const q8Data = [50, 55, 60, 65, 70, 72, 75, 80, 85, 90];

// Determinação de outliers baseada em estatísticas simples
const identifyOutliers = (data: number[]): number[] => {
  const sortedData = [...data].sort((a, b) => a - b);
  const q1 = sortedData[Math.floor(sortedData.length * 0.25)];
  const q3 = sortedData[Math.floor(sortedData.length * 0.75)];
  const iqr = q3 - q1;
  const upperBound = q3 + 1.5 * iqr;
  
  return data.map((value, index) => value > upperBound ? index : -1).filter(i => i !== -1);
};

// Define types for the specific trace structures used
type ViolinTrace = Partial<PlotData> & {
  type: 'violin';
  y: number[];
  name: string;
  box: { visible: boolean };
  meanline: { visible: boolean };
  points: string;
  jitter: number;
  pointpos: number;
  marker: { 
    color: string;
    size: number;
    opacity: number;
    line: { width: number; color: string };
  };
};

type ScatterTrace = Partial<PlotData> & {
  type: 'scatter';
  y: number[];
  x: number[];
  mode: string;
  name: string;
  marker: { 
    color: string;
    size: number;
    symbol: string;
    line: { width: number; color: string };
  };
  hoverinfo: string;
  showlegend: boolean;
};

// Union type for the traces
type ViolinPlotTrace = ViolinTrace | ScatterTrace;

const CLCompLViolin: React.FC = () => {
  const [showOutlierInfo, setShowOutlierInfo] = useState(false);
  const outlierIndices = identifyOutliers(q4lmasData);
  
  // Criação de traces para o gráfico de violino
  const violinTraces: ViolinTrace[] = [
    {
      type: 'violin',
      y: q4lmasData,
      name: 'Q4 + LMAS',
      box: { visible: true },
      meanline: { visible: true },
      points: 'all',
      jitter: 0.3,
      pointpos: -1.8,
      marker: { 
        color: '#8884d8',
        size: 8,
        opacity: 0.7,
        line: { width: 1, color: 'gray' },
      }
    },
    {
      type: 'violin',
      y: q8Data,
      name: 'Q8',
      box: { visible: true },
      meanline: { visible: true },
      points: 'all',
      jitter: 0.3,
      pointpos: 1.8,
      marker: { 
        color: '#82ca9d',
        size: 8,
        opacity: 0.7,
        line: { width: 1, color: 'gray' },
      }
    }
  ];

  // Destaque para outliers
  const outliersTrace: ScatterTrace = {
    type: 'scatter',
    y: outlierIndices.map(i => q4lmasData[i]),
    x: Array(outlierIndices.length).fill(0),
    mode: 'markers',
    name: 'Outliers',
    marker: { 
      color: 'rgba(219, 64, 82, 0.8)',
      size: 12,
      symbol: 'circle-open',
      line: { width: 3, color: 'rgba(219, 64, 82, 1.0)' }
    },
    hoverinfo: 'y',
    showlegend: false
  };

  // Explicitly type allTraces with the union type
  const allTraces: ViolinPlotTrace[] = [...violinTraces];
  if (outlierIndices.length > 0) {
    allTraces.push(outliersTrace);
  }

  return (
    <div style={{ width: 320, height: 240 }}>
      <h4 className="text-center font-semibold mb-1 text-sm">CL x CompL (Violino)</h4>
      <Plot
        data={allTraces as PlotData[]} // Cast to PlotData[] which Plotly expects
        layout={{
          width: 320,
          height: 205,
          yaxis: { 
            title: 'Carga Cognitiva (CL)', 
            zeroline: false,
            gridcolor: 'rgba(200,200,200,0.2)'
          },
          xaxis: { showticklabels: false },
          margin: { l: 40, r: 10, b: 20, t: 10 },
          font: { size: 10 },
          showlegend: true,
          legend: { x: 0.1, y: -0.2, orientation: 'h' },
          hovermode: 'closest'
        }}
        config={{ displayModeBar: false }}
        onClick={() => setShowOutlierInfo(!showOutlierInfo)}
      />

      {outlierIndices.length > 0 && showOutlierInfo && (
        <div className="text-xs text-red-600 text-center mt-1">
          Alta CL em Q4 detectada (possível instabilidade com LMAS)
        </div>
      )}
      {!showOutlierInfo && outlierIndices.length > 0 && (
        <div className="text-xs text-gray-500 text-center mt-1">
          Clique para ver análise de outliers
        </div>
      )}
    </div>
  );
};

export default CLCompLViolin;
