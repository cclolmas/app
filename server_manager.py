#!/usr/bin/env python3
"""
Script para gerenciar servidores, verificar portas em uso e encerrar processos
"""

import os
import subprocess
import signal
import socket
import sys
import time
import psutil

DEFAULT_PORT = 8001

def check_port_in_use(port):
    """Verifica se uma porta está em uso"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def find_process_using_port(port):
    """Encontra o processo que está usando uma porta específica"""
    for proc in psutil.process_iter(['pid', 'name', 'connections']):
        try:
            for conn in proc.connections(kind='inet'):
                if conn.laddr.port == port:
                    return proc
        except (psutil.AccessDenied, psutil.NoSuchProcess):
            pass
    return None

def kill_process_on_port(port):
    """Mata o processo que está usando uma porta específica"""
    process = find_process_using_port(port)
    if process:
        print(f"\033[93m[Gerenciador] Encontrado processo {process.info['name']} (PID: {process.info['pid']}) usando a porta {port}\033[0m")
        try:
            os.kill(process.info['pid'], signal.SIGTERM)
            time.sleep(0.5)
            if check_port_in_use(port):  # Se ainda estiver em uso, força o encerramento
                os.kill(process.info['pid'], signal.SIGKILL)
                time.sleep(0.5)
            
            if not check_port_in_use(port):
                print(f"\033[92m[Gerenciador] Processo na porta {port} encerrado com sucesso\033[0m")
                return True
            else:
                print(f"\033[91m[Gerenciador] Não foi possível encerrar o processo na porta {port}\033[0m")
                return False
        except Exception as e:
            print(f"\033[91m[Gerenciador] Erro ao encerrar processo: {e}\033[0m")
            return False
    else:
        print(f"\033[93m[Gerenciador] Nenhum processo encontrado usando a porta {port}\033[0m")
        return False

def start_server(port=None):
    """Inicia o servidor na porta especificada ou em uma porta disponível"""
    if port:
        cmd = [sys.executable, "start_server.py", str(port)]
    else:
        cmd = [sys.executable, "start_server.py"]
        
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )
    
    # Aguarda um pouco para ver se o servidor iniciou corretamente
    time.sleep(2)
    if process.poll() is not None:
        stdout, stderr = process.communicate()
        print(f"\033[91m[Gerenciador] Falha ao iniciar o servidor:\033[0m")
        if stdout:
            print("\033[91mSaída:\033[0m", stdout)
        if stderr:
            print("\033[91mErro:\033[0m", stderr)
        return None
    
    return process

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Gerencia o servidor HTTP do projeto CCLOLMAS")
    parser.add_argument('action', choices=['start', 'stop', 'restart', 'status'],
                      help='Ação a ser executada')
    parser.add_argument('-p', '--port', type=int, default=DEFAULT_PORT,
                      help=f'Porta a ser usada (padrão: {DEFAULT_PORT})')
    
    args = parser.parse_args()
    
    if args.action == 'status':
        if check_port_in_use(args.port):
            process = find_process_using_port(args.port)
            if process:
                print(f"\033[92m[Gerenciador] Servidor ativo na porta {args.port} - Processo: {process.info['name']} (PID: {process.info['pid']})\033[0m")
            else:
                print(f"\033[93m[Gerenciador] Porta {args.port} está em uso, mas não foi possível identificar o processo\033[0m")
        else:
            print(f"\033[93m[Gerenciador] Nenhum servidor ativo na porta {args.port}\033[0m")
    
    elif args.action == 'stop':
        if check_port_in_use(args.port):
            kill_process_on_port(args.port)
        else:
            print(f"\033[93m[Gerenciador] Nenhum servidor ativo na porta {args.port}\033[0m")
    
    elif args.action == 'start':
        if check_port_in_use(args.port):
            print(f"\033[93m[Gerenciador] A porta {args.port} já está em uso. Use 'restart' para reiniciar o servidor.\033[0m")
        else:
            process = start_server(args.port)
            if process:
                print(f"\033[92m[Gerenciador] Servidor iniciado na porta {args.port}\033[0m")
    
    elif args.action == 'restart':
        if check_port_in_use(args.port):
            print(f"\033[93m[Gerenciador] Encerrando servidor atual na porta {args.port}...\033[0m")
            if kill_process_on_port(args.port):
                print(f"\033[93m[Gerenciador] Iniciando novo servidor na porta {args.port}...\033[0m")
                process = start_server(args.port)
                if process:
                    print(f"\033[92m[Gerenciador] Servidor reiniciado na porta {args.port}\033[0m")
        else:
            print(f"\033[93m[Gerenciador] Nenhum servidor ativo para reiniciar. Iniciando novo servidor...\033[0m")
            process = start_server(args.port)
            if process:
                print(f"\033[92m[Gerenciador] Servidor iniciado na porta {args.port}\033[0m")

if __name__ == "__main__":
    main()
