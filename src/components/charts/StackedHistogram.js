import React from 'react';
import Plot from 'react-plotly.js';

const StackedHistogram = () => {
  // Generate some random data for the stacked histogram
  const generateNormalData = (n, mu, sigma) => {
    const data = [];
    for (let i = 0; i < n; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      data.push(mu + sigma * z);
    }
    return data;
  };

  const data1 = generateNormalData(500, 5, 1);
  const data2 = generateNormalData(500, 5, 1.2);
  const data3 = generateNormalData(500, 5, 1.5);

  return (
    <div className="chart-container">
      <h2>Distribuição de Escores por Categoria</h2>
      <Plot
        data={[
          {
            x: data1,
            type: 'histogram',
            name: 'Iniciante',
            opacity: 0.75,
            marker: {
              color: '#8884d8',
            },
          },
          {
            x: data2,
            type: 'histogram',
            name: 'Intermediário',
            opacity: 0.75,
            marker: {
              color: '#82ca9d',
            },
          },
          {
            x: data3,
            type: 'histogram',
            name: 'Avançado',
            opacity: 0.75,
            marker: {
              color: '#ffc658',
            },
          }
        ]}
        layout={{
          height: 300,
          width: '100%',
          margin: { l: 50, r: 50, b: 50, t: 50 },
          barmode: 'stack',
          xaxis: { title: 'Pontuação' },
          yaxis: { title: 'Frequência' }
        }}
        config={{ responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default StackedHistogram;
