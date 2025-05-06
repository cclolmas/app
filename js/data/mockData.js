/**
 * Mock data generator for CL-CompL visualizations
 */
export function generateMockData() {
  return {
    // Radar chart data: Cognitive Load dimensions
    radarData: {
      dimensions: ['Subjective', 'Intrinsic', 'Extrinsic', 'Germanic'],
      values: [
        {name: 'Current', values: [0.8, 0.6, 0.9, 0.5], color: '#3498db'},
        {name: 'Optimal', values: [0.6, 0.7, 0.7, 0.6], color: '#2ecc71'}
      ],
      tooltips: [
        "CL Subjetiva: Percepção do usuário sobre dificuldade",
        "CL Intrínseca: Complexidade inerente à tarefa",
        "CL Extrínseca elevada: Redesenhe prompts",
        "CL Germânica: Consistência em múltiplos idiomas"
      ]
    },
    
    // Stacked histogram data: Cognitive tasks
    taskDistribution: {
      categories: ['Debug', 'Prompt Engineering', 'Fine-Tuning', 'Data Preparation'],
      series: [
        {name: 'Low CL', data: [20, 15, 5, 10], color: '#2ecc71'},
        {name: 'Medium CL', data: [15, 25, 15, 15], color: '#f39c12'},
        {name: 'High CL', data: [5, 10, 20, 5], color: '#e74c3c'}
      ],
      byPeriod: {
        hour: {/* similar structure as above but filtered */},
        session: {/* similar structure as above but filtered */}
      },
      byExpertise: {
        beginner: {/* similar structure as above but filtered */},
        advanced: {/* similar structure as above but filtered */}
      }
    },
    
    // Stacked bar chart data: Resource allocation
    resourceAllocation: {
      categories: ['Model Loading', 'Inference', 'Post-processing', 'Feedback Analysis'],
      series: [
        {name: 'GPU', data: [30, 50, 10, 5], color: '#3498db'},
        {name: 'RAM', data: [20, 15, 25, 15], color: '#9b59b6'},
        {name: 'VRAM', data: [10, 35, 5, 5], color: '#f1c40f'}
      ],
      comparison: {
        q4: [60, 100, 30, 25],
        q8: [120, 180, 40, 30]
      }
    },
    
    // Sankey diagram data: Computation flow
    computationFlow: {
      nodes: [
        {id: "input", name: "Input"},
        {id: "model", name: "Model"},
        {id: "output", name: "Output"},
        {id: "feedback", name: "Feedback"}
      ],
      links: [
        {source: "input", target: "model", value: 100},
        {source: "model", target: "output", value: 80},
        {source: "output", target: "feedback", value: 40},
        {source: "feedback", target: "input", value: 30}
      ]
    },
    
    // Violin plot data: CL vs CompL
    clCompLDistribution: [
      {group: "Q4 + LMAS", CL: Array(100).fill().map(() => Math.random() * 0.6 + 0.2), 
       CompL: Array(100).fill().map(() => Math.random() * 0.4 + 0.1)},
      {group: "Q8 Standard", CL: Array(100).fill().map(() => Math.random() * 0.4 + 0.1), 
       CompL: Array(100).fill().map(() => Math.random() * 0.8 + 0.1)}
    ],
    
    // KDE plot data: Density
    densityData: {
      // Generate synthetic data points for CL and CompL dimensions
      points: Array(200).fill().map(() => ({
        CL: Math.random() * 0.8 + 0.1,
        CompL: Math.random() * 0.8 + 0.1
      })),
      expertiseLevels: {
        beginner: {x: 0.6, y: 0.7},
        expert: {x: 0.4, y: 0.5}
      }
    },
    
    // Bars with Curve plot data: GGUF models
    ggufModelData: Array(50).fill().map(() => ({
      quantization: Math.random() * 8 + 2, // Q2 to Q10
      parameters: Math.random() * 100 + 5, // 5B to 105B
      cl: Math.random(),
      compL: Math.random() * 1.2,
      name: `Model ${Math.floor(Math.random() * 20)}`
    })),
    
    // Methods for filtering and transforming data
    filterTasksByPeriod(period) {
      return this.taskDistribution.byPeriod[period] || this.taskDistribution;
    },
    
    filterTasksByExpertise(expertise) {
      return this.taskDistribution.byExpertise[expertise] || this.taskDistribution;
    },
    
    simulateFlowWithBatchSize(batchSize) {
      const factor = batchSize / 8; // Normalize based on default batch size 8
      const newFlow = {
        nodes: this.computationFlow.nodes,
        links: [
          {source: "input", target: "model", value: 100 * factor},
          {source: "model", target: "output", value: 80 * factor},
          {source: "output", target: "feedback", value: 40},
          {source: "feedback", target: "input", value: 30}
        ]
      };
      return newFlow;
    }
  };
}
