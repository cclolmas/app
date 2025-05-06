import puppeteer from 'puppeteer';

describe('End-to-end Visualization Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new', // Use headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('CL-CompL visualizations load and render correctly', async () => {
    await page.goto('http://localhost:3000/dashboard/cognitive-load', { waitUntil: 'networkidle0' });
    
    // Verificar se a página carregou corretamente
    await page.waitForSelector('.load-view-container');
    
    // Verificar se o gráfico de radar está visível
    await page.waitForSelector('.radar-chart-full-container');
    
    // Verificar se o gráfico de barras está visível
    await page.waitForSelector('.bar-chart-container');
    
    // Capturar screenshot do dashboard
    await page.screenshot({ path: './tests/visualizations/screenshots/cognitive-load-dashboard.png' });
    
    // Alternar para a guia de perfil
    await page.click('button.active + button');
    await page.waitForSelector('.profile-metrics');
    
    // Verificar se a seleção de estudante funciona
    const selectElement = await page.$('select');
    await selectElement.select('1'); // Selecionar o segundo estudante
    
    // Capturar screenshot após a seleção
    await page.screenshot({ path: './tests/visualizations/screenshots/cognitive-profile-view.png' });
  });

  test('Computational Load visualizations load and render correctly', async () => {
    await page.goto('http://localhost:3000/dashboard/computational-load', { waitUntil: 'networkidle0' });
    
    // Verificar se a página carregou corretamente
    await page.waitForSelector('.computational-load-container');
    
    // Verificar se o gráfico de recursos está visível
    await page.waitForSelector('.stacked-bar-chart');
    
    // Verificar se o diagrama Sankey está visível
    await page.waitForSelector('.sankey-diagram');
    
    // Capturar screenshot do dashboard
    await page.screenshot({ path: './tests/visualizations/screenshots/computational-load-dashboard.png' });
    
    // Aplicar filtros
    const filterSelect = await page.$('select[data-testid="model-filter"]');
    await filterSelect.select('Llama');
    
    // Aguardar atualização do gráfico
    await page.waitForTimeout(500);
    
    // Capturar screenshot após filtro
    await page.screenshot({ path: './tests/visualizations/screenshots/computational-load-filtered.png' });
  });

  test('Visualization responds to window resize', async () => {
    await page.goto('http://localhost:3000/dashboard/cognitive-load', { waitUntil: 'networkidle0' });
    
    // Capturar screenshot em tamanho normal
    await page.screenshot({ path: './tests/visualizations/screenshots/normal-size.png' });
    
    // Redimensionar para tablet
    await page.setViewport({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // Capturar screenshot após redimensionamento
    await page.screenshot({ path: './tests/visualizations/screenshots/tablet-size.png' });
    
    // Redimensionar para celular
    await page.setViewport({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    
    // Capturar screenshot em tamanho móvel
    await page.screenshot({ path: './tests/visualizations/screenshots/mobile-size.png' });
    
    // Verificar se os elementos responsivos se ajustaram corretamente
    const chartContainer = await page.$('.chart-container');
    const boundingBox = await chartContainer.boundingBox();
    
    expect(boundingBox.width).toBeLessThanOrEqual(375);
  });
  
  test('Interactive elements work correctly', async () => {
    await page.goto('http://localhost:3000/dashboard/cognitive-load', { waitUntil: 'networkidle0' });
    
    // Alternar para a guia de distribuição
    const distributionTab = await page.$('button:nth-of-type(4)');
    await distributionTab.click();
    
    // Verificar se a guia foi carregada
    await page.waitForSelector('.distribution-view');
    
    // Interagir com os filtros
    const dimensionFilter = await page.$('.filter-group select');
    await dimensionFilter.select('complexity');
    
    // Verificar se o texto de filtro está presente
    await page.waitForFunction(
      () => document.querySelector('.distribution-view h3').innerText.includes('Complexidade')
    );
    
    // Capturar screenshot após filtro
    await page.screenshot({ path: './tests/visualizations/screenshots/filtered-distribution.png' });
  });
});
