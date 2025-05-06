/**
 * QA Utilities for CL-CompL
 * Provides testing, validation, and debugging tools
 */

/**
 * Run a comprehensive DOM check and report issues
 * @param {boolean} fix - Whether to attempt fixing issues
 * @return {Object} - Report of issues found and fixed
 */
function diagnosePageIssues(fix = false) {
  const report = {
    timestamp: new Date().toISOString(),
    errors: [],
    warnings: [],
    fixes: [],
    performance: {}
  };
  
  // Start performance measurement
  const startTime = performance.now();
  
  try {
    // Check for required script dependencies
    checkDependencies(report, fix);
    
    // Check for required DOM elements
    checkRequiredElements(report, fix);
    
    // Check for accessibility issues
    checkAccessibility(report, fix);
    
    // Check for common UI issues
    checkUIConsistency(report, fix);
    
    // Check for console errors
    checkConsoleErrors(report);
    
  } catch (error) {
    report.errors.push({
      type: 'diagnostic_failure',
      message: `Diagnóstico falhou com erro: ${error.message}`,
      stack: error.stack
    });
  }
  
  // Complete performance measurement
  const endTime = performance.now();
  report.performance.duration = endTime - startTime;
  report.performance.timestamp = Date.now();
  
  // Output report to console
  console.group('📋 CL-CompL Diagnostic Report');
  console.log('Timestamp:', report.timestamp);
  console.log('Performance:', report.performance.duration.toFixed(2) + 'ms');
  
  if (report.errors.length > 0) {
    console.group('❌ Errors (' + report.errors.length + ')');
    report.errors.forEach((err, i) => console.log(`${i+1}. ${err.message}`));
    console.groupEnd();
  }
  
  if (report.warnings.length > 0) {
    console.group('⚠️ Warnings (' + report.warnings.length + ')');
    report.warnings.forEach((warn, i) => console.log(`${i+1}. ${warn.message}`));
    console.groupEnd();
  }
  
  if (report.fixes.length > 0) {
    console.group('🔧 Fixes Applied (' + report.fixes.length + ')');
    report.fixes.forEach((fix, i) => console.log(`${i+1}. ${fix.message}`));
    console.groupEnd();
  }
  
  console.groupEnd();
  return report;
}

/**
 * Check for required script dependencies
 * @param {Object} report - The report object
 * @param {boolean} fix - Whether to attempt fixing issues
 */
function checkDependencies(report, fix) {
  const dependencies = [
    { name: 'Chart.js', check: () => typeof Chart !== 'undefined' },
    { name: 'DOM Utils', check: () => typeof getElement === 'function' },
    { name: 'Chart Utils', check: () => typeof createChart === 'function' }
  ];
  
  dependencies.forEach(dep => {
    if (!dep.check()) {
      report.errors.push({
        type: 'missing_dependency',
        message: `Dependência ${dep.name} não encontrada`
      });
      
      if (fix && dep.name === 'Chart.js') {
        try {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
          document.head.appendChild(script);
          
          report.fixes.push({
            type: 'dependency_added',
            message: `Script ${dep.name} foi adicionado dinamicamente`
          });
        } catch (e) {
          report.errors.push({
            type: 'fix_failed',
            message: `Falha ao adicionar ${dep.name}: ${e.message}`
          });
        }
      }
    }
  });
}

/**
 * Check for required DOM elements
 * @param {Object} report - The report object
 * @param {boolean} fix - Whether to attempt fixing issues
 */
function checkRequiredElements(report, fix) {
  // Critical elements by module
  const moduleElements = {
    modelSelector: ['select-modelo', 'select-quantizacao', 'select-expertise'],
    promptTester: ['prompt-input', 'send-prompt-btn', 'model-output'],
    qloraTuner: ['lora-rank', 'learning-rate', 'batch-size', 'simulate-qlora-btn'],
    resourceMonitor: ['vram-estimada', 'latencia-estimada'],
    visualization: ['graph-histogram-cl', 'graph-bars-compl']
  };
  
  Object.entries(moduleElements).forEach(([module, elements]) => {
    const missingElements = elements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
      report.warnings.push({
        type: 'missing_elements',
        message: `Módulo ${module} está faltando elementos: ${missingElements.join(', ')}`
      });
      
      if (fix) {
        missingElements.forEach(id => {
          try {
            createPlaceholderElement(id, module);
            report.fixes.push({
              type: 'element_created',
              message: `Elemento placeholder criado para #${id}`
            });
          } catch (e) {
            report.errors.push({
              type: 'fix_failed',
              message: `Falha ao criar elemento #${id}: ${e.message}`
            });
          }
        });
      }
    }
  });
}

/**
 * Create a placeholder element for missing DOM elements
 * @param {string} id - The ID to create
 * @param {string} module - The module this element belongs to
 */
function createPlaceholderElement(id, module) {
  const container = document.querySelector('.container') || document.body;
  
  // Create a hidden placeholder
  const placeholder = document.createElement('div');
  placeholder.id = id;
  placeholder.dataset.placeholder = 'true';
  placeholder.dataset.module = module;
  placeholder.style.display = 'none';
  placeholder.innerHTML = `<!-- Placeholder for ${id} -->`;
  
  container.appendChild(placeholder);
  return placeholder;
}

/**
 * Check for accessibility issues
 * @param {Object} report - The report object
 * @param {boolean} fix - Whether to attempt fixing issues
 */
function checkAccessibility(report, fix) {
  // Check for images without alt text
  const imagesWithoutAlt = Array.from(document.querySelectorAll('img')).filter(img => !img.hasAttribute('alt'));
  
  if (imagesWithoutAlt.length > 0) {
    report.warnings.push({
      type: 'a11y_issue',
      message: `${imagesWithoutAlt.length} imagens sem texto alternativo (alt)`
    });
    
    if (fix) {
      imagesWithoutAlt.forEach((img, index) => {
        img.alt = `Imagem ${index + 1}`;
        report.fixes.push({
          type: 'a11y_fix',
          message: `Adicionado alt provisório para imagem #${index + 1}`
        });
      });
    }
  }
  
  // Check for form inputs without labels
  const inputsWithoutLabels = Array.from(document.querySelectorAll('input, select, textarea'))
    .filter(input => {
      if (input.type === 'hidden') return false;
      
      // Check for associated label
      const id = input.id;
      if (!id) return true;
      
      const hasLabel = document.querySelector(`label[for="${id}"]`);
      return !hasLabel;
    });
  
  if (inputsWithoutLabels.length > 0) {
    report.warnings.push({
      type: 'a11y_issue',
      message: `${inputsWithoutLabels.length} campos de formulário sem labels associados`
    });
    
    // Fixes for accessibility issues would go here
  }
}

/**
 * Check for UI consistency issues
 * @param {Object} report - The report object
 * @param {boolean} fix - Whether to attempt fixing issues
 */
function checkUIConsistency(report, fix) {
  // Implementation for UI consistency checks
  // This would check for things like consistent styling, button placements, etc.
}

/**
 * Check for console errors
 * @param {Object} report - The report object
 */
function checkConsoleErrors(report) {
  if (typeof window._consoleErrors !== 'undefined' && Array.isArray(window._consoleErrors)) {
    const errorCount = window._consoleErrors.length;
    
    if (errorCount > 0) {
      report.warnings.push({
        type: 'console_errors',
        message: `${errorCount} erros foram detectados no console`
      });
      
      window._consoleErrors.forEach(error => {
        report.warnings.push({
          type: 'console_error_detail',
          message: error.message,
          stack: error.stack
        });
      });
    }
  } else {
    // Set up error tracking
    window._consoleErrors = [];
    const originalConsoleError = console.error;
    
    console.error = function() {
      const error = {
        message: Array.from(arguments).join(' '),
        stack: new Error().stack,
        timestamp: Date.now()
      };
      window._consoleErrors.push(error);
      originalConsoleError.apply(console, arguments);
    };
    
    report.fixes.push({
      type: 'console_tracking',
      message: 'Monitoramento de erros do console foi ativado'
    });
  }
}

/**
 * Run diagnostics automatically when included in debug mode
 */
(function() {
  const isDebugMode = 
    window.location.search.includes('debug=true') || 
    window.location.search.includes('qa=true');
  
  if (isDebugMode) {
    window.addEventListener('load', function() {
      // Allow the page to fully initialize before running diagnostics
      setTimeout(() => {
        diagnosePageIssues(true);  // Auto-fix issues in debug mode
      }, 1000);
    });
    
    console.info('🛠️ Modo de Diagnóstico QA ativado - executará verificações automaticamente');
  }
  
  // Expose QA utilities globally
  window.qaUtils = {
    diagnose: diagnosePageIssues,
    createPlaceholder: createPlaceholderElement
  };
})();
