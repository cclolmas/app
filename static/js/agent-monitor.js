class AgentMonitor {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            updateInterval: 100, // ms
            maxHistory: 50,
            displayMode: 'cards', // 'cards', 'list', 'diagram'
            ...options
        };
        
        this.agents = new Map(); // Armazena os dados de cada agente
        this.socket = null;
        this.connected = false;
        
        this.init();
    }
    
    init() {
        // Cria elementos da UI
        this.createUI();
        
        // Inicializa WebSocket
        this.initWebSocket();
        
        // Configurações de exibição
        this.setupDisplayControls();
    }
    
    createUI() {
        this.container.innerHTML = `
            <div class="agent-monitor-header">
                <h2>Monitor de Agentes</h2>
                <div class="controls">
                    <select id="display-mode">
                        <option value="cards">Cartões</option>
                        <option value="list">Lista</option>
                        <option value="diagram">Diagrama</option>
                    </select>
                    <input type="text" id="search-filter" placeholder="Filtrar agentes...">
                    <span class="connection-status" id="connection-status">Desconectado</span>
                </div>
            </div>
            <div class="agent-monitor-container" id="agent-container"></div>
        `;
        
        this.agentContainer = document.getElementById('agent-container');
        this.connectionStatus = document.getElementById('connection-status');
        this.displaySelect = document.getElementById('display-mode');
        this.searchFilter = document.getElementById('search-filter');
    }
    
    initWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsUrl = `${protocol}://${window.location.host}/ws/agents`;
        
        this.socket = new WebSocket(wsUrl);
        
        this.socket.onopen = () => {
            this.connected = true;
            this.connectionStatus.textContent = 'Conectado';
            this.connectionStatus.classList.add('connected');
        };
        
        this.socket.onclose = () => {
            this.connected = false;
            this.connectionStatus.textContent = 'Desconectado';
            this.connectionStatus.classList.remove('connected');
            
            // Tenta reconectar após 5 segundos
            setTimeout(() => this.initWebSocket(), 5000);
        };
        
        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
        this.socket.onmessage = (event) => {
            this.handleMessage(JSON.parse(event.data));
        };
    }
    
    handleMessage(message) {
        switch(message.type) {
            case 'state_update':
                this.updateAgentState(message.agent_id, message.data);
                break;
                
            case 'full_state':
                this.updateAllAgents(message.data);
                break;
                
            default:
                console.warn('Mensagem desconhecida:', message);
        }
    }
    
    updateAgentState(agentId, data) {
        if (!this.agents.has(agentId)) {
            this.agents.set(agentId, {
                id: agentId,
                currentState: data,
                stateHistory: [data]
            });
            
            this.createAgentElement(agentId);
        } else {
            const agent = this.agents.get(agentId);
            agent.currentState = data;
            
            // Adicionar ao histórico
            agent.stateHistory.push(data);
            if (agent.stateHistory.length > this.options.maxHistory) {
                agent.stateHistory.shift();
            }
            
            // Atualizar o elemento visual
            this.updateAgentElement(agentId);
        }
    }
    
    updateAllAgents(data) {
        Object.entries(data).forEach(([agentId, stateData]) => {
            this.updateAgentState(agentId, stateData);
        });
    }
    
    createAgentElement(agentId) {
        const agent = this.agents.get(agentId);
        const element = document.createElement('div');
        element.className = 'agent-card';
        element.id = `agent-${agentId}`;
        element.innerHTML = this.getAgentTemplate(agentId);
        
        this.agentContainer.appendChild(element);
        this.updateAgentElement(agentId);
    }
    
    updateAgentElement(agentId) {
        const agent = this.agents.get(agentId);
        const element = document.getElementById(`agent-${agentId}`);
        
        if (!element) return;
        
        const statusEl = element.querySelector('.agent-status');
        const infoEl = element.querySelector('.agent-info');
        const timeEl = element.querySelector('.agent-time');
        
        // Atualizar informações básicas
        const state = agent.currentState.state;
        statusEl.textContent = state.status || 'Unknown';
        statusEl.className = `agent-status status-${(state.status || '').toLowerCase()}`;
        
        // Atualizar timestamp
        const timestamp = new Date(agent.currentState.timestamp);
        timeEl.textContent = timestamp.toLocaleTimeString();
        
        // Atualizar detalhes do estado
        infoEl.innerHTML = this.formatStateInfo(state);
        
        // Adicionar classe para animação de atualização
        element.classList.add('updated');
        setTimeout(() => {
            element.classList.remove('updated');
        }, this.options.updateInterval);
    }
    
    getAgentTemplate(agentId) {
        return `
            <h3 class="agent-title">${agentId}</h3>
            <div class="agent-status">Desconhecido</div>
            <div class="agent-time"></div>
            <div class="agent-info"></div>
            <button class="history-btn" data-agent="${agentId}">Histórico</button>
        `;
    }
    
    formatStateInfo(state) {
        let html = '<dl>';
        
        // Formata as propriedades principais para exibição
        Object.entries(state)
            .filter(([key]) => key !== 'status')  // status já é exibido separadamente
            .forEach(([key, value]) => {
                html += `<dt>${key}:</dt>`;
                
                if (typeof value === 'object' && value !== null) {
                    html += `<dd>${JSON.stringify(value)}</dd>`;
                } else {
                    html += `<dd>${value}</dd>`;
                }
            });
        
        html += '</dl>';
        return html;
    }
    
    setupDisplayControls() {
        // Controle de modo de exibição
        this.displaySelect.addEventListener('change', (e) => {
            this.options.displayMode = e.target.value;
            this.updateDisplay();
        });
        
        // Filtro de busca
        this.searchFilter.addEventListener('input', (e) => {
            const filter = e.target.value.toLowerCase();
            this.filterAgents(filter);
        });
        
        // Botões de histórico
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('history-btn')) {
                const agentId = e.target.getAttribute('data-agent');
                this.showAgentHistory(agentId);
            }
        });
    }
    
    updateDisplay() {
        this.agentContainer.className = `agent-monitor-container mode-${this.options.displayMode}`;
        
        // Atualiza a exibição de cada agente com base no modo selecionado
        this.agents.forEach((agent, agentId) => {
            const element = document.getElementById(`agent-${agentId}`);
            if (element) {
                element.className = `agent-card mode-${this.options.displayMode}`;
                
                // Se for modo diagrama, atualiza visualização específica
                if (this.options.displayMode === 'diagram') {
                    this.updateAgentDiagram(agentId);
                }
            }
        });
    }
    
    filterAgents(filter) {
        this.agents.forEach((agent, agentId) => {
            const element = document.getElementById(`agent-${agentId}`);
            if (element) {
                if (!filter || agentId.toLowerCase().includes(filter)) {
                    element.style.display = '';
                } else {
                    element.style.display = 'none';
                }
            }
        });
    }
    
    updateAgentDiagram(agentId) {
        const agent = this.agents.get(agentId);
        const element = document.getElementById(`agent-${agentId}`);
        
        if (!element || !agent) return;
        
        const infoEl = element.querySelector('.agent-info');
        
        // Implementação básica de diagrama - pode ser substituída por uma biblioteca como D3.js
        const history = agent.stateHistory;
        
        // Cria um SVG simples para mostrar a progressão de estados
        let svgContent = `
            <svg width="100%" height="80" class="state-diagram">
                <g transform="translate(10, 40)">
        `;
        
        history.forEach((item, index) => {
            const x = (index / (history.length - 1 || 1)) * 100;
            const state = item.state;
            const color = this.getStateColor(state.status);
            
            svgContent += `
                <circle cx="${x}%" cy="0" r="5" fill="${color}" 
                    data-timestamp="${item.timestamp}" data-index="${index}" />
            `;
            
            // Conectar pontos com linhas
            if (index > 0) {
                const prevX = ((index - 1) / (history.length - 1 || 1)) * 100;
                svgContent += `
                    <line x1="${prevX}%" y1="0" x2="${x}%" y2="0" 
                        stroke="${color}" stroke-width="2" />
                `;
            }
        });
        
        svgContent += `
                </g>
            </svg>
        `;
        
        infoEl.innerHTML = svgContent + this.formatStateInfo(agent.currentState.state);
    }
    
    getStateColor(status) {
        const colors = {
            'active': '#32CD32',
            'processing': '#FFA500',
            'idle': '#1E90FF',
            'error': '#FF0000',
            'completed': '#8A2BE2'
        };
        
        return colors[status?.toLowerCase()] || '#888888';
    }
    
    showAgentHistory(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return;
        
        // Cria modal para exibir histórico
        const modal = document.createElement('div');
        modal.className = 'agent-history-modal';
        
        let historyContent = `
            <div class="history-header">
                <h3>Histórico de Estados: ${agentId}</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="history-content">
                <table class="history-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Status</th>
                            <th>Detalhes</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Adiciona histórico em ordem reversa (mais recente primeiro)
        [...agent.stateHistory].reverse().forEach(item => {
            const timestamp = new Date(item.timestamp);
            const state = item.state;
            
            historyContent += `
                <tr>
                    <td>${timestamp.toLocaleString()}</td>
                    <td class="status-${(state.status || '').toLowerCase()}">${state.status || 'Unknown'}</td>
                    <td><pre>${JSON.stringify(state, null, 2)}</pre></td>
                </tr>
            `;
        });
        
        historyContent += `
                    </tbody>
                </table>
            </div>
        `;
        
        modal.innerHTML = historyContent;
        document.body.appendChild(modal);
        
        // Adiciona evento para fechar o modal
        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }
}
