"""
Stability utilities for measuring consistency between model responses.
"""
import numpy as np
from typing import List, Dict, Tuple, Union, Optional

try:
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError:
    # Fallback implementation if sklearn is not available
    def cosine_similarity(X, Y=None):
        if Y is None:
            Y = X
        # Normalize vectors
        X_norm = np.linalg.norm(X, axis=1, keepdims=True)
        Y_norm = np.linalg.norm(Y, axis=1, keepdims=True)
        X_normalized = X / X_norm if np.all(X_norm) else X
        Y_normalized = Y / Y_norm if np.all(Y_norm) else Y
        return np.dot(X_normalized, Y_normalized.T)

try:
    import nltk
    from nltk.tokenize import word_tokenize
    # Download required NLTK resources if not already present
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt', quiet=True)
except ImportError:
    # Fallback implementation if nltk is not available
    def word_tokenize(text):
        return text.lower().split()

def jaccard_similarity(text1: str, text2: str) -> float:
    """
    Calculate Jaccard similarity between two texts.
    
    Args:
        text1: First text string
        text2: Second text string
        
    Returns:
        Jaccard similarity score (0-1)
    """
    # Tokenize and convert to sets
    set1 = set(word_tokenize(text1.lower()))
    set2 = set(word_tokenize(text2.lower()))
    
    # Calculate Jaccard similarity
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    
    return intersection / union if union > 0 else 0.0

def get_sentence_embeddings(texts: List[str]) -> np.ndarray:
    """
    Get sentence embeddings using sentence-transformers.
    
    Args:
        texts: List of text strings
        
    Returns:
        Numpy array of embeddings
    """
    try:
        import sentence_transformers
        model = sentence_transformers.SentenceTransformer('paraphrase-MiniLM-L6-v2')
        embeddings = model.encode(texts)
        return embeddings
    except ImportError:
        print("Warning: sentence_transformers not installed. Using mock embeddings.")
        # Return mock embeddings (random vectors) as fallback
        return np.random.rand(len(texts), 384)  # 384 is embedding dimension of the model

def compute_semantic_stability(text1: str, text2: str) -> float:
    """
    Compute semantic stability between two text outputs.
    
    Uses a combination of lexical and semantic similarity measures.
    
    Args:
        text1: First text output
        text2: Second text output
        
    Returns:
        Stability score (0-1)
    """
    # Calculate Jaccard similarity (lexical)
    jaccard = jaccard_similarity(text1, text2)
    
    # Calculate cosine similarity of embeddings (semantic)
    embeddings = get_sentence_embeddings([text1, text2])
    cosine = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    
    # Combine scores (can be weighted differently if needed)
    combined_score = 0.3 * jaccard + 0.7 * cosine
    
    return combined_score

def calculate_consistency_metrics(responses1: List[str], responses2: List[str]) -> Dict:
    """
    Calculate consistency metrics across multiple response pairs.
    
    Args:
        responses1: First list of text responses
        responses2: Second list of text responses (corresponding to first list)
        
    Returns:
        Dictionary of consistency metrics
    """
    if len(responses1) != len(responses2):
        raise ValueError("Response lists must be the same length")
    
    stability_scores = []
    
    for r1, r2 in zip(responses1, responses2):
        stability = compute_semantic_stability(r1, r2)
        stability_scores.append(stability)
    
    return {
        "stability_scores": stability_scores,
        "mean_stability": np.mean(stability_scores),
        "min_stability": np.min(stability_scores),
        "max_stability": np.max(stability_scores),
        "std_stability": np.std(stability_scores)
    }
