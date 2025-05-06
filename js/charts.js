// Verificar disponibilidade do Chart.js
function isChartJsAvailable() {
  return typeof Chart !== 'undefined';
}

// Armazenar referências dos gráficos para destruí-los antes de recriar
const chartInstances = {
  winRateChart: null,
  pickRateChart: null,
  banRateChart: null
};

// Função para marcar containers de visualização como carregados
function markContainerAsLoaded(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.classList.add('loaded');
  }
}

// Função para destruir um gráfico existente se houver
function destroyChartIfExists(chartId) {
  if (chartInstances[chartId]) {
    chartInstances[chartId].destroy();
    chartInstances[chartId] = null;
    console.log(`Gráfico ${chartId} destruído antes da recriação`);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  if (!isChartJsAvailable()) {
    console.error('Chart.js não está disponível. Os gráficos não serão renderizados.');
    
    // Mostrar mensagem de erro
    const errorMessage = document.getElementById('viz-error-message');
    if (errorMessage) {
      errorMessage.classList.remove('d-none');
      const errorDetails = document.getElementById('viz-error-details');
      if (errorDetails) {
        errorDetails.textContent = 'Biblioteca Chart.js não foi carregada corretamente. Tente recarregar a página.';
      }
    }
    return;
  }

  console.log('Inicializando gráficos...');
  
  // Adicionar tratamento para carregar gráficos apenas quando os elementos existirem
  setTimeout(() => {
    // Verificar se os elementos canvas existem antes de criar os gráficos
    if (document.getElementById('winRateChart')) {
      createWinRateChart();
    } else {
      console.log('Canvas winRateChart não encontrado');
    }
    
    if (document.getElementById('pickRateChart')) {
      createPickRateChart();
    } else {
      console.log('Canvas pickRateChart não encontrado');
    }
    
    if (document.getElementById('banRateChart')) {
      createBanRateChart();
    } else {
      console.log('Canvas banRateChart não encontrado');
    }
  }, 100); // Pequeno atraso para garantir que o DOM está completamente carregado
});

function createWinRateChart() {
  try {
    // Destruir gráfico existente se houver
    destroyChartIfExists('winRateChart');
    
    const ctx = document.getElementById('winRateChart').getContext('2d');
    
    chartInstances.winRateChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mistral 7B', 'LLaMA 13B', 'WizardCoder', 'Phi-3', 'Mixtral 8x7B'],
        datasets: [{
          label: 'Taxa de Acerto (%)',
          data: [52.3, 48.7, 61.2, 49.8, 70.5],
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            min: 40,
            max: 80
          }
        }
      }
    });
    
    markContainerAsLoaded('winRateChartContainer');
    console.log('Gráfico winRateChart criado com sucesso');
  } catch (error) {
    console.error('Erro ao criar o gráfico de taxa de acerto:', error);
  }
}

function createPickRateChart() {
  try {
    // Destruir gráfico existente se houver
    destroyChartIfExists('pickRateChart');
    
    const ctx = document.getElementById('pickRateChart').getContext('2d');
    
    chartInstances.pickRateChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Iniciante', 'Intermediário', 'Avançado', 'Especialista'],
        datasets: [{
          label: 'Taxa de Escolha (%)',
          data: [18.3, 32.7, 35.2, 13.8],
          backgroundColor: 'rgba(255, 159, 64, 0.7)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    
    markContainerAsLoaded('pickRateChartContainer');
    console.log('Gráfico pickRateChart criado com sucesso');
  } catch (error) {
    console.error('Erro ao criar o gráfico de taxa de escolha:', error);
  }
}

function createBanRateChart() {
  try {
    // Destruir gráfico existente se houver
    destroyChartIfExists('banRateChart');
    
    const ctx = document.getElementById('banRateChart').getContext('2d');
    
    chartInstances.banRateChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Geração Código', 'Debug', 'Refatoração', 'QA', 'Testes'],
        datasets: [{
          label: 'Carga Cognitiva',
          data: [6.3, 5.7, 4.2, 3.8, 2.5],
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    
    markContainerAsLoaded('banRateChartContainer');
    console.log('Gráfico banRateChart criado com sucesso');
  } catch (error) {
    console.error('Erro ao criar o gráfico de carga cognitiva:', error);
  }
}

// Exportar funções para uso global
window.createWinRateChart = createWinRateChart;
window.createPickRateChart = createPickRateChart;
window.createBanRateChart = createBanRateChart;
