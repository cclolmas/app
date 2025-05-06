// Global array to store scatter plot data points
let scatterPlotDataPoints = { x: [], y: [], text: [] };

/**
 * Application default configuration - will be overridden by values in HTML when available
 */
const AppDefaults = {
    // QLoRA parameters
    qloraParams: {
        dataset: 'medio',
        rank: 16,
        learningRate: 0.0001,
        batchSize: 4
    },
    
    // Model parameters
    modelParams: {
        defaultModel: 'phi4',
        defaultQuantization: 'q8',
        defaultTask: 'geracao',
        defaultExpertise: 'avancado'
    },
    
    // UI related values
    ui: {
        simulationDelay: 1500, // Simulation delay in ms
        notificationDuration: 5000 // Notification duration in ms
    }
};

/**
 * Input validation utilities
 */
const InputValidator = {
    /**
     * Validates and sanitizes an integer input
     * @param {HTMLInputElement} inputElement - The input element to validate
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @param {number} defaultValue - Default value to use if input is invalid
     * @returns {number} - The validated integer value
     */
    validateInteger: function(inputElement, min, max, defaultValue) {
        if (!inputElement) return defaultValue;
        
        // Get current value
        let value = inputElement.value.trim();
        
        // Parse as integer
        let intValue = parseInt(value, 10);
        
        // Check if value is a valid number
        if (isNaN(intValue)) {
            this.markInvalid(inputElement, `Por favor, insira um número inteiro entre ${min} e ${max}`);
            return defaultValue;
        }
        
        // Check min/max constraints
        if (intValue < min) {
            this.markInvalid(inputElement, `O valor mínimo é ${min}`);
            intValue = min;
        } else if (intValue > max) {
            this.markInvalid(inputElement, `O valor máximo é ${max}`);
            intValue = max;
        } else {
            // Value is valid
            this.markValid(inputElement);
        }
        
        // Update input value to sanitized value
        inputElement.value = intValue.toString();
        
        return intValue;
    },
    
    /**
     * Validates and sanitizes a floating-point input
     * @param {HTMLInputElement} inputElement - The input element to validate
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @param {number} defaultValue - Default value to use if input is invalid
     * @param {number} [precision=6] - Number of decimal places to round to
     * @returns {number} - The validated float value
     */
    validateFloat: function(inputElement, min, max, defaultValue, precision = 6) {
        if (!inputElement) return defaultValue;
        
        // Get current value
        let value = inputElement.value.trim();
        
        // Support for scientific notation (e.g., 1e-4)
        let floatValue;
        if (value.includes('e') || value.includes('E')) {
            floatValue = parseFloat(value);
        } else {
            floatValue = parseFloat(value);
        }
        
        // Check if value is a valid number
        if (isNaN(floatValue)) {
            this.markInvalid(inputElement, `Por favor, insira um número válido entre ${min} e ${max}`);
            return defaultValue;
        }
        
        // Check min/max constraints
        if (floatValue < min) {
            this.markInvalid(inputElement, `O valor mínimo é ${min}`);
            floatValue = min;
        } else if (floatValue > max) {
            this.markInvalid(inputElement, `O valor máximo é ${max}`);
            floatValue = max;
        } else {
            // Value is valid
            this.markValid(inputElement);
        }
        
        // Round to specified precision and handle scientific notation
        let formattedValue;
        if (floatValue < 0.0001 || floatValue > 9999) {
            // Use scientific notation for very small or large numbers
            formattedValue = floatValue.toExponential(precision);
        } else {
            // Use standard notation for normal numbers
            formattedValue = floatValue.toFixed(precision).replace(/\.?0+$/, '');
        }
        
        // Update input value to sanitized value
        inputElement.value = formattedValue;
        
        return floatValue;
    },
    
    /**
     * Marks an input as invalid with a custom message
     * @param {HTMLInputElement} inputElement - The input element to mark
     * @param {string} message - Error message to display
     */
    markInvalid: function(inputElement, message) {
        // Add invalid class to input
        inputElement.classList.add('is-invalid');
        
        // Find or create feedback element
        let feedbackElement = inputElement.nextElementSibling;
        if (!feedbackElement || !feedbackElement.classList.contains('invalid-feedback')) {
            feedbackElement = document.createElement('div');
            feedbackElement.className = 'invalid-feedback';
            inputElement.parentNode.insertBefore(feedbackElement, inputElement.nextSibling);
        }
        
        // Set the feedback message
        feedbackElement.textContent = message;
        
        // Add animation to highlight the error
        inputElement.classList.add('shake-error');
        setTimeout(() => {
            inputElement.classList.remove('shake-error');
        }, 500);
    },
    
    /**
     * Marks an input as valid
     * @param {HTMLInputElement} inputElement - The input element to mark
     */
    markValid: function(inputElement) {
        // Remove invalid class and add valid class
        inputElement.classList.remove('is-invalid');
        inputElement.classList.add('is-valid');
        
        // Remove any existing feedback
        const feedbackElement = inputElement.nextElementSibling;
        if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
            feedbackElement.textContent = '';
        }
        
        // Remove valid class after a short delay
        setTimeout(() => {
            inputElement.classList.remove('is-valid');
        }, 2000);
    }
};

/**
 * Chart responsiveness handler
 */
const ChartManager = {
    /**
     * Array to keep track of all charts that need to be responsive
     */
    charts: [],
    
    /**
     * Initializes a chart and makes it responsive
     * @param {string} chartId - ID of the chart container element
     * @param {Object} data - The data for the chart
     * @param {Object} layout - The layout for the chart
     * @param {Object} [config] - Optional configuration for the chart
     * @returns {Object} - The Plotly chart instance
     */
    createResponsiveChart: function(chartId, data, layout, config = {}) {
        try {
            // Check if Plotly is available
            if (typeof Plotly === 'undefined') {
                console.warn(`Plotly not available for chart ${chartId}`);
                return null;
            }
            
            // Make sure the chart container exists
            const chartDiv = document.getElementById(chartId);
            if (!chartDiv) {
                console.warn(`Chart container #${chartId} not found`);
                return null;
            }
            
            // Add responsive config defaults
            const responsiveConfig = {
                responsive: true,
                ...config
            };
            
            // Extend layout with responsive settings
            const responsiveLayout = {
                autosize: true,
                ...layout
            };
            
            // Create the chart
            Plotly.newPlot(chartId, data, responsiveLayout, responsiveConfig);
            
            // Add to tracked charts for easy resize handling
            this.trackChart(chartId);
            
            return Plotly.Graphs.getGraphDiv(chartId);
        } catch (error) {
            console.error(`Error creating chart ${chartId}:`, error);
            return null;
        }
    },
    
    /**
     * Updates an existing chart
     * @param {string} chartId - ID of the chart container element
     * @param {Object} data - The new data for the chart
     * @param {Object} [layout] - Optional new layout for the chart
     * @returns {boolean} - Whether the update was successful
     */
    updateChart: function(chartId, data, layout = null) {
        try {
            if (typeof Plotly === 'undefined') {
                console.warn(`Plotly not available for updating chart ${chartId}`);
                return false;
            }
            
            const chartDiv = document.getElementById(chartId);
            if (!chartDiv) {
                console.warn(`Chart container #${chartId} not found for update`);
                return false;
            }
            
            if (layout) {
                // Update with new data and layout
                Plotly.react(chartId, data, layout);
            } else {
                // Keep existing layout and only update data
                const currentLayout = Plotly.Graphs.getGraphDiv(chartId).layout;
                Plotly.react(chartId, data, currentLayout);
            }
            
            return true;
        } catch (error) {
            console.error(`Error updating chart ${chartId}:`, error);
            return false;
        }
    },
    
    /**
     * Track a chart for responsive handling
     * @param {string} chartId - ID of the chart container element
     */
    trackChart: function(chartId) {
        if (!this.charts.includes(chartId)) {
            this.charts.push(chartId);
        }
    },
    
    /**
     * Resize all tracked charts
     */
    resizeAllCharts: function() {
        try {
            if (typeof Plotly === 'undefined') return;
            
            this.charts.forEach(chartId => {
                const chartDiv = document.getElementById(chartId);
                if (chartDiv) {
                    // Use Plotly.relayout to resize the chart
                    Plotly.relayout(chartId, {autosize: true});
                }
            });
        } catch (error) {
            console.error('Error resizing charts:', error);
        }
    }
};

/**
 * Reads default values from HTML elements
 * @returns {Object} - An object containing default values
 */
function readDefaultValuesFromHTML() {
    const elements = document.querySelectorAll('[data-default]');
    const values = {};
    
    elements.forEach(el => {
        const key = el.getAttribute('id') || el.getAttribute('name');
        if (key) {
            values[key] = el.getAttribute('data-default');
        }
    });
    
    return values;
}

// Add this near the top or before usage if not already defined
function clearConfigurations() {
    // TODO: Implement configuration clearing logic if needed
    console.log('clearConfigurations called (stub)');
}

// Add this function definition if it doesn't exist
function saveAnalysisSimulated() {
    // TODO: Implement actual saving logic if needed
    console.log('saveAnalysisSimulated called (stub)');
    alert('Análise simulada salva (funcionalidade simulada).');
}

// Add this debounce function (a common utility)
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

document.addEventListener('DOMContentLoaded', function() {
    // Read and apply default values from HTML
    readDefaultValuesFromHTML();
    
    // Initialize components that might need JS initialization
    initializeComponents();

    // Add event listeners
    setupEventListeners();

    // Initialize plots with default data
    initializePlots();

    // Add CSS for value changed animation if it doesn't exist
    if (!document.getElementById('compl-animation-css')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'compl-animation-css';
        styleElement.textContent = `
            @keyframes highlight {
                0% { background-color: transparent; }
                30% { background-color: rgba(255, 240, 0, 0.3); }
                100% { background-color: transparent; }
            }
            
            .value-changed {
                animation: highlight 1s ease-out;
            }
        `;
        document.head.appendChild(styleElement);
    }

    // Add CSS for input validation
    if (!document.getElementById('input-validation-css')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'input-validation-css';
        styleElement.textContent = `
            .is-invalid {
                border-color: #dc3545 !important;
                background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23dc3545' viewBox='0 0 12 12'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
                background-repeat: no-repeat;
                background-position: right calc(0.375em + 0.1875rem) center;
                background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
            }
            
            .is-valid {
                border-color: #28a745 !important;
                background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3e%3cpath fill='%2328a745' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
                background-repeat: no-repeat;
                background-position: right calc(0.375em + 0.1875rem) center;
                background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
            }
            
            .invalid-feedback {
                display: block;
                width: 100%;
                margin-top: 0.25rem;
                font-size: 80%;
                color: #dc3545;
            }
            
            .shake-error {
                animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
            }
            
            @keyframes shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
                40%, 60% { transform: translate3d(3px, 0, 0); }
            }
        `;
        document.head.appendChild(styleElement);
    }

    // Add window resize event listener for chart responsiveness
    window.addEventListener('resize', debounce(function() {
        // Resize all tracked charts when window size changes
        ChartManager.resizeAllCharts();
    }, 250));

    // Initialize metrics on page load
    updateCompLMetrics();
});

// Add this near the top or before usage if not already defined
function setupEventListeners() {
    // TODO: Implement event listeners setup if needed
    console.log('setupEventListeners called (stub)');
}

/**
 * Initializes components that might need JavaScript initialization
 */
function initializeComponents() {
    console.log("Inicializando componentes da interface...");
    
    try {
        // Inicializa componentes do Design System GOV.BR (se existir)
        if (typeof window.dsgov !== 'undefined') {
            console.log("Design System GOV.BR detectado. Inicializando componentes...");
        }
        
        // Inicializa botões de controle
        initializeActionButtons();
        
        // Inicializa tooltips para ícones de informação
        initializeTooltips();
        
        console.log("Componentes inicializados com sucesso.");
    } catch (error) {
        console.error("Erro ao inicializar componentes:", error);
    }
}

/**
 * Initializes action buttons and their event listeners
 */
function initializeActionButtons() {
    // Botão "Limpar Configurações"
    const clearConfigBtn = document.getElementById('clear-config-btn');
    if (clearConfigBtn) {
        clearConfigBtn.addEventListener('click', clearConfigurations);
    }
    
    // Botão "Exportar Cenário (JSON)"
    const exportScenarioBtn = document.getElementById('export-scenario-btn');
    if (exportScenarioBtn) {
        exportScenarioBtn.addEventListener('click', exportScenarioToJson);
    }
    
    // Botão "Salvar Avaliação (Simulado)"
    const saveAnalysisBtn = document.getElementById('save-analysis-btn');
    if (saveAnalysisBtn) {
        saveAnalysisBtn.addEventListener('click', saveAnalysisSimulated);
    }
    
    // Botão "Simular Ajuste Fino"
    const simulateQloraBtn = document.getElementById('simulate-qlora-btn');
    if (simulateQloraBtn) {
        simulateQloraBtn.addEventListener('click', simulateQloraFinetuning);
    }
    
    // Botão "Enviar Prompt"
    const sendPromptBtn = document.getElementById('send-prompt-btn');
    if (sendPromptBtn) {
        sendPromptBtn.addEventListener('click', handlePromptSubmission);
    }
    
    // Adiciona listeners para os radio buttons
    const radioButtons = document.querySelectorAll('input[type="radio"][name="modelo"], input[type="radio"][name="quantizacao"], input[type="radio"][name="tarefa"], input[type="radio"][name="expertise"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', updateCompLMetrics);
    });
}

/**
 * Initializes tooltips for information icons
 */
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip-text]');
    tooltipElements.forEach(el => {
        // Usar a implementação de tooltip nativa do GOV.BR se disponível
        if (typeof window.dsgov !== 'undefined') {
            // O Design System já cuida disso
            return;
        }
        
        // Implementação simples de tooltip como fallback
        el.style.position = 'relative';
        
        el.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip-text');
            if (!tooltipText) return;
            
            // Remove qualquer tooltip existente
            const existingTooltip = document.querySelector('.custom-tooltip');
            if (existingTooltip) {
                existingTooltip.remove();
            }
            
            // Cria o elemento tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = tooltipText;
            
            // Estilo do tooltip
            tooltip.style.position = 'absolute';
            tooltip.style.bottom = '100%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            tooltip.style.color = 'white';
            tooltip.style.padding = '8px 12px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '14px';
            tooltip.style.marginBottom = '8px';
            tooltip.style.zIndex = '1000';
            tooltip.style.whiteSpace = 'normal';
            tooltip.style.maxWidth = '250px';
            tooltip.style.textAlign = 'center';
            
            // Adiciona seta
            tooltip.style.boxSizing = 'border-box';
            tooltip.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
            tooltip.style.transition = 'opacity 0.2s';
            tooltip.style.opacity = '0';
            
            // Adiciona o tooltip ao DOM
            document.body.appendChild(tooltip);
            
            // Posiciona o tooltip
            const elRect = this.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            // Ajusta posição para manter visível
            let left = (elRect.left + elRect.width / 2) - (tooltipRect.width / 2);
            if (left < 10) left = 10;
            if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10;
            }
            
            tooltip.style.position = 'fixed';
            tooltip.style.left = left + 'px';
            tooltip.style.top = (elRect.top - tooltipRect.height - 8) + 'px';
            
            // Mostra o tooltip com fade in
            setTimeout(() => {
                tooltip.style.opacity = '1';
            }, 10);
        });
        
        el.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.custom-tooltip');
            if (tooltip) {
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    if (tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                }, 200);
            }
        });
    });
}

/**
 * Toggle the instability warning message
 * @param {string} state - 'show', 'hide', or null (toggle)
 */
function toggleInstabilityWarning(state) {
    const warningEl = document.getElementById('instability-warning');
    if (!warningEl) return;
    
    const parentEl = warningEl.parentElement;
    if (!parentEl) return;
    
    if (state === 'show') {
        parentEl.classList.remove('d-none');
    } else if (state === 'hide') {
        parentEl.classList.add('d-none');
    } else {
        // Toggle
        parentEl.classList.toggle('d-none');
    }
}

/**
 * Export the current scenario configuration to a JSON file
 */
function exportScenarioToJson() {
    try {
        // Get current configuration
        const config = {
            model: getSelectedRadioValue('modelo'),
            quantization: getSelectedRadioValue('quantizacao'),
            task: getSelectedRadioValue('tarefa'),
            expertise: getSelectedRadioValue('expertise'),
            qloraParams: {
                dataset: document.getElementById('select-dataset')?.value || null,
                rank: parseInt(document.getElementById('lora-rank')?.value || '0', 10) || null,
                learningRate: parseFloat(document.getElementById('learning-rate')?.value || '0') || null,
                batchSize: parseInt(document.getElementById('batch-size')?.value || '0', 10) || null
            },
            metrics: {
                vram: document.getElementById('vram-estimada')?.value || null,
                latency: document.getElementById('latencia-estimada')?.value || null
            },
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        // Convert to JSON string with pretty formatting
        const jsonStr = JSON.stringify(config, null, 2);
        
        // Create a blob and download link
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ccl-scenario-${new Date().toISOString().split('T')[0]}.json`;
        
        // Append to body, click and remove
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up the URL
        URL.revokeObjectURL(url);
        
        // Show notification
        showNotification('Cenário exportado com sucesso!', 'success');
    } catch (error) {
        console.error('Error exporting scenario:', error);
        showNotification('Erro ao exportar cenário. Veja o console para detalhes.', 'danger');
    }
}

/**
 * Handles QLoRA parameter changes
 * @param {Event} event - The change event
 */
function handleQloraParamChange(event) {
    console.log('QLoRA parameter changed:', event.target.id, event.target.value);
    // Implement your logic here to update UI based on QLoRA parameter changes
}

/**
 * Simulates QLoRA fine-tuning with current parameters
 */
function simulateQloraFinetuning() {
    console.log('Simulando ajuste fino QLoRA...');
    
    // Get input values with validation
    const datasetType = document.getElementById('select-dataset')?.value || 'codesum';
    const loraRank = InputValidator.validateInteger(
        document.getElementById('lora-rank'), 
        1, 256, 
        AppDefaults.qloraParams.rank
    );
    const learningRate = InputValidator.validateFloat(
        document.getElementById('learning-rate'),
        0.000001, 0.01,
        AppDefaults.qloraParams.learningRate
    );
    const batchSize = InputValidator.validateInteger(
        document.getElementById('batch-size'),
        1, 32,
        AppDefaults.qloraParams.batchSize
    );
    
    // Get model and quantization selection
    const modelType = getSelectedRadioValue('modelo') || 'phi4';
    const quantizationType = getSelectedRadioValue('quantizacao') || 'q8';
    
    // Show loading state on button
    const simulateBtn = document.getElementById('simulate-qlora-btn');
    if (simulateBtn) {
        const originalText = simulateBtn.innerHTML;
        simulateBtn.disabled = true;
        simulateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Simulando...';
        
        // Simulate processing delay
        setTimeout(() => {
            try {
                // Generate a simulated result
                const result = generateSimulatedQloraResult(
                    modelType, quantizationType, datasetType, loraRank, learningRate, batchSize
                );
                
                // Display the result
                displayQloraResults(result);
                
                // Show success notification
                showNotification('Simulação concluída com sucesso!', 'success');
            } catch (error) {
                console.error('Error in QLoRA simulation:', error);
                showNotification('Erro na simulação QLoRA. Veja o console para detalhes.', 'danger');
            } finally {
                // Reset button state
                simulateBtn.disabled = false;
                simulateBtn.innerHTML = originalText;
            }
        }, AppDefaults.ui.simulationDelay); // Use the configured simulation delay
    }
}

/**
 * Generate a simulated QLoRA fine-tuning result based on parameters
 */
function generateSimulatedQloraResult(model, quantization, dataset, rank, learningRate, batchSize) {
    // Esta é uma função simulada que gera resultados pseudoaleatórios baseados nos parâmetros
    // Em uma implementação real, isso seria substituído por chamadas a um backend ou modelo real
    
    // Bases para os cálculos de simulação
    const modelFactors = {
        'phi4': { vram: 2.5, time: 0.7, accuracy: 0.85 },
        'mistral': { vram: 5.0, time: 1.0, accuracy: 0.89 },
        'llama': { vram: 7.0, time: 1.2, accuracy: 0.92 }
    };
    
    const quantizationFactors = {
        'q4': { vram: 0.5, time: 0.8, accuracy: 0.93 },
        'q8': { vram: 1.0, time: 1.0, accuracy: 1.0 },
        'fp16': { vram: 2.0, time: 1.3, accuracy: 1.05 }
    };
    
    const datasetFactors = {
        'codesum': { complexity: 1.0, time: 1.0 },
        'commitclassify': { complexity: 0.8, time: 0.7 }
    };
    
    // Fatores de base do modelo e quantização
    const modelFactor = modelFactors[model] || modelFactors.phi4;
    const quantFactor = quantizationFactors[quantization] || quantizationFactors.q8;
    const datasetFactor = datasetFactors[dataset] || datasetFactors.codesum;
    
    // Cálculos para cada métrica com variação pseudoaleatória
    const randomFactor = () => 0.9 + (Math.random() * 0.2); // Entre 0.9 e 1.1
    
    // Cálculo da VRAM estimada
    const vramBase = modelFactor.vram * quantFactor.vram;
    const vramRankEffect = (rank / 8) * 0.5; // Quanto maior o rank, mais VRAM
    const vramBatchEffect = (batchSize / 4) * 0.8; // Quanto maior o batch, mais VRAM
    const vramTotal = (vramBase + vramRankEffect + vramBatchEffect) * randomFactor();
    
    // Cálculo do tempo estimado
    const timeBase = modelFactor.time * quantFactor.time * datasetFactor.time;
    const timeRankEffect = (rank / 8) * 0.3; // Rank maior = mais tempo
    const timeLREffect = (0.0001 / Math.max(learningRate, 0.000001)) * 0.2; // LR menor = mais tempo
    const timeBatchEffect = Math.max(1, 4 / batchSize) * 0.5; // Batch menor = mais tempo por época
    const timeTotal = (timeBase + timeRankEffect + timeLREffect + timeBatchEffect) * randomFactor() * 60; // Em minutos
    
    // Cálculo da acurácia/perda
    const accuracyBase = modelFactor.accuracy * quantFactor.accuracy;
    const accuracyRankEffect = (rank / 16) * 0.05; // Rank maior = potencialmente mais acurácia
    const accuracyLREffect = Math.min(learningRate * 1000, 0.5) * 0.02; // LR ótimo = melhor acurácia
    const accuracyBatchEffect = Math.min(batchSize / 16, 1) * 0.03; // Batch muito grande pode reduzir acurácia
    const accuracyModel = (accuracyBase + accuracyRankEffect - accuracyBatchEffect + accuracyLREffect) * randomFactor();
    const accuracy = Math.min(Math.max(accuracyModel * 100, 65), 95); // Entre 65% e 95%
    
    // Cálculo da estabilidade/CL
    const stabilityBase = quantFactor.accuracy;
    const stabilityRankEffect = (rank / 32) * 0.2; // Rank muito alto = mais complexo = menos estável
    const stabilityTotal = (stabilityBase - stabilityRankEffect) * randomFactor();
    const stability = Math.min(Math.max(stabilityTotal * 10, 3), 10); // Entre 3 e 10
    
    // Avaliação de trade-off
    let tradeoffEvaluation = '';
    if (vramTotal > 8) {
        tradeoffEvaluation = 'Alto consumo de VRAM (CompL), mas ';
        tradeoffEvaluation += accuracy > 85 ? 'excelente precisão.' : 'precisão moderada.';
    } else if (timeTotal > 120) {
        tradeoffEvaluation = 'Tempo de treinamento longo, ';
        tradeoffEvaluation += accuracy > 88 ? 'mas excelente precisão.' : 'com precisão moderada.';
    } else if (stability < 5) {
        tradeoffEvaluation = 'Baixa estabilidade/alta CL, ';
        tradeoffEvaluation += accuracy > 90 ? 'mas precisão excepcional.' : 'com precisão moderada.';
    } else {
        tradeoffEvaluation = 'Configuração equilibrada com ';
        tradeoffEvaluation += accuracy > 85 ? 'boa precisão.' : 'precisão moderada.';
    }
    
    // Adicionar um novo ponto ao gráfico de dispersão
    if (typeof scatterPlotDataPoints !== 'undefined') {
        scatterPlotDataPoints.x.push(vramTotal);
        scatterPlotDataPoints.y.push(accuracy);
        scatterPlotDataPoints.text.push(`${model} (${quantization}) - R${rank}/LR${learningRate}/B${batchSize}`);
    }
    
    // Retorna o resultado simulado
    return {
        configuration: `R${rank}, LR ${learningRate.toExponential(1)}, BS ${batchSize}`,
        vram: vramTotal.toFixed(1) + ' GB',
        time: timeTotal.toFixed(0) + ' min',
        accuracy: accuracy.toFixed(1) + '%',
        stability: stability.toFixed(1) + '/10',
        evaluation: tradeoffEvaluation,
        rawValues: {
            vram: vramTotal,
            time: timeTotal,
            accuracy: accuracy,
            stability: stability
        }
    };
}

/**
 * Display QLoRA simulation results in the UI
 */
function displayQloraResults(result) {
    // Atualiza a tabela de resultados
    const tableBody = document.getElementById('qlora-results-table-body');
    if (tableBody) {
        // Adiciona uma nova linha à tabela
        const row = document.createElement('tr');
        
        // Adiciona células com os resultados
        row.innerHTML = `
            <td data-th="Configuração">${result.configuration}</td>
            <td data-th="VRAM Estimada (CompL)">${result.vram}</td>
            <td data-th="Tempo Estimado (CompL)">${result.time}</td>
            <td data-th="Acurácia/Perda (Perf.)">${result.accuracy}</td>
            <td data-th="Estabilidade/CL Estimada">${result.stability}</td>
            <td data-th="Avaliação Trade-off">${result.evaluation}</td>
        `;
        
        // Adiciona a linha à tabela
        tableBody.appendChild(row);
    }
    
    // Atualiza o gráfico de dispersão
    updateScatterPlot();
    
    // Exibe o resumo da avaliação
    const summaryEl = document.getElementById('qlora-summary');
    if (summaryEl) {
        summaryEl.classList.remove('d-none');
        
        // Determina o tipo de mensagem com base nos resultados
        let messageType = 'success';
        if (result.rawValues.accuracy < 75 || result.rawValues.stability < 4) {
            messageType = 'warning';
        }
        
        // Define a classe da mensagem
        summaryEl.className = `br-message ${messageType} mt-3`;
        
        // Define o conteúdo da mensagem
        const icon = messageType === 'success' ? 'check-circle' : 'exclamation-triangle';
        summaryEl.innerHTML = `
            <div class="icon"><i class="fas fa-${icon} fa-lg" aria-hidden="true"></i></div>
            <div class="content">
                <span class="message-body">
                    Configuração avaliada: ${result.configuration} obteve ${result.accuracy} de precisão 
                    com ${result.vram} de VRAM e estabilidade ${result.stability}. 
                    ${result.evaluation}
                </span>
            </div>
        `;
    }
}

/**
 * Update the scatter plot with new data points
 */
function updateScatterPlot() {
    try {
        if (typeof Plotly === 'undefined' || !document.getElementById('graph-scatter-precision-compl')) {
            console.warn('Plotly ou elemento gráfico não disponível para atualização');
            return;
        }
        
        // Cria nova série de dados para o gráfico de dispersão
        const chartData = [{
            x: scatterPlotDataPoints.x,
            y: scatterPlotDataPoints.y,
            text: scatterPlotDataPoints.text,
            mode: 'markers',
            type: 'scatter',
            marker: {
                size: 10,
                color: '#1f77b4',
                opacity: 0.7
            },
            hoverinfo: 'text+x+y'
        }];
        
        const layout = {
            xaxis: {title: 'VRAM Estimada (GB)'},
            yaxis: {title: 'Precisão (%)'},
            margin: {t: 30, b: 40, l: 60, r: 30},
            hovermode: 'closest'
        };
        
        Plotly.react('graph-scatter-precision-compl', chartData, layout);
        console.log('Scatter plot updated with new data points');
    } catch (error) {
        console.error('Error updating scatter plot:', error);
    }
}

/**
 * Get the value of the selected radio button in a group
 * @param {string} name - The name of the radio button group
 * @returns {string|null} - The value of the selected radio button, or null if none selected
 */
function getSelectedRadioValue(name) {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    return selected ? selected.value : null;
}

/**
 * Extract table data as an array of objects
 * @param {string} tableBodyId - The ID of the table body element
 * @returns {Array} - An array of objects representing the table data
 */
function extractTableData(tableBodyId) {
    const tableData = [];
    const tbody = document.getElementById(tableBodyId);
    
    if (!tbody) return tableData;
    
    // Iterate over each row in the table
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const rowData = {};
        
        // Get all cells in the row
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
            // Use data-th attribute as the key, or cell index if not available
            const key = cell.getAttribute('data-th') || `column${cells.indexOf(cell)}`;
            rowData[key] = cell.textContent.trim();
        });
        
        tableData.push(rowData);
    });
    
    return tableData;
}

/**
 * Handle prompt submission and generate a simulated response
 */
function handlePromptSubmission() {
    const promptInput = document.getElementById('prompt-input');
    const outputElement = document.getElementById('model-output');
    
    if (!promptInput || !outputElement) {
        console.error('Prompt input or output elements not found');
        return;
    }
    
    const prompt = promptInput.value.trim();
    if (!prompt) {
        showNotification('Por favor, insira um prompt antes de enviar.', 'warning');
        return;
    }
    
    // Show loading state
    outputElement.innerHTML = '<pre><code><i class="fas fa-spinner fa-spin"></i> Processando prompt...</code></pre>';
    
    // Get selected model configuration
    const modelType = getSelectedRadioValue('modelo') || 'phi4';
    const quantizationType = getSelectedRadioValue('quantizacao') || 'q8';
    const taskType = getSelectedRadioValue('tarefa') || 'geracao';
    
    // Simulate processing delay
    setTimeout(() => {
        try {
            // Generate simulated response based on configuration
            const response = generateSimulatedResponse(prompt, modelType, quantizationType, taskType);
            
            // Display response with syntax highlighting if it's code
            if (taskType === 'geracao' || taskType === 'refactor') {
                outputElement.innerHTML = `<pre><code class="language-python">${escapeHtml(response)}</code></pre>`;
            } else {
                outputElement.innerHTML = `<pre><code>${escapeHtml(response)}</code></pre>`;
            }
            
            // Apply syntax highlighting if library exists
            if (typeof hljs !== 'undefined') {
                outputElement.querySelectorAll('pre code').forEach(block => {
                    hljs.highlightBlock(block);
                });
            }
            
            // Show different message based on quantization
            if (quantizationType === 'q4') {
                toggleInstabilityWarning('show');
            } else {
                toggleInstabilityWarning('hide');
            }
            
            // Update CompL metrics
            updateCompLMetrics();
            
        } catch (error) {
            console.error('Error generating response:', error);
            outputElement.innerHTML = '<pre><code class="text-danger">Erro ao processar o prompt. Veja o console para detalhes.</code></pre>';
        }
    }, AppDefaults.ui.simulationDelay);
}

/**
 * Generate a simulated model response based on prompt and configuration
 */
function generateSimulatedResponse(prompt, model, quantization, task) {
    // Esta função simula respostas diferentes com base na configuração
    // Em uma implementação real, isso seria substituído por chamadas a um modelo de IA
    
    // Respostas simuladas para cada tipo de tarefa
    const responses = {
        geracao: {
            default: `def calculate_fibonacci(n):
    """
    Calculate the nth Fibonacci number using dynamic programming.
    
    Args:
        n (int): The position in Fibonacci sequence.
        
    Returns:
        int: The nth Fibonacci number.
    """
    if n <= 0:
        return 0
    elif n == 1:
        return 1
        
    fib = [0] * (n + 1)
    fib[1] = 1
    
    for i in range(2, n + 1):
        fib[i] = fib[i-1] + fib[i-2]
    
    return fib[n]

# Example usage
result = calculate_fibonacci(10)
print(f"The 10th Fibonacci number is {result}")`,
            
            error_q4: `def calculate_fibonacci(n):
    """
    Calkulate the nth Fibonacci number usando dynamic programming.
    
    Input:
        n (int): Position in Fibonaci sequence.
        
    Output:
        int: The nth Fib number.
    """
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    
    fib = [0] * (n + 1)
    fib[1] = 1
    
    for i in range(2, n + 1):
        fib[i] = fib[i-1] + fib[i-2]
    
    return fib[n]

# Usage example
result = calculate_fibonacci(10)
print("The " + str(10) + "th Fibonacci number is " + str(result))
`
        },
        debug: {
            default: `O problema está na linha 7, onde você está tentando acessar um elemento fora dos limites do array:

\`\`\`python
# Linha original com erro
result = data[i + 1] * multiplier  # IndexError quando i é o último elemento
\`\`\`

Você precisa verificar se \`i + 1\` não excede o tamanho do array:

\`\`\`python
# Correção
if i + 1 < len(data):
    result = data[i + 1] * multiplier
else:
    result = data[i] * fallback_multiplier  # Use um valor alternativo
\`\`\`

Além disso, é recomendável adicionar validação de entrada no início da função para evitar problemas com arrays vazios.`,
            
            error_q4: `O problema está no código quando voce tenta acessar indice fora do array:

\`\`\`
result = data[i + 1] * multiplier
\`\`\`

Isso da IndexError na ultima iteração. 

Solução:
\`\`\`
if i + 1 < len(data):
    result = data[i + 1] * multiplier
else:
    result = 0  # ou outro valor padrão
\`\`\`

Espero que isso ajude!`
        },
        refactor: {
            default: `Aqui está o código refatorado para melhorar a legibilidade e eficiência:

\`\`\`python
def process_data(data_list, config=None):
    """
    Process a list of data items according to the provided configuration.
    
    Args:
        data_list (list): The list of data items to process.
        config (dict, optional): Configuration parameters. Defaults to None.
        
    Returns:
        dict: The processed results containing statistics and transformed data.
    """
    # Initialize default configuration if not provided
    config = config or {
        'threshold': 0.5,
        'multiplier': 2.0,
        'use_cache': False
    }
    
    # Extract configuration parameters
    threshold = config.get('threshold', 0.5)
    multiplier = config.get('multiplier', 2.0)
    use_cache = config.get('use_cache', False)
    
    # Initialize results
    results = {
        'processed_items': [],
        'stats': {
            'total_items': len(data_list),
            'items_above_threshold': 0,
            'average_value': 0.0
        }
    }
    
    # Process each item in the data list
    total_value = 0.0
    for item in data_list:
        # Apply transformation
        processed_value = transform_item(item, multiplier, use_cache)
        total_value += processed_value
        
        # Check if above threshold
        if processed_value > threshold:
            results['stats']['items_above_threshold'] += 1
            results['processed_items'].append(processed_value)
    
    # Calculate average if there are items
    if data_list:
        results['stats']['average_value'] = total_value / len(data_list)
    
    return results

def transform_item(item, multiplier=2.0, use_cache=False):
    """
    Transform a single data item.
    
    Args:
        item: The data item to transform.
        multiplier (float): The multiplication factor.
        use_cache (bool): Whether to use cached values.
        
    Returns:
        float: The transformed value.
    """
    # Implementation of transformation logic
    # (This is a simplified example)
    return float(item) * multiplier
\`\`\`

Principais melhorias:
1. Separação de responsabilidades: Criada uma função 'transform_item' para processar cada item.
2. Documentação adequada: Adicionados docstrings explicativos.
3. Valores padrão mais seguros: Uso de 'config or {...}' e '.get()' com valores padrão.
4. Organização lógica: Agrupamento relacionado de operações.
5. Melhor nomeação de variáveis para clareza.
6. Tratamento de caso especial para evitar divisão por zero.
7. Tipo de retorno consistente (sempre um dicionário).`,
            
            error_q4: `Refatoração do código:

\`\`\`python
def process_data(data_list, config=None):
    """Process data list with given config"""
    if config is None:
        config = {'threshold': 0.5, 'multiplier': 2.0, 'use_cache': False}
    
    threshold = config.get('threshold', 0.5)
    multiplier = config.get('multiplier', 2.0)
    use_cache = config.get('use_cache', False)
    
    results = {
        'processed_items': [],
        'stats': {
            'total_items': len(data_list),
            'items_above_threshold': 0,
            'average_value': 0.0
        }
    }
    
    total = 0.0
    for item in data_list:
        value = float(item) * multiplier
        total += value
        
        if value > threshold:
            results['stats']['items_above_threshold'] += 1
            results['processed_items'].append(value)
    
    if len(data_list) > 0:
        results['stats']['average_value'] = total / len(data_list)
    
    return results
\`\`\`

Melhorias:
- Adicionei inicialização padrão para config
- Prevenção de divisão por zero
- Valores default nos get()
- Estrutura de dados mais clara
- Documentação básica`
        }
    };
    
    // Seleciona a resposta com base na tarefa e quantização
    let response;
    if (quantization === 'q4' && Math.random() < 0.7) {
        response = responses[task].error_q4 || responses[task].default;
    } else {
        response = responses[task].default;
    }
    
    return response;
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} html - The input string that may contain HTML
 * @returns {string} - The escaped string
 */
function escapeHtml(html) {
    if (!html) return '';
    
    const el = document.createElement('div');
    el.innerText = html;
    return el.innerHTML;
}

/**
 * UI Updater object for handling metric updates
 */
const UIUpdater = {
    updateAll: function() {
        this.updateVRAM();
        this.updateLatency();
    },
    
    updateVRAM: function() {
        try {
            const modelType = getSelectedRadioValue('modelo') || 'phi4';
            const quantizationType = getSelectedRadioValue('quantizacao') || 'q8';
            
            // Base VRAM por modelo
            const baseVRAM = {
                'phi4': 2.1,
                'mistral': 6.5,
                'llama': 8.2
            };
            
            // Multiplicadores por quantização
            const quantMultiplier = {
                'q4': 0.5,
                'q8': 1.0,
                'fp16': 2.0
            };
            
            // Calcular VRAM estimada
            const vramValue = baseVRAM[modelType] * quantMultiplier[quantizationType];
            
            // Atualizar o campo de VRAM estimada com o novo valor
            const vramField = document.getElementById('vram-estimada');
            if (vramField) {
                const oldValue = vramField.value;
                const newValue = vramValue.toFixed(1);
                
                vramField.value = newValue;
                
                // Adicionar animação se o valor mudou
                if (oldValue !== newValue && oldValue !== '--') {
                    vramField.classList.add('value-changed');
                    setTimeout(() => vramField.classList.remove('value-changed'), 1000);
                }
            }
            
            // Mostrar aviso se quantização for Q4
            if (quantizationType === 'q4') {
                toggleInstabilityWarning('show');
            } else {
                toggleInstabilityWarning('hide');
            }
        } catch (error) {
            console.error('Error updating VRAM metric:', error);
        }
    },
    
    updateLatency: function() {
        try {
            const modelType = getSelectedRadioValue('modelo') || 'phi4';
            const quantizationType = getSelectedRadioValue('quantizacao') || 'q8';
            const taskType = getSelectedRadioValue('tarefa') || 'geracao';
            
            // Base latência por modelo (em segundos)
            const baseLatency = {
                'phi4': 1.5,
                'mistral': 2.8,
                'llama': 3.2
            };
            
            // Multiplicadores por quantização
            const quantMultiplier = {
                'q4': 0.7,
                'q8': 1.0,
                'fp16': 1.4
            };
            
            // Multiplicadores por tarefa
            const taskMultiplier = {
                'geracao': 1.0,
                'debug': 0.8,
                'refactor': 1.2
            };
            
            // Calcular latência estimada
            const latencyValue = baseLatency[modelType] * quantMultiplier[quantizationType] * taskMultiplier[taskType];
            
            // Atualizar o campo de latência estimada com o novo valor
            const latencyField = document.getElementById('latencia-estimada');
            if (latencyField) {
                const oldValue = latencyField.value;
                const newValue = latencyValue.toFixed(1);
                
                latencyField.value = newValue;
                
                // Adicionar animação se o valor mudou
                if (oldValue !== newValue && oldValue !== '--') {
                    latencyField.classList.add('value-changed');
                    setTimeout(() => latencyField.classList.remove('value-changed'), 1000);
                }
            }
        } catch (error) {
            console.error('Error updating latency metric:', error);
        }
    }
};

/**
 * Update the computational metrics display based on current selections
 */
function updateCompLMetrics() {
    // Update VRAM and Latency metrics
    UIUpdater.updateAll();
    
    // Get selected model configuration
    const modelType = getSelectedRadioValue('modelo') || 'phi4';
    const quantizationType = getSelectedRadioValue('quantizacao') || 'q8';
    const taskType = getSelectedRadioValue('tarefa') || 'geracao';
    const expertiseLevel = getSelectedRadioValue('expertise') || 'avancado';
    
    console.log(`Updating CompL metrics for ${modelType}/${quantizationType}/${taskType}/${expertiseLevel}`);
    
    // Show instability warning for Q4 quantization
    if (quantizationType === 'q4') {
        toggleInstabilityWarning('show');
    } else {
        toggleInstabilityWarning('hide');
    }
}

/**
 * Initializes all plots/visualizations with data from the synthetic data source
 */
function initializePlots() {
    console.log("Initializing plots with synthetic data...");
    
    try {
        // Skip CORS‐bound fetch on file:// and use fallback
        if (window.location.protocol === 'file:') {
            console.warn('file:// protocol detected – skipping synthetic data fetch.');
            useFallbackData(); // your stub for missing data
        } else {
            console.log("Tentando carregar dados de: ./js/synthetic_data.json");
            fetch('./js/synthetic_data.json')
                .then(response => {
                    console.log("Resposta do fetch:", response.status, response.statusText);
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Once data is loaded, initialize each chart
                    if (!data) {
                        console.error("No data loaded for visualizations");
                        return;
                    }
                    
                    console.log("Synthetic data loaded successfully:", Object.keys(data));
                    
                    if (typeof initializeRadarChart !== 'function') {
                        console.error("Função initializeRadarChart não encontrada. Implementando versão básica.");
                        // Implementa uma versão simples da função
                        window.initializeRadarChart = function(data) {
                            console.log("Inicializando gráfico radar com dados:", data);
                            if (!data || data.length === 0 || !Plotly) {
                                console.error("Dados ou Plotly indisponível para gráfico radar");
                                return;
                            }
                            try {
                                const chartData = [{
                                    type: 'scatterpolar',
                                    r: [data[0].ICL, data[0].ECL, data[0].GCL],
                                    theta: ['ICL', 'ECL', 'GCL'],
                                    fill: 'toself',
                                    name: data[0].config
                                }];
                                if (data.length > 1) {
                                    chartData.push({
                                        type: 'scatterpolar',
                                        r: [data[1].ICL, data[1].ECL, data[1].GCL],
                                        theta: ['ICL', 'ECL', 'GCL'],
                                        fill: 'toself',
                                        name: data[1].config
                                    });
                                }
                                const layout = {
                                    polar: {
                                        radialaxis: {
                                            visible: true,
                                            range: [0, 10]
                                        }
                                    },
                                    showlegend: true,
                                    margin: {t: 30, b: 20, l: 40, r: 40},
                                    legend: {orientation: 'h', y: -0.2}
                                };
                                Plotly.newPlot('graph-radar-cl', chartData, layout, {responsive: true});
                                console.log("Gráfico de radar inicializado com sucesso");
                            } catch (error) {
                                console.error("Erro ao criar gráfico radar:", error);
                            }
                        };
                    }
                    
                    if (typeof initializeHistogramChart !== 'function') {
                        console.error("Função initializeHistogramChart não encontrada. Implementando versão básica.");
                        // Implementa uma versão simples da função
                        window.initializeHistogramChart = function(data) {
                            console.log("Inicializando gráfico histograma com dados:", data);
                            if (!data || data.length === 0 || !Plotly) {
                                console.error("Dados ou Plotly indisponível para gráfico histograma");
                                return;
                            }
                            try {
                                const expertisetLabels = data.map(item => item.expertise);
                                const q4Values = data.map(item => item.Q4_overload);
                                const q8Values = data.map(item => item.Q8_overload);
                                const chartData = [
                                    {
                                        x: expertisetLabels,
                                        y: q4Values,
                                        type: 'bar',
                                        name: 'Q4',
                                        marker: {color: '#ff7f0e'}
                                    },
                                    {
                                        x: expertisetLabels,
                                        y: q8Values,
                                        type: 'bar',
                                        name: 'Q8',
                                        marker: {color: '#1f77b4'}
                                    }
                                ];
                                const layout = {
                                    barmode: 'group',
                                    xaxis: {title: 'Nível de Expertise'},
                                    yaxis: {title: 'Sobrecarga Cognitiva (%)'},
                                    margin: {t: 30, b: 40, l: 60, r: 30},
                                    legend: {orientation: 'h', y: -0.2}
                                };
                                Plotly.newPlot('graph-histogram-overload', chartData, layout, {responsive: true});
                                console.log("Gráfico de histograma inicializado com sucesso");
                            } catch (error) {
                                console.error("Erro ao criar gráfico histograma:", error);
                            }
                        };
                    }
                    
                    if (typeof initializeBarChart !== 'function') {
                        console.error("Função initializeBarChart não encontrada. Implementando versão básica.");
                        // Implementa uma versão simples da função
                        window.initializeBarChart = function(data) {
                            console.log("Inicializando gráfico de barras com dados:", data);
                            if (!data || data.length === 0 || !Plotly) {
                                console.error("Dados ou Plotly indisponível para gráfico de barras");
                                return;
                            }
                            try {
                                const taskLabels = data.map(item => item.task);
                                const q4VramValues = data.map(item => item.Q4_VRAM);
                                const q8VramValues = data.map(item => item.Q8_VRAM);
                                const chartData = [
                                    {
                                        x: taskLabels,
                                        y: q4VramValues,
                                        type: 'bar',
                                        name: 'Q4 VRAM (GB)',
                                        marker: {color: '#ff7f0e'}
                                    },
                                    {
                                        x: taskLabels,
                                        y: q8VramValues,
                                        type: 'bar',
                                        name: 'Q8 VRAM (GB)',
                                        marker: {color: '#1f77b4'}
                                    }
                                ];
                                const layout = {
                                    barmode: 'group',
                                    xaxis: {title: 'Tipo de Tarefa'},
                                    yaxis: {title: 'VRAM (GB)'},
                                    margin: {t: 30, b: 40, l: 60, r: 30},
                                    legend: {orientation: 'h', y: -0.2}
                                };
                                Plotly.newPlot('graph-bar-resources', chartData, layout, {responsive: true});
                                console.log("Gráfico de barras inicializado com sucesso");
                            } catch (error) {
                                console.error("Erro ao criar gráfico de barras:", error);
                            }
                        };
                    }
                    
                    if (typeof initializeSankeyChart !== 'function') {
                        console.error("Função initializeSankeyChart não encontrada. Implementando versão básica.");
                        window.initializeSankeyChart = function(data) {
                            console.log("Inicializando gráfico sankey com dados:", data);
                            if (!data || !data.nodes || !data.links || !Plotly) {
                                console.error("Dados ou Plotly indisponível para gráfico sankey");
                                return;
                            }
                            try {
                                const chartData = [{
                                    type: "sankey",
                                    orientation: "h",
                                    node: {
                                        pad: 15,
                                        thickness: 20,
                                        line: {
                                            color: "black",
                                            width: 0.5
                                        },
                                        label: data.nodes.map(n => n.id)
                                    },
                                    link: {
                                        source: data.links.map(l => data.nodes.findIndex(n => n.id === l.source)),
                                        target: data.links.map(l => data.nodes.findIndex(n => n.id === l.target)),
                                        value: data.links.map(l => l.value)
                                    }
                                }];
                                const layout = {
                                    margin: {t: 30, b: 20, l: 20, r: 20}
                                };
                                Plotly.newPlot('graph-sankey-flow', chartData, layout, {responsive: true});
                                console.log("Gráfico sankey inicializado com sucesso");
                            } catch (error) {
                                console.error("Erro ao criar gráfico sankey:", error);
                            }
                        };
                    }
                    
                    if (typeof initializeViolinChart !== 'function') {
                        console.error("Função initializeViolinChart não encontrada. Implementando versão básica.");
                        window.initializeViolinChart = function(data) {
                            console.log("Inicializando gráfico violin com dados:", data);
                            if (!data || data.length === 0 || !Plotly) {
                                console.error("Dados ou Plotly indisponível para gráfico violin");
                                return;
                            }
                            try {
                                // Separa dados por tipo de expertise
                                const iniciante = data.filter(d => d.expertise === 'Iniciante');
                                const avancado = data.filter(d => d.expertise === 'Avançado');
                                const chartData = [
                                    {
                                        y: iniciante.map(d => d.CompL),
                                        name: 'Iniciante',
                                        type: 'violin',
                                        box: {visible: true},
                                        line: {color: '#ff7f0e'},
                                        meanline: {visible: true}
                                    },
                                    {
                                        y: avancado.map(d => d.CompL),
                                        name: 'Avançado',
                                        type: 'violin',
                                        box: {visible: true},
                                        line: {color: '#1f77b4'},
                                        meanline: {visible: true}
                                    }
                                ];
                                const layout = {
                                    yaxis: {title: 'Carga Computacional (CompL)'},
                                    margin: {t: 30, b: 40, l: 60, r: 30},
                                    legend: {orientation: 'h', y: -0.2}
                                };
                                Plotly.newPlot('graph-violin-cl-compl', chartData, layout, {responsive: true});
                                console.log("Gráfico violin inicializado com sucesso");
                            } catch (error) {
                                console.error("Erro ao criar gráfico violin:", error);
                            }
                        };
                    }
                    
                    if (typeof initializeKDEChart !== 'function') {
                        console.error("Função initializeKDEChart não encontrada. Implementando versão básica.");
                        window.initializeKDEChart = function(data) {
                            console.log("Inicializando gráfico KDE com dados:", data);
                            if (!data || data.length === 0 || !Plotly) {
                                console.error("Dados ou Plotly indisponível para gráfico KDE");
                                return;
                            }
                            try {
                                const chartData = [{
                                    x: data.map(d => d.CL),
                                    y: data.map(d => d.CompL),
                                    mode: 'markers',
                                    type: 'scatter',
                                    marker: {
                                        color: 'rgba(31, 119, 180, 0.6)',
                                        size: 10
                                    },
                                    name: 'Distribuição CL-CompL'
                                }];
                                const layout = {
                                    xaxis: {title: 'Carga Cognitiva (CL)'},
                                    yaxis: {title: 'Carga Computacional (CompL)'},
                                    margin: {t: 30, b: 40, l: 60, r: 30}
                                };
                                Plotly.newPlot('graph-kde-cl-compl', chartData, layout, {responsive: true});
                                console.log("Gráfico KDE inicializado com sucesso");
                            } catch (error) {
                                console.error("Erro ao criar gráfico KDE:", error);
                            }
                        };
                    }
                    
                    if (typeof initializeScatterChart !== 'function') {
                        console.error("Função initializeScatterChart não encontrada. Implementando versão básica.");
                        window.initializeScatterChart = function(data) {
                            console.log("Inicializando gráfico scatter com dados:", data);
                            if (!data || data.length === 0 || !Plotly) {
                                console.error("Dados ou Plotly indisponível para gráfico scatter");
                                return;
                            }
                            try {
                                const chartData = [{
                                    x: data.map(d => d.CompL_VRAM),
                                    y: data.map(d => d.Precision),
                                    text: data.map(d => `${d.model} (${d.quantization})`),
                                    mode: 'markers',
                                    type: 'scatter',
                                    marker: {
                                        size: 12,
                                        color: data.map(d => d.quantization === 'Q4' ? '#ff7f0e' : '#1f77b4'),
                                        opacity: 0.7
                                    },
                                    hoverinfo: 'x+y+text'
                                }];
                                const layout = {
                                    xaxis: {title: 'VRAM (GB)'},
                                    yaxis: {title: 'Precisão (%)'},
                                    margin: {t: 30, b: 40, l: 60, r: 30},
                                    showlegend: false
                                };
                                Plotly.newPlot('graph-scatter-precision-compl', chartData, layout, {responsive: true});
                                console.log("Gráfico scatter inicializado com sucesso");
                                if (typeof scatterPlotDataPoints !== 'undefined') {
                                    scatterPlotDataPoints.x = [];
                                    scatterPlotDataPoints.y = [];
                                    scatterPlotDataPoints.text = [];
                                    data.forEach(point => {
                                        scatterPlotDataPoints.x.push(point.CompL_VRAM);
                                        scatterPlotDataPoints.y.push(point.Precision);
                                        scatterPlotDataPoints.text.push(`${point.model} (${point.quantization})`);
                                    });
                                }
                            } catch (error) {
                                console.error("Erro ao criar gráfico scatter:", error);
                            }
                        };
                    }
                    
                    // Initialize each chart with its corresponding data
                    try {
                        console.log("Iniciando radar chart");
                        initializeRadarChart(data.radar_cl);
                    } catch (e) {
                        console.error("Erro ao inicializar radar chart:", e);
                    }
                    
                    try {
                        console.log("Iniciando histogram chart");
                        initializeHistogramChart(data.histogram_overload);
                    } catch (e) {
                        console.error("Erro ao inicializar histogram chart:", e);
                    }
                    
                    try {
                        console.log("Iniciando bar chart");
                        initializeBarChart(data.bar_resources);
                    } catch (e) {
                        console.error("Erro ao inicializar bar chart:", e);
                    }
                    
                    try {
                        console.log("Iniciando sankey chart");
                        initializeSankeyChart(data.sankey_flow);
                    } catch (e) {
                        console.error("Erro ao inicializar sankey chart:", e);
                    }
                    
                    try {
                        console.log("Iniciando violin chart");
                        initializeViolinChart(data.violin_cl_compl);
                    } catch (e) {
                        console.error("Erro ao inicializar violin chart:", e);
                    }
                    
                    try {
                        console.log("Iniciando KDE chart");
                        initializeKDEChart(data.kde_cl_compl);
                    } catch (e) {
                        console.error("Erro ao inicializar KDE chart:", e);
                    }
                    
                    try {
                        console.log("Iniciando scatter chart");
                        initializeScatterChart(data.scatter_precision_compl);
                    } catch (e) {
                        console.error("Erro ao inicializar scatter chart:", e);
                    }
                    
                    console.log("All visualizations initialized");
                })
                .catch(error => {
                    console.error("Error loading synthetic data:", error);
                    // Display placeholder charts with error message
                    displayPlaceholderCharts();
                });
        }
    } catch (error) {
        console.error("Error in initializePlots:", error);
        // Display placeholder charts with error message
        displayPlaceholderCharts();
    }
}

/**
 * Display placeholder charts when data loading fails
 */
function displayPlaceholderCharts() {
    console.log("Exibindo gráficos de placeholder devido a erro nos dados");
    const placeholderMessage = "Não foi possível carregar os dados. Verifique o console para mais detalhes.";
    
    const chartIds = [
        'graph-radar-cl',
        'graph-histogram-overload',
        'graph-bar-resources',
        'graph-sankey-flow',
        'graph-violin-cl-compl',
        'graph-kde-cl-compl',
        'graph-scatter-precision-compl'
    ];
    
    // Exibe mensagem de erro em cada contenedor de gráfico
    chartIds.forEach(id => {
        try {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column;">
                        <i class="fas fa-exclamation-triangle fa-2x text-warning mb-2"></i>
                        <p class="text-center">${placeholderMessage}</p>
                    </div>
                `;
            }
        } catch (e) {
            console.error(`Erro ao exibir placeholder para ${id}:`, e);
        }
    });
}
