#!/bin/bash

# Cores para mensagens no terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # Sem cor

echo -e "${PURPLE}=============================${NC}"
echo -e "${PURPLE} INICIANDO SISTEMA CCLOLMAS ${NC}"
echo -e "${PURPLE}=============================${NC}"

# Verificar se python3 está instalado
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Erro: Python 3 não encontrado. Por favor, instale o Python 3.${NC}"
    exit 1
fi

# Verificar se o módulo psutil está instalado
python3 -c "import psutil" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}O módulo psutil não está instalado. Tentando instalar...${NC}"
    python3 -m pip install psutil
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro ao instalar psutil. Tente executar: pip3 install psutil${NC}"
        echo -e "${YELLOW}Continuando sem gerenciamento avançado de processos...${NC}"
    else
        echo -e "${GREEN}psutil instalado com sucesso!${NC}"
    fi
fi

# Tornar os scripts executáveis
chmod +x run.py
chmod +x start_server.py
chmod +x server_manager.py 2>/dev/null

# Verificar se devemos reiniciar o servidor
if [ "$1" == "restart" ]; then
    if command -v python3 ./server_manager.py &> /dev/null; then
        echo -e "${BLUE}Reiniciando servidores...${NC}"
        python3 ./server_manager.py restart
    else
        echo -e "${BLUE}Encerrando quaisquer servidores ativos e iniciando novos...${NC}"
        python3 ./run.py
    fi
else
    # Iniciar o sistema principal
    echo -e "${BLUE}Iniciando servidor...${NC}"
    python3 ./run.py
fi

exit_code=$?
if [ $exit_code -ne 0 ]; then
    echo -e "${RED}Erro ao iniciar o sistema. Código de saída: $exit_code${NC}"
    echo -e "${YELLOW}Tentando iniciar apenas o servidor frontend...${NC}"
    python3 ./start_server.py
fi
