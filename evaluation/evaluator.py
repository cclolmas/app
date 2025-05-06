import logging
import pandas as pd
import matplotlib.pyplot as plt
from typing import List, Dict, Union, Any, Optional
from .metrics import get_metric, EvaluationMetric

class TextQualityEvaluator:
    """
    Main class for evaluating text quality using various metrics
    """
    def __init__(self, metrics: Optional[List[str]] = None):
        """
        Initialize the evaluator with specified metrics
        
        Args:
            metrics: List of metric names to use for evaluation
        """
        self.logger = logging.getLogger(__name__)
        
        if metrics is None:
            # Default metrics
            metrics = ['bleu', 'rougeL']
        
        self.metrics = {}
        for metric_name in metrics:
            try:
                self.metrics[metric_name] = get_metric(metric_name)
            except ValueError as e:
                self.logger.warning(f"Failed to load metric {metric_name}: {e}")
    
    def add_metric(self, metric_name: str) -> None:
        """Add a metric to the evaluator"""
        if metric_name not in self.metrics:
            self.metrics[metric_name] = get_metric(metric_name)
            self.logger.info(f"Added metric: {metric_name}")
    
    def remove_metric(self, metric_name: str) -> None:
        """Remove a metric from the evaluator"""
        if metric_name in self.metrics:
            del self.metrics[metric_name]
            self.logger.info(f"Removed metric: {metric_name}")
    
    def evaluate(self, references: List[List[str]], hypotheses: List[str], 
                 **metric_kwargs) -> Dict[str, Any]:
        """
        Evaluate text quality using all configured metrics
        
        Args:
            references: List of reference texts (each item is a list of reference alternatives)
            hypotheses: List of generated texts to evaluate
            **metric_kwargs: Additional keyword arguments to pass to specific metrics
            
        Returns:
            Dictionary with metric names and their scores
        """
        if len(references) != len(hypotheses):
            raise ValueError(
                f"Number of references lists ({len(references)}) must match "
                f"number of hypotheses ({len(hypotheses)})"
            )
            
        results = {}
        for name, metric in self.metrics.items():
            self.logger.info(f"Computing {name} metric...")
            try:
                kwargs = metric_kwargs.get(name, {})
                score = metric.compute(references, hypotheses, **kwargs)
                results[name] = score
                self.logger.info(f"{name} score: {score}")
            except Exception as e:
                self.logger.error(f"Error computing {name} metric: {e}")
                results[name] = None
        
        return results
    
    def create_report(self, results: Dict[str, Any], 
                     output_format: str = 'dict') -> Union[Dict[str, Any], pd.DataFrame, str]:
        """
        Create a report from evaluation results
        
        Args:
            results: Evaluation results from evaluate()
            output_format: Format of the report ('dict', 'dataframe', 'html')
            
        Returns:
            Report in the specified format
        """
        if output_format == 'dict':
            return results
        
        elif output_format == 'dataframe':
            data = []
            for metric_name, score in results.items():
                if isinstance(score, dict):
                    # For metrics that return multiple values (like ROUGE)
                    for submetric, value in score.items():
                        data.append({
                            'Metric': f"{metric_name}_{submetric}",
                            'Score': value
                        })
                else:
                    data.append({
                        'Metric': metric_name,
                        'Score': score
                    })
            
            return pd.DataFrame(data)
        
        elif output_format == 'html':
            df = self.create_report(results, output_format='dataframe')
            return df.to_html()
        
        else:
            raise ValueError(f"Unsupported output format: {output_format}")
    
    def visualize(self, results: Dict[str, Any], 
                  output_file: Optional[str] = None) -> None:
        """
        Visualize evaluation results
        
        Args:
            results: Evaluation results from evaluate()
            output_file: Path to save the visualization, or None for display
        """
        df = self.create_report(results, output_format='dataframe')
        
        plt.figure(figsize=(10, 6))
        
        # Create bar chart
        ax = plt.subplot(111)
        df.plot.bar(x='Metric', y='Score', ax=ax)
        
        plt.title('Text Quality Evaluation Metrics')
        plt.xlabel('Metric')
        plt.ylabel('Score')
        plt.ylim(0, 1.1)  # Most metrics range from 0 to 1
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        if output_file:
            plt.savefig(output_file)
            self.logger.info(f"Visualization saved to {output_file}")
        else:
            plt.show()
