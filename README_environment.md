# Environment Setup Guide

This document provides guidance on setting up the environment for the cclolmas project.

## Dependency Issues

Several Python dependencies are required for this project to function correctly:

- `llama-cpp-python`: Required for the Q model tester
- `scikit-learn`: Required for metrics and pairwise calculations
- `nltk`: Required for text tokenization
- `sentence-transformers`: Required for text embeddings

## Quick Setup

Run the provided setup script to install all dependencies:

```bash
python setup_env.py
```

## Manual Setup

If the setup script doesn't work, you can install the dependencies manually:

1. Install Python packages:
   ```bash
   pip install llama-cpp-python scikit-learn nltk sentence-transformers
   ```

2. Download NLTK data:
   ```python
   import nltk
   nltk.download('punkt')
   ```

## JavaScript Issues

If you encounter JavaScript syntax errors in `custom.js`, please check line 588 for any syntax issues such as:
- Missing semicolons
- Unmatched brackets or parentheses
- Stray characters

## Troubleshooting

If you still encounter import errors after installing the dependencies, ensure your Python environment is correctly configured and activated.
