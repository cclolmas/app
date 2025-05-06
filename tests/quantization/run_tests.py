import argparse
import unittest
import logging
import sys
import os
from pathlib import Path

# Add parent directory to path to ensure imports work
sys.path.append(str(Path(__file__).parent.parent.parent))

def main():
    """Run the Q4/Q8 alternation tests."""
    parser = argparse.ArgumentParser(description="Run Q4/Q8 quantization alternation tests")
    parser.add_argument("--model", default="meta-llama/Llama-2-7b-hf", 
                        help="Model ID to test")
    parser.add_argument("--alternations", type=int, default=5, 
                        help="Number of Q4/Q8 alternation rounds")
    parser.add_argument("--output-dir", default="./test_results", 
                        help="Directory for test results")
    parser.add_argument("--verbose", "-v", action="store_true", 
                        help="Enable verbose output")
    
    args = parser.parse_args()
    
    # Set up logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(level=log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Configure test environment
    os.environ["QUANTIZATION_TEST_MODEL"] = args.model
    os.environ["QUANTIZATION_TEST_ALTERNATIONS"] = str(args.alternations)
    os.environ["QUANTIZATION_TEST_OUTPUT_DIR"] = args.output_dir
    
    # Discover and run tests
    from tests.quantization.q4_q8_alternation_test import Q4Q8AlternationTest
    
    test_suite = unittest.TestSuite()
    test_suite.addTest(Q4Q8AlternationTest("test_q4_q8_alternation"))
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    if result.wasSuccessful():
        print("\nTests completed successfully!")
        print(f"Results saved to: {args.output_dir}")
    else:
        print("\nTests failed. Check logs for details.")
        sys.exit(1)

if __name__ == "__main__":
    main()
