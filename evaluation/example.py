import sys
import os
import logging
from typing import List, Dict

# Add parent directory to path to enable imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from evaluation.evaluator import TextQualityEvaluator
from evaluation.utils import save_evaluation_results, compare_systems

def setup_logging():
    """Set up basic logging configuration"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[logging.StreamHandler()]
    )

def main():
    """Example of how to use the evaluation module"""
    setup_logging()
    
    # Sample data
    references = [
        ["The quick brown fox jumps over the lazy dog.", 
         "A swift brown fox leaps over the lazy dog."],
        ["The cat sat on the mat.", 
         "A cat was sitting on the mat."],
        ["Machine learning models require careful evaluation.",
         "Evaluation is crucial for machine learning models."]
    ]
    
    system1_hypotheses = [
        "The quick brown fox jumps over the lazy dog.",
        "The feline sat on the carpet.",
        "Machine learning requires thorough assessment."
    ]
    
    system2_hypotheses = [
        "A fast fox jumps over a dog.",
        "A cat sits on a mat.",
        "We need to carefully evaluate ML models."
    ]
    
    # Create evaluator with default metrics
    evaluator = TextQualityEvaluator(metrics=['bleu', 'rougeL', 'meteor'])
    
    # Evaluate system 1
    logging.info("Evaluating System 1...")
    system1_results = evaluator.evaluate(references, system1_hypotheses)
    
    # Evaluate system 2
    logging.info("Evaluating System 2...")
    system2_results = evaluator.evaluate(references, system2_hypotheses)
    
    # Create DataFrame report
    df_report = evaluator.create_report(system1_results, output_format='dataframe')
    print("\nSystem 1 Results:")
    print(df_report)
    
    # Save results to files
    save_evaluation_results(system1_results, 'system1_results.json')
    save_evaluation_results(system2_results, 'system2_results.json')
    
    # Compare systems
    compare_systems({
        'System 1': system1_results,
        'System 2': system2_results
    }, output_file='system_comparison.png')
    
    print("\nEvaluation complete! Results saved to JSON files and comparison plot.")

if __name__ == "__main__":
    main()
