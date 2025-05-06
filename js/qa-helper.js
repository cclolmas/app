/**
 * Helper de QA para corrigir problemas comuns e fornecer ferramentas de depuração
 */
const QAHelper = {
  /**
   * Inicializa as ferramentas de QA
   * @param {Object} options - Opções de configuração
   */
  init: function(options = {}) {
    const defaultOptions = {
      fixMissingElements: true,
      fixMissingFunctions: true,
      monitorErrors: true,
      autoRetry: true,
      debugMode: false
    };
    
    this.options = { ...defaultOptions, ...options };
    this.initialized = false;
    
    // Configurar monitoramento de erros
    if (this.options.monitorErrors && window.DOMUtils && typeof window.DOMUtils.setupDOMErrorMonitoring === 'function') {
      window.DOMUtils.setupDOMErrorMonitoring();
    } else {
      console.warn('⚠️ DOMUtils.setupDOMErrorMonitoring is not available.');
    }
    
    // Garantir que estamos executando após o DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._initialize());
    } else {
      this._initialize();
    }
    
    return this;
  },
  
  /**
   * Inicialização principal
   */
  _initialize: function() {
    if (this.initialized) return;
    
    console.info('🔍 QA Helper: Inicializando...');
    
    // Verificar elementos críticos e criar se necessário
    if (this.options.fixMissingElements) {
      this._createMissingElements();
    }
    
    // Monitorar e corrigir funções ausentes
    if (this.options.fixMissingFunctions) {
      this._fixMissingFunctions();
    }
    
    // Adicionar métodos globais de suporte de QA
    this._exposeGlobalHelpers();
    
    this.initialized = true;
    console.info('✅ QA Helper: Inicialização concluída');
  },
  
  /**
   * Cria elementos importantes que estão faltando
   */
  _createMissingElements: function() {
    const criticalElements = [
      { selector: 'body', tag: 'body', parent: 'html' },
      { selector: 'main', tag: 'main', parent: 'body' },
      { selector: '.container', tag: 'div', parent: 'body', attributes: { class: 'container' } },
      { selector: '.chart-container', tag: 'div', parent: '.container', attributes: { class: 'chart-container' } },
      { selector: '#graph-histogram-cl', tag: 'div', parent: '.chart-container' }
    ];
    
    criticalElements.forEach(element => {
      if (window.DOMUtils) {
        const { exists } = window.DOMUtils.elementExists(element.selector, {
          createIfMissing: true,
          tagType: element.tag,
          parent: element.parent,
          attributes: element.attributes,
          debug: this.options.debugMode
        });
        
        if (!exists && this.options.debugMode) {
          console.info(`🛠️ QA Helper: Criado elemento ${element.selector}`);
        }
      }
    });
  },
  
  /**
   * Corrige funções ausentes mencionadas nos logs de erro
   */
  _fixMissingFunctions: function() {
    // Lista de funções que são frequentemente esperadas
    const commonFunctions = [
      { name: 'initializeMockData', scope: window, implementation: function() {
        console.info('⚠️ Mock implementation of initializeMockData called');
        return {};
      }},
      { name: 'initHistogramChart', scope: window, implementation: function() {
        console.warn('⚠️ Mock implementation of initHistogramChart called');
        return Promise.resolve();
      }},
      { name: 'initBarChart', scope: window, implementation: function() {
        console.info('⚠️ Mock implementation of initBarChart called');
        return null;
      }},
      { name: 'initScatterChart', scope: window, implementation: function() {
        console.warn('⚠️ Mock implementation of initScatterChart called');
        return Promise.resolve();
      }},
      { name: 'initHeatmapChart', scope: window, implementation: function() {
        console.info('⚠️ Mock implementation of initHeatmapChart called');
        return null;
      }},
      { name: 'initRadarChart', scope: window, implementation: function() {
        console.warn('⚠️ Mock implementation of initRadarChart called');
        return Promise.resolve();
      }},
      { name: 'initGaugeChart', scope: window, implementation: function() {
        console.warn('⚠️ Mock implementation of initGaugeChart called');
        return Promise.resolve();
      }}
    ];
    
    // Verificar e adicionar funções ausentes
    commonFunctions.forEach(func => {
      const { name, scope, implementation } = func;
      
      if (typeof scope[name] === 'undefined') {
        scope[name] = implementation;
        if (this.options.debugMode) {
          console.info(`🔧 QA Helper: Adicionado mock para função ausente ${name}`);
        }
      }
    });
    
    // Observer para monitorar e corrigir erros em tempo real se autoRetry estiver ativado
    if (this.options.autoRetry) {
      this._setupErrorObserver();
    }
  },
  
  /**
   * Configura um observer para detectar e corrigir erros em tempo real
   */
  _setupErrorObserver: function() {
    if (!window._domErrorLog) {
      window._domErrorLog = [];
    }
    
    // Monitorar a regra global window.onerror
    const originalOnError = window.onerror;
    window.onerror = (msg, url, lineNo, columnNo, error) => {
      // Tente corrigir o erro
      this._attemptToFixError(msg, error);
      
      // Chame o handler original, se existir
      if (typeof originalOnError === 'function') {
        return originalOnError(msg, url, lineNo, columnNo, error);
      }
      
      return false; // Não prevenir o comportamento padrão
    };
    
    console.info('👀 QA Helper: Monitoramento de erros em tempo real ativado');
  },
  
  /**
   * Tenta corrigir um erro automaticamente com base na mensagem
   */
  _attemptToFixError: function(msg, error) {
    const errorMessage = msg.toString();
    
    // Verificar por funções indefinidas
    const undefinedFuncMatch = errorMessage.match(/(\w+) is not defined/);
    if (undefinedFuncMatch && undefinedFuncMatch[1]) {
      const funcName = undefinedFuncMatch[1];
      
      // Não substituir funções do sistema
      const systemFunctions = ['document', 'window', 'console', 'alert'];
      if (!systemFunctions.includes(funcName) && typeof window[funcName] === 'undefined') {
        // Criar uma função mock
        window[funcName] = function() {
          console.warn(`⚠️ Mock implementation of ${funcName} called with:`, arguments);
          return null;
        };
        
        console.info(`🔧 QA Helper: Criada função mock para ${funcName}`);
      }
    }
    
    // Verificar por elementos que não foram encontrados
    const elementMatch = errorMessage.match(/Cannot (read|set) properties of null/);
    if (elementMatch && error && error.stack) {
      // Tentar extrair o seletor do stack trace (isso é mais difícil e menos confiável)
      const selectorMatches = error.stack.match(/getElementById\(['"](.+?)['"]\)/g) || 
                              error.stack.match(/querySelector\(['"](.+?)['"]\)/g);
      
      if (selectorMatches && selectorMatches.length > 0) {
        selectorMatches.forEach(match => {
          const selectorMatch = match.match(/['"](.+?)['"]/);
          if (selectorMatch && selectorMatch[1]) {
            const selector = selectorMatch[1];
            
            // Criar o elemento ausente
            if (window.DOMUtils) {
              window.DOMUtils.elementExists(selector, {
                createIfMissing: true,
                debug: this.options.debugMode
              });
            }
          }
        });
      }
    }
  },
  
  /**
   * Expõe helpers globais para uso durante depuração
   */
  _exposeGlobalHelpers: function() {
    window.qaHelper = {
      fixMissingElement: (selector, options = {}) => {
        if (window.DOMUtils) {
          return window.DOMUtils.elementExists(selector, {
            createIfMissing: true,
            ...options,
            debug: true
          });
        }
        return { error: 'DOMUtils not available' };
      },
      
      getDOMReport: () => {
        if (window.DOMUtils) {
          return window.DOMUtils.getDOMHealthReport();
        }
        return { error: 'DOMUtils not available' };
      },
      
      logDOMReport: () => {
        const report = window.qaHelper.getDOMReport();
        console.group('📊 DOM Health Report');
        console.log('Document Ready State:', report.documentReady);
        console.log('Critical Containers:', report.criticalContainers);
        console.log('Critical Scripts:', report.criticalScripts);
        console.log('Errors:', report.errors);
        console.groupEnd();
        return report;
      },
      
      mockFunction: (name, implementation = null) => {
        const mockImpl = implementation || function() {
          console.warn(`⚠️ Mock implementation of ${name} called with:`, arguments);
          return null;
        };
        
        window[name] = mockImpl;
        console.info(`🔧 Mock function ${name} created`);
      }
    };
    
    if (this.options.debugMode) {
      console.info('🔧 QA Helper: Global helpers expostos em window.qaHelper');
    }
  }
};

// Auto-inicialize em modo debug apenas se o URL contiver o parâmetro qa=debug
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const qaMode = urlParams.get('qa');
  
  if (qaMode === 'debug') {
    QAHelper.init({ debugMode: true });
    console.info('🐞 QA Helper: Inicializado automaticamente em modo debug');
  }
})();

// Exportar o módulo
window.QAHelper = QAHelper;

/**
 * QA Helper utility functions 
 * Provides testing and quality assurance utilities
 */

// DOMUtils namespace for DOM-related helper functions
window.DOMUtils = window.DOMUtils || {};

/**
 * Sets up DOM error monitoring to detect and log DOM-related issues
 */
DOMUtils.setupDOMErrorMonitoring = function() {
  try {
    console.log('📝 Monitoramento de erros DOM ativado');
    
    // Track DOM mutations for potential errors
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Check for potentially problematic mutations
        if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
          // Log removed nodes that might cause issues
          for (const node of mutation.removedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE && node.hasAttributes()) {
              console.debug('DOM: Elemento removido com atributos:', node);
            }
          }
        }
      });
    });
    
    // Start observing the document
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true
    });
    
    // Add error event listener
    window.addEventListener('error', function(event) {
      // Store error information in global error log
      if (!window._domErrorLog) window._domErrorLog = [];
      window._domErrorLog.push({
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: new Date()
      });
      
      if (event.target && (event.target.tagName === 'IMG' || event.target.tagName === 'SCRIPT')) {
        console.warn(`⚠️ Erro ao carregar recurso: ${event.target.src || event.target.href}`);
      }
    }, true);
    
  } catch (error) {
    console.error('❌ Falha ao configurar monitoramento de erros:', error);
  }
};

/**
 * Checks for JavaScript syntax errors in provided code
 * @param {string} code - JavaScript code to analyze
 * @returns {Array} - List of potential syntax issues
 */
DOMUtils.checkSyntaxErrors = function(code) {
  const issues = [];
  
  try {
    // Try to evaluate the code in a sandboxed way
    new Function(code);
  } catch (error) {
    // Parse error message to provide helpful information
    const errorInfo = {
      message: error.message,
      line: null,
      column: null,
      suggestion: ''
    };
    
    // Try to extract line and column information
    const lineMatch = error.stack.match(/(\d+):(\d+)/);
    if (lineMatch) {
      errorInfo.line = parseInt(lineMatch[1]);
      errorInfo.column = parseInt(lineMatch[2]);
    }
    
    // Provide targeted suggestions based on error type
    if (error.message.includes("expected")) {
      if (error.message.includes("')' expected")) {
        errorInfo.suggestion = "Missing closing parenthesis. Check function calls and if/while conditions.";
      } else if (error.message.includes("'}' expected")) {
        errorInfo.suggestion = "Missing closing brace. Check function, object, or block definitions.";
      } else if (error.message.includes("'catch' or 'finally' expected")) {
        errorInfo.suggestion = "Incomplete try block. Add catch or finally block.";
      }
    }
    
    issues.push(errorInfo);
  }
  
  return issues;
};

/**
 * Creates a health report for JavaScript files
 * @returns {Object} - DOM health report
 */
DOMUtils.getDOMHealthReport = function() {
  // Existing report code if any
  const report = {
    documentReady: document.readyState,
    criticalContainers: {},
    criticalScripts: {},
    errors: window._domErrorLog || [],
    syntaxIssues: []
  };
  
  // Check critical containers
  const containers = [
    'body', 'main', '.container', '.chart-container', '#graph-histogram-cl'
  ];
  
  containers.forEach(selector => {
    const element = document.querySelector(selector);
    report.criticalContainers[selector] = !!element;
  });
  
  // Check script elements for errors
  const scripts = document.querySelectorAll('script');
  Array.from(scripts).forEach((script, index) => {
    if (script.src) {
      report.criticalScripts[script.src] = script.readyState !== 'loading';
    } else {
      if (script.textContent.length > 0) {
        // Check for syntax issues in inline scripts
        const issues = DOMUtils.checkSyntaxErrors(script.textContent);
        if (issues.length > 0) {
          report.syntaxIssues.push({
            scriptIndex: index,
            issues: issues
          });
        }
      }
    }
  });
  
  return report;
};

/**
 * Logs information about the DOM environment
 */
DOMUtils.logEnvironmentInfo = function() {
  const info = {
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    userAgent: navigator.userAgent,
    elements: {
      total: document.getElementsByTagName('*').length,
      interactive: document.querySelectorAll('button, a, input, select, textarea').length
    },
    scripts: document.scripts.length,
    stylesheets: document.styleSheets.length
  };
  
  console.info('📊 Informações do ambiente DOM:', info);
  return info;
};

/**
 * Tests element visibility and reports any issues
 * @param {string} selector - CSS selector for elements to test
 */
DOMUtils.testElementVisibility = function(selector) {
  const elements = document.querySelectorAll(selector);
  const results = [];
  
  elements.forEach(element => {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    const isVisible = rect.width > 0 && 
                      rect.height > 0 && 
                      computedStyle.display !== 'none' && 
                      computedStyle.visibility !== 'hidden' &&
                      parseFloat(computedStyle.opacity) > 0;
    
    results.push({
      element: element,
      visible: isVisible,
      dimensions: {
        width: rect.width,
        height: rect.height
      },
      position: {
        top: rect.top,
        left: rect.left
      }
    });
    
    if (!isVisible) {
      console.warn(`⚠️ Elemento não visível: ${selector}`, element);
    }
  });
  
  return results;
};

// Define a logging utility
DOMUtils.log = {
  info: function(message) {
    console.info(`ℹ️ ${message}`);
  },
  
  warn: function(message) {
    console.warn(`⚠️ ${message}`);
  },
  
  error: function(message, error) {
    console.error(`❌ ${message}`, error || '');
  },
  
  success: function(message) {
    console.log(`✅ ${message}`);
  }
};

/**
 * Checks if all required assets are loaded
 * @returns {boolean} - True if all assets are loaded
 */
DOMUtils.areAssetsLoaded = function() {
  // Check images
  const images = Array.from(document.images);
  const areImagesLoaded = images.every(img => img.complete);
  
  // Check stylesheets
  const stylesheets = Array.from(document.styleSheets);
  const areStylesheetsLoaded = stylesheets.every(sheet => {
    try {
      return sheet.cssRules && sheet.cssRules.length > 0;
    } catch (e) {
      // CORS error or stylesheet not loaded
      return false;
    }
  });
  
  return areImagesLoaded && areStylesheetsLoaded;
};

// Export the DOMUtils object if we're in a module environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DOMUtils };
}
