import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Dados simulados para ajuste fino de modelos GGUF - substituir com dados reais
// Inclui parâmetros não-lineares como contagem de parâmetros, perplexidade, tempo de treinamento, e eficiência
const modelData = [
  { paramCount: 0.8e9, perplexity: 6.2, time: 80, efficiency: 0.6, name: 'GGUF-S1' },
  { paramCount: 1.2e9, perplexity: 5.8, time: 120, efficiency: 0.65, name: 'GGUF-M1' },
  { paramCount: 1.5e9, perplexity: 5.3, time: 150, efficiency: 0.7, name: 'GGUF-M2' },
  { paramCount: 1.8e9, perplexity: 5.0, time: 200, efficiency: 0.75, name: 'GGUF-L1' },
  { paramCount: 2.2e9, perplexity: 4.7, time: 250, efficiency: 0.72, name: 'GGUF-L2-Q4' },
  { paramCount: 2.5e9, perplexity: 4.5, time: 300, efficiency: 0.68, name: 'GGUF-XL1-Q4' },
  { paramCount: 3.0e9, perplexity: 4.2, time: 400, efficiency: 0.62, name: 'GGUF-XL2-Q8' },
  { paramCount: 3.5e9, perplexity: 4.0, time: 500, efficiency: 0.58, name: 'GGUF-XXL-Q8' },
];

// Função para formatar valores para melhor visualização
const formatParamCount = (count: number) => `${(count / 1e9).toFixed(1)}B`;
const formatTime = (time: number) => `${time}min`;
const formatPerplexity = (perp: number) => perp.toFixed(1);

// Personalização para Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border rounded shadow text-xs">
        <p className="font-semibold">{data.name}</p>
        <p>Parâmetros: {formatParamCount(data.paramCount)}</p>
        <p>Perplexidade: {formatPerplexity(data.perplexity)}</p>
        <p>Tempo: {formatTime(data.time)}</p>
        <p>Eficiência: {(data.efficiency * 100).toFixed(0)}%</p>
      </div>
    );
  }
  return null;
};

const FineTuningScatter: React.FC = () => {
  const [xMetric, setXMetric] = useState<'paramCount' | 'time'>('paramCount');
  const [showEfficiency, setShowEfficiency] = useState<boolean>(true);

  return (
    <div style={{ width: 320, height: 240 }}>
      <div className="flex justify-between items-center px-1">
        <h4 className="text-center font-semibold text-sm">Ajuste Fino GGUF (Scatter)</h4>
        <div className="flex items-center space-x-1">
          <select 
            className="text-xs border rounded px-1" 
            value={xMetric}
            onChange={(e) => setXMetric(e.target.value as any)}
          >
            <option value="paramCount">Parâmetros</option>
            <option value="time">Tempo</option>
          </select>
          <label className="text-xs flex items-center">
            <input 
              type="checkbox" 
              className="mr-1 h-3 w-3" 
              checked={showEfficiency} 
              onChange={() => setShowEfficiency(!showEfficiency)} 
            />
            Eficiência
          </label>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={215}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            dataKey={xMetric} 
            name={xMetric === 'paramCount' ? 'Parâmetros' : 'Tempo'} 
            unit={xMetric === 'paramCount' ? 'B' : 'min'} 
            tick={{ fontSize: 8 }} 
            tickFormatter={xMetric === 'paramCount' ? formatParamCount : formatTime}
          />
          <YAxis 
            type="number" 
            dataKey="perplexity" 
            name="Perplexidade" 
            tick={{ fontSize: 8 }} 
            domain={['auto', 'auto']}
          />
          {showEfficiency && (
            <ZAxis 
              type="number" 
              dataKey="efficiency" 
              range={[40, 400]} 
              name="Eficiência" 
            />
          )}
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Legend wrapperStyle={{ fontSize: '10px' }}/>
          <Scatter 
            name="Modelos GGUF" 
            data={modelData} 
            fill="#8884d8" 
            shape="circle"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FineTuningScatter;
