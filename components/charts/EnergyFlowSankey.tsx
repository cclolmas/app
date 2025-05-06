import React, { useState } from 'react';
import Plot from 'react-plotly.js';

// Função para cálculo de impacto na CompL baseado nos parâmetros
const calculateCompLImpact = (batchSize: number, quantization: string): number => {
  // Simulação de cálculo de eficiência computacional (CompL)
  const baseEfficiency = quantization === 'Q4' ? 0.75 : 0.85;
  // BatchSize maior reduz eficiência para Q4, mas tem menos impacto em Q8
  const batchFactor = quantization === 'Q4' 
    ? Math.max(0.5, 1 - (batchSize / 256) * 0.5)
    : Math.max(0.7, 1 - (batchSize / 256) * 0.3);
    
  return baseEfficiency * batchFactor;
};

// Função para gerar dados do Sankey com base nos parâmetros
const generateSankeyData = (batchSize: number, quantization: string) => {
  const compL = calculateCompLImpact(batchSize, quantization);
  const efficiency = compL * 100;
  const inputValue = batchSize;
  const modelProcessing = batchSize * compL;
  const outputValue = modelProcessing * 0.9;
  const feedback = modelProcessing * 0.1;
  
  return {
    type: "sankey",
    orientation: "h",
    node: {
      pad: 15,
      thickness: 20,
      line: { color: "black", width: 0.5 },
      label: ["Input", "Modelo", "Output", "Feedback"],
      color: ["#7EA4D7", "#6F9654", "#F6B26B", "#8E7CC3"]
    },
    link: {
      source: [0, 1, 2], // Índices correspondem a labels
      target: [1, 2, 3],
      value: [inputValue, outputValue, feedback],
      color: [
        `rgba(126, 164, 215, 0.6)`,
        `rgba(246, 178, 107, 0.6)`,
        `rgba(142, 124, 195, 0.6)`
      ],
      label: [`Input: ${inputValue}`, `Output: ${outputValue.toFixed(1)}`, `Feedback: ${feedback.toFixed(1)}`]
    }
  };
};

const EnergyFlowSankey: React.FC = () => {
  const [batchSize, setBatchSize] = useState(32);
  const [quantization, setQuantization] = useState('Q4');
  const [sankeyData, setSankeyData] = useState(generateSankeyData(batchSize, quantization));
  const compL = calculateCompLImpact(batchSize, quantization);

  // Atualizar o Sankey quando os parâmetros mudarem
  const handleParamChange = () => {
    setSankeyData(generateSankeyData(batchSize, quantization));
  };

  return (
    <div style={{ width: 320, height: 240 }}>
      <h4 className="text-center font-semibold mb-1 text-sm">Fluxo Energia/Computação (Sankey)</h4>
      <Plot
        data={[sankeyData]}
        layout={{
          width: 320,
          height: 160, // Ajuste para caber os controles
          margin: { l: 5, r: 5, b: 5, t: 5 },
          font: { size: 10 }
        }}
        config={{ displayModeBar: false }}
      />
      <div className="text-center mt-1 text-xs space-y-1">
        <div>
          <label htmlFor="batchSize" className="mr-1">Batch Size:</label>
          <input
            type="range"
            id="batchSize"
            min="8"
            max="128"
            step="8"
            value={batchSize}
            onChange={(e) => {
              setBatchSize(parseInt(e.target.value, 10));
              handleParamChange();
            }}
            className="w-24 align-middle"
          />
          <span className="ml-1">{batchSize}</span>
        </div>
        <div>
          <label className="mr-1">Quantização:</label>
          <select 
            value={quantization} 
            onChange={(e) => {
              setQuantization(e.target.value);
              handleParamChange();
            }}
            className="border rounded px-1 text-xs"
          >
            <option value="Q4">Q4</option>
            <option value="Q8">Q8</option>
          </select>
          <span className="ml-2">CompL: {(compL * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

export default EnergyFlowSankey;
