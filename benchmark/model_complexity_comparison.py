import os
import time
import psutil
import gc
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

class ModelComplexityBenchmark:
    def __init__(self, model_names, device="cuda" if torch.cuda.is_available() else "cpu"):
        """
        Initialize benchmark for comparing single vs multi-model complexity
        
        Args:
            model_names: List of model names/paths to test
            device: Device to run models on (cuda/cpu)
        """
        self.model_names = model_names
        self.device = device
        self.results = {
            "single_model": {},
            "multi_model": {}
        }
        
    def _measure_resources(self, func):
        """Measure execution time and peak memory usage of a function"""
        # Clear memory before test
        gc.collect()
        torch.cuda.empty_cache() if torch.cuda.is_available() else None
        
        process = psutil.Process(os.getpid())
        start_mem = process.memory_info().rss / 1024 / 1024  # MB
        start_time = time.time()
        
        result = func()
        
        end_time = time.time()
        end_mem = process.memory_info().rss / 1024 / 1024  # MB
        
        return {
            "execution_time": end_time - start_time,
            "memory_increase": end_mem - start_mem,
            "result": result
        }
    
    def run_single_model(self, model_name, input_text, generate_params):
        """Run a single model task and measure performance"""
        
        def task():
            model = AutoModelForCausalLM.from_pretrained(model_name).to(self.device)
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            
            inputs = tokenizer(input_text, return_tensors="pt").to(self.device)
            output = model.generate(
                inputs["input_ids"], 
                **generate_params
            )
            
            response = tokenizer.decode(output[0], skip_special_tokens=True)
            return response
        
        return self._measure_resources(task)
    
    def run_multi_model(self, input_text, generate_params):
        """Run a multi-model task and measure performance"""
        
        def task():
            models = []
            tokenizers = []
            results = []
            
            # Load all models
            for model_name in self.model_names:
                model = AutoModelForCausalLM.from_pretrained(model_name).to(self.device)
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                models.append(model)
                tokenizers.append(tokenizer)
            
            # Execute on all models
            for i, model_name in enumerate(self.model_names):
                inputs = tokenizers[i](input_text, return_tensors="pt").to(self.device)
                output = models[i].generate(
                    inputs["input_ids"], 
                    **generate_params
                )
                response = tokenizers[i].decode(output[0], skip_special_tokens=True)
                results.append(response)
                
            return results
        
        return self._measure_resources(task)
    
    def benchmark(self, input_text, generate_params=None):
        """Run the complete benchmark comparing single vs. multi-model performance"""
        if generate_params is None:
            generate_params = {"max_new_tokens": 50}
            
        print("Running single model benchmarks...")
        for model_name in self.model_names:
            print(f"  Testing model: {model_name}")
            result = self.run_single_model(model_name, input_text, generate_params)
            self.results["single_model"][model_name] = result
            print(f"    Time: {result['execution_time']:.2f}s, Memory: {result['memory_increase']:.2f}MB")
        
        print("\nRunning multi-model benchmark...")
        result = self.run_multi_model(input_text, generate_params)
        self.results["multi_model"]["combined"] = result
        print(f"  Time: {result['execution_time']:.2f}s, Memory: {result['memory_increase']:.2f}MB")
        
        return self.results
    
    def analyze_results(self):
        """Analyze benchmark results to confirm complexity increase"""
        if not self.results["single_model"] or "combined" not in self.results["multi_model"]:
            raise ValueError("No benchmark results to analyze. Run benchmark() first.")
        
        # Calculate single model averages
        single_times = [res["execution_time"] for res in self.results["single_model"].values()]
        single_memory = [res["memory_increase"] for res in self.results["single_model"].values()]
        avg_single_time = sum(single_times) / len(single_times)
        avg_single_memory = sum(single_memory) / len(single_memory)
        max_single_time = max(single_times)
        max_single_memory = max(single_memory)
        
        # Get multi-model stats
        multi_time = self.results["multi_model"]["combined"]["execution_time"]
        multi_memory = self.results["multi_model"]["combined"]["memory_increase"]
        
        # Calculate ratios
        time_ratio_to_avg = multi_time / avg_single_time
        memory_ratio_to_avg = multi_memory / avg_single_memory
        time_ratio_to_max = multi_time / max_single_time
        memory_ratio_to_max = multi_memory / max_single_memory
        
        analysis = {
            "avg_single_model": {
                "time": avg_single_time,
                "memory": avg_single_memory
            },
            "max_single_model": {
                "time": max_single_time,
                "memory": max_single_memory
            },
            "multi_model": {
                "time": multi_time,
                "memory": multi_memory
            },
            "ratios": {
                "time_vs_avg": time_ratio_to_avg,
                "memory_vs_avg": memory_ratio_to_avg,
                "time_vs_max": time_ratio_to_max,
                "memory_vs_max": memory_ratio_to_max
            }
        }
        
        return analysis
    
    def plot_results(self, save_path=None):
        """Plot the benchmark results"""
        analysis = self.analyze_results()
        
        # Create figure with two subplots
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
        
        # Prepare data
        models = list(self.results["single_model"].keys()) + ["Multi-Model"]
        times = [res["execution_time"] for res in self.results["single_model"].values()]
        times.append(analysis["multi_model"]["time"])
        memory = [res["memory_increase"] for res in self.results["single_model"].values()]
        memory.append(analysis["multi_model"]["memory"])
        
        # Plot execution time
        ax1.bar(models, times)
        ax1.set_title("Execution Time Comparison")
        ax1.set_ylabel("Time (seconds)")
        ax1.tick_params(axis='x', rotation=45)
        
        # Plot memory usage
        ax2.bar(models, memory)
        ax2.set_title("Memory Usage Comparison")
        ax2.set_ylabel("Memory (MB)")
        ax2.tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path)
            print(f"Plot saved to {save_path}")
        else:
            plt.show()
            
        # Create a summary text
        summary = f"""
        Complexity Analysis Summary:
        ----------------------------
        Single Model Avg Time: {analysis['avg_single_model']['time']:.2f}s
        Single Model Max Time: {analysis['max_single_model']['time']:.2f}s
        Multi-Model Time:      {analysis['multi_model']['time']:.2f}s
        
        Single Model Avg Memory: {analysis['avg_single_model']['memory']:.2f}MB
        Single Model Max Memory: {analysis['max_single_model']['memory']:.2f}MB
        Multi-Model Memory:      {analysis['multi_model']['memory']:.2f}MB
        
        Time Ratio (Multi/Avg):  {analysis['ratios']['time_vs_avg']:.2f}x
        Memory Ratio (Multi/Avg): {analysis['ratios']['memory_vs_avg']:.2f}x
        
        Time Ratio (Multi/Max):  {analysis['ratios']['time_vs_max']:.2f}x
        Memory Ratio (Multi/Max): {analysis['ratios']['memory_vs_max']:.2f}x
        """
        
        print(summary)
        
        if save_path:
            summary_path = save_path.replace(".png", "_summary.txt")
            with open(summary_path, "w") as f:
                f.write(summary)
            print(f"Summary saved to {summary_path}")
            
        return summary


if __name__ == "__main__":
    # Example usage
    model_names = [
        "gpt2",  # Small model for testing
        "distilgpt2"  # Another small model for testing
    ]
    
    input_text = "Compare the economic impacts of climate change across different regions."
    
    benchmark = ModelComplexityBenchmark(model_names)
    results = benchmark.benchmark(input_text)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    save_path = f"./model_complexity_comparison_{timestamp}.png"
    
    benchmark.plot_results(save_path)
