import React, { useState, useCallback } from 'react';
import { DataGrid } from '../components/DataGrid';
import useDataFetcher from '../hooks/useDataFetcher';

// Função de exemplo que simula busca de dados
const fetchMockData = async () => {
  // Simular atraso de rede
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Gerar dados aleatórios
  const items = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    value: Math.round(Math.random() * 100),
    timestamp: new Date().toISOString(),
    status: Math.random() > 0.5 ? 'active' : 'inactive',
  }));
  
  return items;
};

const DashboardExample = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Utilizando nosso hook personalizado para buscar dados
  const { 
    data, 
    loading, 
    error, 
    refetch, 
    cancel, 
    resume 
  } = useDataFetcher(fetchMockData, 10000);
  
  // Memoizar o manipulador de seleção de linha
  const handleRowSelect = useCallback((item) => {
    setSelectedItem(item);
  }, []);
  
  if (loading && data.length === 0) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div className="dashboard-container">
      <h1>Dashboard Example</h1>
      
      <div className="controls">
        <button onClick={refetch}>Refresh Now</button>
        <button onClick={cancel}>Pause Updates</button>
        <button onClick={resume}>Resume Updates</button>
      </div>
      
      {selectedItem && (
        <div className="selected-item">
          <h2>Selected: {selectedItem.name}</h2>
          <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
        </div>
      )}
      
      {data.length > 0 ? (
        <DataGrid 
          data={data} 
          onRowSelect={handleRowSelect}
          sortable={true} 
        />
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

// Não precisamos memoizar a página inteira, pois seus componentes filhos já são otimizados
export default DashboardExample;
