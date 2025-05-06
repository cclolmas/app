from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
import logging
from typing import Dict, Any

from ..services.agent_monitor_service import monitor_service
from ..auth.jwt_handler import verify_token

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/ws/agents")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    try:
        # Registra o cliente no serviço de monitoramento
        await monitor_service.register_client(websocket)
        
        while True:
            # Espera por comandos do cliente (como filtros ou solicitações de histórico)
            data = await websocket.receive_text()
            # Processar comandos do cliente aqui se necessário
            
    except WebSocketDisconnect:
        await monitor_service.unregister_client(websocket)
    except Exception as e:
        logger.error(f"Erro na conexão WebSocket: {e}")
        await monitor_service.unregister_client(websocket)

@router.post("/api/agents/{agent_id}/state")
async def update_agent_state(
    agent_id: str, 
    state: Dict[str, Any],
):
    """Endpoint para atualizar o estado de um agente."""
    try:
        await monitor_service.update_agent_state(agent_id, state)
        return {"success": True}
    except Exception as e:
        logger.error(f"Erro ao atualizar estado: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/agents/{agent_id}/history")
async def get_agent_history(agent_id: str, limit: int = 20):
    """Endpoint para obter histórico de estados de um agente."""
    try:
        history = monitor_service.get_agent_history(agent_id, limit)
        return {"agent_id": agent_id, "history": history}
    except Exception as e:
        logger.error(f"Erro ao obter histórico: {e}")
        raise HTTPException(status_code=500, detail=str(e))
