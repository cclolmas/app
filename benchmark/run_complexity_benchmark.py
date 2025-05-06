import os
import argparse
from model_complexity_comparison import ModelComplexityBenchmark
from datetime import datetime

def main():
    parser = argparse.ArgumentParser(description="Compare computational complexity of single vs multi-model execution")
    parser.add_argument("--models", nargs="+", default=["gpt2", "distilgpt2"],
                        help="List of models to benchmark")
    parser.add_argument("--prompt", type=str, 
                       default="Compare the economic impacts of climate change across different regions.",
                       help="Input prompt for the models")
    parser.add_argument("--max-tokens", type=int, default=50,
                       help="Maximum number of tokens to generate")
    parser.add_argument("--output-dir", type=str, default="./benchmark_results",
                       help="Directory to save results")
    
    args = parser.parse_args()
    
    # Create output directory if it doesn't exist
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Setup benchmark parameters
    generate_params = {
        "max_new_tokens": args.max_tokens,
        "do_sample": True,
        "temperature": 0.7
    }
    
    print(f"Starting benchmark with the following models: {', '.join(args.models)}")
    print(f"Prompt: {args.prompt}")
    
    # Initialize and run benchmark
    benchmark = ModelComplexityBenchmark(args.models)
    results = benchmark.benchmark(args.prompt, generate_params)
    
    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    save_path = os.path.join(args.output_dir, f"model_complexity_comparison_{timestamp}.png")
    
    summary = benchmark.plot_results(save_path)
    
    print(f"Benchmark completed. Results saved to {args.output_dir}")
    
if __name__ == "__main__":
    main()
