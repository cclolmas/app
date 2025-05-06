from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
import os

router = APIRouter()

# Configurar o Jinja2Templates para encontrar os templates
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
templates = Jinja2Templates(directory=os.path.join(base_dir, "templates"))

@router.get("/agent-monitoring", response_class=HTMLResponse)
async def agent_monitoring(request: Request):
    """Página de monitoramento de estados dos agentes."""
    return templates.TemplateResponse("agent_monitoring.html", {"request": request})
