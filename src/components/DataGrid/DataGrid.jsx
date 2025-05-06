import React, { useState, useMemo, useCallback } from 'react';
import DataRow from './DataRow';
import './DataGrid.css';

const DataGrid = ({ data, onRowSelect, sortable = true }) => {
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Memoizar a função de ordenação para evitar recriá-la a cada renderização
  const handleSort = useCallback((field) => {
    setSortField(field);
    setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
  }, []);
  
  // Memoizar os dados ordenados para evitar recálculos desnecessários
  const sortedData = useMemo(() => {
    console.log('Sorting data...'); // Para demonstrar quando o cálculo ocorre
    
    if (!sortable) return data;
    
    return [...data].sort((a, b) => {
      if (a[sortField] < b[sortField]) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (a[sortField] > b[sortField]) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortField, sortDirection, sortable]);

  // Memoizar as estatísticas calculadas
  const statistics = useMemo(() => {
    console.log('Calculating statistics...'); // Para demonstrar quando o cálculo ocorre
    
    // Simulação de um cálculo pesado
    const sum = data.reduce((acc, item) => acc + (item.value || 0), 0);
    const avg = sum / (data.length || 1);
    return { count: data.length, sum, avg };
  }, [data]);

  return (
    <div className="data-grid">
      <div className="statistics">
        <p>Total Items: {statistics.count}</p>
        <p>Sum: {statistics.sum.toFixed(2)}</p>
        <p>Average: {statistics.avg.toFixed(2)}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            {Object.keys(data[0] || {}).map(key => (
              <th 
                key={key} 
                onClick={() => sortable && handleSort(key)}
                className={sortable ? 'sortable' : ''}
              >
                {key}
                {sortable && sortField === key && (
                  <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map(item => (
            <DataRow 
              key={item.id} 
              data={item} 
              onClick={() => onRowSelect(item)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Memoizar o componente inteiro para evitar re-renderizações quando as props não mudarem
export default React.memo(DataGrid);
