import asyncio
import logging
import json
from typing import Dict, Any
import httpx
import aiohttp

logger = logging.getLogger(__name__)

class AgentStateLogger:
    """
    Utilitário para registrar mudanças de estado dos agentes e notificar o serviço de monitoramento.
    """
    
    def __init__(self, agent_id: str, service_url: str = None):
        self.agent_id = agent_id
        self.service_url = service_url or "http://localhost:8000/api/agents"
        self.state_history = []
        self.last_reported_state = None
        
    async def log_state(self, state: Dict[str, Any], force_report: bool = False):
        """
        Registra um novo estado do agente e envia para o serviço de monitoramento.
        
        Args:
            state: O estado atual do agente
            force_report: Se True, envia o estado mesmo que seja idêntico ao anterior
        """
        # Adiciona ao histórico local
        self.state_history.append(state.copy())
        
        # Limita o tamanho do histórico local
        if len(self.state_history) > 100:
            self.state_history.pop(0)
            
        # Registra no log
        logger.info(f"Agente {self.agent_id}: {json.dumps(state)}")
        
        # Verifica se o estado mudou significativamente antes de notificar
        if force_report or self._state_changed(state):
            await self._report_state(state)
            self.last_reported_state = state.copy()
            
    def _state_changed(self, state: Dict[str, Any]) -> bool:
        """Verifica se o estado atual é diferente do último reportado."""
        if self.last_reported_state is None:
            return True
            
        # Compara campos importantes que indicam mudança de estado
        key_fields = ['status', 'phase', 'progress']
        
        for field in key_fields:
            if (field in state and field in self.last_reported_state and 
                state[field] != self.last_reported_state[field]):
                return True
                
            if (field in state and field not in self.last_reported_state) or \
               (field not in state and field in self.last_reported_state):
                return True
                
        return False
            
    async def _report_state(self, state: Dict[str, Any]):
        """Envia o estado para o serviço de monitoramento."""
        url = f"{self.service_url}/{self.agent_id}/state"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=state) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"Erro ao reportar estado: {response.status} - {error_text}")
        except Exception as e:
            logger.error(f"Falha ao notificar serviço de monitoramento: {e}")
            
    def get_history(self):
        """Retorna o histórico local de estados."""
        return self.state_history.copy()
