/**
 * Script específico para inicializar visualizações CL-CompL
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('📊 Inicializando visualizações CL-CompL...');
  
  // 1. Verificar se os componentes necessários estão presentes
  const balanceIndicator = document.getElementById('balance-indicator');
  const statusText = document.getElementById('balance-status-text');
  
  if (!balanceIndicator || !statusText) {
    console.log('ℹ️ Elementos de indicador de equilíbrio não encontrados na página atual.');
    return;
  }
  
  // 2. Verificar se a função updateBalanceIndicator está disponível
  if (typeof window.updateBalanceIndicator !== 'function') {
    console.warn('⚠️ função updateBalanceIndicator não disponível. Carregando o script...');
    
    // Carregar o script balance-indicator.js dinamicamente
    const script = document.createElement('script');
    script.src = '/js/balance-indicator.js';
    script.async = true;
    document.head.appendChild(script);
    
    // Aguardar o carregamento e tentar inicializar
    script.onload = function() {
      initializeBalanceIndicator();
    };
  } else {
    // Se já estiver disponível, inicializar diretamente
    initializeBalanceIndicator();
  }
  
  // 3. Função para inicializar o indicador de equilíbrio
  function initializeBalanceIndicator() {
    // Valores iniciais
    const initialMetrics = {
      confidenceLevel: 50,
      complexityLevel: 50
    };
    
    // Atualizar indicador com valores padrão
    try {
      window.updateBalanceIndicator(initialMetrics);
      console.log('✅ Indicador de equilíbrio inicializado com valores padrão');
      
      // Adicionar listener para atualizações
      document.addEventListener('metrics:updated', function(event) {
        if (event.detail && event.detail.metrics) {
          window.updateBalanceIndicator(event.detail.metrics);
        }
      });
    } catch (error) {
      console.error('❌ Erro ao inicializar indicador de equilíbrio:', error);
    }
  }
  
  // 4. Verificar se Chart.js está disponível e inicializar gráficos
  if (document.querySelectorAll('.chart-container').length > 0) {
    if (typeof Chart === 'undefined') {
      console.log('ℹ️ Carregando Chart.js dinamicamente');
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.async = true;
      document.head.appendChild(script);
      
      script.onload = function() {
        console.log('✅ Chart.js carregado com sucesso');
        initializeCharts();
      };
    } else {
      initializeCharts();
    }
  }
  
  // 5. Função para inicializar gráficos
  function initializeCharts() {
    const chartContainers = document.querySelectorAll('.chart-container');
    
    if (chartContainers.length === 0) {
      console.log('ℹ️ Nenhum container de gráfico encontrado');
      return;
    }
    
    try {
      chartContainers.forEach(function(container) {
        const canvasId = container.querySelector('canvas')?.id;
        if (!canvasId) return;
        
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        // Exemplo de configuração básica de gráfico
        const chartConfig = {
          type: container.dataset.chartType || 'line',
          data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [{
              label: container.dataset.chartLabel || 'Dados',
              data: [12, 19, 3, 5, 2, 3],
              backgroundColor: 'rgba(0, 123, 255, 0.2)',
              borderColor: 'rgba(0, 123, 255, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        };
        
        // Criamos o gráfico
        new Chart(ctx, chartConfig);
      });
      
      console.log('✅ Todos os gráficos inicializados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar gráficos:', error);
    }
  }
});
