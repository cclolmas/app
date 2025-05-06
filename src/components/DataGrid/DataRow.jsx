import React from 'react';

const DataRow = ({ data, onClick }) => {
  console.log(`Rendering row for item ${data.id}`); // Para demonstrar quando o componente renderiza
  
  return (
    <tr onClick={onClick}>
      {Object.values(data).map((value, index) => (
        <td key={index}>{typeof value === 'object' ? JSON.stringify(value) : value}</td>
      ))}
    </tr>
  );
};

// Memoizar o componente da linha para evitar re-renderizações quando os dados não mudarem
export default React.memo(DataRow, (prevProps, nextProps) => {
  // Comparação personalizada para melhor desempenho
  return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});
