import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const generateMockAgents = (count) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `agent-${index}`,
    name: `Agent ${index}`,
    type: index % 3 === 0 ? 'AI' : index % 3 === 1 ? 'Human' : 'Hybrid',
    status: index % 4 === 0 ? 'active' : index % 4 === 1 ? 'inactive' : index % 4 === 2 ? 'paused' : 'error',
    performance: Math.random() * 100,
    messages: Math.floor(Math.random() * 1000),
    connections: Math.floor(Math.random() * 20),
    lastActive: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toISOString(),
    ramUsage: Math.random() * 1024, // Changed from cpuUsage to ramUsage
    memoryUsage: Math.random() * 1024,
    stats: {
      accuracy: Math.random() * 100,
      speed: Math.random() * 100,
      efficiency: Math.random() * 100
    }
  }));
};

const AgentItem = React.memo(({ agent, onSelect }) => {
  return (
    <div 
      className="agent-item" 
      onClick={() => onSelect(agent)}
      style={{
        padding: '8px',
        margin: '4px 0',
        border: '1px solid #ddd',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <strong>{agent.name}</strong> ({agent.type})
      </div>
      <div>
        Status: {agent.status} | RAM: {agent.ramUsage.toFixed(1)}MB | Memory: {agent.memoryUsage.toFixed(1)}MB
      </div>
    </div>
  );
});

const AgentDetails = React.memo(({ agent }) => {
  if (!agent) return null;
  
  return (
    <div
      style={{
        padding: '16px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginTop: '16px'
      }}
    >
      <h3>{agent.name}</h3>
      <table style={{ width: '100%' }}>
        <tbody>
          {Object.entries(agent).map(([key, value]) => {
            if (key === 'stats') return null;
            if (typeof value === 'object') return null;
            
            return (
              <tr key={key}>
                <td style={{ fontWeight: 'bold', padding: '4px' }}>{key}</td>
                <td>{String(value)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <h4>Performance Stats</h4>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>Accuracy: {agent.stats.accuracy.toFixed(1)}%</div>
        <div>Speed: {agent.stats.speed.toFixed(1)}</div>
        <div>Efficiency: {agent.stats.efficiency.toFixed(1)}%</div>
      </div>
    </div>
  );
});

function TestPerformancePage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const agentCount = parseInt(params.get('agents') || '10', 10);
  
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fps, setFps] = useState(0);
  
  // Medição de FPS
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFps = () => {
      frameCount++;
      const now = performance.now();
      
      if (now - lastTime >= 1000) {
        const currentFps = frameCount * 1000 / (now - lastTime);
        setFps(currentFps);
        window.lastFPS = currentFps;
        frameCount = 0;
        lastTime = now;
      }
      
      requestAnimationFrame(measureFps);
    };
    
    const animationId = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Carregar agentes e medir o tempo
  useEffect(() => {
    const startTime = performance.now();
    
    // Simular trabalho de rede/cálculo
    setTimeout(() => {
      const mockAgents = generateMockAgents(agentCount);
      setAgents(mockAgents);
      setIsLoading(false);
      
      const renderTime = performance.now() - startTime;
      
      // Registrar dados de desempenho
      if (window.logPerformance) {
        window.logPerformance({
          agentCount,
          initialRenderMs: renderTime,
          timestamp: new Date().toISOString()
        });
      }
      
      // Marcar que o teste está completo para que o script de teste saiba
      const completionMarker = document.createElement('div');
      completionMarker.id = 'performance-test-complete';
      completionMarker.style.display = 'none';
      document.body.appendChild(completionMarker);
      
    }, 500); // Simular tempo de carregamento
  }, [agentCount]);

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
  };

  // Simulação de atualização periódica dos agentes para testar a reatividade
  useEffect(() => {
    if (agents.length === 0) return;
    
    const updateInterval = setInterval(() => {
      setAgents(currentAgents => 
        currentAgents.map(agent => ({
          ...agent,
          ramUsage: Math.random() * 1024, // Changed from cpuUsage to ramUsage
          memoryUsage: Math.random() * 1024,
          status: Math.random() > 0.9 ? 
            (agent.status === 'active' ? 'inactive' : 'active') : 
            agent.status
        }))
      );
    }, 2000);
    
    return () => clearInterval(updateInterval);
  }, [agents.length]);

  return (
    <div 
      style={{
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}
    >
      <h1>Performance Test: {agentCount} Agents</h1>
      <div 
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: '#333',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '4px'
        }}
      >
        FPS: {fps.toFixed(1)}
      </div>
      
      {isLoading ? (
        <div>Loading {agentCount} agents...</div>
      ) : (
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}
        >
          <div>
            <h2>Agents ({agents.length})</h2>
            <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
              {agents.map(agent => (
                <AgentItem 
                  key={agent.id} 
                  agent={agent}
                  onSelect={handleSelectAgent}
                />
              ))}
            </div>
          </div>
          <div>
            <h2>Selected Agent Details</h2>
            <AgentDetails agent={selectedAgent} />
          </div>
        </div>
      )}
    </div>
  );
}

export default TestPerformancePage;
