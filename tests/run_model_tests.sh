#!/bin/bash

# Set the Python environment
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Check if configuration file is provided as argument
CONFIG_FILE=${1:-"config_example.json"}

# Create results directory if it doesn't exist
mkdir -p "results"

# Run the test script
echo "Starting model tests with configuration: $CONFIG_FILE"
python q_model_tester.py --config "$CONFIG_FILE"

# Check the exit status
if [ $? -eq 0 ]; then
    echo "Tests completed successfully."
    echo "Results can be found in the results directory."
else
    echo "Tests failed. Check the logs for more information."
fi
