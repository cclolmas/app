#!/usr/bin/env python3

import sys
import os
import argparse
import time
import json
from datetime import datetime

# Adicionar o diretório raiz ao path para importar módulos do projeto
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.metrics_validator import MetricsValidator

# Importar o coletor de métricas do CompL
try:
    from compl.metrics import MetricsCollector
except ImportError:
    print("AVISO: O módulo de métricas do CompL não foi encontrado.")
    print("Usando um coletor simulado para demonstração.")
    
    # Coletor de métricas simulado
    import psutil
    class MetricsCollector:
        def __init__(self):
            self.start_time = None
        
        def start_timer(self):
            self.start_time = time.time()
            
        def end_timer(self):
            if self.start_time is None:
                return 0
            elapsed = time.time() - self.start_time
            self.start_time = None
            return elapsed
            
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

def run_validation(args):
    """Executa a validação das métricas do CompL"""
    collector = MetricsCollector()
    validator = MetricsValidator(collector, output_dir=args.output_dir)
    
    print(f"Iniciando validação de métricas do CompL. Duração: {args.duration} segundos")
    
    # Executar validação em diferentes cenários de carga
    scenarios = [
        {"name": "Idle", "load": "idle", "duration": args.duration // 4},
        {"name": "CPU Load", "load": "cpu", "duration": args.duration // 4},
        {"name": "Memory Load", "load": "memory", "duration": args.duration // 4},
    ]
    
    if args.gpu:
        scenarios.append({"name": "GPU Load", "load": "gpu", "duration": args.duration // 4})
    
    for scenario in scenarios:
        print(f"\nCenário: {scenario['name']}")
        
        # Preparar carga de trabalho
        if scenario["load"] == "cpu":
            print("Executando carga de CPU...")
            # Iniciar threads para carregar CPU
            import threading
            stop_threads = False
            
            def cpu_load():
                while not stop_threads:
                    _ = [i*i for i in range(10000)]
            
            threads = []
            for _ in range(psutil.cpu_count()):
                t = threading.Thread(target=cpu_load)
                t.daemon = True
                threads.append(t)
                t.start()
                
            # Monitorar durante carga
            validator.validate_resource_usage(duration=scenario["duration"], interval=args.interval)
            
            # Finalizar threads
            stop_threads = True
            for t in threads:
                t.join(0.5)
                
        elif scenario["load"] == "memory":
            print("Executando carga de memória...")
            # Alocar memória
            mem_blocks = []
            try:
                # Alocar até 50% da memória disponível
                target_memory = psutil.virtual_memory().available * 0.5
                block_size = 100 * 1024 * 1024  # 100MB por bloco
                
                while sum(sys.getsizeof(block) for block in mem_blocks) < target_memory:
                    mem_blocks.append(bytearray(block_size))
                    
                # Monitorar
                validator.validate_resource_usage(duration=scenario["duration"], interval=args.interval)
                
            finally:
                # Limpar memória
                mem_blocks.clear()
                
        elif scenario["load"] == "gpu" and args.gpu:
            try:
                import torch
                if torch.cuda.is_available():
                    print("Executando carga de GPU...")
                    # Alocar memória na GPU
                    tensors = []
                    try:
                        while len(tensors) < 10:  # Limite para evitar out-of-memory
                            # Criar tensor grande
                            tensors.append(torch.rand(1000, 1000, device="cuda"))
                            # Executar alguma operação
                            tensors[-1] = torch.matmul(tensors[-1], tensors[-1])
                            
                        # Monitorar
                        validator.validate_resource_usage(duration=scenario["duration"], interval=args.interval)
                        
                    finally:
                        # Limpar GPU
                        for t in tensors:
                            del t
                        torch.cuda.empty_cache()
                else:
                    print("GPU não disponível, pulando teste de GPU")
            except ImportError:
                print("PyTorch não instalado, pulando teste de GPU")
                
        else:  # idle
            print("Monitorando sistema em estado idle...")
            validator.validate_resource_usage(duration=scenario["duration"], interval=args.interval)
    
    # Gerar relatório
    report_path = validator.generate_report()
    print(f"\nValidação concluída. Relatório gerado em: {report_path}")
    
    # Exibir resumo
    try:
        with open(os.path.join(report_path, "statistics.json"), "r") as f:
            stats = json.load(f)
            
        print("\nResumo da validação:")
        for metric, metric_stats in stats.items():
            error_pct = metric_stats.get("percentage_error")
            error_str = f"{error_pct:.2f}%" if error_pct is not None else "N/A"
            
            print(f"- {metric.upper()}: Diferença média: {metric_stats['mean_difference']:.4f}, Erro: {error_str}")
    except:
        print("Não foi possível carregar estatísticas para exibir resumo.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validar métricas do CompL")
    parser.add_argument("--duration", type=int, default=60,
                      help="Duração total da validação em segundos (padrão: 60)")
    parser.add_argument("--interval", type=float, default=0.5,
                      help="Intervalo entre medições em segundos (padrão: 0.5)")
    parser.add_argument("--output-dir", type=str, default="./metrics_validation",
                      help="Diretório para salvar os resultados (padrão: ./metrics_validation)")
    parser.add_argument("--gpu", action="store_true",
                      help="Incluir testes de GPU (requer PyTorch com CUDA)")
    
    args = parser.parse_args()
    run_validation(args)
