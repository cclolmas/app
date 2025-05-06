const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Testes de desempenho para medir a responsividade da aplicação
 * com um número crescente de agentes
 */
async function runPerformanceTests() {
  const results = [];
  const agentCounts = [1, 5, 10, 25, 50, 100, 200];
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Habilitar a API de Performance do Chrome
  await page.evaluateOnNewDocument(() => {
    window.performanceData = [];
    window.logPerformance = (data) => {
      window.performanceData.push(data);
    };
  });
  
  console.log('Iniciando testes de desempenho com diferentes quantidades de agentes...');
  
  for (const agentCount of agentCounts) {
    console.log(`Testando com ${agentCount} agentes...`);
    
    // Abre a página com o parâmetro de quantidade de agentes
    await page.goto(`http://localhost:3000/test-performance?agents=${agentCount}`, {
      waitUntil: 'networkidle2'
    });
    
    // Espera a renderização completa
    await page.waitForSelector('#performance-test-complete', { timeout: 60000 });
    
    // Medir uso de memória
    const memoryInfo = await page.evaluate(() => window.performance.memory);
    
    // Coletar métricas de performance
    const performanceMetrics = await page.evaluate(() => window.performanceData);
    const timing = await page.evaluate(() => window.performance.timing);
    
    // Executar avaliação de FPS durante 5 segundos de interação
    await page.evaluate(() => {
      return new Promise(resolve => {
        const testInteractions = () => {
          // Simular interações na interface
          document.querySelectorAll('.agent-item').forEach(agent => {
            agent.click();
            setTimeout(() => agent.click(), 100);
          });
        };
        
        testInteractions();
        setTimeout(resolve, 5000);
      });
    });
    
    // Capturar métricas finais
    const fps = await page.evaluate(() => {
      return window.lastFPS || 0;
    });
    
    // Calcular tempo de renderização
    const renderTime = timing.loadEventEnd - timing.navigationStart;
    
    results.push({
      agentCount,
      renderTimeMs: renderTime,
      fps,
      usedHeapSize: memoryInfo ? memoryInfo.usedJSHeapSize / (1024 * 1024) : 'N/A',
      totalHeapSize: memoryInfo ? memoryInfo.totalJSHeapSize / (1024 * 1024) : 'N/A',
      customMetrics: performanceMetrics
    });
  }
  
  await browser.close();
  
  // Salvar os resultados em um arquivo JSON
  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsPath = path.join(resultsDir, `agent-scaling-results-${timestamp}.json`);
  
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`Resultados salvos em: ${resultsPath}`);
  
  // Exibir um resumo no console
  console.log('\n----- RESUMO DOS RESULTADOS -----');
  console.log('Quantidade de Agentes | Tempo de Renderização (ms) | FPS | Uso de Heap (MB)');
  results.forEach(r => {
    console.log(`${r.agentCount.toString().padStart(20)} | ${r.renderTimeMs.toString().padStart(25)} | ${r.fps.toFixed(2).padStart(5)} | ${typeof r.usedHeapSize === 'number' ? r.usedHeapSize.toFixed(2) : r.usedHeapSize.toString().padStart(13)}`);
  });
}

runPerformanceTests().catch(console.error);
