/**
 * Component Refresher
 * 
 * Este módulo garante que componentes importantes estejam definidos
 * antes que sejam necessários por outros scripts.
 */

// Adicionar a função setupDOMErrorMonitoring ao DOMUtils
if (window.DOMUtils && !window.DOMUtils.setupDOMErrorMonitoring) {
  window.DOMUtils.setupDOMErrorMonitoring = function(options = {}) {
    console.log('📝 Configurando monitoramento de erros DOM avançado');
    
    // Já temos initErrorMonitoring, mas vamos estender com mais funcionalidades
    this.initErrorMonitoring();
    
    // Lista global de erros DOM
    if (!window._domErrors) {
      window._domErrors = [];
    }
    
    // Captura referências a elementos inexistentes
    const originalGetElementById = document.getElementById;
    document.getElementById = function(id) {
      const element = originalGetElementById.call(document, id);
      if (!element && options.logMissingElements !== false) {
        console.warn(`⚠️ Elemento com ID "${id}" não encontrado no DOM`);
      }
      return element;
    };
    
    // Monitorar erros em scripts
    window.addEventListener('error', function(event) {
      const error = {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        timestamp: new Date().toISOString(),
        stack: event.error ? event.error.stack : null
      };
      
      window._domErrors.push(error);
      
      // Notificar error handlers registrados
      document.dispatchEvent(new CustomEvent('dom-error', { detail: error }));
    });
    
    return {
      success: true,
      timestamp: new Date().toISOString()
    };
  };
  
  console.log('✅ DOMUtils.setupDOMErrorMonitoring foi implementado');
}

// Garantir que updateBalanceIndicator exista
if (typeof window.updateBalanceIndicator !== 'function') {
  // Criar uma versão temporária da função para evitar erros
  window.updateBalanceIndicator = function(metrics = {}) {
    console.log('Stub de updateBalanceIndicator chamado com:', metrics);
    // Vamos tentar carregar o script real
    loadBalanceIndicatorScript();
  };
  
  // Tentar carregar o script balance-indicator.js
  loadBalanceIndicatorScript();
}

// Garantir que updateComparisonTable exista IMEDIATAMENTE no window
window.updateComparisonTable = window.updateComparisonTable || function(data = {}) {
  console.log('Stub padrão de updateComparisonTable chamado com:', data);
  
  const tableBody = document.getElementById('comparison-table-body');
  if (tableBody) {
    // Implementação simples para exibir dados
    try {
      if (Array.isArray(data) && data.length > 0) {
        let html = '';
        data.forEach(item => {
          html += '<tr>';
          Object.values(item).forEach(value => {
            html += `<td>${value}</td>`;
          });
          html += '</tr>';
        });
        tableBody.innerHTML = html;
      }
    } catch (error) {
      console.error('Erro ao atualizar tabela de comparação:', error);
    }
  }
  
  // Carregar implementação real se disponível
  loadComparisonTableScript();
};

/**
 * Carrega o script balance-indicator.js dinamicamente
 */
function loadBalanceIndicatorScript() {
  // Verifica se o script já está carregado ou sendo carregado
  if (document.querySelector('script[src*="balance-indicator.js"]')) {
    return;
  }
  
  const script = document.createElement('script');
  script.src = '/js/balance-indicator.js';
  script.async = true;
  script.onload = function() {
    console.log('✅ Script balance-indicator.js carregado com sucesso');
    document.dispatchEvent(new CustomEvent('balanceIndicatorReady'));
  };
  script.onerror = function() {
    console.error('❌ Erro ao carregar balance-indicator.js');
  };
  document.head.appendChild(script);
}

/**
 * Carrega o script comparison-table.js dinamicamente
 */
function loadComparisonTableScript() {
  // Verifica se o script já está carregado ou sendo carregado
  if (document.querySelector('script[src*="comparison-table.js"]')) {
    return;
  }
  
  // Tenta localizar o script, se existir
  const script = document.createElement('script');
  script.src = '/js/comparison-table.js';
  script.async = true;
  script.onload = function() {
    console.log('✅ Script comparison-table.js carregado com sucesso');
  };
  script.onerror = function() {
    console.warn('⚠️ Script comparison-table.js não encontrado. Usando implementação stub.');
    
    // Define uma implementação simples para garantir funcionamento básico
    window.updateComparisonTable = function(data) {
      console.log('Implementação básica de updateComparisonTable', data);
      
      const tableBody = document.getElementById('comparison-table-body');
      if (!tableBody) {
        console.debug('Elemento comparison-table-body não encontrado.');
        return;
      }
      
      // Implementação mínima para exibir dados
      try {
        if (Array.isArray(data) && data.length > 0) {
          let html = '';
          data.forEach(item => {
            html += '<tr>';
            Object.values(item).forEach(value => {
              html += `<td>${value}</td>`;
            });
            html += '</tr>';
          });
          tableBody.innerHTML = html;
        }
      } catch (error) {
        console.error('Erro ao atualizar tabela de comparação:', error);
      }
    };
  };
  document.head.appendChild(script);
}

/**
 * Atualiza componentes após mudanças dinâmicas no DOM
 */
window.refreshComponents = function() {
  console.info('🔄 Refreshing components after dynamic content load...');
  
  // Seleciona todos os componentes que precisam ser atualizados
  const selects = document.querySelectorAll('.br-select:not([data-initialized])');
  const messages = document.querySelectorAll('.br-message:not([data-initialized])');
  const collapses = document.querySelectorAll('.br-collapse:not([data-initialized])');
  const tooltips = document.querySelectorAll('.br-tooltip:not([data-initialized])');
  const tabs = document.querySelectorAll('.br-tab:not([data-initialized])');
  const tables = document.querySelectorAll('.br-table:not([data-initialized])');
  
  // Atualiza os componentes Select
  if (selects.length && typeof BRSelect !== 'undefined') {
    selects.forEach(el => {
      new BRSelect('br-select', el);
      el.setAttribute('data-initialized', 'true');
    });
    console.log(`✓ Refreshed ${selects.length} select components`);
  }
  
  // Atualiza os componentes Message
  if (messages.length && typeof BRMessage !== 'undefined') {
    messages.forEach(el => {
      new BRMessage('br-message', el);
      el.setAttribute('data-initialized', 'true');
    });
    console.log(`✓ Refreshed ${messages.length} message components`);
  }
  
  // Atualiza os componentes Collapse
  if (collapses.length && typeof BRCollapse !== 'undefined') {
    collapses.forEach(el => {
      new BRCollapse('br-collapse', el);
      el.setAttribute('data-initialized', 'true');
    });
    console.log(`✓ Refreshed ${collapses.length} collapse components`);
  }
  
  // Atualiza os componentes Tooltip
  if (tooltips.length && typeof BRTooltip !== 'undefined') {
    tooltips.forEach(el => {
      new BRTooltip('br-tooltip', el);
      el.setAttribute('data-initialized', 'true');
    });
    console.log(`✓ Refreshed ${tooltips.length} tooltip components`);
  }
  
  // Atualiza os componentes Tab (importante para visualizações em abas)
  if (tabs.length && typeof BRTab !== 'undefined') {
    tabs.forEach(el => {
      new BRTab('br-tab', el);
      el.setAttribute('data-initialized', 'true');
    });
    console.log(`✓ Refreshed ${tabs.length} tab components`);
  }
  
  // Atualiza os componentes Table (importante para dados tabulares)
  if (tables.length && typeof BRTable !== 'undefined') {
    tables.forEach((el, index) => {
      new BRTable('br-table', el, index);
      el.setAttribute('data-initialized', 'true');
    });
    console.log(`✓ Refreshed ${tables.length} table components`);
  }
  
  // Dispara um evento personalizado para informar que os componentes foram atualizados
  document.dispatchEvent(new CustomEvent('components:refreshed'));
};

// Informar que o script foi carregado
console.log('✅ Component refresher loaded and ready');

// Executa a atualização inicial após o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
  // A inicialização principal é feita pelo core.min.js, então vamos apenas adicionar 
  // um hook para quando conteúdo dinâmico for carregado posteriormente
  console.info('🔌 Component refresher initialized and ready');
});
