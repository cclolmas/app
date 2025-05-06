import os
import logging
import json
from typing import Dict, List, Optional, Any, Tuple
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("template_validation.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TemplateValidator:
    def __init__(self, templates_dir: str):
        """
        Initialize the template validator.
        
        Args:
            templates_dir (str): Directory containing QLoRA/LMAS templates
        """
        self.templates_dir = templates_dir
        self.validation_results = {}
        
    def scan_templates(self) -> List[str]:
        """
        Scan the templates directory for template files.
        
        Returns:
            List[str]: List of paths to template files
        """
        templates = []
        logger.info(f"Scanning for templates in {self.templates_dir}")
        
        if not os.path.exists(self.templates_dir):
            logger.error(f"Templates directory {self.templates_dir} does not exist")
            return templates
        
        for root, _, files in os.walk(self.templates_dir):
            for file in files:
                if file.endswith('.json') or file.endswith('.pt') or file.endswith('.bin'):
                    templates.append(os.path.join(root, file))
        
        logger.info(f"Found {len(templates)} potential template files")
        return templates
    
    def validate_template(self, template_path: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Validate if a template can be loaded and edited.
        
        Args:
            template_path (str): Path to the template file
            
        Returns:
            Tuple[bool, Dict[str, Any]]: Tuple of (success, details)
        """
        logger.info(f"Validating template: {template_path}")
        result = {
            "path": template_path,
            "loadable": False,
            "editable": False,
            "error": None
        }
        
        try:
            # Attempt to load the template
            if template_path.endswith('.json'):
                # Load JSON template
                with open(template_path, 'r') as f:
                    template_data = json.load(f)
                result["loadable"] = True
                
                # Check if template is editable by modifying a value and saving it back
                if isinstance(template_data, dict):
                    # Make a backup
                    backup = json.dumps(template_data)
                    
                    # Try to modify
                    if "metadata" in template_data:
                        template_data["metadata"]["_validation_test"] = True
                    else:
                        template_data["_validation_test"] = True
                    
                    # Write back
                    with open(template_path, 'w') as f:
                        json.dump(template_data, f)
                    
                    # Read again to confirm
                    with open(template_path, 'r') as f:
                        modified_data = json.load(f)
                    
                    # Check if modification exists
                    if ("metadata" in modified_data and "_validation_test" in modified_data["metadata"]) or "_validation_test" in modified_data:
                        result["editable"] = True
                    
                    # Restore backup
                    with open(template_path, 'w') as f:
                        f.write(backup)
                    
            elif template_path.endswith('.pt') or template_path.endswith('.bin'):
                # Load PyTorch model template
                try:
                    model_data = torch.load(template_path, map_location="cpu")
                    result["loadable"] = True
                    
                    # Check model editability by attempting to add a dummy parameter
                    # This is a very simple check - we're not actually modifying the model structure
                    if isinstance(model_data, dict):
                        backup = model_data.copy()
                        model_data["_validation_test"] = torch.tensor([1.0])
                        torch.save(model_data, template_path)
                        
                        # Verify the change
                        check_data = torch.load(template_path, map_location="cpu")
                        if "_validation_test" in check_data:
                            result["editable"] = True
                        
                        # Restore backup
                        torch.save(backup, template_path)
                except Exception as e:
                    # Try as a HuggingFace model
                    try:
                        model = AutoModelForCausalLM.from_pretrained(
                            os.path.dirname(template_path),
                            local_files_only=True,
                            torch_dtype=torch.float16
                        )
                        tokenizer = AutoTokenizer.from_pretrained(
                            os.path.dirname(template_path),
                            local_files_only=True
                        )
                        result["loadable"] = True
                        result["editable"] = True  # Assuming HF models are editable
                    except Exception as inner_e:
                        raise RuntimeError(f"Failed to load as PyTorch tensor and as HF model: {str(e)} | {str(inner_e)}")
            
        except Exception as e:
            result["error"] = str(e)
            logger.error(f"Error validating template {template_path}: {e}")
        
        logger.info(f"Template validation result: loadable={result['loadable']}, editable={result['editable']}")
        return result["loadable"] and result["editable"], result
    
    def validate_all(self) -> Dict[str, Any]:
        """
        Validate all templates in the templates directory.
        
        Returns:
            Dict[str, Any]: Validation results
        """
        templates = self.scan_templates()
        
        all_results = {
            "total": len(templates),
            "passed": 0,
            "failed": 0,
            "templates": []
        }
        
        for template_path in templates:
            success, result = self.validate_template(template_path)
            all_results["templates"].append(result)
            
            if success:
                all_results["passed"] += 1
            else:
                all_results["failed"] += 1
        
        logger.info(f"Validation complete: {all_results['passed']} passed, {all_results['failed']} failed")
        return all_results
    
    def save_report(self, output_path: str) -> None:
        """
        Save validation results to a JSON file.
        
        Args:
            output_path (str): Path to save the report
        """
        results = self.validate_all()
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2)
        logger.info(f"Validation report saved to {output_path}")
        
        # Print summary
        print("\n=== Template Validation Summary ===")
        print(f"Total templates: {results['total']}")
        print(f"Passed: {results['passed']}")
        print(f"Failed: {results['failed']}")
        print(f"See {output_path} for detailed report")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Validate QLoRA/LMAS templates")
    parser.add_argument("--templates-dir", type=str, required=True, help="Directory containing templates")
    parser.add_argument("--output", type=str, default="template_validation_report.json", help="Output path for validation report")
    
    args = parser.parse_args()
    
    validator = TemplateValidator(args.templates_dir)
    validator.save_report(args.output)
