#!/usr/bin/env python3
"""
Script para iniciar um servidor HTTP simples na porta 8001
para testar a visualização dos gráficos.
"""

import http.server
import socketserver
import os
import webbrowser
import socket
from pathlib import Path
import http.client
from http import HTTPStatus
import sys

# Configurações do servidor
DEFAULT_PORT = 8001
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def log_message(self, format, *args):
        # Formatar mensagens de log com cores para facilitar a leitura
        if isinstance(args[0], str) and args[0].startswith('GET') and isinstance(args[1], str) and args[1].startswith('2'):
            # Requisições bem-sucedidas (GET com código 2xx)
            print(f"\033[92m[Servidor] {self.address_string()} - {format % args}\033[0m")
        elif isinstance(args[0], HTTPStatus):
            # Erros HTTP
            status_code = args[0].value
            status_name = args[0].name
            message = args[1] if len(args) > 1 else ""
            print(f"\033[93m[Servidor] {self.address_string()} - Erro {status_code} ({status_name}): {message}\033[0m")
        else:
            # Outros tipos de mensagens
            print(f"\033[93m[Servidor] {self.address_string()} - {format % args}\033[0m")

def find_free_port(start_port=DEFAULT_PORT, max_attempts=20):
    """Encontra uma porta disponível começando da porta inicial."""
    for port_offset in range(max_attempts):
        port = start_port + port_offset
        try:
            # Tenta criar um socket na porta para verificar se está disponível
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.bind(('localhost', port))
                return port
        except OSError:
            continue
    
    # Se chegamos aqui, não encontramos nenhuma porta disponível
    print(f"\033[91m[Erro] Não foi possível encontrar uma porta disponível após {max_attempts} tentativas.\033[0m")
    return None

def main():
    # Verificando se os arquivos necessários existem
    files_to_check = [
        "index.html",
        "scripts.js",
        "js/synthetic_data.json"
    ]
    
    for file in files_to_check:
        path = Path(DIRECTORY) / file
        if not path.exists():
            print(f"\033[91mArquivo necessário não encontrado: {file}\033[0m")
            return
    
    # Verifica se alguns arquivos não essenciais existem e avisa se não
    optional_files = [
        "styles.css",
        "js/plotly-basic-latest.min.js"
    ]
    
    for file in optional_files:
        path = Path(DIRECTORY) / file
        if not path.exists():
            print(f"\033[93mArquivo opcional não encontrado: {file}\033[0m")
            print(f"\033[93mO arquivo {file} está referenciado no HTML, mas não existe no diretório.\033[0m")
            print(f"\033[93mIsso pode causar erros, mas o CDN da biblioteca Plotly deve funcionar mesmo assim.\033[0m")
    
    port = None
    
    # Verificar se foi passada uma porta como argumento
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
            print(f"\033[96m[Servidor] Tentando usar porta específica: {port}\033[0m")
        except ValueError:
            print("\033[93m[Servidor] Argumento de porta inválido, usando busca automática.\033[0m")
    
    if port is None:
        # Encontrar uma porta disponível
        port = find_free_port()
        if port is None:
            print("\033[91m[Erro] Falha ao encontrar uma porta disponível. Encerrando.\033[0m")
            return
    
    try:
        # Configuração do servidor com tratamento de erro
        try:
            httpd = socketserver.TCPServer(("", port), Handler)
        except OSError as e:
            if e.errno == 98:  # Erro de endereço em uso
                print(f"\033[93m[Servidor] Porta {port} já está em uso.\033[0m")
                port = find_free_port(port + 1)  # Tenta encontrar outra porta
                if port is None:
                    return
                httpd = socketserver.TCPServer(("", port), Handler)
            else:
                raise
        
        print(f"\033[96m[Servidor] Iniciando servidor HTTP na porta {port}...\033[0m")
        print(f"\033[96m[Servidor] Diretório: {DIRECTORY}\033[0m")
        print(f"\033[96m[Servidor] Acesse http://localhost:{port}/ no seu navegador\033[0m")
        print(f"\033[96m[Servidor] Pressione Ctrl+C para encerrar o servidor\033[0m")
        
        # Abre o navegador automaticamente
        webbrowser.open(f"http://localhost:{port}/")
        
        # Inicia o servidor
        httpd.serve_forever()
    
    except KeyboardInterrupt:
        print("\n\033[96m[Servidor] Servidor encerrado pelo usuário.\033[0m")
    except Exception as e:
        print(f"\033[91m[Servidor] Erro: {e}\033[0m")

if __name__ == "__main__":
    main()