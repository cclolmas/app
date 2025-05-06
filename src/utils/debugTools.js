/**
 * Ferramentas de depuração para a plataforma CrossDebate
 */

// Níveis de log
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

// Configurações de depuração
const debugConfig = {
  enabled: process.env.NODE_ENV !== 'production',
  logToConsole: true,
  logToUI: true,
  highlightErrors: true,
  maxLogs: 100,
};

// Armazenamento de logs
let logHistory = [];

/**
 * Registra uma mensagem de log
 * @param {string} message - Mensagem a ser registrada
 * @param {LogLevel} level - Nível do log
 * @param {Error|null} error - Objeto de erro (opcional)
 * @param {Object} metadata - Dados adicionais para o log
 */
export function logMessage(message, level = LogLevel.INFO, error = null, metadata = {}) {
  const timestamp = new Date();
  const logEntry = {
    id: Date.now() + Math.random().toString(36).substr(2, 5),
    message,
    level,
    timestamp,
    error: error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : null,
    metadata
  };

  // Adicionar ao histórico
  logHistory = [logEntry, ...logHistory].slice(0, debugConfig.maxLogs);

  // Despachar evento para o UI
  if (debugConfig.logToUI) {
    dispatchLogEvent(logEntry);
  }

  // Registrar no console nativo
  if (debugConfig.logToConsole) {
    logToConsole(logEntry);
  }

  return logEntry.id;
}

/**
 * Registra um erro
 */
export function logError(message, error = null, metadata = {}) {
  return logMessage(message, LogLevel.ERROR, error, metadata);
}

/**
 * Registra um aviso
 */
export function logWarning(message, metadata = {}) {
  return logMessage(message, LogLevel.WARNING, null, metadata);
}

/**
 * Registra uma informação
 */
export function logInfo(message, metadata = {}) {
  return logMessage(message, LogLevel.INFO, null, metadata);
}

/**
 * Registra uma mensagem de depuração
 */
export function logDebug(message, metadata = {}) {
  return logMessage(message, LogLevel.DEBUG, null, metadata);
}

/**
 * Aplica highlight em um elemento com erro
 * @param {HTMLElement} element - Elemento a ser destacado
 * @param {string} message - Mensagem de erro
 */
export function highlightElement(element, message) {
  if (!debugConfig.enabled || !debugConfig.highlightErrors) return;
  
  // Salvar o estilo original
  const originalStyle = {
    border: element.style.border,
    boxShadow: element.style.boxShadow,
    position: element.style.position,
  };

  // Aplicar highlight
  element.style.border = '2px solid red';
  element.style.boxShadow = '0 0 5px rgba(255,0,0,0.5)';
  element.dataset.debugError = message;
  
  // Criar tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'debug-error-tooltip';
  tooltip.textContent = message;
  tooltip.style.cssText = 'position:absolute;background:rgba(255,0,0,0.9);color:white;padding:5px;border-radius:3px;z-index:10000;max-width:250px;font-size:12px;display:none';
  
  element.addEventListener('mouseenter', () => {
    tooltip.style.display = 'block';
    tooltip.style.top = `${element.offsetTop + element.offsetHeight}px`;
    tooltip.style.left = `${element.offsetLeft}px`;
  });
  
  element.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });
  
  element.parentNode.appendChild(tooltip);
  
  // Método para remover o highlight
  return function removeHighlight() {
    element.style.border = originalStyle.border;
    element.style.boxShadow = originalStyle.boxShadow;
    element.style.position = originalStyle.position;
    delete element.dataset.debugError;
    if (tooltip.parentNode) {
      tooltip.parentNode.removeChild(tooltip);
    }
  };
}

// Funções internas
function logToConsole(logEntry) {
  const { level, message, error, metadata } = logEntry;
  const consoleStyles = {
    [LogLevel.DEBUG]: 'color: gray',
    [LogLevel.INFO]: 'color: blue',
    [LogLevel.WARNING]: 'color: orange; font-weight: bold',
    [LogLevel.ERROR]: 'color: red; font-weight: bold',
    [LogLevel.CRITICAL]: 'color: white; background: red; font-weight: bold',
  };
  
  console.groupCollapsed(`%c[${level.toUpperCase()}] ${message}`, consoleStyles[level] || '');
  if (Object.keys(metadata).length > 0) {
    console.log('Metadados:', metadata);
  }
  if (error) {
    console.error('Erro:', error);
  }
  console.groupEnd();
}

function dispatchLogEvent(logEntry) {
  const event = new CustomEvent('debug:newLog', { detail: logEntry });
  document.dispatchEvent(event);
}

/**
 * Retorna todo o histórico de logs
 */
export function getLogHistory() {
  return [...logHistory];
}

/**
 * Limpa o histórico de logs
 */
export function clearLogHistory() {
  logHistory = [];
  return true;
}

/**
 * Atualiza as configurações de depuração
 */
export function updateDebugConfig(newConfig) {
  Object.assign(debugConfig, newConfig);
  return { ...debugConfig };
}

/**
 * Obtém as configurações atuais
 */
export function getDebugConfig() {
  return { ...debugConfig };
}
