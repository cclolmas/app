from fastapi import APIRouter, HTTPException
import psutil
try:
    import GPUtil
    gpu_available = True
except ImportError:
    gpu_available = False
import time
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/system",
    tags=["system"],
    responses={404: {"description": "Not found"}},
)

class SystemMetrics(BaseModel):
    ram: Dict[str, int]
    vram: Dict[str, int]
    gpu: Dict[str, float]
    activeTasksEstimatedTime: float

@router.get("/metrics", response_model=SystemMetrics)
async def get_system_metrics():
    """
    Endpoint para obter métricas do sistema (RAM, VRAM, GPU)
    """
    try:
        # Métricas de RAM
        ram_info = psutil.virtual_memory()
        ram = {
            "total": ram_info.total,
            "used": ram_info.used,
        }
        
        # Métricas de GPU (se disponível)
        if gpu_available:
            try:
                gpus = GPUtil.getGPUs()
                if gpus:
                    vram = {
                        "total": int(gpus[0].memoryTotal * 1024 * 1024),  # Converter MB para bytes
                        "used": int(gpus[0].memoryUsed * 1024 * 1024)
                    }
                    gpu_usage = {
                        "usage": gpus[0].load * 100  # Converter para percentual
                    }
                else:
                    vram = {"total": 0, "used": 0}
                    gpu_usage = {"usage": 0.0}
            except Exception as e:
                vram = {"total": 0, "used": 0}
                gpu_usage = {"usage": 0.0}
        else:
            vram = {"total": 0, "used": 0}
            gpu_usage = {"usage": 0.0}
        
        # Tempo estimado para tarefas ativas
        # Normalmente seria calculado com base em dados de tarefas em andamento
        # Esta é uma implementação simplificada
        active_tasks_time = 0.0
        # Aqui você poderia consultar um banco de dados ou serviço para obter tempos estimados
        
        return SystemMetrics(
            ram=ram,
            vram=vram,
            gpu=gpu_usage,
            activeTasksEstimatedTime=active_tasks_time
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting system metrics: {str(e)}")

class CognitiveLoadData(BaseModel):
    project_id: str
    value: int
    timestamp: Optional[int] = None

@router.post("/cognitive-load")
async def save_cognitive_load(data: CognitiveLoadData):
    """
    Endpoint para salvar avaliações de carga cognitiva do usuário
    """
    try:
        # Aqui você salvaria os dados em um banco de dados
        # Por exemplo, usando SQLAlchemy ou outro ORM
        
        # Simulação de armazenamento bem-sucedido
        if data.timestamp is None:
            data.timestamp = int(time.time() * 1000)
            
        return {"status": "success", "message": "Cognitive load saved", "data": data.dict()}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving cognitive load: {str(e)}")
