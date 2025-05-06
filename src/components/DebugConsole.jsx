import React, { useState, useEffect } from 'react';
import { getLogHistory, clearLogHistory, LogLevel } from '../utils/debugTools';
import './DebugConsole.css';

const DebugConsole = () => {
  const [logs, setLogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    // Inicializar com os logs existentes
    setLogs(getLogHistory());
    
    // Ouvir por novos logs
    const handleNewLog = (event) => {
      setLogs((prevLogs) => [event.detail, ...prevLogs]);
    };
    
    document.addEventListener('debug:newLog', handleNewLog);
    
    return () => {
      document.removeEventListener('debug:newLog', handleNewLog);
    };
  }, []);
  
  const handleClearLogs = () => {
    clearLogHistory();
    setLogs([]);
  };
  
  const toggleConsole = () => {
    setIsOpen(!isOpen);
  };
  
  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.level === filter);
  
  // Renderiza somente em modo de desenvolvimento ou quando forçado por configuração
  if (process.env.NODE_ENV === 'production') return null;
  
  return (
    <div className={`debug-console ${isOpen ? 'debug-console-open' : ''}`}>
      <div className="debug-console-header" onClick={toggleConsole}>
        <span>{isOpen ? 'Fechar' : 'Abrir'} Console de Depuração</span>
        {!isOpen && (
          <div className="debug-console-badge">
            {logs.filter(log => log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL).length}
          </div>
        )}
      </div>
      
      {isOpen && (
        <div className="debug-console-content">
          <div className="debug-console-toolbar">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value={LogLevel.DEBUG}>Debug</option>
              <option value={LogLevel.INFO}>Info</option>
              <option value={LogLevel.WARNING}>Avisos</option>
              <option value={LogLevel.ERROR}>Erros</option>
              <option value={LogLevel.CRITICAL}>Críticos</option>
            </select>
            <button onClick={handleClearLogs}>Limpar Logs</button>
          </div>
          
          <div className="debug-console-logs">
            {filteredLogs.length === 0 ? (
              <div className="debug-console-empty">Nenhum log encontrado.</div>
            ) : (
              filteredLogs.map(log => (
                <div 
                  key={log.id} 
                  className={`debug-log-entry debug-log-${log.level}`}
                >
                  <div className="debug-log-timestamp">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="debug-log-level">{log.level}</div>
                  <div className="debug-log-message">{log.message}</div>
                  {log.error && (
                    <div className="debug-log-error">
                      <div>{log.error.message}</div>
                      <pre>{log.error.stack}</pre>
                    </div>
                  )}
                  {Object.keys(log.metadata).length > 0 && (
                    <div className="debug-log-metadata">
                      <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugConsole;
