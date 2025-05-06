export enum ExperimentType {
  FINE_TUNING = 'fine_tuning',
  LMAS = 'lmas'
}

export enum QuantizationType {
  Q4 = 'q4',
  Q5 = 'q5',
  Q8 = 'q8',
  FP16 = 'fp16'
}

export interface MetricPoint {
  timestamp: string;
  value: number;
}

// Métricas de desempenho computacional (CompL)
export interface CompLMetrics {
  vramUsage: MetricPoint[];
  ramUsage: MetricPoint[];
  cpuUsage: MetricPoint[];
  inferenceTime?: MetricPoint[];
  trainingTime?: MetricPoint[];
  powerConsumption?: MetricPoint[];
}

// Métricas de carga cognitiva (CL)
export interface CLMetrics {
  subjectiveRatings: {
    timestamp: string;
    value: number;
    notes?: string;
  }[];
  taskCompletionTime?: number;
  errorRate?: number;
}

// Métricas de qualidade do modelo/sistema
export interface QualityMetrics {
  accuracy?: number;
  perplexity?: number;
  loss?: MetricPoint[];
  validationLoss?: MetricPoint[];
  bleuScore?: number;
  rougeScore?: number;
  humanEvalScore?: number;
  otherMetrics?: Record<string, number>;
}

// Configuração específica para Fine-Tuning
export interface FineTuningConfig {
  baseModel: string;
  quantization: QuantizationType;
  learningRate: number;
  epochs: number;
  batchSize: number;
  loraRank: number;
  loraAlpha: number;
  maxLength: number;
  datasetName: string;
  datasetSize: number;
}

// Configuração específica para LMAS
export interface LMASConfig {
  agents: {
    name: string;
    model: string;
    quantization: QuantizationType;
    role: string;
    promptTokens?: number;
  }[];
  executionMode: 'sequential' | 'parallel';
  interactionPattern: string;
  maxTurns?: number;
  taskType: string;
}

// Interface principal para um experimento compartilhado
export interface SharedExperiment {
  id: string;
  title: string;
  type: ExperimentType;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  
  // Configuração específica do experimento
  config: FineTuningConfig | LMASConfig;
  
  // Métricas coletadas
  compLMetrics: CompLMetrics;
  clMetrics: CLMetrics;
  qualityMetrics: QualityMetrics;
  
  // Anotações e reflexões
  annotations: {
    id: string;
    userId: string;
    userName: string;
    timestamp: string;
    text: string;
    position?: { x: number, y: number }; // Posição para anotações em visualizações
    targetMetric?: string;
  }[];
  
  // Conclusões sobre trade-offs CL-CompL
  clCompLTradeoffs: {
    description: string;
    recommendation: string;
    rating: number; // 1-5: quão eficaz foi o equilíbrio encontrado
  };
  
  // Outros metadados
  tags: string[];
  hardwareSpecs: {
    gpu: string;
    vram: number;
    ram: number;
    cpu: string;
  };
  
  // Status e visibilidade
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'classroom';
  classroomId?: string;
}
