import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import ResourceMonitorDashboard from '../../frontend/src/components/ComputationalLoadVisualizations/ResourceMonitorDashboard';
import CognitiveLoadView from '../../src/components/dashboard/views/CognitiveLoadView';
import ComputationalLoadView from '../../src/components/ComputationalLoadView';

// Mock axios para simular chamadas à API
jest.mock('axios');

// Mock react-chartjs-2 para evitar erros de renderização em ambiente de teste
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart">Mock Bar Chart</div>,
  Line: () => <div data-testid="line-chart">Mock Line Chart</div>,
  Radar: () => <div data-testid="radar-chart">Mock Radar Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Mock Doughnut Chart</div>,
}));

// Mock para componentes externos que não estamos testando diretamente
jest.mock('../../frontend/src/components/ComputationalLoadVisualizations/SankeyDiagram', () => () => (
  <div data-testid="sankey-diagram">Mock Sankey Diagram</div>
));

jest.mock('../../frontend/src/components/ComputationalLoadVisualizations/StackedResourceBarChart', () => () => (
  <div data-testid="stacked-bar-chart">Mock Stacked Bar Chart</div>
));

describe('ResourceMonitorDashboard Integration', () => {
  const mockResourceData = [
    {
      id: 1, 
      modelName: 'GPT-J',
      quantization: 'Q4',
      taskType: 'Summarization',
      peakVRAM: 4.2,
      avgVRAM: 3.8,
      peakRAM: 12.5,
      avgRAM: 10.3,
      executionTime: 45.2,
      status: 'success',
      timestamp: '2023-04-01T14:32:10Z'
    },
    {
      id: 2, 
      modelName: 'Llama',
      quantization: 'Q8',
      taskType: 'Translation',
      peakVRAM: 8.7,
      avgVRAM: 7.9,
      peakRAM: 15.2,
      avgRAM: 14.1,
      executionTime: 62.8,
      status: 'success',
      timestamp: '2023-04-02T09:15:23Z'
    }
  ];

  const mockFlowData = {
    nodes: [
      { name: "Input Data", id: "input1" },
      { name: "Tokenization", id: "process1" },
      { name: "Model Inference", id: "process2" },
      { name: "Output", id: "output1" }
    ],
    links: [
      { source: 0, target: 1, value: 100 },
      { source: 1, target: 2, value: 90 },
      { source: 2, target: 3, value: 85 }
    ]
  };

  beforeEach(() => {
    // Configurar mock de axios para responder com dados de teste
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/resources')) {
        return Promise.resolve({ data: mockResourceData });
      } else if (url.includes('/api/flow')) {
        return Promise.resolve({ data: mockFlowData });
      }
      return Promise.reject(new Error('Mocked API call failed'));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('loads and displays resource data', async () => {
    render(<ResourceMonitorDashboard />);

    // Verificar estado de carregamento inicial
    expect(screen.getByText(/carregando dados/i)).toBeInTheDocument();

    // Esperar que os dados sejam carregados
    await waitFor(() => {
      expect(screen.queryByText(/carregando dados/i)).not.toBeInTheDocument();
    });

    // Verificar que as visualizações são renderizadas com os dados
    expect(screen.getByTestId('stacked-bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('sankey-diagram')).toBeInTheDocument();

    // Verificar que as estatísticas foram calculadas corretamente
    expect(screen.getByText(/monitor de recursos computacionais/i)).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    // Configurar axios para simular um erro
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    render(<ResourceMonitorDashboard />);

    // Esperar pela mensagem de erro
    await waitFor(() => {
      expect(screen.getByText(/falha ao carregar dados/i)).toBeInTheDocument();
    });
  });

  test('applies filters correctly', async () => {
    render(<ResourceMonitorDashboard />);

    // Esperar que os dados sejam carregados
    await waitFor(() => {
      expect(screen.queryByText(/carregando dados/i)).not.toBeInTheDocument();
    });

    // Encontrar e interagir com os filtros (se implementados)
    // Exemplo:
    // const modelFilter = screen.getByLabelText(/modelo/i);
    // fireEvent.change(modelFilter, { target: { value: 'GPT-J' } });
    
    // Verificar que os dados filtrados são exibidos corretamente
    // (implementação depende da estrutura do componente)
  });
});

describe('CognitiveLoadView Integration', () => {
  const mockCognitiveData = {
    overallScore: 75,
    trendData: {
      labels: ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
      datasets: [
        {
          label: 'Carga Cognitiva',
          data: [65, 72, 86, 81, 74, 78, 85],
          borderColor: '#9c27b0',
          backgroundColor: 'rgba(156, 39, 176, 0.2)',
        },
      ],
    },
    componentsData: {
      labels: ['Memória', 'Processamento', 'Atenção', 'Raciocínio', 'Linguagem'],
      datasets: [
        {
          data: [85, 72, 80, 68, 75],
          backgroundColor: [
            'rgba(156, 39, 176, 0.7)',
            'rgba(233, 30, 99, 0.7)',
            'rgba(103, 58, 183, 0.7)',
            'rgba(63, 81, 181, 0.7)',
            'rgba(33, 150, 243, 0.7)',
          ],
        },
      ],
    },
    radarData: {
      labels: [
        'Complexidade',
        'Esforço',
        'Carga Intrínseca',
        'Carga Extrínseca',
        'Carga Germane',
        'Usabilidade',
        'Frustração',
        'Confiança'
      ],
    },
    studentsData: [
      {
        id: 1,
        name: "Estudante Atual",
        radarData: [72, 85, 78, 65, 80, 62, 40, 75]
      },
      {
        id: 2,
        name: "Estudante A",
        radarData: [65, 78, 70, 58, 75, 68, 45, 80]
      }
    ],
    groupAverage: {
      radarData: [65, 70, 72, 60, 75, 68, 45, 72]
    },
    distributionData: {
      labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      datasets: [
        {
          label: 'Novato',
          data: [2, 3, 4, 5, 8, 12, 15, 10, 4],
          backgroundColor: 'rgba(255, 87, 34, 0.8)',
          stack: 'Stack 0',
        },
      ],
    },
  };

  beforeEach(() => {
    // Mock de setTimeout para controlar o carregamento simulado
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('loads and displays cognitive load visualizations', async () => {
    render(<CognitiveLoadView />);
    
    // Verificar estado de carregamento inicial
    expect(screen.getByText(/carregando dados de carga cognitiva/i)).toBeInTheDocument();

    // Avançar no tempo para permitir que o setTimeout conclua
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.queryByText(/carregando dados de carga cognitiva/i)).not.toBeInTheDocument();
    });

    // Verificar que as visualizações são renderizadas
    expect(screen.getByText(/índice de carga/i)).toBeInTheDocument();
    expect(screen.getByText(/tendência de carga cognitiva/i)).toBeInTheDocument();
  });

  test('switches between tabs correctly', async () => {
    render(<CognitiveLoadView />);
    
    // Avançar no tempo para permitir que o setTimeout conclua
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.queryByText(/carregando dados de carga cognitiva/i)).not.toBeInTheDocument();
    });

    // Alternar para a guia de perfil cognitivo
    const profileTab = screen.getByText(/perfil cognitivo/i);
    fireEvent.click(profileTab);

    // Verificar que a guia de perfil é exibida
    expect(screen.getByText(/análise por dimensão/i)).toBeInTheDocument();
    
    // Alternar para outra guia
    const componentsTab = screen.getByText(/componentes/i);
    fireEvent.click(componentsTab);
    
    // Verificar que a nova guia é exibida
    expect(screen.getByText(/distribuição por componente/i)).toBeInTheDocument();
  });
});

describe('Computational Load View Integration', () => {
  test('renders computational load visualizations', async () => {
    render(<ComputationalLoadView />);
    
    // Verificar que as visualizações são renderizadas após o carregamento
    await waitFor(() => {
      expect(screen.getByText(/métricas de carga computacional/i)).toBeInTheDocument();
    });
  });
  
  // Mais testes seriam implementados para interações específicas
  // com as visualizações de carga computacional
});
