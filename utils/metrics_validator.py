import time
import psutil
import subprocess
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
import os
import json

# Tente importar bibliotecas específicas de GPU
try:
    import torch
    has_torch = True
except ImportError:
    has_torch = False

try:
    import pynvml
    pynvml.nvmlInit()
    has_pynvml = True
except:
    has_pynvml = False

class MetricsValidator:
    def __init__(self, compl_metrics_collector, output_dir="metrics_validation"):
        """
        Inicializa o validador de métricas.
        
        Args:
            compl_metrics_collector: O coletor de métricas do CompL
            output_dir: Diretório para salvar os resultados da validação
        """
        self.compl_collector = compl_metrics_collector
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        self.results = {
            "vram": [],
            "ram": [],
            "execution_time": []
        }

    def get_external_vram_usage(self):
        """Obtém o uso de VRAM por ferramentas externas"""
        if has_pynvml:
            handle = pynvml.nvmlDeviceGetHandleByIndex(0)  # Assume primeira GPU
            info = pynvml.nvmlDeviceGetMemoryInfo(handle)
            return info.used / 1024**2  # Converter para MB
        elif has_torch and torch.cuda.is_available():
            return torch.cuda.memory_allocated() / 1024**2  # MB
        return None

    def get_external_ram_usage(self):
        """Obtém uso de RAM por ferramentas externas"""
        memory = psutil.virtual_memory()
        return memory.used / 1024**2  # MB

    def validate_execution_time(self, func, *args, **kwargs):
        """
        Valida o tempo de execução de uma função.
        
        Args:
            func: Função a ser executada e medida
            args, kwargs: Argumentos para a função
        
        Returns:
            Tupla contendo (resultado_função, tempo_compl, tempo_externo)
        """
        # Medir com timer externo
        start_time_ext = time.time()
        
        # Iniciar medição do CompL
        self.compl_collector.start_timer()
        
        # Executar função
        result = func(*args, **kwargs)
        
        # Finalizar medições
        compl_time = self.compl_collector.end_timer()
        external_time = time.time() - start_time_ext
        
        self.results["execution_time"].append({
            "compl": compl_time,
            "external": external_time,
            "difference": abs(compl_time - external_time),
            "timestamp": datetime.now().isoformat()
        })
        
        return result, compl_time, external_time

    def validate_resource_usage(self, duration=10, interval=0.5):
        """
        Monitora uso de recursos por um período para comparação.
        
        Args:
            duration: Duração da monitoração em segundos
            interval: Intervalo entre medições em segundos
        """
        end_time = time.time() + duration
        
        while time.time() < end_time:
            # Obter métricas do CompL
            compl_vram = self.compl_collector.get_vram_usage()
            compl_ram = self.compl_collector.get_ram_usage()
            
            # Obter métricas externas
            ext_vram = self.get_external_vram_usage()
            ext_ram = self.get_external_ram_usage()
            
            # Registrar resultados
            if ext_vram is not None and compl_vram is not None:
                self.results["vram"].append({
                    "compl": compl_vram,
                    "external": ext_vram,
                    "difference": abs(compl_vram - ext_vram),
                    "timestamp": datetime.now().isoformat()
                })
            
            if ext_ram is not None and compl_ram is not None:
                self.results["ram"].append({
                    "compl": compl_ram,
                    "external": ext_ram,
                    "difference": abs(compl_ram - ext_ram),
                    "timestamp": datetime.now().isoformat()
                })
            
            time.sleep(interval)

    def generate_report(self):
        """Gera um relatório detalhado com os resultados da validação"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = os.path.join(self.output_dir, f"validation_report_{timestamp}")
        os.makedirs(report_path, exist_ok=True)
        
        # Salvar dados brutos
        with open(os.path.join(report_path, "raw_data.json"), "w") as f:
            json.dump(self.results, f, indent=2)
        
        # Gerar estatísticas
        stats = {}
        for metric, data in self.results.items():
            if not data:
                continue
                
            df = pd.DataFrame(data)
            stats[metric] = {
                "mean_difference": df["difference"].mean(),
                "max_difference": df["difference"].max(),
                "min_difference": df["difference"].min(),
                "std_difference": df["difference"].std(),
                "percentage_error": (df["difference"] / df["external"]).mean() * 100 if "external" in df else None
            }
            
            # Gerar gráficos
            plt.figure(figsize=(10, 6))
            plt.plot(range(len(df)), df["compl"], label="CompL")
            plt.plot(range(len(df)), df["external"], label="External")
            plt.title(f"{metric.upper()} Comparison")
            plt.xlabel("Measurement Index")
            plt.ylabel(metric)
            plt.legend()
            plt.grid(True)
            plt.savefig(os.path.join(report_path, f"{metric}_comparison.png"))
            plt.close()
            
        # Salvar estatísticas
        with open(os.path.join(report_path, "statistics.json"), "w") as f:
            json.dump(stats, f, indent=2)
            
        # Gerar relatório HTML
        html_report = self._generate_html_report(stats)
        with open(os.path.join(report_path, "report.html"), "w") as f:
            f.write(html_report)
            
        print(f"Validation report generated at: {report_path}")
        return report_path

    def _generate_html_report(self, stats):
        """Gera um relatório em HTML"""
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>CompL Metrics Validation Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .good { color: green; }
                .warning { color: orange; }
                .error { color: red; }
                .summary { margin-top: 20px; }
            </style>
        </head>
        <body>
            <h1>CompL Metrics Validation Report</h1>
            <p>Generated on: """ + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + """</p>
            
            <h2>Summary</h2>
        """
        
        # Adicionar tabela de resumo
        html += """
            <table>
                <tr>
                    <th>Metric</th>
                    <th>Mean Difference</th>
                    <th>Max Difference</th>
                    <th>Error (%)</th>
                    <th>Accuracy</th>
                </tr>
        """
        
        for metric, metric_stats in stats.items():
            error_pct = metric_stats.get("percentage_error")
            
            if error_pct is None:
                accuracy = "N/A"
                css_class = ""
            elif error_pct < 5:
                accuracy = "Excellent"
                css_class = "good"
            elif error_pct < 10:
                accuracy = "Good"
                css_class = "good"
            elif error_pct < 20:
                accuracy = "Fair"
                css_class = "warning"
            else:
                accuracy = "Poor"
                css_class = "error"
                
            html += f"""
                <tr>
                    <td>{metric}</td>
                    <td>{metric_stats["mean_difference"]:.4f}</td>
                    <td>{metric_stats["max_difference"]:.4f}</td>
                    <td>{error_pct:.2f}% if error_pct is not None else "N/A"</td>
                    <td class="{css_class}">{accuracy}</td>
                </tr>
            """
        
        html += """
            </table>
            
            <h2>Detailed Results</h2>
        """
        
        # Adicionar detalhes para cada métrica
        for metric, metric_stats in stats.items():
            html += f"""
            <h3>{metric}</h3>
            <table>
                <tr>
                    <th>Statistic</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Mean Difference</td>
                    <td>{metric_stats["mean_difference"]:.4f}</td>
                </tr>
                <tr>
                    <td>Max Difference</td>
                    <td>{metric_stats["max_difference"]:.4f}</td>
                </tr>
                <tr>
                    <td>Min Difference</td>
                    <td>{metric_stats["min_difference"]:.4f}</td>
                </tr>
                <tr>
                    <td>Standard Deviation</td>
                    <td>{metric_stats["std_difference"]:.4f}</td>
                </tr>
            </table>
            
            <div class="chart">
                <img src="{metric}_comparison.png" alt="{metric} Comparison Chart" width="800">
            </div>
            """
        
        html += """
            <div class="summary">
                <h2>Conclusion</h2>
                <p>
                    This report compares CompL metrics with external measurements.
                    An error percentage below 5% is considered excellent,
                    below 10% is good, below 20% is fair, and above 20% indicates
                    potential issues with the CompL metrics collection.
                </p>
            </div>
        </body>
        </html>
        """
        
        return html
