import numpy as np
import torch
import logging
from typing import List, Dict, Any, Union

logger = logging.getLogger("CompLTracker")

class CompLTracker:
    """
    Class for tracking and comparing CompL (Computational Loss) metrics
    between different quantization levels.
    """
    
    def __init__(self):
        self.q4_history = []
        self.q8_history = []
    
    def calculate_compl(self, model: Any, inputs: Dict[str, torch.Tensor]) -> float:
        """
        Calculate the CompL (Computational Loss) metric for a given model and inputs.
        
        This is a simplified implementation - replace with your actual CompL calculation.
        CompL could involve measuring how much information is lost due to quantization
        by comparing original and quantized activations/weights.
        """
        # Placeholder implementation - replace with your actual CompL calculation
        try:
            # Example approach: Sample some weights and compare their dynamic range
            sample_size = 1000
            total_compl = 0.0
            param_count = 0
            
            with torch.no_grad():
                for name, param in model.named_parameters():
                    if param.requires_grad and param.numel() > 0:
                        # Sample parameters
                        flat_param = param.view(-1)
                        indices = torch.randint(0, flat_param.numel(), (min(sample_size, flat_param.numel()),))
                        sampled = flat_param[indices].float().cpu().numpy()
                        
                        # Compute a simple metric based on the parameter distribution
                        # For example: normalized entropy or dynamic range utilization
                        if len(sampled) > 0:
                            # Normalized histogram for entropy calculation
                            hist, _ = np.histogram(sampled, bins=20)
                            hist = hist / hist.sum() if hist.sum() > 0 else hist
                            
                            # Calculate entropy
                            entropy = -np.sum(np.where(hist > 0, hist * np.log2(hist), 0))
                            dynamic_range = np.max(sampled) - np.min(sampled) if len(sampled) > 0 else 0
                            
                            # Combine metrics
                            param_compl = entropy * dynamic_range
                            total_compl += param_compl
                            param_count += 1
            
            avg_compl = total_compl / param_count if param_count > 0 else 0
            return avg_compl
            
        except Exception as e:
            logger.error(f"Error calculating CompL: {e}")
            return 0.0
    
    def calculate_difference(self, q4_compl: List[float], q8_compl: List[float]) -> float:
        """
        Calculate the difference between Q4 and Q8 CompL values.
        Returns the average difference across all provided values.
        """
        if len(q4_compl) != len(q8_compl):
            logger.warning("CompL lists have different lengths")
            min_len = min(len(q4_compl), len(q8_compl))
            q4_compl = q4_compl[:min_len]
            q8_compl = q8_compl[:min_len]
        
        # Store history
        self.q4_history.extend(q4_compl)
        self.q8_history.extend(q8_compl)
        
        # Calculate average difference
        differences = [q8 - q4 for q4, q8 in zip(q4_compl, q8_compl)]
        return sum(differences) / len(differences) if differences else 0.0
    
    def get_summary_statistics(self) -> Dict[str, Any]:
        """
        Get summary statistics for all recorded CompL values.
        """
        q4_array = np.array(self.q4_history)
        q8_array = np.array(self.q8_history)
        
        if len(q4_array) == 0 or len(q8_array) == 0:
            return {
                "error": "No CompL data available"
            }
        
        # Calculate differences
        min_len = min(len(q4_array), len(q8_array))
        differences = q8_array[:min_len] - q4_array[:min_len]
        
        return {
            "q4_mean": float(np.mean(q4_array)),
            "q4_std": float(np.std(q4_array)),
            "q4_min": float(np.min(q4_array)),
            "q4_max": float(np.max(q4_array)),
            
            "q8_mean": float(np.mean(q8_array)),
            "q8_std": float(np.std(q8_array)),
            "q8_min": float(np.min(q8_array)),
            "q8_max": float(np.max(q8_array)),
            
            "diff_mean": float(np.mean(differences)),
            "diff_std": float(np.std(differences)),
            "diff_min": float(np.min(differences)),
            "diff_max": float(np.max(differences)),
            
            "sample_count": min_len
        }
