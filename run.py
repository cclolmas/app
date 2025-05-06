#!/usr/bin/env python3
"""
Script para iniciar todos os componentes necessários do projeto CCLOLMAS.
Inicia tanto o backend FastAPI quanto um servidor estático para os arquivos frontend.
"""

import subprocess
import os
import sys
import time
import webbrowser
from pathlib import Path
import socket
import signal
import psutil

def is_port_in_use(port):
    """Verifica se uma porta está em uso"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def kill_process_on_port(port):
    """Mata o processo que está usando uma porta específica"""
    for proc in psutil.process_iter(['pid', 'name', 'connections']):
        try:
            for conn in proc.connections(kind='inet'):
                if conn.laddr.port == port:
                    print(f"\033[93m[Sistema] Encerrando processo existente na porta {port} (PID: {proc.info['pid']})\033[0m")
                    os.kill(proc.info['pid'], signal.SIGTERM)
                    time.sleep(1)
                    if is_port_in_use(port):  # Se ainda estiver em uso, força o encerramento
                        os.kill(proc.info['pid'], signal.SIGKILL)
                    return True
        except (psutil.AccessDenied, psutil.NoSuchProcess):
            pass
    return False

def setup_environment():
    """Verifica e configura o ambiente antes de iniciar os servidores."""
    # Verificar diretórios e arquivos necessários
    print("\033[96m[Sistema] Verificando ambiente...\033[0m")
    
    essential_files = [
        "index.html",
        "start_server.py"
    ]
    
    for file in essential_files:
        if not Path(file).exists():
            print(f"\033[91m[Erro] Arquivo essencial não encontrado: {file}\033[0m")
            return False
    
    print("\033[92m[Sistema] Ambiente verificado com sucesso.\033[0m")
    return True

def find_free_port(start_port=8000, max_attempts=10):
    """Encontra uma porta disponível"""
    for port_offset in range(max_attempts):
        port = start_port + port_offset
        if not is_port_in_use(port):
            return port
    return None

def start_backend():
    """Inicia o servidor backend FastAPI."""
    # Verificar se o backend está configurado
    if not Path("server.js").exists() and not Path("index.js").exists():
        print("\033[93m[Backend] Servidor backend não configurado, pulando...\033[0m")
        return None
    
    # Verificar qual arquivo de servidor usar
    server_file = "server.js" if Path("server.js").exists() else "index.js"
    
    # Verificar se node está instalado
    try:
        subprocess.run(["node", "--version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except FileNotFoundError:
        print("\033[91m[Backend] Node.js não encontrado. Pulando inicialização do backend.\033[0m")
        return None
    
    port = 3000
    if is_port_in_use(port):
        print(f"\033[93m[Backend] Porta {port} já está em uso.\033[0m")
        # Tenta encerrar o processo existente
        if kill_process_on_port(port):
            print(f"\033[92m[Backend] Processo na porta {port} encerrado.\033[0m")
        else:
            # Se não conseguiu encerrar, tenta outra porta
            port = find_free_port(3001)
            if port is None:
                print("\033[91m[Backend] Não foi possível encontrar uma porta disponível para o backend.\033[0m")
                return None
            print(f"\033[93m[Backend] Usando porta alternativa: {port}\033[0m")
    
    print(f"\033[96m[Backend] Iniciando servidor Node.js na porta {port}...\033[0m")
    backend_process = subprocess.Popen(
        ["node", server_file],
        stderr=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True,
        bufsize=1,
        env={**os.environ, "PORT": str(port)}
    )
    
    # Aguarda um tempo para o servidor iniciar e verifica se houve erro
    time.sleep(2)
    if backend_process.poll() is not None:
        stdout, stderr = backend_process.communicate()
        print("\033[91m[Erro] Falha ao iniciar o servidor backend:\033[0m")
        if stdout:
            print("\033[91mSaída:\033[0m", stdout)
        if stderr:
            print("\033[91mErro:\033[0m", stderr)
        return None
    
    print(f"\033[92m[Backend] Servidor Node.js iniciado na porta {port}.\033[0m")
    return backend_process

def start_frontend():
    """Inicia o servidor frontend para servir arquivos estáticos."""
    frontend_script = Path("start_server.py")
    if not frontend_script.exists():
        print("\033[91m[Erro] Arquivo start_server.py não encontrado.\033[0m")
        return None
    
    frontend_port = 8001
    if is_port_in_use(frontend_port):
        print(f"\033[93m[Frontend] Porta {frontend_port} já está em uso.\033[0m")
        # Tenta encerrar o processo existente
        if kill_process_on_port(frontend_port):
            print(f"\033[92m[Frontend] Processo na porta {frontend_port} encerrado.\033[0m")
        else:
            # Se não conseguiu encerrar, usa uma porta automática
            print(f"\033[93m[Frontend] Usando seleção automática de porta...\033[0m")
            frontend_port = None
    
    print("\033[96m[Frontend] Iniciando servidor frontend...\033[0m")
    
    # Prepara o comando com ou sem a porta específica
    cmd = [sys.executable, "start_server.py"]
    if frontend_port:
        cmd.append(str(frontend_port))
    
    frontend_process = subprocess.Popen(
        cmd,
        stderr=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True,
        bufsize=1
    )
    
    # Aguarda um tempo para o servidor iniciar e verifica se houve erro
    time.sleep(2)
    if frontend_process.poll() is not None:
        stdout, stderr = frontend_process.communicate()
        print("\033[91m[Erro] Falha ao iniciar o servidor frontend:\033[0m")
        if stdout:
            print("\033[91mSaída:\033[0m", stdout)
        if stderr:
            print("\033[91mErro:\033[0m", stderr)
        return None
    
    return frontend_process

def monitor_processes(processes):
    """Monitora os processos e exibe seus outputs."""
    try:
        active_processes = {name: proc for name, proc in processes.items() if proc is not None}
        
        if not active_processes:
            print("\033[91m[Sistema] Nenhum servidor ativo para monitorar.\033[0m")
            return
        
        print("\033[92m[Sistema] Monitorando servidores. Pressione Ctrl+C para encerrar.\033[0m")
        
        # Processar saídas dos processos
        while True:
            for name, proc in list(active_processes.items()):
                # Verificar se o processo ainda está ativo
                if proc.poll() is not None:
                    stdout, stderr = proc.communicate()
                    print(f"\033[91m[{name}] Servidor encerrado inesperadamente.\033[0m")
                    if stdout:
                        print(f"\033[91m[{name}] Saída final:\033[0m {stdout}")
                    if stderr:
                        print(f"\033[91m[{name}] Erro final:\033[0m {stderr}")
                    active_processes.pop(name)
                
                # Processar saídas disponíveis
                if proc.stdout:
                    line = proc.stdout.readline()
                    if line:
                        print(f"\033[96m[{name}]\033[0m {line}", end="")
                
                if proc.stderr:
                    line = proc.stderr.readline()
                    if line:
                        print(f"\033[95m[{name}]\033[0m {line}", end="")
            
            # Se não há mais processos ativos, sair do loop
            if not active_processes:
                print("\033[91m[Sistema] Todos os servidores foram encerrados.\033[0m")
                break
                
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\n\033[93m[Sistema] Encerrando servidores...\033[0m")
        for name, proc in processes.items():
            if proc is not None:
                try:
                    proc.terminate()
                    time.sleep(0.5)
                    if proc.poll() is None:  # Se ainda estiver ativo, força o encerramento
                        proc.kill()
                    print(f"\033[92m[Sistema] Servidor {name} encerrado.\033[0m")
                except:
                    print(f"\033[93m[Sistema] Não foi possível encerrar o servidor {name} normalmente.\033[0m")
    
    print("\033[92m[Sistema] Todos os servidores foram encerrados.\033[0m")

def main():
    """Função principal que inicia todos os componentes."""
    print("\033[95m==== Iniciando sistema CCLOLMAS ====\033[0m")
    
    if not setup_environment():
        print("\033[91m[Erro] Falha ao configurar o ambiente.\033[0m")
        return
    
    processes = {
        "Backend": start_backend(),
        "Frontend": start_frontend()
    }
    
    # Verifica se ao menos um servidor foi iniciado
    if not any(processes.values()):
        print("\033[91m[Erro] Nenhum servidor pôde ser iniciado. Verifique os erros acima.\033[0m")
        return
    
    print("\033[92m[Sistema] Servidores iniciados! Pressione Ctrl+C para encerrar.\033[0m")
    monitor_processes(processes)

if __name__ == "__main__":
    main()
