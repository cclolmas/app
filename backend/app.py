from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import psutil
import time
import json
from datetime import datetime
import torch

app = FastAPI(title="CL-CompL Dashboard API")

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class CognitiveLoadInput(BaseModel):
    userId: str
    taskId: str
    loadValue: int
    timestamp: str

# Store cognitive load readings
cognitive_load_records = []

# Helper function to get system metrics
def get_system_metrics():
    metrics = {
        "cpu_usage": psutil.cpu_percent(),
        "memory_usage": psutil.virtual_memory().percent,
        "timestamp": datetime.now().isoformat()
    }
    
    # Get VRAM usage if GPU is available
    if torch.cuda.is_available():
        metrics["vram_total"] = torch.cuda.get_device_properties(0).total_memory / 1024**3  # GB
        metrics["vram_used"] = (torch.cuda.memory_allocated(0) + torch.cuda.memory_reserved(0)) / 1024**3  # GB
    else:
        metrics["vram_total"] = 0
        metrics["vram_used"] = 0
        
    return metrics

@app.get("/")
def read_root():
    return {"message": "CL-CompL Dashboard API is running"}

@app.get("/api/system-metrics")
async def system_metrics():
    # Get basic system metrics
    metrics = get_system_metrics()
    
    # Add execution time simulation (would be real in production)
    execution_samples = []
    for _ in range(5):
        start_time = time.time()
        # Simulate computation with complexity based on day of month (for demo variation)
        n = datetime.now().day * 100000
        sum(i * i for i in range(n))
        execution_time = (time.time() - start_time) * 1000  # Convert to ms
        execution_samples.append(execution_time)
    
    metrics["execution_time"] = sum(execution_samples) / len(execution_samples)
    
    # Generate time series data for the dashboard
    time_series = []
    for i in range(20):
        # Create slightly varied metrics for time series display
        var_factor = 0.9 + (i % 5) * 0.05
        time_series.append({
            "time": i,
            "vramUsage": metrics["vram_used"] * var_factor if metrics["vram_used"] > 0 else 4 + (i % 5) * 0.8,
            "cpuUsage": metrics["cpu_usage"] * var_factor,
            "executionTime": metrics["execution_time"] * var_factor
        })
    
    return {
        "current": metrics,
        "timeSeries": time_series
    }

@app.post("/api/cognitive-load")
async def record_cognitive_load(data: CognitiveLoadInput):
    cognitive_load_records.append(data.dict())
    
    # In a real app, save this to a database
    return {"status": "recorded", "records_count": len(cognitive_load_records)}

@app.get("/api/optimal-point")
async def get_optimal_point(taskType: str, userExperienceLevel: str):
    # In a real app, this would use a model to determine the optimal balance
    # For demo purposes, we'll use a simple rule-based approach
    
    # Map experience levels to cognitive capacity (1-10)
    experience_cognitive_map = {
        "beginner": 3,
        "intermediate": 6,
        "advanced": 9
    }
    
    # Map task types to computational intensity (1-10)
    task_computational_map = {
        "basic": 2,
        "standard": 5,
        "complex": 8
    }
    
    # Get base values
    cognitive_capacity = experience_cognitive_map.get(userExperienceLevel, 5)
    computational_need = task_computational_map.get(taskType, 5)
    
    # Calculate optimal point - this is a simplistic model
    # In a real system, this would be based on empirical data
    optimal_comp_load = min(computational_need, cognitive_capacity)
    optimal_cog_load = (10 - cognitive_capacity) + computational_need/2
    
    return {
        "compL": optimal_comp_load,
        "cogL": min(optimal_cog_load, 9),  # Cap at 9 for visualization purposes
        "explanation": f"Based on {userExperienceLevel} experience and {taskType} task complexity"
    }

def find_free_port(start_port=8000, max_attempts=20):
    """Encontra uma porta disponível começando da porta inicial."""
    import socket
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('', port))
                return port
        except OSError:
            continue
    raise RuntimeError(f"Não foi possível encontrar uma porta disponível após {max_attempts} tentativas")

if __name__ == "__main__":
    import uvicorn
    port = find_free_port()
    print(f"\033[96m[Backend] Iniciando servidor FastAPI na porta {port}...\033[0m")
    print(f"\033[96m[Backend] Acesse http://localhost:{port}/ no seu navegador\033[0m")
    uvicorn.run(app, host="0.0.0.0", port=port)
