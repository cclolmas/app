import React, { useState } from 'react';
import ChartComponent from '../components/charts/ChartComponent';
import CounterIndicator from '../components/indicators/CounterIndicator';
import DataTable from '../components/indicators/DataTable';
import './ChartsDemo.css';

const ChartsDemo = () => {
  const [dataSize, setDataSize] = useState('normal'); // 'normal', 'empty', 'large'

  // Dados de exemplo
  const dataSets = {
    normal: {
      lineChart: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [
          {
            label: 'Participantes',
            data: [45, 59, 80, 81, 56, 55],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            fill: false,
          },
        ],
      },
      barChart: {
        labels: ['2019', '2020', '2021', '2022', '2023'],
        datasets: [
          {
            label: 'Debates',
            data: [12, 19, 15, 25, 32],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
          },
        ],
      },
      tableData: {
        headers: ['Evento', 'Participantes', 'Avaliação'],
        data: [
          ['Debate Regional', '24', '4.7/5.0'],
          ['Conferência Nacional', '56', '4.2/5.0'],
          ['Competição Universitária', '32', '4.9/5.0'],
        ],
      },
      counters: [
        { value: 254, label: 'Participantes', color: '#3498db' },
        { value: 42, label: 'Eventos', color: '#2ecc71' },
        { value: 18, label: 'Instituições', color: '#9b59b6' },
      ],
    },
    empty: {
      lineChart: {
        labels: [],
        datasets: [{ label: 'Sem dados', data: [], borderColor: 'rgb(75, 192, 192)' }],
      },
      barChart: {
        labels: [],
        datasets: [{ label: 'Sem dados', data: [], backgroundColor: 'rgba(54, 162, 235, 0.5)' }],
      },
      tableData: {
        headers: ['Evento', 'Participantes', 'Avaliação'],
        data: [],
      },
      counters: [
        { value: 0, label: 'Participantes', color: '#3498db' },
        { value: 'N/A', label: 'Eventos', color: '#2ecc71' },
        { value: '-', label: 'Instituições', color: '#9b59b6' },
      ],
    },
    large: {
      lineChart: {
        labels: Array(50).fill(0).map((_, i) => `Dia ${i+1}`),
        datasets: [
          {
            label: 'Atividades',
            data: Array(50).fill(0).map(() => Math.floor(Math.random() * 100)),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            fill: false,
          },
        ],
      },
      barChart: {
        labels: Array(30).fill(0).map((_, i) => `Região ${i+1}`),
        datasets: [
          {
            label: 'Participantes',
            data: Array(30).fill(0).map(() => Math.floor(Math.random() * 500)),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
          },
        ],
      },
      tableData: {
        headers: ['ID', 'Evento', 'Local', 'Data', 'Participantes', 'Avaliação'],
        data: Array(30).fill(0).map((_, i) => [
          `#${i+1000}`,
          `Evento ${i+1}`,
          `Cidade ${i % 10 + 1}`,
          `${Math.floor(Math.random() * 28) + 1}/0${Math.floor(Math.random() * 9) + 1}/2023`,
          `${Math.floor(Math.random() * 100) + 10}`,
          `${(Math.random() * 5).toFixed(1)}/5.0`,
        ]),
      },
      counters: [
        { value: 12458, label: 'Participantes', color: '#3498db' },
        { value: 1024, label: 'Eventos', color: '#2ecc71' },
        { value: 345, label: 'Instituições', color: '#9b59b6' },
      ],
    },
  };

  const currentData = dataSets[dataSize];

  return (
    <div className="charts-demo-container">
      <h1>Demonstração de Gráficos e Indicadores</h1>
      
      <div className="controls">
        <label>Cenário de Dados: </label>
        <select 
          value={dataSize} 
          onChange={(e) => setDataSize(e.target.value)}
        >
          <option value="normal">Normal</option>
          <option value="empty">Vazio</option>
          <option value="large">Grande Volume</option>
        </select>
      </div>
      
      <div className="charts-section">
        <h2>Gráficos</h2>
        <div className="chart-container">
          <h3>Gráfico de Linha</h3>
          <ChartComponent type="line" data={currentData.lineChart} height="300px" />
        </div>
        
        <div className="chart-container">
          <h3>Gráfico de Barras</h3>
          <ChartComponent type="bar" data={currentData.barChart} height="300px" />
        </div>
      </div>
      
      <div className="indicators-section">
        <h2>Indicadores Numéricos</h2>
        
        <div className="counters-grid">
          {currentData.counters.map((counter, index) => (
            <div key={index} className="counter-card">
              <CounterIndicator
                value={counter.value}
                label={counter.label}
                color={counter.color}
              />
            </div>
          ))}
        </div>
        
        <div className="table-section">
          <h3>Tabela de Dados</h3>
          <DataTable
            headers={currentData.tableData.headers}
            data={currentData.tableData.data}
            caption="Estatísticas de Eventos"
          />
        </div>
      </div>
    </div>
  );
};

export default ChartsDemo;
