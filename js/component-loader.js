/**
 * Component Loader e Visualization Helper
 * 
 * Este módulo garante que todos os componentes necessários para visualizações
 * sejam carregados corretamente e na ordem certa.
 */

// Objeto global para gerenciar componentes
window.ComponentLoader = {
  // Componentes registrados
  components: {},
  
  // Status da inicialização
  initialized: false,
  
  // Registrar um componente
  register: function(name, initFunction) {
    this.components[name] = {
      init: initFunction,
      loaded: false
    };
    console.log(`🔌 Componente "${name}" registrado`);
    return this;
  },
  
  // Inicializar um componente específico
  initComponent: function(name) {
    const component = this.components[name];
    if (!component) {
      console.warn(`⚠️ Componente "${name}" não registrado`);
      return false;
    }
    
    if (component.loaded) {
      console.log(`ℹ️ Componente "${name}" já foi inicializado`);
      return true;
    }
    
    try {
      component.init();
      component.loaded = true;
      console.log(`✅ Componente "${name}" inicializado com sucesso`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao inicializar "${name}":`, error);
      return false;
    }
  },
  
  // Inicializar todos os componentes registrados
  initAll: function() {
    console.log('🚀 Inicializando todos os componentes registrados...');
    let success = true;
    
    Object.keys(this.components).forEach(name => {
      if (!this.initComponent(name)) {
        success = false;
      }
    });
    
    this.initialized = true;
    if (success) {
      console.log('✅ Todos os componentes inicializados com sucesso');
      // Emitir evento para informar que todos os componentes foram carregados
      document.dispatchEvent(new CustomEvent('components:loaded'));
    } else {
      console.warn('⚠️ Alguns componentes não puderam ser inicializados');
    }
    
    return success;
  },
  
  // Verificar se elemento existe antes de usar
  safeGetElement: function(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.debug(`🔍 Elemento com ID "${id}" não encontrado no DOM atual`);
      return null;
    }
    return element;
  },
  
  // Atualizar componentes específicos após mudanças no DOM
  refreshComponent: function(name) {
    if (this.components[name] && typeof this.components[name].refresh === 'function') {
      console.log(`🔄 Atualizando componente "${name}"`);
      this.components[name].refresh();
    }
  }
};

// Registramos os componentes principais de visualização
window.ComponentLoader.register('balanceIndicator', function() {
  // Esta função verifica se temos updateBalanceIndicator disponível
  if (typeof window.updateBalanceIndicator !== 'function') {
    // Se não tiver, vamos definir uma implementação stub para evitar erros
    window.updateBalanceIndicator = function(metrics) {
      console.warn('⚠️ updateBalanceIndicator chamado, mas não está implementado corretamente', metrics);
    };
    
    // Carregar dinamicamente o script balance-indicator.js se necessário
    const script = document.createElement('script');
    script.src = '/js/balance-indicator.js';
    script.async = true;
    script.onload = function() {
      console.log('✅ Script balance-indicator.js carregado com sucesso');
      // Tentar atualizar com valores padrão após carregar
      if (typeof window.updateBalanceIndicator === 'function') {
        window.updateBalanceIndicator({});
      }
    };
    document.head.appendChild(script);
  }
}).register('charts', function() {
  // Apenas um stub para exemplificar - isto seria implementado conforme necessário
  console.log('📊 Inicializando módulos de gráficos...');
  
  // Verificar se o Chart.js está disponível
  if (typeof Chart === 'undefined') {
    console.warn('⚠️ Chart.js não está disponível. Tentando carregar dinamicamente...');
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    script.onload = function() {
      console.log('✅ Chart.js carregado com sucesso');
      // Inicializar gráficos aqui
    };
    document.head.appendChild(script);
  }
});

// Inicializamos quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  window.ComponentLoader.initAll();
  
  // Adicionamos um listener para content-updated para reinicializar componentes específicos
  document.addEventListener('content:updated', function(event) {
    const components = event.detail && event.detail.components ? event.detail.components : ['balanceIndicator', 'charts'];
    components.forEach(function(component) {
      window.ComponentLoader.refreshComponent(component);
    });
  });
});

// Exportar uma função para atualizar componentes em casos específicos
window.refreshComponents = function(componentNames) {
  const componentsToRefresh = componentNames || Object.keys(window.ComponentLoader.components);
  
  componentsToRefresh.forEach(function(name) {
    window.ComponentLoader.refreshComponent(name);
  });
  
  console.log('🔄 Componentes atualizados após alterações no DOM');
};
