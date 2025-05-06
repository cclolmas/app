"""
Q Model Tester - Utilities to test models with different quantization levels
"""
import os
import sys
import time
import logging
import numpy as np
from pathlib import Path
import json
from typing import Dict, List, Tuple, Optional, Union, Any

# Configure logging
logger = logging.getLogger(__name__)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Import local modules
try:
    from tests.quantization.stability_utils import compute_semantic_stability
except ImportError:
    logger.error("Cannot import stability_utils. Please check the module path.")
    compute_semantic_stability = lambda x, y: 0.0  # Fallback implementation

class ModelPerformanceMetrics:
    """Class to collect and store model performance metrics."""
    
    def __init__(self, model_name: str, quantization: str):
        self.model_name = model_name
        self.quantization = quantization
        self.inference_times = []
        self.memory_usage = []
        self.responses = []
        self.prompts = []
        
    def add_measurement(self, 
                        prompt: str, 
                        response: str, 
                        inference_time: float, 
                        memory_mb: float):
        """Add a single performance measurement."""
        self.prompts.append(prompt)
        self.responses.append(response)
        self.inference_times.append(inference_time)
        self.memory_usage.append(memory_mb)
        
    def get_avg_inference_time(self) -> float:
        """Return average inference time in seconds."""
        return np.mean(self.inference_times) if self.inference_times else 0.0
    
    def get_avg_memory_usage(self) -> float:
        """Return average memory usage in MB."""
        return np.mean(self.memory_usage) if self.memory_usage else 0.0
    
    def to_dict(self) -> Dict:
        """Convert metrics to dictionary."""
        return {
            "model_name": self.model_name,
            "quantization": self.quantization,
            "avg_inference_time": self.get_avg_inference_time(),
            "avg_memory_usage": self.get_avg_memory_usage(),
            "num_samples": len(self.prompts)
        }

class LlamaCppTester:
    """Test harness for llama.cpp based models."""
    
    def __init__(self, model_path: str, n_gpu_layers: int = 0, verbose: bool = False):
        """Initialize the tester with model path and configuration."""
        self.model_path = model_path
        self.n_gpu_layers = n_gpu_layers
        self.verbose = verbose
        self._model = None
        
    def load_model(self):
        """Load the model."""
        try:
            # Use dynamic import to handle potential missing dependencies
            import llama_cpp
            self._model = llama_cpp.Llama(
                model_path=self.model_path,
                n_gpu_layers=self.n_gpu_layers,
                verbose=self.verbose
            )
            logger.info(f"Model loaded from {self.model_path}")
            return True
        except ImportError:
            logger.error("llama_cpp module not found. Please install with 'pip install llama-cpp-python'")
            return False
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return False
    
    def generate(self, prompt: str, max_tokens: int = 100) -> Tuple[str, float]:
        """Generate a response for the given prompt and measure performance."""
        if not self._model:
            if not self.load_model():
                return "", 0.0
        
        start_time = time.time()
        try:
            response = self._model(
                prompt, 
                max_tokens=max_tokens, 
                echo=False
            )
            gen_text = response["choices"][0]["text"]
        except Exception as e:
            logger.error(f"Error during generation: {e}")
            gen_text = ""
        
        elapsed_time = time.time() - start_time
        return gen_text, elapsed_time
    
    def estimate_memory_usage(self) -> float:
        """Estimate memory usage in MB."""
        if not self._model:
            return 0.0
        # This is a placeholder. Actual memory measurement depends on implementation
        return 0.0  # Replace with actual measurement
    
    def cleanup(self):
        """Clean up resources."""
        self._model = None
        import gc
        gc.collect()
        logger.info("Model resources cleaned up")

def run_comparison_test(
    model_q4_path: str,
    model_q8_path: str,
    test_prompts: List[str],
    output_dir: str = "./results"
) -> Dict:
    """
    Run comparison test between Q4 and Q8 models.
    
    Args:
        model_q4_path: Path to Q4 quantized model
        model_q8_path: Path to Q8 quantized model
        test_prompts: List of prompts to test
        output_dir: Directory to save results
        
    Returns:
        Dictionary with test results
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Initialize metrics collectors
    q4_metrics = ModelPerformanceMetrics("llama", "q4")
    q8_metrics = ModelPerformanceMetrics("llama", "q8")
    
    # Initialize testers
    q4_tester = LlamaCppTester(model_q4_path)
    q8_tester = LlamaCppTester(model_q8_path)
    
    stability_scores = []
    
    # Run tests for each prompt
    for i, prompt in enumerate(test_prompts):
        logger.info(f"Testing prompt {i+1}/{len(test_prompts)}")
        
        # Test Q4 model
        q4_response, q4_time = q4_tester.generate(prompt)
        q4_memory = q4_tester.estimate_memory_usage()
        q4_metrics.add_measurement(prompt, q4_response, q4_time, q4_memory)
        
        # Test Q8 model
        q8_response, q8_time = q8_tester.generate(prompt)
        q8_memory = q8_tester.estimate_memory_usage()
        q8_metrics.add_measurement(prompt, q8_response, q8_time, q8_memory)
        
        # Calculate stability score between responses
        stability = compute_semantic_stability(q4_response, q8_response)
        stability_scores.append(stability)
        
        logger.info(f"Prompt {i+1} - Stability score: {stability:.4f}")
    
    # Clean up resources
    q4_tester.cleanup()
    q8_tester.cleanup()
    
    # Compile results
    results = {
        "q4_metrics": q4_metrics.to_dict(),
        "q8_metrics": q8_metrics.to_dict(),
        "stability_scores": stability_scores,
        "avg_stability": np.mean(stability_scores) if stability_scores else 0.0,
        "test_prompts": test_prompts
    }
    
    # Save results to file
    result_path = os.path.join(output_dir, "comparison_results.json")
    with open(result_path, "w") as f:
        json.dump(results, f, indent=2)
    
    logger.info(f"Test results saved to {result_path}")
    return results
