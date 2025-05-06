import json
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

class AgentMonitorService:
    """Serviço para monitorar estados dos agentes e enviar atualizações em tempo real."""
    
    def __init__(self):
        self.connected_clients = set()
        self.agent_states = {}
        self.state_history = {}  # Armazena histórico de estados para cada agente
        
    async def register_client(self, websocket):
        """Registra um novo cliente websocket."""
        self.connected_clients.add(websocket)
        # Envia o estado atual para o novo cliente
        await self.send_current_states(websocket)
        logger.info(f"Cliente registrado. Total de clientes: {len(self.connected_clients)}")
        
    async def unregister_client(self, websocket):
        """Remove um cliente websocket."""
        self.connected_clients.remove(websocket)
        logger.info(f"Cliente desconectado. Total de clientes: {len(self.connected_clients)}")
        
    async def update_agent_state(self, agent_id: str, state: Dict):
        """Atualiza o estado de um agente e notifica os clientes."""
        timestamp = datetime.utcnow().isoformat()
        
        # Adiciona timestamp ao estado
        state_with_meta = {
            "state": state,
            "timestamp": timestamp
        }
        
        # Atualiza o estado atual
        self.agent_states[agent_id] = state_with_meta
        
        # Adiciona ao histórico
        if agent_id not in self.state_history:
            self.state_history[agent_id] = []
        
        # Limita o histórico a 100 estados por agente
        if len(self.state_history[agent_id]) >= 100:
            self.state_history[agent_id].pop(0)
            
        self.state_history[agent_id].append(state_with_meta)
        
        # Notifica todos os clientes
        await self.broadcast_update(agent_id, state_with_meta)
        
    async def broadcast_update(self, agent_id: str, state: Dict):
        """Envia uma atualização para todos os clientes conectados."""
        message = json.dumps({
            "type": "state_update",
            "agent_id": agent_id,
            "data": state
        })
        
        disconnect_clients = set()
        for websocket in self.connected_clients:
            try:
                await websocket.send(message)
            except Exception as e:
                logger.error(f"Erro ao enviar mensagem: {e}")
                disconnect_clients.add(websocket)
                
        # Remove clientes desconectados
        for websocket in disconnect_clients:
            await self.unregister_client(websocket)
            
    async def send_current_states(self, websocket):
        """Envia todos os estados atuais para um cliente específico."""
        message = json.dumps({
            "type": "full_state",
            "data": self.agent_states
        })
        
        try:
            await websocket.send(message)
        except Exception as e:
            logger.error(f"Erro ao enviar estados atuais: {e}")
            
    def get_agent_history(self, agent_id: str, limit: int = 20) -> List[Dict]:
        """Recupera o histórico de estados de um agente."""
        if agent_id not in self.state_history:
            return []
        
        history = self.state_history[agent_id]
        return history[-limit:] if limit > 0 else history

# Instância global do serviço
monitor_service = AgentMonitorService()
