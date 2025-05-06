import os
import json
import tempfile
import unittest
import torch
from pathlib import Path

# Add parent directory to path to import the module being tested
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from template_validation import TemplateValidator

class TestTemplateValidator(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory for test templates
        self.temp_dir = tempfile.TemporaryDirectory()
        self.templates_dir = self.temp_dir.name
        
        # Create some dummy templates for testing
        # 1. Valid JSON template
        self.json_template = os.path.join(self.templates_dir, "valid_template.json")
        with open(self.json_template, 'w') as f:
            json.dump({
                "name": "Test Template",
                "version": "1.0",
                "metadata": {
                    "description": "A test template"
                },
                "parameters": {
                    "learning_rate": 1e-5
                }
            }, f)
        
        # 2. Valid PT template (simple tensor dictionary)
        self.pt_template = os.path.join(self.templates_dir, "valid_model.pt")
        torch_data = {
            "weights": torch.randn(10, 10),
            "bias": torch.randn(10)
        }
        torch.save(torch_data, self.pt_template)
        
        # 3. Invalid template (text file with .json extension)
        self.invalid_template = os.path.join(self.templates_dir, "invalid.json")
        with open(self.invalid_template, 'w') as f:
            f.write("This is not a valid JSON file")
            
        # Create the validator
        self.validator = TemplateValidator(self.templates_dir)
        
    def tearDown(self):
        # Clean up the temporary directory
        self.temp_dir.cleanup()
        
    def test_scan_templates(self):
        """Test scanning for templates"""
        templates = self.validator.scan_templates()
        self.assertEqual(len(templates), 3)
        
    def test_validate_json_template(self):
        """Test validating a JSON template"""
        success, result = self.validator.validate_template(self.json_template)
        self.assertTrue(success)
        self.assertTrue(result["loadable"])
        self.assertTrue(result["editable"])
        
    def test_validate_pt_template(self):
        """Test validating a PyTorch template"""
        success, result = self.validator.validate_template(self.pt_template)
        self.assertTrue(success)
        self.assertTrue(result["loadable"])
        self.assertTrue(result["editable"])
        
    def test_validate_invalid_template(self):
        """Test validating an invalid template"""
        success, result = self.validator.validate_template(self.invalid_template)
        self.assertFalse(success)
        self.assertFalse(result["loadable"])
        self.assertIsNotNone(result["error"])
        
    def test_validate_all(self):
        """Test validating all templates"""
        results = self.validator.validate_all()
        self.assertEqual(results["total"], 3)
        self.assertEqual(results["passed"], 2)
        self.assertEqual(results["failed"], 1)

if __name__ == "__main__":
    unittest.main()
