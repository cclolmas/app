/**
 * Mock data generator for cognitive-computational load relationship
 * In a real application, this would be replaced with actual student data
 */

// Generate random data with distributions that demonstrate the hypotheses
export const getMockClCompData = async () => {
  // Create base dataset
  const data = [];
  const sampleSize = 200;
  
  // Helper function for normal distribution
  const normalRandom = (mean, sd) => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * sd;
  };
  
  // Helper to bound values
  const bound = (value, min, max) => Math.max(min, Math.min(max, value));
  
  // Helper to create data clusters that support hypotheses
  const generateCluster = (n, expertiseLevel, taskType, options) => {
    const {
      quantization, 
      modelSize,
      executionTime,
      clMean,
      clSd,
      vramMean,
      vramSd,
      timeMean,
      timeSd,
      sizeMean,
      sizeSd
    } = options;
    
    for (let i = 0; i < n; i++) {
      const cl = bound(normalRandom(clMean, clSd), 1, 10);
      const vram = bound(normalRandom(vramMean, vramSd), 0.5, 24);
      const time = bound(normalRandom(timeMean, timeSd), 1, 100);
      const size = bound(normalRandom(sizeMean, sizeSd), 0.5, 70);
      
      data.push({
        id: `data-${data.length + 1}`,
        cognitiveLoad: cl,
        vramUsage: vram,
        executionTime: time,
        modelSize: size,
        expertiseLevel,
        taskType,
        quantization,
        modelSize,
        executionTime: executionTime
      });
    }
  };

  // Generate clusters for different expertise levels, tasks, and configurations
  
  // 1. Novice users - higher cognitive load across all computational loads (H1 and H4)
  // Q4 (High cognitive load due to instability - H1)
  generateCluster(30, 'novice', 'qlora', {
    quantization: 'q4',
    modelSize: 'medium',
    executionTime: 'medium',
    clMean: 8.2,
    clSd: 1.0,
    vramMean: 4.5,
    vramSd: 1.0,
    timeMean: 15,
    timeSd: 5,
    sizeMean: 7,
    sizeSd: 1
  });
  
  // Q8 (Better stability, moderate cognitive load - H3)
  generateCluster(30, 'novice', 'qlora', {
    quantization: 'q8',
    modelSize: 'medium',
    executionTime: 'medium',
    clMean: 6.5,
    clSd: 1.2,
    vramMean: 7.5,
    vramSd: 1.2,
    timeMean: 20,
    timeSd: 6,
    sizeMean: 7,
    sizeSd: 1
  });
  
  // FP16 (Higher computational load, high cognitive load due to complexity - H4)
  generateCluster(30, 'novice', 'qlora', {
    quantization: 'f16',
    modelSize: 'medium',
    executionTime: 'slow',
    clMean: 7.8,
    clSd: 1.1,
    vramMean: 14,
    vramSd: 2.0,
    timeMean: 35,
    timeSd: 8,
    sizeMean: 7,
    sizeSd: 1
  });
  
  // 2. Intermediate users - more balanced cognitive load
  // Q4 (Still elevated cognitive load - H1)
  generateCluster(30, 'intermediate', 'qlora', {
    quantization: 'q4',
    modelSize: 'medium',
    executionTime: 'medium',
    clMean: 7.0,
    clSd: 1.2,
    vramMean: 4.5,
    vramSd: 1.0,
    timeMean: 15,
    timeSd: 5,
    sizeMean: 7,
    sizeSd: 1
  });
  
  // Q8 (Optimal point - H3)
  generateCluster(30, 'intermediate', 'qlora', {
    quantization: 'q8',
    modelSize: 'medium',
    executionTime: 'medium',
    clMean: 5.0,
    clSd: 1.0,
    vramMean: 7.5,
    vramSd: 1.2,
    timeMean: 20,
    timeSd: 6,
    sizeMean: 7,
    sizeSd: 1
  });
  
  // FP16 (Higher computational resources, moderate cognitive load)
  generateCluster(30, 'intermediate', 'qlora', {
    quantization: 'f16',
    modelSize: 'medium',
    executionTime: 'slow',
    clMean: 6.0,
    clSd: 1.3,
    vramMean: 14,
    vramSd: 2.0,
    timeMean: 35,
    timeSd: 8,
    sizeMean: 7,
    sizeSd: 1
  });
  
  // 3. Advanced users - expertise reversal effect (H4)
  // Q4 (Lower cognitive load despite optimization - expertise handles instability better)
  generateCluster(30, 'advanced', 'qlora', {
    quantization: 'q4',
    modelSize: 'medium',
    executionTime: 'medium',
    clMean: 5.0,
    clSd: 1.1,
    vramMean: 4.5,
    vramSd: 1.0,
    timeMean: 15,
    timeSd: 5,
    sizeMean: 7,
    sizeSd: 1
  });
  
  // Q8 (Very low cognitive load - optimal efficiency)
  generateCluster(30, 'advanced', 'qlora', {
    quantization: 'q8',
    modelSize: 'medium',
    executionTime: 'medium',
    clMean: 3.5,
    clSd: 0.8,
    vramMean: 7.5,
    vramSd: 1.2,
    timeMean: 20,
    timeSd: 6,
    sizeMean: 7,
    sizeSd: 1
  });
  
  // FP16 (Higher cognitive load due to wasted resources - expertise reversal, H4)
  generateCluster(30, 'advanced', 'qlora', {
    quantization: 'f16',
    modelSize: 'medium',
    executionTime: 'slow',
    clMean: 4.5,
    clSd: 0.9,
    vramMean: 14,
    vramSd: 2.0,
    timeMean: 35,
    timeSd: 8,
    sizeMean: 7,
    sizeSd: 1
  });

  // Add some LMAS orchestration tasks
  // Novices with LMAS
  generateCluster(20, 'novice', 'lmas', {
    quantization: 'q4',
    modelSize: 'small',
    executionTime: 'fast',
    clMean: 8.5,
    clSd: 0.9,
    vramMean: 3.5,
    vramSd: 0.8,
    timeMean: 10,
    timeSd: 3,
    sizeMean: 3,
    sizeSd: 0.5
  });
  
  generateCluster(20, 'novice', 'lmas', {
    quantization: 'q8',
    modelSize: 'medium',
    executionTime: 'medium',
    clMean: 7.0,
    clSd: 1.0,
    vramMean: 9.0,
    vramSd: 1.5,
    timeMean: 25,
    timeSd: 7,
    sizeMean: 10,
    sizeSd: 2
  });
  
  // Advanced with LMAS
  generateCluster(20, 'advanced', 'lmas', {
    quantization: 'q4',
    modelSize: 'small',
    executionTime: 'fast',
    clMean: 4.0,
    clSd: 0.7,
    vramMean: 3.5,
    vramSd: 0.8,
    timeMean: 10,
    timeSd: 3,
    sizeMean: 3,
    sizeSd: 0.5
  });
  
  generateCluster(20, 'advanced', 'lmas', {
    quantization: 'q8',
    modelSize: 'medium',
    executionTime: 'medium',
    clMean: 5.5,
    clSd: 0.8,
    vramMean: 9.0,
    vramSd: 1.5,
    timeMean: 25,
    timeSd: 7,
    sizeMean: 10,
    sizeSd: 2
  });

  return data;
};
