import React, { useState } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Placeholder data - replace with actual data fetching
const data = [
  { name: 'Tarefa A (Q4)', GPU: 40, VRAM: 12, RAM: 24, CL: 85, type: 'Q4' },
  { name: 'Tarefa A (Q8)', GPU: 30, VRAM: 20, RAM: 18, CL: 75, type: 'Q8' },
  { name: 'Tarefa B (Q4)', GPU: 20, VRAM: 15, RAM: 48, CL: 90, type: 'Q4' },
  { name: 'Tarefa B (Q8)', GPU: 15, VRAM: 25, RAM: 35, CL: 80, type: 'Q8' },
];

// Comparison highlight logic
const ComparisonInfo: React.FC<{ taskName: string }> = ({ taskName }) => {
  const baseTask = taskName.split(' (')[0]; // Extract base task name without Q4/Q8
  const q4 = data.find(d => d.name === `${baseTask} (Q4)`);
  const q8 = data.find(d => d.name === `${baseTask} (Q8)`);
  
  if (q4 && q8) {
    const vramDiff = q8.VRAM - q4.VRAM;
    const clDiff = q4.CL - q8.CL;
    
    return (
      <div className="text-xs bg-gray-50 p-1 rounded">
        <p><span className="font-semibold">VRAM:</span> {vramDiff > 0 ? 
          <span className="text-red-600">+{vramDiff}MB em Q8</span> : 
          <span className="text-green-600">{Math.abs(vramDiff)}MB economizada em Q4</span>}
        </p>
        <p><span className="font-semibold">CL:</span> {clDiff > 0 ? 
          <span className="text-orange-500">+{clDiff} CL adicional em Q4</span> : 
          <span className="text-blue-600">{Math.abs(clDiff)} CL reduzida em Q4</span>}
        </p>
      </div>
    );
  }
  return null;
};

const ResourceAllocationBar: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  
  return (
    <div style={{ width: 320, height: 240 }}>
      <h4 className="text-center font-semibold mb-1 text-sm">Alocação de Recursos (Barras)</h4>
      <ResponsiveContainer width="100%" height={selectedTask ? "70%" : "90%"}>
        <BarChart 
          data={data} 
          margin={{ top: 5, right: 10, left: 10, bottom: 40 }}
          onClick={(data) => data && data.activePayload ? setSelectedTask(data.activePayload[0].payload.name) : null}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 8 }} angle={-20} textAnchor="end" interval={0} height={40}/>
          <YAxis tick={{ fontSize: 8 }}/>
          <Tooltip 
            wrapperStyle={{ fontSize: '10px' }}
            formatter={(value, name) => [`${value} ${name === 'CL' ? '' : 'MB'}`, name]}
          />
          <Legend wrapperStyle={{ fontSize: '10px' }}/>
          <Bar dataKey="GPU" stackId="a" fill="#8884d8" />
          <Bar dataKey="VRAM" stackId="a" fill="#ffc658" />
          <Bar dataKey="RAM" stackId="a" fill="#82ca9d">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.type === 'Q4' ? '#82ca9d' : '#2ca9d8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {selectedTask && (
        <div className="mt-1 flex justify-center">
          <ComparisonInfo taskName={selectedTask} />
        </div>
      )}
      {!selectedTask && (
        <p className="text-xs text-center text-gray-500 mt-1">Clique em uma barra para ver a comparação Q4 vs. Q8</p>
      )}
    </div>
  );
};

export default ResourceAllocationBar;
