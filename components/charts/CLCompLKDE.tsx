import React, { useState } from 'react';
import Plot from 'react-plotly.js';

// Definir tipo para os pontos de dados
interface DataPoint {
  cl: number;
  compL: number;
}

// Dados simulados para diferentes perfis - substituir com dados reais
const generateProfileData = (profile: 'iniciante' | 'especialista' | 'ideal'): DataPoint[] => {
  // Centro da distribuição varia por perfil
  let center, spread;
  switch (profile) {
    case 'iniciante':
      center = { cl: 90, compL: 0.6 };
      spread = { cl: 15, compL: 0.1 };
      break;
    case 'especialista':
      center = { cl: 70, compL: 0.8 };
      spread = { cl: 10, compL: 0.08 };
      break;
    case 'ideal':
      center = { cl: 80, compL: 0.7 };
      spread = { cl: 12, compL: 0.09 };
      break;
  }
  
  // Gerar pontos em torno do centro com dispersão controlada
  const points: DataPoint[] = [];
  const numPoints = 50;
  for (let i = 0; i < numPoints; i++) {
    // Box-Muller para gerar pontos com distribuição normal
    const u1 = Math.random();
    const u2 = Math.random();
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
    
    points.push({
      cl: center.cl + z1 * spread.cl,
      compL: Math.min(1, Math.max(0.3, center.compL + z2 * spread.compL))
    });
  }
  
  return points;
};

// Gerar dados para os três perfis
const inicianteData = generateProfileData('iniciante');
const especialistaData = generateProfileData('especialista');
const idealData = generateProfileData('ideal');
const allData: DataPoint[] = [...inicianteData, ...especialistaData, ...idealData];

// Extrair valores para KDE
const clValues = allData.map(d => d.cl);
const compLValues = allData.map(d => d.compL);

const CLCompLKDE: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<string>('all');
  
  // Filtrar dados com base no perfil selecionado
  const getProfileData = (): DataPoint[] => {
    switch (selectedProfile) {
      case 'iniciante':
        return inicianteData;
      case 'especialista':
        return especialistaData;
      case 'ideal':
        return idealData;
      default:
        return allData;
    }
  };
  
  const visibleData = getProfileData();
  
  // Traços para o gráfico KDE
  const kdeTrace = {
    type: 'histogram2dcontour',
    x: visibleData.map(d => d.cl),
    y: visibleData.map(d => d.compL),
    colorscale: 'Blues',
    reversescale: true,
    showscale: false,
    contours: {
      coloring: 'heatmap'
    },
    hoverinfo: 'none'
  };

  // Pontos de dispersão
  const scatterTrace = {
    type: 'scatter',
    x: visibleData.map(d => d.cl),
    y: visibleData.map(d => d.compL),
    mode: 'markers',
    marker: {
      color: selectedProfile === 'iniciante' ? 'rgba(255,100,100,0.5)' :
             selectedProfile === 'especialista' ? 'rgba(100,200,100,0.5)' :
             selectedProfile === 'ideal' ? 'rgba(100,100,255,0.5)' : 'rgba(150,150,150,0.5)',
      size: 5
    },
    name: selectedProfile === 'all' ? 'Todos os pontos' : `Perfil ${selectedProfile}`,
    hoverinfo: 'x+y',
    hovertemplate: 'CL: %{x:.1f}<br>CompL: %{y:.2f}<extra></extra>'
  };

  // Referências para os perfis
  const shapes = [
    {
      type: 'line',
      x0: 70,
      y0: 0.3,
      x1: 70,
      y1: 1,
      line: {
        color: 'green',
        width: 1,
        dash: 'dash'
      },
      name: 'Limite especialista'
    },
    {
      type: 'line',
      x0: 90,
      y0: 0.3,
      x1: 90,
      y1: 1,
      line: {
        color: 'red',
        width: 1,
        dash: 'dash'
      },
      name: 'Limite iniciante'
    }
  ];

  return (
    <div style={{ width: 320, height: 240 }}>
      <h4 className="text-center font-semibold mb-1 text-sm">Densidade CL-CompL (KDE)</h4>
      <div className="mb-1 flex justify-center">
        <select 
          value={selectedProfile}
          onChange={(e) => setSelectedProfile(e.target.value)}
          className="text-xs border rounded px-1"
        >
          <option value="all">Todos os perfis</option>
          <option value="iniciante">Iniciante</option>
          <option value="especialista">Especialista</option>
          <option value="ideal">Ponto Ideal (H3)</option>
        </select>
      </div>
      <Plot
        data={[kdeTrace, scatterTrace]}
        layout={{
          width: 320,
          height: 195,
          xaxis: {
            title: 'Carga Cognitiva (CL)',
            range: [40, 140],
            gridcolor: 'rgba(200,200,200,0.2)'
          },
          yaxis: {
            title: 'CompL',
            range: [0.3, 1],
            gridcolor: 'rgba(200,200,200,0.2)'
          },
          margin: { l: 45, r: 5, b: 40, t: 5 },
          font: { size: 9 },
          showlegend: false,
          shapes,
          annotations: [
            {
              x: 70,
              y: 0.35,
              xref: 'x',
              yref: 'y',
              text: 'Especialista',
              showarrow: false,
              font: { size: 8, color: 'green' }
            },
            {
              x: 90,
              y: 0.35,
              xref: 'x',
              yref: 'y',
              text: 'Iniciante',
              showarrow: false,
              font: { size: 8, color: 'red' }
            }
          ]
        }}
        config={{ displayModeBar: false }}
      />
    </div>
  );
};

export default CLCompLKDE;
