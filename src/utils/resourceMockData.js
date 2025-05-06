/**
 * Mock data generator for resource visualization
 * In a real application, this would be replaced with actual resource monitoring data
 */

// Calculate VRAM usage based on model and quantization
const calculateVRAM = (model, quantization, batchSize, taskType, agents) => {
  // Base memory requirements in GB
  const baseMemory = {
    'phi-2': 2.5,
    'phi-3-mini': 3.8,
    'mistral-7b': 7,
    'gemma-7b': 7.2,
    'llama-13b': 13
  };
  
  // Quantization multipliers (approximate compression ratios)
  const quantMultiplier = {
    'f16': 1.0,    // No compression
    'q8': 0.5,     // 2:1 compression
    'q6': 0.375,   // 8:3 compression
    'q5': 0.3125,  // 16:5 compression
    'q4': 0.25,    // 4:1 compression
    'q3': 0.1875   // 16:3 compression
  };
  
  // Task type multipliers
  const taskMultiplier = {
    'inference': 1.0,
    'fine-tuning': 1.5,  // Needs more memory for gradients
    'lmas': 1.2          // Overhead for agent coordination
  };
  
  // Base VRAM calculation
  let vram = baseMemory[model] * quantMultiplier[quantization] * taskMultiplier[taskType];
  
  // Add batch size effect (non-linear scaling)
  vram *= (1 + Math.log2(batchSize) * 0.2);
  
  // For LMAS, multiply by number of agents (with diminishing returns)
  if (taskType === 'lmas') {
    vram *= (1 + (agents - 1) * 0.5);
  }
  
  return parseFloat(vram.toFixed(2));
};

// Calculate processing time based on configuration
const calculateProcessingTime = (model, quantization, batchSize, taskType, datasetSize) => {
  // Base processing times in seconds
  const baseTime = {
    'phi-2': 0.8,
    'phi-3-mini': 1.2,
    'mistral-7b': 1.5,
    'gemma-7b': 1.4,
    'llama-13b': 2.2
  };
  
  // Quantization speed factors (lower bits = faster inference but slower training)
  const quantSpeedFactor = {
    'f16': taskType === 'inference' ? 0.8 : 1.0,
    'q8': taskType === 'inference' ? 0.9 : 1.1,
    'q6': taskType === 'inference' ? 1.0 : 1.3,
    'q5': taskType === 'inference' ? 1.1 : 1.5,
    'q4': taskType === 'inference' ? 1.2 : 2.0,
    'q3': taskType === 'inference' ? 1.4 : 3.0
  };
  
  // Dataset size multipliers
  const sizeMultiplier = {
    'tiny': 1,
    'small': 10,
    'medium': 100,
    'large': 1000
  };
  
  // Task type time factors
  const taskTimeFactor = {
    'inference': 1,
    'fine-tuning': 15,
    'lmas': 5
  };
  
  // Base time calculation
  let time = baseTime[model] * quantSpeedFactor[quantization] * taskTimeFactor[taskType];
  
  // Scale by dataset size
  time *= sizeMultiplier[datasetSize];
  
  // Batch size improves throughput but with diminishing returns
  time /= Math.sqrt(batchSize);
  
  return parseFloat(time.toFixed(2));
};

// Calculate RAM usage
const calculateRAM = (model, taskType, datasetSize, batchSize) => {
  // Base RAM usage in GB
  const baseRAM = 2;
  
  // Dataset size factors
  const sizeFactors = {
    'tiny': 0.1,
    'small': 0.5,
    'medium': 2,
    'large': 8
  };
  
  // Task type factors
  const taskFactors = {
    'inference': 1,
    'fine-tuning': 2.5,
    'lmas': 1.8
  };
  
  // Calculate RAM
  let ram = baseRAM + sizeFactors[datasetSize] * taskFactors[taskType];
  
  // Add batch size effect
  ram *= (1 + batchSize * 0.05);
  
  return parseFloat(ram.toFixed(2));
};

// Calculate disk I/O
const calculateDiskIO = (datasetSize, taskType) => {
  // Base disk I/O in MB/s
  const baseDiskIO = {
    'tiny': 5,
    'small': 15,
    'medium': 40,
    'large': 100
  };
  
  // Task type multipliers
  const taskMultiplier = {
    'inference': 0.5,
    'fine-tuning': 1.2,
    'lmas': 0.8
  };
  
  return parseFloat((baseDiskIO[datasetSize] * taskMultiplier[taskType]).toFixed(2));
};

// Generate resource consumption data based on configuration
export const getResourceData = (config) => {
  // Extract configuration parameters
  const { model, quantization, batchSize, taskType, agents, datasetSize } = config;
  
  // Create a descriptive name for the configuration
  const configName = `${model.split('-')[0].charAt(0).toUpperCase() + model.split('-')[0].slice(1)} ${model.split('-')[1] || ''} ${quantization.toUpperCase()} ${taskType.replace('-', ' ')}`;
  
  // Calculate resource usages
  const vram = calculateVRAM(model, quantization, batchSize, taskType, agents);
  const processingTime = calculateProcessingTime(model, quantization, batchSize, taskType, datasetSize);
  const ram = calculateRAM(model, taskType, datasetSize, batchSize);
  const diskIO = calculateDiskIO(datasetSize, taskType);
  
  // Create the data entry
  const entry = {
    name: configName,
    config: { ...config },
    resources: {
      vram,
      processingTime,
      ram,
      diskIO
    }
  };
  
  // Generate some variations for the visualization
  return [
    entry,
    // Add some variations with slightly different configurations
    {
      name: `${configName} (Batch ${batchSize*2})`,
      config: { ...config, batchSize: batchSize * 2 },
      resources: {
        vram: calculateVRAM(model, quantization, batchSize * 2, taskType, agents),
        processingTime: calculateProcessingTime(model, quantization, batchSize * 2, taskType, datasetSize),
        ram: calculateRAM(model, taskType, datasetSize, batchSize * 2),
        diskIO: diskIO
      }
    },
    {
      name: `${configName} (Higher Quant)`,
      config: { 
        ...config, 
        quantization: quantization === 'q4' ? 'q8' : (quantization === 'q8' ? 'f16' : 'q8')
      },
      resources: {
        vram: calculateVRAM(
          model, 
          quantization === 'q4' ? 'q8' : (quantization === 'q8' ? 'f16' : 'q8'), 
          batchSize, 
          taskType, 
          agents
        ),
        processingTime: calculateProcessingTime(
          model, 
          quantization === 'q4' ? 'q8' : (quantization === 'q8' ? 'f16' : 'q8'),
          batchSize,
          taskType,
          datasetSize
        ),
        ram: ram,
        diskIO: diskIO
      }
    }
  ];
};

// Generate Sankey diagram data based on configuration
export const getFlowData = (config) => {
  // Extract configuration parameters
  const { model, quantization, batchSize, taskType, agents, datasetSize } = config;
  
  // Node categories
  const categories = {
    input: "Input Configuration",
    process: "Processing Step",
    resource: "Resource Usage",
    output: "Output"
  };
  
  // Calculate resource usages
  const vram = calculateVRAM(model, quantization, batchSize, taskType, agents);
  const processingTime = calculateProcessingTime(model, quantization, batchSize, taskType, datasetSize);
  const ram = calculateRAM(model, taskType, datasetSize, batchSize);
  
  // Create nodes based on task type
  let nodes = [
    // Input configuration nodes
    { id: "model", name: `Model: ${model}`, category: categories.input },
    { id: "quantization", name: `Quantization: ${quantization}`, category: categories.input },
    { id: "batch", name: `Batch Size: ${batchSize}`, category: categories.input },
    
    // Process nodes - common for all task types
    { id: "loadData", name: "Load Dataset", category: categories.process, time: "50-500ms", memory: `${(ram * 0.3).toFixed(1)} MB` },
    { id: "loadModel", name: "Load Model", category: categories.process, time: `${(vram * 200).toFixed(0)}ms`, memory: `${(vram * 1024).toFixed(0)} MB` },
    
    // Resource usage nodes
    { id: "vramUsage", name: `VRAM: ${vram} GB`, category: categories.resource },
    { id: "timeUsage", name: `Time: ${processingTime} s`, category: categories.resource },
    { id: "ramUsage", name: `RAM: ${ram} GB`, category: categories.resource },
    
    // Output node
    { id: "result", name: "Task Complete", category: categories.output }
  ];
  
  // Task-specific nodes
  if (taskType === 'fine-tuning') {
    nodes.push(
      { id: "prepareData", name: "Prepare Training Data", category: categories.process, time: `${(ram * 100).toFixed(0)}ms`, memory: `${(ram * 512).toFixed(0)} MB` },
      { id: "initOptimizer", name: "Initialize Optimizer", category: categories.process, time: "100-300ms", memory: `${(vram * 0.1 * 1024).toFixed(0)} MB` },
      { id: "training", name: "Training Loop", category: categories.process, time: `${(processingTime * 0.8).toFixed(1)}s`, memory: `${(vram * 0.9 * 1024).toFixed(0)} MB` },
      { id: "evaluation", name: "Model Evaluation", category: categories.process, time: `${(processingTime * 0.15).toFixed(1)}s`, memory: `${(vram * 0.7 * 1024).toFixed(0)} MB` },
      { id: "saveModel", name: "Save Model", category: categories.process, time: `${(processingTime * 0.05).toFixed(1)}s`, memory: `${(vram * 0.5 * 1024).toFixed(0)} MB` }
    );
  } else if (taskType === 'inference') {
    nodes.push(
      { id: "tokenize", name: "Tokenize Input", category: categories.process, time: "10-50ms", memory: "50-200 MB" },
      { id: "generate", name: "Generate Response", category: categories.process, time: `${(processingTime * 0.9).toFixed(1)}s`, memory: `${(vram * 0.95 * 1024).toFixed(0)} MB` },
      { id: "postprocess", name: "Post-process Output", category: categories.process, time: `${(processingTime * 0.1).toFixed(1)}s`, memory: "100-300 MB" }
    );
  } else if (taskType === 'lmas') {
    // LMAS (Language Model Agent System) nodes
    nodes.push(
      { id: "agentInit", name: `Initialize ${agents} Agents`, category: categories.process, time: `${(50 * agents).toFixed(0)}ms`, memory: `${(vram * 0.2 * 1024).toFixed(0)} MB` },
      { id: "planTask", name: "Task Planning", category: categories.process, time: `${(processingTime * 0.1).toFixed(1)}s`, memory: `${(ram * 0.3 * 1024).toFixed(0)} MB` },
      { id: "agentExecution", name: "Agent Execution", category: categories.process, time: `${(processingTime * 0.7).toFixed(1)}s`, memory: `${(vram * 0.9 * 1024).toFixed(0)} MB` },
      { id: "coordination", name: "Agent Coordination", category: categories.process, time: `${(processingTime * 0.1).toFixed(1)}s`, memory: `${(ram * 0.5 * 1024).toFixed(0)} MB` },
      { id: "resultMerging", name: "Result Merging", category: categories.process, time: `${(processingTime * 0.1).toFixed(1)}s`, memory: `${(ram * 0.2 * 1024).toFixed(0)} MB` }
    );
  }
  
  // Create links based on task type
  let links = [
    // Common initial links
    { source: "model", target: "loadModel", value: 10, unit: "steps" },
    { source: "quantization", target: "loadModel", value: 8, unit: "steps" },
    { source: "batch", target: "loadData", value: 6, unit: "steps" },
    { source: "loadModel", target: "vramUsage", value: vram * 5, unit: "GB" },
    { source: "loadData", target: "ramUsage", value: ram * 5, unit: "GB" }
  ];
  
  // Task-specific links
  if (taskType === 'fine-tuning') {
    links = [
      ...links,
      { source: "loadData", target: "prepareData", value: 8, unit: "steps" },
      { source: "loadModel", target: "initOptimizer", value: 10, unit: "steps" },
      { source: "prepareData", target: "training", value: 12, unit: "steps" },
      { source: "initOptimizer", target: "training", value: 10, unit: "steps" },
      { source: "training", target: "vramUsage", value: vram * 10, unit: "GB" },
      { source: "training", target: "timeUsage", value: processingTime * 5, unit: "s" },
      { source: "training", target: "evaluation", value: 8, unit: "steps" },
      { source: "evaluation", target: "saveModel", value: 6, unit: "steps" },
      { source: "saveModel", target: "result", value: 10, unit: "steps" },
    ];
  } else if (taskType === 'inference') {
    links = [
      ...links,
      { source: "loadData", target: "tokenize", value: 8, unit: "steps" },
      { source: "loadModel", target: "generate", value: 10, unit: "steps" },
      { source: "tokenize", target: "generate", value: 12, unit: "steps" },
      { source: "generate", target: "vramUsage", value: vram * 10, unit: "GB" },
      { source: "generate", target: "timeUsage", value: processingTime * 5, unit: "s" },
      { source: "generate", target: "postprocess", value: 8, unit: "steps" },
      { source: "postprocess", target: "result", value: 10, unit: "steps" },
    ];
  } else if (taskType === 'lmas') {
    links = [
      ...links,
      { source: "loadModel", target: "agentInit", value: 10, unit: "steps" },
      { source: "loadData", target: "planTask", value: 8, unit: "steps" },
      { source: "agentInit", target: "planTask", value: 6, unit: "steps" },
      { source: "planTask", target: "agentExecution", value: 12, unit: "steps" },
      { source: "agentExecution", target: "vramUsage", value: vram * 10, unit: "GB" },
      { source: "agentExecution", target: "timeUsage", value: processingTime * 5, unit: "s" },
      { source: "agentExecution", target: "coordination", value: 8, unit: "steps" },
      { source: "coordination", target: "resultMerging", value: 6, unit: "steps" },
      { source: "resultMerging", target: "result", value: 10, unit: "steps" },
    ];
  }
  
  return { nodes, links };
};
