import sys
import os
import time
import unittest
import numpy as np
import psutil

# Adicionar o diretório raiz ao path para importar módulos do projeto
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.metrics_validator import MetricsValidator

# Supondo que CompL tenha um módulo de métricas
try:
    from compl.metrics import MetricsCollector
except ImportError:
    # Mock do coletor de métricas caso não esteja disponível
    class MetricsCollector:
        def __init__(self):
            self.start_time = None
        
        def start_timer(self):
            self.start_time = time.time()
            
        def end_timer(self):
            if self.start_time is None:
                return 0
            return time.time() - self.start_time
            
        def get_vram_usage(self):
            # Simular coleta de VRAM
            try:
                import torch
                if torch.cuda.is_available():
                    return torch.cuda.memory_allocated() / 1024**2
                return 0
            except ImportError:
                return 0
                
        def get_cpu_usage(self):
            return psutil.cpu_percent(interval=0.1)

class TestMetricsValidation(unittest.TestCase):
    
    def setUp(self):
        self.compl_collector = MetricsCollector()
        self.validator = MetricsValidator(self.compl_collector)
        
    def test_memory_intensive_operation(self):
        """Testa se o CompL mede corretamente o uso de memória durante operação intensiva"""
        # Definir uma operação intensiva de memória
        def memory_intensive_task():
            # Criar arrays grandes para consumir memória
            arrays = []
            for _ in range(10):
                arrays.append(np.ones((1000, 1000), dtype=np.float32))
            time.sleep(2)  # Manter dados na memória
            return sum(arr.mean() for arr in arrays)
            
        print("\nExecutando teste de memória intensivo...")
        self.validator.validate_resource_usage(duration=5, interval=0.5)
        result, compl_time, ext_time = self.validator.validate_execution_time(memory_intensive_task)
        
        # Resultados só para informação - a validação real está nos dados coletados
        print(f"CompL time: {compl_time:.4f}s, External time: {ext_time:.4f}s")
        
    def test_gpu_operation(self):
        """Testa se o CompL mede corretamente o uso da GPU durante operação intensiva"""
        try:
            import torch
            if not torch.cuda.is_available():
                print("CUDA não disponível, pulando teste de GPU")
                return
                
            def gpu_intensive_task():
                # Criar tensores grandes na GPU
                x = torch.randn(5000, 5000, device='cuda')
                y = torch.randn(5000, 5000, device='cuda')
                # Operação intensiva
                result = torch.matmul(x, y)
                torch.cuda.synchronize()  # Garantir que operação terminou
                return result.mean().item()
            
            print("\nExecutando teste de GPU intensivo...")
            self.validator.validate_resource_usage(duration=5, interval=0.5)
            result, compl_time, ext_time = self.validator.validate_execution_time(gpu_intensive_task)
            
            print(f"CompL time: {compl_time:.4f}s, External time: {ext_time:.4f}s")
            
        except ImportError:
            print("PyTorch não instalado, pulando teste de GPU")

    def tearDown(self):
        # Gerar relatório ao final dos testes
        report_path = self.validator.generate_report()
        print(f"Relatório de validação gerado em: {report_path}")

if __name__ == "__main__":
    unittest.main()
