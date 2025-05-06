import numpy as np
import nltk
from nltk.translate.bleu_score import sentence_bleu, corpus_bleu, SmoothingFunction
from nltk.translate.meteor_score import meteor_score
import torch
from collections import Counter
from typing import List, Union, Dict, Any, Optional

class EvaluationMetric:
    """Base class for text evaluation metrics"""
    def __init__(self, name: str):
        self.name = name
    
    def compute(self, references: List[str], hypotheses: List[str], **kwargs) -> float:
        """Compute the metric between references and hypotheses"""
        raise NotImplementedError("Subclasses must implement this method")
    
    def __call__(self, references: List[str], hypotheses: List[str], **kwargs) -> float:
        return self.compute(references, hypotheses, **kwargs)


class BLEUMetric(EvaluationMetric):
    """BLEU (Bilingual Evaluation Understudy) score implementation"""
    
    def __init__(self, weights: List[float] = None, smoothing_method: str = 'method1'):
        super().__init__(name="BLEU")
        # Default: equal weights for 1-grams through 4-grams
        self.weights = weights or [0.25, 0.25, 0.25, 0.25]
        self.smoothing_function = getattr(SmoothingFunction(), smoothing_method)
        
        # Ensure NLTK resources are available
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
    
    def compute(self, references: List[List[str]], hypotheses: List[str], 
                tokenize: bool = True) -> float:
        """
        Compute BLEU score
        
        Args:
            references: List of reference translations (each reference is a list of tokens or a string)
            hypotheses: List of hypothesis translations (each hypothesis is a string)
            tokenize: Whether to tokenize the inputs if they are strings
        
        Returns:
            BLEU score
        """
        if tokenize:
            # Tokenize strings if needed
            tokenized_refs = [[nltk.word_tokenize(ref) for ref in refs] 
                             for refs in references]
            tokenized_hyps = [nltk.word_tokenize(hyp) for hyp in hypotheses]
        else:
            tokenized_refs = references
            tokenized_hyps = hypotheses
        
        try:
            return corpus_bleu(
                tokenized_refs,
                tokenized_hyps,
                weights=self.weights,
                smoothing_function=self.smoothing_function
            )
        except ZeroDivisionError:
            # Handle edge cases where no n-grams match
            return 0.0


class PerplexityMetric(EvaluationMetric):
    """Perplexity metric for evaluating language models"""
    
    def __init__(self, model=None, tokenizer=None):
        super().__init__(name="Perplexity")
        self.model = model
        self.tokenizer = tokenizer
    
    def compute(self, references: List[str], hypotheses: List[str], 
                model=None, tokenizer=None) -> float:
        """
        Compute average perplexity score for generated text
        
        Args:
            references: List of reference texts (unused in perplexity, kept for API consistency)
            hypotheses: List of generated texts to evaluate
            model: Language model (defaults to instance model if provided)
            tokenizer: Tokenizer for the model (defaults to instance tokenizer if provided)
        
        Returns:
            Average perplexity score (lower is better)
        """
        model = model or self.model
        tokenizer = tokenizer or self.tokenizer
        
        if model is None or tokenizer is None:
            raise ValueError("Model and tokenizer must be provided")
        
        total_perplexity = 0.0
        
        with torch.no_grad():
            for hyp in hypotheses:
                inputs = tokenizer(hyp, return_tensors="pt")
                outputs = model(**inputs, labels=inputs["input_ids"])
                total_perplexity += torch.exp(outputs.loss).item()
        
        return total_perplexity / len(hypotheses)


class METEORMetric(EvaluationMetric):
    """METEOR (Metric for Evaluation of Translation with Explicit ORdering) score implementation"""
    
    def __init__(self):
        super().__init__(name="METEOR")
        # Ensure NLTK resources are available
        try:
            nltk.data.find('wordnet')
        except LookupError:
            nltk.download('wordnet')
    
    def compute(self, references: List[List[str]], hypotheses: List[str], 
                tokenize: bool = True) -> float:
        """
        Compute METEOR score
        
        Args:
            references: List of reference translations (each reference is a list of tokens or a string)
            hypotheses: List of hypothesis translations (each hypothesis is a string)
            tokenize: Whether to tokenize the inputs if they are strings
        
        Returns:
            Average METEOR score
        """
        scores = []
        
        for i, hyp in enumerate(hypotheses):
            refs = references[i]
            
            if tokenize:
                hyp_tokens = nltk.word_tokenize(hyp)
                ref_tokens = [nltk.word_tokenize(ref) for ref in refs]
            else:
                hyp_tokens = hyp
                ref_tokens = refs
            
            score = meteor_score(ref_tokens, hyp_tokens)
            scores.append(score)
        
        return sum(scores) / len(scores)


class ROUGEMetric(EvaluationMetric):
    """ROUGE (Recall-Oriented Understudy for Gisting Evaluation) score implementation"""
    
    def __init__(self, rouge_type: str = 'L'):
        """
        Initialize ROUGE metric
        
        Args:
            rouge_type: Type of ROUGE metric ('1', '2', 'L')
        """
        super().__init__(name=f"ROUGE-{rouge_type}")
        self.rouge_type = rouge_type
    
    def _compute_ngrams(self, text, n):
        """Compute n-grams from text"""
        tokens = text.split() if isinstance(text, str) else text
        return Counter([tuple(tokens[i:i+n]) for i in range(len(tokens) - n + 1)])
    
    def _compute_lcs(self, seq1, seq2):
        """Compute Longest Common Subsequence"""
        if isinstance(seq1, str):
            seq1 = seq1.split()
        if isinstance(seq2, str):
            seq2 = seq2.split()
            
        m, n = len(seq1), len(seq2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if seq1[i-1] == seq2[j-1]:
                    dp[i][j] = dp[i-1][j-1] + 1
                else:
                    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
        
        return dp[m][n]
    
    def compute(self, references: List[List[str]], hypotheses: List[str], 
                beta: float = 1.0) -> Dict[str, float]:
        """
        Compute ROUGE score
        
        Args:
            references: List of reference texts
            hypotheses: List of hypothesis texts
            beta: Balance between recall and precision (F-measure parameter)
            
        Returns:
            Dictionary with precision, recall, and F-score
        """
        precisions, recalls = [], []
        
        for i, hyp in enumerate(hypotheses):
            # Use the best scoring reference
            max_f = 0
            
            for ref in references[i]:
                if self.rouge_type in ['1', '2']:
                    n = int(self.rouge_type)
                    hyp_ngrams = self._compute_ngrams(hyp, n)
                    ref_ngrams = self._compute_ngrams(ref, n)
                    
                    overlap = sum((hyp_ngrams & ref_ngrams).values())
                    precision = overlap / (sum(hyp_ngrams.values()) or 1)
                    recall = overlap / (sum(ref_ngrams.values()) or 1)
                else:  # ROUGE-L
                    lcs_length = self._compute_lcs(hyp, ref)
                    hyp_len = len(hyp.split() if isinstance(hyp, str) else hyp)
                    ref_len = len(ref.split() if isinstance(ref, str) else ref)
                    
                    precision = lcs_length / (hyp_len or 1)
                    recall = lcs_length / (ref_len or 1)
                
                if precision + recall > 0:
                    f_score = (1 + beta**2) * (precision * recall) / ((beta**2 * precision) + recall)
                else:
                    f_score = 0
                    
                if f_score > max_f:
                    max_precision, max_recall, max_f = precision, recall, f_score
            
            precisions.append(max_precision)
            recalls.append(max_recall)
        
        avg_precision = sum(precisions) / len(precisions)
        avg_recall = sum(recalls) / len(recalls)
        
        if avg_precision + avg_recall > 0:
            avg_f = (1 + beta**2) * (avg_precision * avg_recall) / ((beta**2 * avg_precision) + avg_recall)
        else:
            avg_f = 0
        
        return {
            'precision': avg_precision,
            'recall': avg_recall,
            'f1': avg_f
        }


def get_metric(metric_name: str) -> EvaluationMetric:
    """Factory function to get metric by name"""
    metrics = {
        'bleu': BLEUMetric(),
        'perplexity': PerplexityMetric(),
        'meteor': METEORMetric(),
        'rouge1': ROUGEMetric(rouge_type='1'),
        'rouge2': ROUGEMetric(rouge_type='2'),
        'rougeL': ROUGEMetric(rouge_type='L')
    }
    
    metric_name = metric_name.lower()
    if metric_name not in metrics:
        raise ValueError(f"Metric '{metric_name}' not supported. Available metrics: {list(metrics.keys())}")
    
    return metrics[metric_name]
