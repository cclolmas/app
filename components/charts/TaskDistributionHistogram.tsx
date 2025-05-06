import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Placeholder data - replace with actual data fetching and filtering logic
const dataLastHour = [
  { name: 'Debug', Iniciante: 40, Avançado: 24 },
  { name: 'Prompt Eng.', Iniciante: 30, Avançado: 13 },
  { name: 'Fine-Tuning', Iniciante: 20, Avançado: 48 },
];

const dataLastSession = [
  { name: 'Debug', Iniciante: 140, Avançado: 124 },
  { name: 'Prompt Eng.', Iniciante: 130, Avançado: 113 },
  { name: 'Fine-Tuning', Iniciante: 120, Avançado: 148 },
];

const TaskDistributionHistogram: React.FC = () => {
  const [period, setPeriod] = useState('lastHour');
  const [expertise, setExpertise] = useState('all'); // 'all', 'Iniciante', 'Avançado'

  const getData = () => {
    const sourceData = period === 'lastHour' ? dataLastHour : dataLastSession;
    if (expertise === 'all') {
      return sourceData;
    }
    // Simplified filter for demonstration - only shows selected expertise
    return sourceData.map(item => ({
      name: item.name,
      [expertise]: item[expertise],
    }));
  };

  const currentData = getData();

  return (
    <div style={{ width: 320, height: 240 }}>
       <h4 className="text-center font-semibold mb-1 text-sm">Distribuição de Tarefas (Histograma)</h4>
       <div className="flex justify-center space-x-2 mb-1 text-xs">
         <select value={period} onChange={(e) => setPeriod(e.target.value)} className="border rounded px-1">
           <option value="lastHour">Última Hora</option>
           <option value="lastSession">Última Sessão</option>
         </select>
         <select value={expertise} onChange={(e) => setExpertise(e.target.value)} className="border rounded px-1">
           <option value="all">Todos</option>
           <option value="Iniciante">Iniciante</option>
           <option value="Avançado">Avançado</option>
         </select>
       </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={currentData} margin={{ top: 5, right: 10, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fontSize: 8 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={40} />
          <Tooltip 
            wrapperStyle={{ fontSize: '10px' }}
            formatter={(value, name) => [`${value} tarefas`, `${name}`]}
            labelFormatter={(label) => `Categoria: ${label}`}
          />
          <Legend wrapperStyle={{ fontSize: '10px' }}/>
          {expertise !== 'Avançado' && <Bar dataKey="Iniciante" stackId="a" fill="#8884d8" />}
          {expertise !== 'Iniciante' && <Bar dataKey="Avançado" stackId="a" fill="#82ca9d" />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TaskDistributionHistogram;
