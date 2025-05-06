/**
 * Arquivo de dados mock para visualizações
 */

const mockData = {
  // Dados para Radar CL
  radarCL: {
    dimensions: ['Complexidade', 'Ambiguidade', 'Abstração', 'Novidade', 'Familiaridade'],
    values: [0.8, 0.65, 0.9, 0.7, 0.5]
  },
  
  // Dados para histograma de sobrecarga
  histogramOverload: {
    expertiseLevels: ['Iniciante', 'Intermediário', 'Avançado'],
    overloadValues: [
      [0.3, 0.5, 0.7, 0.8, 0.9, 0.85, 0.7, 0.5, 0.3],
      [0.2, 0.3, 0.5, 0.6, 0.7, 0.65, 0.5, 0.4, 0.2],
      [0.1, 0.2, 0.3, 0.4, 0.5, 0.45, 0.3, 0.2, 0.1]
    ],
    bins: Array.from({length: 9}, (_, i) => 0.1 + i * 0.1)
  },
  
  // Dados para barras de recursos
  barResources: {
    tasks: ['Geração', 'Debug', 'Refatoração', 'QA', 'Documentação', 'Otimização'],
    gpu: [85, 15, 25, 10, 5, 95], // Renamed from cpu, using original gpu values
    vram: [45, 25, 35, 15, 10, 60], // Renamed from memory, using original memory values
    ram: [65, 35, 45, 20, 15, 85]  // Renamed from gpu, using original cpu values
  },
  
  // Dados para Sankey
  sankeyFlow: {
    nodes: [
      {name: "Entrada"},
      {name: "Pré-processamento"},
      {name: "Modelo"},
      {name: "GPU"},
      {name: "CPU"},
      {name: "Memória"},
      {name: "Saída"}
    ],
    links: [
      {source: 0, target: 1, value: 20},
      {source: 1, target: 2, value: 15},
      {source: 1, target: 4, value: 5},
      {source: 2, target: 3, value: 10},
      {source: 2, target: 4, value: 3},
      {source: 2, target: 5, value: 2},
      {source: 3, target: 6, value: 10},
      {source: 4, target: 6, value: 8},
      {source: 5, target: 6, value: 2}
    ]
  },
  
  // Dados para violino CL-CompL
  violinCLCompL: {
    expertise: ['Iniciante', 'Intermediário', 'Avançado'],
    cl: [
      Array.from({length: 50}, () => Math.random() * 0.6 + 0.4),
      Array.from({length: 50}, () => Math.random() * 0.5 + 0.2),
      Array.from({length: 50}, () => Math.random() * 0.4 + 0.1)
    ],
    compl: [
      Array.from({length: 50}, () => Math.random() * 0.4 + 0.1),
      Array.from({length: 50}, () => Math.random() * 0.5 + 0.2),
      Array.from({length: 50}, () => Math.random() * 0.6 + 0.4)
    ]
  },
  
  // Dados para KDE CL-CompL
  kdeCLCompL: {
    cl: Array.from({length: 100}, () => Math.random()),
    compl: Array.from({length: 100}, () => Math.random())
  },
  
  // Dados para scatter precisão-compl
  scatterPrecisionCompL: {
    x: Array.from({length: 50}, () => Math.random()), // CompL
    y: Array.from({length: 50}, (_, i) => 0.3 + 0.6 * Math.exp(-((i/50) - 0.5) * ((i/50) - 0.5) / 0.05)), // Precisão
    size: Array.from({length: 50}, () => Math.random() * 15 + 5)
  }
};

// Export mockData para ser usado em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mockData };
} else {
  window.mockData = mockData;
}
