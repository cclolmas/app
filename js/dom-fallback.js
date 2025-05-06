/**
 * DOM Fallback Module
 * Provides graceful fallbacks for missing DOM elements
 */

(function() {
  // Store references to all required elements
  const requiredElements = {
    // Model selector elements
    'select-modelo': { created: false, type: 'select', options: ['mistral-7b', 'llama-13b', 'wizardcoder-34b', 'phi3', 'mixtral-8x7b'] },
    'select-quantizacao': { created: false, type: 'select', options: ['q4', 'q5', 'q8', 'f16'] },
    'select-expertise': { created: false, type: 'select', options: ['beginner', 'intermediate', 'advanced', 'expert'] },
    
    // Output elements
    'model-output': { created: false, type: 'div', default: 'A resposta do modelo aparecerá aqui...' },
    'vram-estimada': { created: false, type: 'span', default: '0 GB' },
    'latencia-estimada': { created: false, type: 'span', default: '0s' },
    'instability-warning': { created: false, type: 'div', default: '', classes: ['d-none'] },
    
    // Table elements
    'comparison-table-body': { created: false, type: 'tbody' },
    'balance-indicator-body': { created: false, type: 'tbody' },
    
    // QLoRA elements
    'lora-rank': { created: false, type: 'input', inputType: 'number', default: '8', attrs: { min: '1', max: '64' } },
    'learning-rate': { created: false, type: 'input', inputType: 'number', default: '0.0002', attrs: { min: '0.00001', max: '0.01', step: '0.0001' } },
    'batch-size': { created: false, type: 'input', inputType: 'number', default: '1', attrs: { min: '1', max: '32' } },
    'qlora-results-table-body': { created: false, type: 'tbody' },
    'qlora-summary': { created: false, type: 'div', classes: ['d-none'] },
    
    // Action buttons
    'simulate-qlora-btn': { created: false, type: 'button', default: 'Simular Ajuste Fino', classes: ['btn', 'btn-primary'] },
    'export-scenario-btn': { created: false, type: 'button', default: 'Exportar Cenário', classes: ['btn', 'btn-secondary'] },
    'clear-config-btn': { created: false, type: 'button', default: 'Limpar Configurações', classes: ['btn', 'btn-outline-secondary'] },
    'send-prompt-btn': { created: false, type: 'button', default: 'Enviar Prompt', classes: ['btn', 'btn-primary'] }
  };

  // Define balance levels that custom.js expects
  window.balanceLevels = {
    low: 'Baixo',
    medium: 'Médio',
    high: 'Alto',
    optimal: 'Ótimo'
  };

  // Create container for fallback elements if they don't exist
  function ensureFallbackContainer() {
    let container = document.getElementById('fallback-elements-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'fallback-elements-container';
      container.style.display = 'none';
      container.style.position = 'fixed';
      container.style.bottom = '0';
      container.style.right = '0';
      container.style.zIndex = '-1000';
      document.body.appendChild(container);
    }
    return container;
  }

  // Create a fallback element
  function createFallbackElement(id, config) {
    if (document.getElementById(id)) {
      console.log(`Element #${id} already exists, skipping fallback creation`);
      return document.getElementById(id);
    }

    const container = ensureFallbackContainer();
    let element;

    switch (config.type) {
      case 'select':
        element = document.createElement('select');
        element.id = id;
        
        // Add options
        if (config.options && Array.isArray(config.options)) {
          config.options.forEach(optValue => {
            const option = document.createElement('option');
            option.value = optValue;
            option.textContent = optValue;
            element.appendChild(option);
          });
        }
        break;
        
      case 'input':
        element = document.createElement('input');
        element.id = id;
        element.type = config.inputType || 'text';
        if (config.default) {
          element.value = config.default;
        }
        
        // Add attributes
        if (config.attrs) {
          Object.entries(config.attrs).forEach(([key, value]) => {
            element.setAttribute(key, value);
          });
        }
        break;
        
      case 'button':
        element = document.createElement('button');
        element.id = id;
        element.textContent = config.default || '';
        break;
        
      case 'tbody':
        // Find or create parent table
        let table = document.getElementById(`${id}-table`);
        if (!table) {
          table = document.createElement('table');
          table.id = `${id}-table`;
          table.style.display = 'none';
          container.appendChild(table);
        }
        
        element = document.createElement('tbody');
        element.id = id;
        table.appendChild(element);
        break;
        
      default:
        element = document.createElement(config.type || 'div');
        element.id = id;
        if (config.default) {
          element.textContent = config.default;
        }
    }
    
    // Add classes if specified
    if (config.classes && Array.isArray(config.classes)) {
      element.classList.add(...config.classes);
    }
    
    // Add to container unless it's already part of a table
    if (config.type !== 'tbody') {
      container.appendChild(element);
    }
    
    console.log(`Created fallback element for #${id}`);
    config.created = true;
    
    return element;
  }

  // Check all required elements and create fallbacks if needed
  function ensureRequiredElements() {
    Object.entries(requiredElements).forEach(([id, config]) => {
      if (!document.getElementById(id)) {
        createFallbackElement(id, config);
      }
    });
  }

  // Run when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    ensureRequiredElements();
    console.log('DOM fallbacks initialized');
    
    // Let other scripts know we're ready
    document.dispatchEvent(new CustomEvent('dom-fallbacks-ready'));
  });

  // Run immediately if DOM is already loaded
  if (document.readyState !== 'loading') {
    ensureRequiredElements();
  }
  
  // Make functions globally available
  window.DOMFallback = {
    createFallbackElement,
    ensureRequiredElements
  };
})();
