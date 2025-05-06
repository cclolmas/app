// Main initialization function with improved error handling
document.addEventListener('DOMContentLoaded', function() {
  // Detect which page modules are present
  const pageModules = detectPageModules();
  console.info('📊 Detected page modules:', pageModules);
  
  // Initialize only the modules that are present
  initializeModules(pageModules);
});

// --- GARANTIR QUE OS GLOBAIS DE INICIALIZAÇÃO ESTEJAM DEFINIDOS ---
if (typeof window.initializeQloraTuner !== 'function') {
    window.initializeQloraTuner = function(elements) {
        console.warn('⚠️ Stub: initializeQloraTuner called (no-op)');
    };
}
if (typeof initializeQloraTuner !== 'function') {
    function initializeQloraTuner(elements) {
        return window.initializeQloraTuner(elements);
    }
}

// stub para initializeModelSelector
if (typeof window.initializeModelSelector !== 'function') {
    window.initializeModelSelector = function(elements) {
        console.warn('⚠️ Stub: initializeModelSelector called (no-op)');
    };
}

// Replace stub: wire up prompt tester controls to update metrics and submission
if (typeof window.initializePromptTester !== 'function') {
    window.initializePromptTester = function(elements) {
        // call queue: try UIUpdater first, fallback to updateCompLMetrics
        const updateMetrics = () => {
            if (window.UIUpdater?.updateAll) {
                UIUpdater.updateAll();
            } else if (window.updateCompLMetrics) {
                updateCompLMetrics();
            }
        };

        // attach change listeners on the three radio-groups
        ['select-modelo','select-quantizacao','select-expertise'].forEach(id => {
            const container = elements[id];
            if (container?.querySelectorAll) {
                container.querySelectorAll('input[type="radio"]').forEach(radio =>
                    radio.addEventListener('change', updateMetrics)
                );
            }
        });

        // wire up the send-prompt button
        const sendBtn = document.getElementById('send-prompt-btn');
        if (sendBtn && typeof handlePromptSubmission === 'function') {
            sendBtn.addEventListener('click', handlePromptSubmission);
        }

        // initial metrics run
        updateMetrics();
    };
}

// stub para initializeResourceMonitor
if (typeof window.initializeResourceMonitor !== 'function') {
    window.initializeResourceMonitor = function(elements) {
        console.warn('⚠️ Stub: initializeResourceMonitor called (no-op)');
    };
}

/**
 * Safely detects which modules are present on the page
 * @returns {Object} Object with detected modules
 */
function detectPageModules() {
  const modules = {
    charts: document.querySelectorAll('.chart-container, [data-chart]').length > 0,
    tables: document.querySelectorAll('.data-table, .br-table').length > 0,
    forms: document.querySelectorAll('form, .br-form').length > 0,
    modelSelector: !!document.querySelector('#select-modelo, .model-selector, [data-module="model-selector"]'),
    promptTester: !!document.querySelector('#send-prompt-btn, .prompt-tester, [data-module="prompt-tester"]'),
    qloraTuner: !!document.querySelector('#simulate-qlora-btn, .qlora-tuner, [data-module="qlora-tuner"]'),
    resourceMonitor: !!document.querySelector('#vram-estimada, .resource-monitor, [data-module="resource-monitor"]')
  };
  
  return modules;
}

/**
 * Safely get multiple elements and return an object with found elements
 * @param {Array<string>} ids - Array of DOM IDs
 * @returns {Object} foundElements - Object mapping IDs to found elements
 */
function safeGetElements(ids) {
  const result = {};
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      result[id] = el;
    } else {
      // Optionally warn if an element is not found
      // console.warn(`⚠️ Element with ID "${id}" not found`);
    }
  });
  return result;
}

/**
 * Check if all required elements are available
 * @param {Object} foundElements
 * @param {Array<string>} requiredKeys
 * @returns {boolean}
 */
function checkRequiredElements(foundElements, requiredKeys) {
  return requiredKeys.every(key => !!foundElements[key]);
}

/**
 * Initializes modules based on detection
 * @param {Object} pageModules - The detected page modules
 */
function initializeModules(pageModules) {
  try {
    // Inicializa componentes de gráficos se presentes
    if (pageModules.charts) {
      console.info('🔍 Initializing chart modules...');
      initChartModules();
    }
    // Inicializa componentes de tabelas se presentes
    if (pageModules.tables) {
      console.info('🔍 Initializing table modules...');
      initTableModules();
    }
    // Inicializa componentes de formulários se presentes
    if (pageModules.forms) {
      console.info('🔍 Initializing form modules...');
      initFormModules();
    }
    // Initialize modules that exist
    if (pageModules.modelSelector) {
      const modelElements = safeGetElements([
        'select-modelo',
        'select-quantizacao',
        'select-expertise',
        'model-output',
        'vram-estimada',
        'latencia-estimada',
        'instability-warning'
      ]);
      // Only initialize if crucial elements exist
      if (checkRequiredElements(modelElements, ['select-modelo', 'select-quantizacao'])) {
        window.initializeModelSelector(modelElements);
      } else {
        console.info('ℹ️ Model selector initialization skipped due to missing elements');
      }
    }

    if (pageModules.promptTester) {
      const promptElements = safeGetElements([
        'select-modelo',
        'select-quantizacao',
        'select-expertise',
        'model-output',
        'vram-estimada',
        'latencia-estimada',
        'instability-warning'
      ]);
      if (typeof window.initializePromptTester === 'function') {
        window.initializePromptTester(promptElements);
      } else {
        console.info('ℹ️ No initializePromptTester found, using fallback stub.');
        if (typeof window.initializePromptTester === 'undefined') {
          window.initializePromptTester = function() {
            console.info('⚠️ Stub: initializePromptTester called (no-op)');
          };
        }
        window.initializePromptTester(promptElements);
      }
    }

    if (pageModules.qloraTuner) {
      console.log('⚙️ Initializing QLoRA Tuner...');
      window.initializeQloraTuner(safeGetElements([
        'select-modelo',
        'select-quantizacao',
        'select-expertise',
        'model-output',
        'vram-estimada',
        'latencia-estimada',
        'instability-warning'
      ]));
    }

    if (pageModules.resourceMonitor) {
      console.log('⚙️ Initializing Resource Monitor...');
      window.initializeResourceMonitor(safeGetElements([
        'select-modelo',
        'select-quantizacao',
        'select-expertise',
        'model-output',
        'vram-estimada',
        'latencia-estimada',
        'instability-warning'
      ]));
    }
  } catch (error) {
    console.error('❌ Error initializing modules:', error);
  }
}

/**
 * Inicializa módulos de gráficos e garante que os componentes sejam atualizados após o carregamento
 */
function initChartModules() {
  document.querySelectorAll('[data-chart]').forEach(chart => {
    chart.addEventListener('chart:loaded', function() {
      if (typeof window.refreshComponents === 'function') {
        window.refreshComponents();
      }
    });
  });
}

/**
 * Inicializa módulos de tabelas
 */
function initTableModules() {
  document.querySelectorAll('.data-table, .br-table').forEach(table => {
    table.addEventListener('table:updated', function() {
      if (typeof window.refreshComponents === 'function') {
        window.refreshComponents();
      }
    });
  });
}

/**
 * Inicializa módulos de formulários
 */
function initFormModules() {
  console.info('ℹ️ Form module initialization logic goes here.');
}

/**
 * Safely get a selected value from a BR Design System select or regular select
 * @param {string} id - The ID of the select element
 * @returns {string|null} - The selected value or null if not found
 */
function safeGetSelectValue(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`⚠️ Select with ID "${id}" not found`);
    return null;
  }
  const brSelect = element.closest('.br-select');
  if (brSelect && brSelect.dataset.value) {
    return brSelect.dataset.value;
  }
  return element.value || null;
}

/**
 * Fallback implementation for missing functions
 */
function updateBalanceIndicator(data) {
  console.info('ℹ️ updateBalanceIndicator called with:', data);
  const balanceBody = document.getElementById('balance-indicator-body');
  if (balanceBody) {
    console.log('Balance indicator would be updated with data:', data);
  }
}

/**
 * Implementation for updateComparisonTable
 */
function updateComparisonTable(data) {
  console.info('ℹ️ updateComparisonTable called with:', data);
  const tableBody = document.getElementById('comparison-table-body');
  if (tableBody) {
    const { clValues, complValues, labels } = data;
    console.log('Comparison table would be updated with data:', { clValues, complValues, labels });
  }
}

// Export globally used functions
window.updateBalanceIndicator = updateBalanceIndicator;
window.updateComparisonTable = updateComparisonTable;

// Adiciona um evento global para quando o conteúdo da página for atualizado
document.addEventListener('content:updated', function() {
  if (typeof window.refreshComponents === 'function') {
    window.refreshComponents();
  }
});

