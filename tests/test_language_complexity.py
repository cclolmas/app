import sys
import os
import pandas as pd
import matplotlib.pyplot as plt
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import numpy as np
import textstat
import time

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class ComplexityMetrics:
    @staticmethod
    def calculate_metrics(text):
        """Calculate various complexity metrics for a given text."""
        results = {
            'flesch_reading_ease': textstat.flesch_reading_ease(text),
            'flesch_kincaid_grade': textstat.flesch_kincaid_grade(text),
            'gunning_fog': textstat.gunning_fog(text),
            'smog_index': textstat.smog_index(text),
            'automated_readability_index': textstat.automated_readability_index(text),
            'coleman_liau_index': textstat.coleman_liau_index(text),
            'dale_chall_readability_score': textstat.dale_chall_readability_score(text),
            'word_count': len(text.split())
        }
        return results

def generate_text(model, tokenizer, prompt, max_length=200):
    """Generate text using the specified model and tokenizer."""
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    start_time = time.time()
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_length=max_length,
            num_return_sequences=1,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
        )
    generation_time = time.time() - start_time
    
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return generated_text, generation_time

def test_model_complexity(model_name, prompts):
    """Test a model's language complexity across multiple prompts."""
    print(f"Testing model: {model_name}")
    results = []
    
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(
            model_name, 
            torch_dtype=torch.float16,
            device_map="auto"
        )
        
        for prompt in prompts:
            print(f"  Processing prompt: {prompt[:50]}...")
            generated_text, generation_time = generate_text(model, tokenizer, prompt)
            metrics = ComplexityMetrics.calculate_metrics(generated_text)
            metrics['model'] = model_name
            metrics['prompt'] = prompt
            metrics['generation_time'] = generation_time
            results.append(metrics)
            
    except Exception as e:
        print(f"Error testing model {model_name}: {e}")
    
    return results

def main():
    # List of models to test
    models = [
        "microsoft/phi-3-mini-4k-instruct",  # Small model (Phi-3-mini)
        "microsoft/phi-2",                   # Small model
        "meta-llama/Llama-2-7b-hf",          # Medium model
        "meta-llama/Llama-2-13b-hf"          # Large model
    ]
    
    # Prompts to test
    prompts = [
        "Explain the concept of climate change in simple terms.",
        "What are the key differences between renewable and non-renewable energy sources?",
        "Summarize the plot of Romeo and Juliet.",
        "Describe the process of photosynthesis in plants."
    ]
    
    all_results = []
    
    for model_name in models:
        model_results = test_model_complexity(model_name, prompts)
        all_results.extend(model_results)
    
    # Convert results to DataFrame
    df = pd.DataFrame(all_results)
    
    # Save results to CSV
    df.to_csv('model_complexity_results.csv', index=False)
    
    # Create visualizations
    plt.figure(figsize=(12, 8))
    
    # Group by model and calculate mean complexity scores
    model_avg = df.groupby('model').mean()
    
    # Plot Flesch Reading Ease (higher = simpler language)
    plt.subplot(2, 2, 1)
    model_avg['flesch_reading_ease'].plot(kind='bar')
    plt.title('Flesch Reading Ease by Model')
    plt.ylabel('Score (higher = easier)')
    plt.xticks(rotation=45)
    
    # Plot Gunning Fog (lower = simpler language)
    plt.subplot(2, 2, 2)
    model_avg['gunning_fog'].plot(kind='bar')
    plt.title('Gunning Fog Index by Model')
    plt.ylabel('Score (lower = easier)')
    plt.xticks(rotation=45)
    
    # Plot generation time
    plt.subplot(2, 2, 3)
    model_avg['generation_time'].plot(kind='bar')
    plt.title('Generation Time by Model')
    plt.ylabel('Time (seconds)')
    plt.xticks(rotation=45)
    
    # Plot word count
    plt.subplot(2, 2, 4)
    model_avg['word_count'].plot(kind='bar')
    plt.title('Word Count by Model')
    plt.ylabel('Count')
    plt.xticks(rotation=45)
    
    plt.tight_layout()
    plt.savefig('model_complexity_comparison.png')
    plt.close()
    
    print("Testing completed. Results saved to model_complexity_results.csv and model_complexity_comparison.png")

if __name__ == "__main__":
    main()
