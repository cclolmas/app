import json
import csv
from typing import List, Dict, Any, Union, Optional
import matplotlib.pyplot as plt
import numpy as np

def load_references_and_hypotheses(filepath: str, format: str = 'json') -> tuple:
    """
    Load reference and hypothesis texts from file
    
    Args:
        filepath: Path to the file
        format: File format ('json', 'csv', or 'tsv')
        
    Returns:
        Tuple of (references, hypotheses)
    """
    if format == 'json':
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        references = data.get('references', [])
        hypotheses = data.get('hypotheses', [])
        
    elif format in ('csv', 'tsv'):
        delimiter = ',' if format == 'csv' else '\t'
        references = []
        hypotheses = []
        
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter=delimiter)
            for row in reader:
                if 'reference' in row and 'hypothesis' in row:
                    # Single reference per example
                    references.append([row['reference']])
                    hypotheses.append(row['hypothesis'])
                elif 'hypothesis' in row:
                    # Multiple references with column names like reference1, reference2, etc.
                    ref_cols = [col for col in row.keys() if col.startswith('reference')]
                    if ref_cols:
                        references.append([row[col] for col in ref_cols if row[col]])
                        hypotheses.append(row['hypothesis'])
    else:
        raise ValueError(f"Unsupported format: {format}")
    
    return references, hypotheses

def save_evaluation_results(results: Dict[str, Any], filepath: str, 
                           format: str = 'json') -> None:
    """
    Save evaluation results to file
    
    Args:
        results: Evaluation results
        filepath: Path to save the results
        format: File format ('json', 'csv', or 'tsv')
    """
    if format == 'json':
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2)
    
    elif format in ('csv', 'tsv'):
        delimiter = ',' if format == 'csv' else '\t'
        data = []
        
        for metric_name, score in results.items():
            if isinstance(score, dict):
                # For metrics that return multiple values (like ROUGE)
                for submetric, value in score.items():
                    data.append({
                        'metric': f"{metric_name}_{submetric}",
                        'score': value
                    })
            else:
                data.append({
                    'metric': metric_name,
                    'score': score
                })
        
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=['metric', 'score'], delimiter=delimiter)
            writer.writeheader()
            writer.writerows(data)

def compare_systems(system_results: Dict[str, Dict[str, float]], 
                   metrics: Optional[List[str]] = None,
                   output_file: Optional[str] = None) -> None:
    """
    Compare multiple systems based on evaluation results
    
    Args:
        system_results: Dictionary mapping system names to their evaluation results
        metrics: List of metrics to compare (if None, use all available)
        output_file: Path to save the visualization, or None for display
    """
    if not metrics:
        # Get all metrics that are present in at least one system
        all_metrics = set()
        for system_name, results in system_results.items():
            all_metrics.update(results.keys())
        metrics = sorted(list(all_metrics))
    
    # Prepare data for plotting
    systems = list(system_results.keys())
    x = np.arange(len(systems))
    width = 0.8 / len(metrics)
    
    plt.figure(figsize=(max(10, len(systems) * 2), 6))
    
    # Plot bars for each metric
    for i, metric in enumerate(metrics):
        values = []
        for system in systems:
            # Get the value, defaulting to 0 if not present
            if metric in system_results[system]:
                result = system_results[system][metric]
                if isinstance(result, dict) and 'f1' in result:  # For ROUGE-like metrics
                    values.append(result['f1'])
                else:
                    values.append(result)
            else:
                values.append(0)
        
        plt.bar(x + i*width - (len(metrics)-1)*width/2, values, width, label=metric)
    
    plt.xlabel('Systems')
    plt.ylabel('Score')
    plt.title('System Comparison by Metrics')
    plt.xticks(x, systems, rotation=45, ha='right')
    plt.legend(loc='upper left', bbox_to_anchor=(1, 1))
    plt.tight_layout()
    
    if output_file:
        plt.savefig(output_file)
    else:
        plt.show()
