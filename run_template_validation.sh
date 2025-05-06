#!/bin/bash

# Run the template validator
# Usage: ./run_template_validation.sh [path/to/templates_dir] [output_file]

# Set default values
TEMPLATES_DIR=${1:-"./templates"}
OUTPUT_FILE=${2:-"template_validation_report.json"}

# Check if Python is installed
if ! command -v python3 &>/dev/null; then
    echo "Error: Python 3 is required but not installed."
    exit 1
fi

# Check if required packages are installed
python3 -c "import torch, transformers" &>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing required packages..."
    pip install torch transformers
fi

echo "Running template validation..."
echo "Template directory: $TEMPLATES_DIR"
echo "Output file: $OUTPUT_FILE"

python3 template_validation.py --templates-dir "$TEMPLATES_DIR" --output "$OUTPUT_FILE"

# Check if validation was successful
if [ $? -eq 0 ]; then
    echo "Validation completed successfully!"
else
    echo "Validation failed! Check the logs for details."
    exit 1
fi
