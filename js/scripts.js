/**
 * Scripts principais para inicialização da página
 */

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar os componentes do GOV.BR Design System
  // Se o objeto window.coreDefaults existir, chamar suas funções
  if (typeof window.coreDefaults !== 'undefined') {
    console.log('Inicializando componentes do GOV.BR Design System');
    
    // Garantir que a função initInstanceAll existe e chamá-la
    if (typeof window.coreDefaults.initInstanceAll === 'function') {
      window.coreDefaults.initInstanceAll();
    }
  }
  
  // Inicializar todos os gráficos Plotly se o DOM estiver pronto
  initializeVisualizationsIfReady();
  
  // Configurar ouvintes de eventos para controles que afetam gráficos
  setupEventListeners();
});

/**
 * Inicializa as visualizações quando o DOM estiver pronto
 * e as bibliotecas necessárias estiverem carregadas
 */
function initializeVisualizationsIfReady() {
  // Verificar se a biblioteca Plotly está disponível
  if (typeof Plotly === 'undefined') {
    console.error('A biblioteca Plotly não está disponível. Tentando novamente em 200ms...');
    setTimeout(initializeVisualizationsIfReady, 200);
    return;
  }

  // Verificar se o objeto visualizations está disponível
  if (typeof visualizations === 'undefined') {
    console.error('O objeto visualizations não está disponível. Tentando novamente em 200ms...');
    setTimeout(initializeVisualizationsIfReady, 200);
    return;
  }

  // Inicializar as visualizações
  initializeVisualizations();
}

/**
 * Inicializa todas as visualizações da página
 */
function initializeVisualizations() {
  console.log('Inicializando visualizações...');
  
  try {
    // Radar de Carga Cognitiva
    if (document.getElementById('graph-radar-cl')) {
      visualizations.renderRadarCL('graph-radar-cl');
    }
    
    // Histograma de Sobrecarga Cognitiva vs Expertise
    if (document.getElementById('graph-histogram-overload')) {
      visualizations.renderHistogramOverload('graph-histogram-overload');
    }
    
    // Barras de Uso de Recursos vs Tarefa
    if (document.getElementById('graph-bar-resources')) {
      visualizations.renderBarResources('graph-bar-resources');
    }
    
    // Diagrama Sankey de Fluxo de Recursos
    if (document.getElementById('graph-sankey-flow')) {
      visualizations.renderSankeyFlow('graph-sankey-flow');
    }
    
    // Gráfico de Violino de CL vs CompL por Expertise
    if (document.getElementById('graph-violin-cl-compl')) {
      visualizations.renderViolinCLCompL('graph-violin-cl-compl');
    }
    
    // Densidade KDE CL-CompL
    if (document.getElementById('graph-kde-cl-compl')) {
      visualizations.renderKDECLCompL('graph-kde-cl-compl');
    }
    
    // Scatter Plot de Precisão vs CompL
    if (document.getElementById('graph-scatter-precision-compl')) {
      visualizations.renderScatterPrecisionCompL('graph-scatter-precision-compl');
    }
    
    console.log('Todas as visualizações foram inicializadas com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar visualizações:', error);
  }
}

/**
 * Configura os ouvintes de eventos para interatividade
 */
function setupEventListeners() {
  // Eventos para a mudança de modelo
  const modelRadios = document.querySelectorAll('input[name="modelo"]');
  modelRadios.forEach(radio => {
    radio.addEventListener('change', updateModelDependentVisualizations);
  });
  
  // Eventos para a mudança de expertise
  const expertiseRadios = document.querySelectorAll('input[name="quantizacao"]');
  expertiseRadios.forEach(radio => {
    radio.addEventListener('change', updateExpertiseDependentVisualizations);
  });
  
  // Eventos para a mudança de tarefa
  const taskRadios = document.querySelectorAll('input[name="tarefa"]');
  taskRadios.forEach(radio => {
    radio.addEventListener('change', updateTaskDependentVisualizations);
  });
  
  // Botão de otimização de parâmetros
  const optimizeBtn = document.getElementById('global-btn-optimize-params');
  if (optimizeBtn) {
    optimizeBtn.addEventListener('click', function() {
      // Exemplo de otimização - selecionar automaticamente opções
      document.getElementById('llama').checked = true;
      document.getElementById('exp-ava2').checked = true;
      document.getElementById('tarefa-gen').checked = true;
      
      // Atualizar visualizações
      updateAllVisualizations();
      
      // Atualizar campos de métricas
      document.getElementById('vram-estimada').value = '5.2 GB';
      document.getElementById('latencia-estimada').value = '0.42s';
    });
  }
  
  // Toggle de colapso para seções
  const collapseToggles = document.querySelectorAll('[data-toggle="collapse"]');
  collapseToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const target = document.querySelector(this.getAttribute('data-target'));
      if (target) {
        if (target.classList.contains('show')) {
          target.classList.remove('show');
          this.querySelector('i').classList.remove('fa-angle-up');
          this.querySelector('i').classList.add('fa-angle-down');
        } else {
          target.classList.add('show');
          this.querySelector('i').classList.remove('fa-angle-down');
          this.querySelector('i').classList.add('fa-angle-up');
        }
      }
    });
  });
}

/**
 * Atualiza as visualizações que dependem do modelo selecionado
 */
function updateModelDependentVisualizations() {
  console.log('Atualizando visualizações baseadas no modelo...');
  
  // Atualizar o gráfico de radar CL
  if (document.getElementById('graph-radar-cl')) {
    // Criar dados diferentes com base no modelo selecionado
    const selectedModel = document.querySelector('input[name="modelo"]:checked')?.value || 'phi4';
    let radarData = {...mockData.radarCL};
    
    if (selectedModel === 'mistral') {
      radarData.values = [0.7, 0.75, 0.8, 0.65, 0.6];
    } else if (selectedModel === 'llama') {
      radarData.values = [0.85, 0.7, 0.95, 0.75, 0.6];
    }
    
    visualizations.renderRadarCL('graph-radar-cl', radarData);
  }
  
  // Atualizar outras visualizações dependentes do modelo
  updateVRAMEstimate();
}

/**
 * Atualiza as visualizações que dependem do nível de expertise
 */
function updateExpertiseDependentVisualizations() {
  console.log('Atualizando visualizações baseadas no nível de expertise...');
  
  // Atualizar o gráfico de violino CL-CompL
  if (document.getElementById('graph-violin-cl-compl')) {
    // Poderia ajustar os dados com base no expertise selecionado
    visualizations.renderViolinCLCompL('graph-violin-cl-compl');
  }
}

/**
 * Atualiza as visualizações que dependem da tarefa selecionada
 */
function updateTaskDependentVisualizations() {
  console.log('Atualizando visualizações baseadas na tarefa...');
  
  // Atualizar o gráfico de barras de recursos
  if (document.getElementById('graph-bar-resources')) {
    const selectedTask = document.querySelector('input[name="tarefa"]:checked')?.value || 'geracao';
    
    // Destaque para a tarefa selecionada nos gráficos
    const barData = {...mockData.barResources};
    // Poderíamos atualizar barData aqui com base na tarefa
    
    visualizations.renderBarResources('graph-bar-resources', barData);
  }
  
  // Atualizar estimativa de latência
  updateLatencyEstimate();
}

/**
 * Atualiza a estimativa de VRAM com base no modelo e na tarefa
 */
function updateVRAMEstimate() {
  const selectedModel = document.querySelector('input[name="modelo"]:checked')?.value || 'phi4';
  const vramEstimateField = document.getElementById('vram-estimada');
  
  if (vramEstimateField) {
    let vramEstimate;
    
    switch (selectedModel) {
      case 'phi4':
        vramEstimate = '2.4 GB';
        break;
      case 'mistral':
        vramEstimate = '4.7 GB';
        break;
      case 'llama':
        vramEstimate = '5.2 GB';
        break;
      default:
        vramEstimate = '-- GB';
    }
    
    vramEstimateField.value = vramEstimate;
  }
}

/**
 * Atualiza a estimativa de latência com base no modelo e na tarefa
 */
function updateLatencyEstimate() {
  const selectedModel = document.querySelector('input[name="modelo"]:checked')?.value || 'phi4';
  const selectedTask = document.querySelector('input[name="tarefa"]:checked')?.value || 'geracao';
  const latencyEstimateField = document.getElementById('latencia-estimada');
  
  if (latencyEstimateField) {
    let latencyEstimate;
    
    // Latência base por modelo
    const baseLatency = {
      'phi4': 0.2,
      'mistral': 0.35,
      'llama': 0.42
    }[selectedModel] || 0.3;
    
    // Multiplicador por tarefa
    const taskMultiplier = {
      'geracao': 1.0,
      'debug': 0.8,
      'refactor': 1.2,
      'qa': 0.7,
      'doc': 0.5,
      'opt': 1.3
    }[selectedTask] || 1.0;
    
    latencyEstimate = (baseLatency * taskMultiplier).toFixed(2);
    latencyEstimateField.value = `${latencyEstimate}s`;
  }
}

/**
 * Atualiza todas as visualizações da página
 */
function updateAllVisualizations() {
  updateModelDependentVisualizations();
  updateExpertiseDependentVisualizations();
  updateTaskDependentVisualizations();
}
