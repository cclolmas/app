/**
 * GOV.BR Design System Components Initialization
 * This file handles the initialization of all GOV.BR-DS components
 * that require JavaScript initialization.
 */

// Stub function if the real one isn't loaded
if (typeof initializePromptTester === 'undefined') {
    // Provide a dummy function to prevent errors if the real function isn't loaded
    window.initializePromptTester = function() {
        console.warn('⚠️ Stub: initializePromptTester called (no-op)');
    };
}

// Stub function for initializeQloraTuner if the real one isn't loaded
if (typeof initializeQloraTuner === 'undefined') {
    window.initializeQloraTuner = function() {
        console.warn('⚠️ Stub: initializeQloraTuner called (no-op)');
    };
}

/**
 * Helper para medir tempo de inicialização de cada componente
 */
function logQATime(label, fn) {
    const t0 = performance.now();
    try {
        fn();
        console.info(`🕒 [QA] ${label} initialized in ${(performance.now() - t0).toFixed(2)}ms`);
    } catch (error) {
        console.error(`❌ [QA] Error initializing ${label}:`, error);
        if (window.qaUtils) window.qaUtils.diagnose(); // registra diagnóstico
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Detecta modo QA
    const params = new URLSearchParams(window.location.search);
    const isQADebug = params.get('qa') === 'debug' || params.get('debug') === 'true';
    if (isQADebug && window.qaUtils) {
        console.info('🛠️ [QA] Mode enabled');
    }

    // Mede tempo total de inicialização
    const startTotal = performance.now();
    initializeGovBRComponents();
    console.info(`🕒 [QA] GOV.BR Components total init in ${(performance.now() - startTotal).toFixed(2)}ms`);

    // Initialize custom modules AFTER GovBR components
    initializeModules();

    // Executa diagnóstico automático se em modo QA
    if (isQADebug && window.qaUtils) {
        window.qaUtils.diagnose(true);
    }

    console.log('GOV.BR Design System components initialization complete.');
});

/**
 * Initializes all GOV.BR Design System components
 */
function initializeGovBRComponents() {
    logQATime('Header', initializeGovBRHeader);
    logQATime('Menu', initializeGovBRMenu);
    logQATime('FormComponents', initializeGovBRFormComponents);
    logQATime('Messages', initializeGovBRMessages);
    logQATime('Collapses', initializeGovBRCollapses);
    logQATime('Tooltips', initializeGovBRTooltips);
    logQATime('OtherComponents', initializeOtherGovBRComponents);
}

/**
 * Initialize GOV.BR Header component
 */
function initializeGovBRHeader() {
    try {
        const headerElements = document.querySelectorAll('.br-header');
        if (headerElements.length > 0) {
            headerElements.forEach(element => {
                if (typeof BRHeader !== 'undefined') {
                    new BRHeader('br-header', element);
                    console.log('GOV.BR Header initialized');
                } else {
                    console.warn('BRHeader class not available. Skipping header initialization.');
                }
            });
        }
    } catch (error) {
        console.error('Error initializing GOV.BR Header:', error);
    }
}

/**
 * Initialize GOV.BR Menu component
 */
function initializeGovBRMenu() {
    try {
        const menuElements = document.querySelectorAll('.br-menu');
        if (menuElements.length > 0) {
            menuElements.forEach(element => {
                if (typeof BRMenu !== 'undefined') {
                    new BRMenu('br-menu', element);
                    console.log('GOV.BR Menu initialized');
                } else {
                    console.warn('BRMenu class not available. Skipping menu initialization.');
                }
            });
        }
    } catch (error) {
        console.error('Error initializing GOV.BR Menu:', error);
    }
}

/**
 * Initialize GOV.BR Form components (Select, Checkbox, Radio)
 */
function initializeGovBRFormComponents() {
    // Initialize Select
    try {
        const selectElements = document.querySelectorAll('.br-select');
        if (selectElements.length > 0) {
            selectElements.forEach(element => {
                if (typeof BRSelect !== 'undefined') {
                    new BRSelect('br-select', element);
                }
            });
            console.log(`GOV.BR Select components initialized (${selectElements.length})`);
        }
    } catch (error) {
        console.error('Error initializing GOV.BR Select:', error);
    }
    
    // Initialize Input
    try {
        const inputElements = document.querySelectorAll('.br-input');
        if (inputElements.length > 0) {
            inputElements.forEach(element => {
                if (typeof BRInput !== 'undefined') {
                    new BRInput('br-input', element);
                }
            });
            console.log(`GOV.BR Input components initialized (${inputElements.length})`);
        }
    } catch (error) {
        console.error('Error initializing GOV.BR Input:', error);
    }
    
    // Initialize Checkbox
    try {
        const checkboxElements = document.querySelectorAll('.br-checkbox');
        if (checkboxElements.length > 0 && typeof BRCheckbox !== 'undefined') {
            checkboxElements.forEach(element => {
                new BRCheckbox('br-checkbox', element);
            });
            console.log(`GOV.BR Checkbox components initialized (${checkboxElements.length})`);
        }
    } catch (error) {
        console.error('Error initializing GOV.BR Checkbox:', error);
    }
    
    // Initialize Radio
    try {
        const radioElements = document.querySelectorAll('.br-radio');
        if (radioElements.length > 0 && typeof BRRadio !== 'undefined') {
            radioElements.forEach(element => {
                new BRRadio('br-radio', element);
            });
            console.log(`GOV.BR Radio components initialized (${radioElements.length})`);
        }
    } catch (error) {
        console.error('Error initializing GOV.BR Radio:', error);
    }
}

/**
 * Initialize GOV.BR Message components
 */
function initializeGovBRMessages() {
    try {
        const messageElements = document.querySelectorAll('.br-message');
        if (messageElements.length > 0) {
            messageElements.forEach(element => {
                if (typeof BRMessage !== 'undefined') {
                    new BRMessage('br-message', element);
                }
            });
            console.log(`GOV.BR Message components initialized (${messageElements.length})`);
        }
    } catch (error) {
        console.error('Error initializing GOV.BR Message:', error);
    }
}

/**
 * Initialize GOV.BR Collapse components
 */
function initializeGovBRCollapses() {
    try {
        const collapseElements = document.querySelectorAll('.br-collapse, [data-toggle="collapse"]');
        if (collapseElements.length > 0) {
            collapseElements.forEach(element => {
                if (typeof BRCollapse !== 'undefined') {
                    new BRCollapse('br-collapse', element);
                } else if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
                    // Fallback to Bootstrap if GOV.BR collapse not available
                    new bootstrap.Collapse(element, {toggle: false});
                }
            });
            console.log(`GOV.BR Collapse components initialized (${collapseElements.length})`);
        }
        
        // Check specifically for 'simulador-qlora' element as it's important for the app
        const qloraSimulator = document.getElementById('simulador-qlora');
        if (qloraSimulator && !qloraSimulator.classList.contains('br-collapse')) {
            console.warn('#simulador-qlora found but missing .br-collapse class. Applying initialization directly.');
            if (typeof BRCollapse !== 'undefined') {
                new BRCollapse('br-collapse', qloraSimulator);
                console.log('#simulador-qlora collapse initialized directly.');
            } else if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
                new bootstrap.Collapse(qloraSimulator, {toggle: false});
                console.log('#simulador-qlora bootstrap collapse initialized directly.');
            }
        }
    } catch (error) {
        console.error('Error initializing GOV.BR Collapse:', error);
    }
}

/**
 * Initialize GOV.BR Tooltip components
 */
function initializeGovBRTooltips() {
    try {
        const tooltipElements = document.querySelectorAll('[data-tooltip], .br-tooltip, [data-toggle="tooltip"]');
        if (tooltipElements.length > 0) {
            if (typeof BRTooltip !== 'undefined') {
                tooltipElements.forEach(element => {
                    new BRTooltip('br-tooltip', element);
                });
                console.log(`GOV.BR Tooltip components initialized (${tooltipElements.length})`);
            } else if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                // Fallback to Bootstrap if GOV.BR tooltip not available
                const tooltipTriggerList = [].slice.call(tooltipElements);
                tooltipTriggerList.map(function (tooltipTriggerEl) {
                    return new bootstrap.Tooltip(tooltipTriggerEl);
                });
                console.log(`Bootstrap Tooltip components initialized as fallback (${tooltipTriggerList.length})`);
            }
        }
    } catch (error) {
        console.error('Error initializing GOV.BR Tooltip:', error);
    }
}

/**
 * Initialize other GOV.BR components (Tabs, Wizard, etc.)
 */
function initializeOtherGovBRComponents() {
    // Initialize Tabs
    try {
        const tabElements = document.querySelectorAll('.br-tab');
        if (tabElements.length > 0 && typeof BRTab !== 'undefined') {
            tabElements.forEach(element => {
                new BRTab('br-tab', element);
            });
            console.log(`GOV.BR Tab components initialized (${tabElements.length})`);
        }
    } catch (error) {
        console.error('Error initializing GOV.BR Tabs:', error);
    }
    
    // Initialize Wizard
    try {
        const wizardElements = document.querySelectorAll('.br-wizard');
        if (wizardElements.length > 0 && typeof BRWizard !== 'undefined') {
            wizardElements.forEach(element => {
                new BRWizard('br-wizard', element);
            });
            console.log(`GOV.BR Wizard components initialized (${wizardElements.length})`);
        }
    } catch (error) {
        console.error('Error initializing GOV.BR Wizard:', error);
    }
    
    // Initialize Accordion
    try {
        const accordionElements = document.querySelectorAll('.br-accordion');
        if (accordionElements.length > 0 && typeof BRAccordion !== 'undefined') {
            accordionElements.forEach(element => {
                new BRAccordion('br-accordion', element);
            });
            console.log(`GOV.BR Accordion components initialized (${accordionElements.length})`);
        }
    } catch (error) {
        console.error('Error initializing GOV.BR Accordion:', error);
    }
}

// Helper function to refresh GOV.BR components after dynamic content changes
window.refreshGovBRComponents = function(container = document) {
    console.log('Refreshing GOV.BR components...');
    
    // Find container elements in the specified container
    const selects = container.querySelectorAll('.br-select:not(.initialized)');
    const messages = container.querySelectorAll('.br-message:not(.initialized)');
    const collapses = container.querySelectorAll('.br-collapse:not(.initialized)');
    const tooltips = container.querySelectorAll('[data-tooltip]:not(.initialized), .br-tooltip:not(.initialized)');
    
    // Re-initialize components as needed
    if (selects.length && typeof BRSelect !== 'undefined') {
        selects.forEach(el => new BRSelect('br-select', el));
        console.log(`Refreshed ${selects.length} select components`);
    }
    
    if (messages.length && typeof BRMessage !== 'undefined') {
        messages.forEach(el => new BRMessage('br-message', el));
        console.log(`Refreshed ${messages.length} message components`);
    }
    
    if (collapses.length && typeof BRCollapse !== 'undefined') {
        collapses.forEach(el => new BRCollapse('br-collapse', el));
        console.log(`Refreshed ${collapses.length} collapse components`);
    }
    
    if (tooltips.length && typeof BRTooltip !== 'undefined') {
        tooltips.forEach(el => new BRTooltip('br-tooltip', el));
        console.log(`Refreshed ${tooltips.length} tooltip components`);
    }
};

/**
 * Initializes specific modules based on page content or configuration.
 */
async function initializeModules() {
    const modules = detectPageModules();
    console.log('📊 Detected page modules:', modules);

    try {
        // Always initialize core UI elements if present
        logQATime('CoreUI', initializeCoreUI);

        if (modules.tables) {
            console.log('🔍 Initializing table modules...');
            logQATime('Tables', initializeTables);
        }

        if (modules.charts) {
            console.log('📊 Initializing chart modules...');
            logQATime('Charts', initializeCharts);
        } else {
            console.log('ℹ️ Chart initialization skipped.');
        }

        if (modules.forms) {
            console.log('📝 Initializing form modules...');
            logQATime('Forms', initializeForms);
        }

        if (modules.modelSelector) {
            if (typeof window.initializeModelSelector === 'function') {
                console.log('🤖 Initializing model selector...');
                logQATime('ModelSelector', window.initializeModelSelector);
            } else {
                console.warn('⚠️ initializeModelSelector function not found.');
            }
        } else {
             console.log('ℹ️ Model selector initialization skipped due to missing elements');
        }

        if (modules.promptTester) {
            if (typeof window.initializePromptTester === 'function') {
                console.log('💬 Initializing prompt tester...');
                logQATime('PromptTester', window.initializePromptTester);
            } else {
                console.error('❌ initializePromptTester function is unexpectedly missing.');
            }
        }

        if (modules.qloraTuner) {
            if (typeof window.initializeQloraTuner === 'function') {
                console.log('⚙️ Initializing QLoRA Tuner (direct call)...');
                try {
                    const t0 = performance.now();
                    window.initializeQloraTuner();
                    console.info(`🕒 [QA] QloraTuner initialized directly in ${(performance.now() - t0).toFixed(2)}ms`);
                } catch (error) {
                    console.error(`❌ [QA] Error initializing QloraTuner directly:`, error);
                    if (window.qaUtils) window.qaUtils.diagnose();
                }
            } else {
                console.error('❌ initializeQloraTuner function is unexpectedly missing.');
            }
        }

        if (modules.agentMonitor) {
            if (typeof window.initializeAgentMonitor === 'function') {
                console.log('🕵️ Initializing Agent Monitor...');
                logQATime('AgentMonitor', window.initializeAgentMonitor);
            } else {
                console.warn('⚠️ initializeAgentMonitor function not found.');
            }
        }

        // Initialize other dynamic components
        logQATime('DynamicComponents', initializeDynamicComponents);

        console.log('✅ Module initialization process completed.');

    } catch (error) {
        console.error('❌ Error initializing modules:', error);
        // Optionally display a user-friendly error message
        // displayGlobalError('Falha ao inicializar alguns componentes da página.');
    }
}

// Placeholder functions for other initializations
function initializeCoreUI() { console.log('Initializing Core UI (placeholder)...'); }
function initializeTables() { console.log('Initializing Tables (placeholder)...'); }
function initializeCharts() { console.log('Initializing Charts (placeholder)...'); }
function initializeForms() { console.log('Initializing Forms (placeholder)...'); }
function initializeDynamicComponents() { console.log('Initializing other dynamic components (placeholder)...'); }

// Detect page modules based on DOM elements
function detectPageModules() {
    console.log('Detecting page modules (placeholder)...');
    return {
        tables: !!document.querySelector('.br-table'),
        charts: !!document.querySelector('.chart-container'),
        forms: !!document.querySelector('form.needs-validation'),
        modelSelector: !!document.getElementById('model-selector-component'),
        promptTester: !!document.getElementById('prompt-tester-component'),
        qloraTuner: !!document.getElementById('qlora-tuner-component'),
        agentMonitor: !!document.getElementById('agent-monitor-component')
    };
}

// Define stubs for missing functions
if (typeof initializeModelSelector === 'undefined') {
    window.initializeModelSelector = function() {
        console.warn('⚠️ Stub: initializeModelSelector called');
    };
}
if (typeof initializeAgentMonitor === 'undefined') {
    window.initializeAgentMonitor = function() {
        console.warn('⚠️ Stub: initializeAgentMonitor called');
    };
}
