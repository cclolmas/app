import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChartComponent from '../components/charts/ChartComponent';

// Mock Chart.js
jest.mock('chart.js/auto', () => {
  return class ChartMock {
    constructor(ctx, config) {
      this.type = config.type;
      this.data = config.data;
      this.options = config.options;
      this.destroyed = false;
    }

    destroy() {
      this.destroyed = true;
    }
  };
});

describe('ChartComponent', () => {
  const mockLineChartData = {
    labels: ['Janeiro', 'Fevereiro', 'Março'],
    datasets: [
      {
        label: 'Vendas',
        data: [12, 19, 3],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const mockEmptyData = {
    labels: [],
    datasets: [
      {
        label: 'Sem dados',
        data: [],
      },
    ],
  };

  const mockLargeDataset = {
    labels: Array(100).fill(0).map((_, i) => `Item ${i}`),
    datasets: [
      {
        label: 'Muitos Dados',
        data: Array(100).fill(0).map(() => Math.random() * 100),
      },
    ],
  };

  test('renderiza um gráfico de linha corretamente', () => {
    render(<ChartComponent type="line" data={mockLineChartData} />);
    expect(document.querySelector('canvas')).toBeInTheDocument();
  });

  test('renderiza um gráfico de barras corretamente', () => {
    render(<ChartComponent type="bar" data={mockLineChartData} />);
    expect(document.querySelector('canvas')).toBeInTheDocument();
  });

  test('lida com conjunto de dados vazio', () => {
    render(<ChartComponent type="line" data={mockEmptyData} />);
    expect(document.querySelector('canvas')).toBeInTheDocument();
    // O Chart.js vai renderizar um gráfico vazio, que é válido
  });

  test('lida com conjunto grande de dados', () => {
    render(<ChartComponent type="line" data={mockLargeDataset} />);
    expect(document.querySelector('canvas')).toBeInTheDocument();
  });
});
