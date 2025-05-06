from enum import Enum
from typing import Dict, List, Optional, Any, Union
from fastapi import Request, status
from fastapi.responses import JSONResponse
import traceback
import json
import logging
import torch

# Configuração de logging
logger = logging.getLogger("lmas_errors")
logger.setLevel(logging.DEBUG)

class LMASErrorTypes(str, Enum):
    """Enumeração de tipos de erro em Sistemas Multiagentes Locais"""
    AGENT_FAILURE = "agent_failure"
    COMMUNICATION_ERROR = "communication_error"
    ORCHESTRATION_ERROR = "orchestration_error"
    TOOL_ERROR = "tool_error"
    MEMORY_ERROR = "memory_error"
    MODEL_LOAD_ERROR = "model_load_error"
    INTEGRATION_ERROR = "integration_error"
    PLANNING_ERROR = "planning_error"
    UNKNOWN = "unknown"

class LMASError(Exception):
    """Exceção base para todos os erros relacionados a LMAS"""
    
    def __init__(
        self, 
        message: str, 
        error_type: LMASErrorTypes = LMASErrorTypes.UNKNOWN,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
        cl_compl_insights: Optional[Dict[str, str]] = None,
        suggestions: Optional[List[str]] = None
    ):
        self.message = message
        self.error_type = error_type
        self.status_code = status_code
        self.details = details or {}
        self.cl_compl_insights = cl_compl_insights or {}
        self.suggestions = suggestions or []
        super().__init__(self.message)

class AgentError(LMASError):
    """Erro quando um agente específico falha"""
    
    def __init__(
        self, 
        message: str, 
        agent_id: str,
        agent_role: Optional[str] = None,
        **kwargs
    ):
        details = kwargs.pop("details", {})
        details.update({
            "agent_id": agent_id,
            "agent_role": agent_role
        })
        
        suggestions = kwargs.pop("suggestions", [
            "Verifique se o prompt do sistema para este agente está claro e bem definido",
            "Considere usar um modelo maior ou diferente para este agente específico",
            "Analise os logs do agente para identificar falhas específicas"
        ])
        
        cl_compl_insights = kwargs.pop("cl_compl_insights", {
            "message": "Falhas em agentes específicos podem indicar um desalinhamento entre a complexidade da tarefa e a capacidade do modelo.",
            "hypothesis": "H2, H4",
            "suggestion": "Considere simplificar as tarefas deste agente ou usar um modelo mais robusto, aceitando maior CompL para reduzir CL."
        })
        
        super().__init__(
            message=message,
            error_type=LMASErrorTypes.AGENT_FAILURE,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=details,
            cl_compl_insights=cl_compl_insights,
            suggestions=suggestions,
            **kwargs
        )

class CommunicationError(LMASError):
    """Erro de comunicação entre agentes"""
    
    def __init__(
        self, 
        message: str, 
        source_agent: str,
        target_agent: str,
        **kwargs
    ):
        details = kwargs.pop("details", {})
        details.update({
            "source_agent": source_agent,
            "target_agent": target_agent
        })
        
        suggestions = kwargs.pop("suggestions", [
            "Verifique se os formatos de mensagem entre os agentes são compatíveis",
            "Simplifique o protocolo de comunicação entre agentes",
            "Considere reduzir o número de agentes no sistema"
        ])
        
        cl_compl_insights = kwargs.pop("cl_compl_insights", {
            "message": "Sistemas com muitos agentes (>3) aumentam tanto a CompL quanto a CL devido à complexidade de comunicação.",
            "hypothesis": "H2",
            "suggestion": "Reduza o número de agentes ou simplifique as interfaces de comunicação para atingir um equilíbrio CL-CompL melhor."
        })
        
        super().__init__(
            message=message,
            error_type=LMASErrorTypes.COMMUNICATION_ERROR,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=details,
            cl_compl_insights=cl_compl_insights,
            suggestions=suggestions,
            **kwargs
        )

class MemoryLimitError(LMASError):
    """Erro quando o sistema ultrapassa limites de memória"""
    
    def __init__(
        self, 
        message: str, 
        vram_required: Optional[float] = None,
        vram_available: Optional[float] = None,
        agents_count: Optional[int] = None,
        **kwargs
    ):
        details = kwargs.pop("details", {})
        details.update({
            "vram_required": vram_required,
            "vram_available": vram_available,
            "agents_count": agents_count
        })
        
        suggestions = kwargs.pop("suggestions", [
            "Reduza o número de agentes executados simultaneamente",
            "Use modelos menores para os agentes (7B em vez de 13B)",
            "Aplique quantização Q4 em vez de Q8, mas esteja ciente da potencial instabilidade",
            "Considere executar os agentes sequencialmente em vez de em paralelo"
        ])
        
        cl_compl_insights = kwargs.pop("cl_compl_insights", {
            "message": "Exceder limites de memória representa um ponto onde a CompL não pode ser reduzida sem trade-offs significativos na CL.",
            "hypothesis": "H1, H3",
            "suggestion": "Priorize agentes críticos com modelos maiores/Q8, e use Q4 para agentes secundários para balancear recursos."
        })
        
        super().__init__(
            message=message,
            error_type=LMASErrorTypes.MEMORY_ERROR,
            status_code=status.HTTP_507_INSUFFICIENT_STORAGE,
            details=details,
            cl_compl_insights=cl_compl_insights,
            suggestions=suggestions,
            **kwargs
        )

# Função para capturar e formatar exceções do sistema LMAS
async def lmas_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handler global para exceções do subsistema LMAS"""
    
    # Se já é um erro LMAS especializado
    if isinstance(exc, LMASError):
        response_data = {
            "error": True,
            "code": exc.error_type,
            "message": exc.message,
            "details": exc.details,
            "cl_compl_insights": exc.cl_compl_insights,
            "suggestions": exc.suggestions
        }
        return JSONResponse(
            status_code=exc.status_code,
            content=response_data
        )
    
    # Erro de CUDA/VRAM
    if isinstance(exc, torch.cuda.OutOfMemoryError) or "CUDA out of memory" in str(exc):
        vram_info = {}
        try:
            if torch.cuda.is_available():
                vram_info = {
                    "vram_available": torch.cuda.get_device_properties(0).total_memory / (1024**3),
                    "vram_allocated": torch.cuda.memory_allocated(0) / (1024**3)
                }
        except:
            pass
            
        error = MemoryLimitError(
            message="Memória VRAM insuficiente para executar o sistema multi-agente",
            vram_required=vram_info.get("vram_allocated", None),
            vram_available=vram_info.get("vram_available", None)
        )
        
        return await lmas_exception_handler(request, error)
    
    # Erro desconhecido - registre com detalhes mas retorne mensagem simplificada
    logger.error(f"LMAS unknown error: {str(exc)}")
    logger.error(traceback.format_exc())
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "code": LMASErrorTypes.UNKNOWN,
            "message": "Ocorreu um erro no sistema multi-agente",
            "suggestions": [
                "Verifique os logs para mais detalhes",
                "Tente simplificar a configuração do sistema",
                "Verifique se todos os modelos necessários estão disponíveis"
            ],
            "cl_compl_insights": {
                "message": "Erros inesperados aumentam significativamente a CL ao exigir depuração e investigação.",
                "suggestion": "Aborde o problema gradualmente, isolando cada componente para reduzir a complexidade."
            }
        }
    )

# Factory function para mapear erros comuns a classes específicas
def create_lmas_error(error_type: str, message: str, **kwargs) -> LMASError:
    """Criar instância apropriada de erro LMAS com base no tipo"""
    error_map = {
        "agent_failure": AgentError,
        "communication": CommunicationError,
        "memory": MemoryLimitError
    }
    
    error_class = error_map.get(error_type, LMASError)
    return error_class(message=message, **kwargs)
