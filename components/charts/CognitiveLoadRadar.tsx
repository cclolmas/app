import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Placeholder data - replace with actual data fetching
const data = [
  { subject: 'Subjetiva', A: 120, fullMark: 150 },
  { subject: 'Intrínseca', A: 98, fullMark: 150 },
  { subject: 'Extrínseca', A: 86, fullMark: 150 },
  { subject: 'Germânica', A: 99, fullMark: 150 },
];

// Custom Tooltip for hover details
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    let detail = '';
    switch (data.subject) {
      case 'Extrínseca':
        detail = data.A > 100 ? 'CL Extrínseca elevada: Redesenhe prompts.' : 'CL Extrínseca normal.';
        break;
      case 'Intrínseca':
        detail = data.A > 110 ? 'CL Intrínseca elevada: Simplifique a tarefa.' : 'CL Intrínseca aceitável.';
        break;
      case 'Subjetiva':
        detail = data.A > 110 ? 'CL Subjetiva elevada: Verifique adaptação do usuário.' : 'Percepção de esforço normal.';
        break;
      case 'Germânica':
        detail = data.A > 90 ? 'CL Germânica elevada: Revise requisitos de memória.' : 'CL Germânica sob controle.';
        break;
      default:
        detail = `Valor: ${payload[0].value}`;
    }
    return (
      <div className="bg-white p-2 border rounded shadow text-sm">
        <p className="font-bold">{data.subject}</p>
        <p>{detail}</p>
      </div>
    );
  }
  return null;
};


const CognitiveLoadRadar: React.FC = () => {
  return (
    <div style={{ width: 320, height: 240 }}>
      <h4 className="text-center font-semibold mb-1 text-sm">Carga Cognitiva (Radar)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fontSize: 8 }}/>
          <Radar name="CL" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Tooltip content={<CustomTooltip />} />
          {/* <Legend wrapperStyle={{ fontSize: '10px' }} /> */}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CognitiveLoadRadar;
