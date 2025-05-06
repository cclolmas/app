// Remover importação ES6 que estava causando problema
// import { createCharts } from './charts.js';

// Função para verificar se a biblioteca Chart.js foi carregada
function isChartJsLoaded() {
  return typeof Chart !== 'undefined';
}

// Inicializar os gráficos quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Verificar carregamento de fontes
  checkFontLoading();
  
  if (isChartJsLoaded()) {
    console.log('Chart.js está disponível e pronto para uso');
    
    // Verificar se os gráficos já estão inicializados pelos scripts charts.js
    if (typeof window.createWinRateChart === 'function') {
      console.log('Funções de criação de gráficos já disponíveis');
    } else {
      console.warn('As funções de criação de gráficos não estão definidas no escopo global');
      retryLoadScript('js/charts.js');
    }
  } else {
    console.error('Chart.js não foi carregado corretamente. Tentando carregar novamente...');
    
    // Tentar carregar Chart.js dinamicamente
    loadScriptDynamically('https://cdn.jsdelivr.net/npm/chart.js', function() {
      console.log('Chart.js carregado dinamicamente');
      // Depois carrega o script de gráficos
      loadScriptDynamically('js/charts.js');
    });
  }
});

// Função para carregar um script dinamicamente
function loadScriptDynamically(src, callback) {
  const script = document.createElement('script');
  script.src = src;
  
  if (callback) {
    script.onload = callback;
  }
  
  script.onerror = function() {
    console.error(`Falha ao carregar o script: ${src}`);
  };
  
  document.head.appendChild(script);
}

// Função para tentar recarregar um script
function retryLoadScript(src, callback, maxRetries = 3) {
  let retries = 0;
  
  function attempt() {
    if (retries >= maxRetries) {
      console.error(`Desistindo após ${maxRetries} tentativas de carregar ${src}`);
      return;
    }
    
    retries++;
    console.log(`Tentativa ${retries} de carregar ${src}`);
    
    loadScriptDynamically(src, function() {
      if (callback) callback();
    });
  }
  
  attempt();
}

// Função para verificar e reportar problema com carregamento de fontes
function checkFontLoading() {
  if (document.fonts) {
    document.fonts.ready.then(function() {
      console.log('Todas as fontes foram carregadas com sucesso');
    }).catch(function(error) {
      console.warn('Problema ao carregar fontes:', error);
      enableFallbackFonts();
    });
    
    // Adicionar timeout para detectar carregamento lento de fontes
    setTimeout(function() {
      if (document.fonts.status !== 'loaded') {
        console.warn('Carregamento de fontes está demorando muito. Habilitando fontes alternativas.');
        enableFallbackFonts();
      }
    }, 3000);
  } else {
    console.warn('API de fontes não suportada. Usando fontes do sistema.');
    enableFallbackFonts();
  }
}

// Habilitar fontes alternativas
function enableFallbackFonts() {
  document.body.classList.add('use-fallback-fonts');
  console.log('Usando fontes fallback');
}
