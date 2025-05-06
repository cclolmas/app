import { 
  logMessage, 
  logError, 
  logWarning, 
  logInfo, 
  logDebug, 
  highlightElement, 
  LogLevel 
} from './debugTools';

/**
 * Função para testar as ferramentas de depuração
 */
export function testDebugTools() {
  console.log('Testando ferramentas de depuração...');
  
  // Teste de mensagens de log
  logDebug('Esta é uma mensagem de depuração');
  logInfo('Esta é uma mensagem informativa');
  logWarning('Esta é uma mensagem de aviso', { entidade: 'usuário', ação: 'login' });
  
  // Simular um erro
  try {
    const obj = null;
    obj.someMethod();
  } catch (error) {
    logError('Ocorreu um erro ao acessar método', error, {
      contexto: 'teste',
      importante: true
    });
  }
  
  // Teste de highlight de elementos
  const elemento = document.querySelector('button');
  if (elemento) {
    const removerHighlight = highlightElement(elemento, 'Este botão contém um erro');
    
    // Remover o highlight após 5 segundos
    setTimeout(() => {
      removerHighlight();
      logInfo('Highlight removido do botão');
    }, 5000);
  }
  
  // Mensagem crítica
  logMessage('Falha crítica simulada', LogLevel.CRITICAL, new Error('Erro crítico de teste'), {
    impacto: 'alto',
    requerAção: true
  });
  
  console.log('Testes de depuração concluídos');
}

// Expor no objeto window para testes no console
if (typeof window !== 'undefined') {
  window.testDebugTools = testDebugTools;
}
