/**
 * Funções auxiliares para testes de visualizações
 */

/**
 * Gera dados de mock para gráficos de barras
 * @param {number} categories - Número de categorias
 * @param {number} datasets - Número de conjuntos de dados
 * @returns {Object} Dados formatados para gráficos
 */
export const generateBarChartData = (categories = 5, datasets = 1) => {
  const labels = Array.from({ length: categories }, (_, i) => `Category ${i + 1}`);
  const datasets_array = Array.from({ length: datasets }, (_, i) => ({
    label: `Dataset ${i + 1}`,
    data: Array.from({ length: categories }, () => Math.floor(Math.random() * 100)),
    backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
      Math.random() * 255
    )}, 0.7)`,
  }));

  return {
    labels,
    datasets: datasets_array,
  };
};

/**
 * Gera dados de mock para gráficos de linha
 * @param {number} points - Número de pontos de dados
 * @param {number} datasets - Número de conjuntos de dados
 * @returns {Object} Dados formatados para gráficos
 */
export const generateLineChartData = (points = 10, datasets = 1) => {
  const labels = Array.from({ length: points }, (_, i) => `Point ${i + 1}`);
  const datasets_array = Array.from({ length: datasets }, (_, i) => ({
    label: `Dataset ${i + 1}`,
    data: Array.from({ length: points }, () => Math.floor(Math.random() * 100)),
    borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
      Math.random() * 255
    )}, 1)`,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  }));

  return {
    labels,
    datasets: datasets_array,
  };
};

/**
 * Gera dados de mock para gráficos de radar
 * @param {number} axes - Número de eixos
 * @param {number} datasets - Número de conjuntos de dados
 * @returns {Object} Dados formatados para gráficos
 */
export const generateRadarChartData = (axes = 8, datasets = 1) => {
  const labels = Array.from({ length: axes }, (_, i) => `Axis ${i + 1}`);
  const datasets_array = Array.from({ length: datasets }, (_, i) => ({
    label: `Dataset ${i + 1}`,
    data: Array.from({ length: axes }, () => Math.floor(Math.random() * 100)),
    borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
      Math.random() * 255
    )}, 1)`,
    backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
      Math.random() * 255
    )}, 0.2)`,
  }));

  return {
    labels,
    datasets: datasets_array,
  };
};

/**
 * Gera dados de mock para diagramas Sankey
 * @param {number} nodes - Número de nós
 * @param {number} links - Número de links (deve ser menor que nodes^2)
 * @returns {Object} Dados formatados para diagramas Sankey
 */
export const generateSankeyData = (nodes = 5, links = 6) => {
  // Garantir que links não exceda o máximo possível
  const maxLinks = nodes * (nodes - 1) / 2;
  const actualLinks = Math.min(links, maxLinks);
  
  const nodesData = Array.from({ length: nodes }, (_, i) => ({
    name: `Node ${i+1}`,
    id: `node-${i+1}`,
    type: i === 0 ? 'input' : i === nodes-1 ? 'output' : 'process'
  }));
  
  // Criar links de forma que os nós fluam de forma lógica
  const linksData = [];
  let linkCount = 0;
  
  for (let source = 0; source < nodes-1 && linkCount < actualLinks; source++) {
    for (let target = source+1; target < nodes && linkCount < actualLinks; target++) {
      linksData.push({
        source,
        target,
        value: Math.floor(Math.random() * 100) + 10 // Valores entre 10 e 110
      });
      linkCount++;
    }
  }
  
  return {
    nodes: nodesData,
    links: linksData
  };
};

/**
 * Gera dados de mock para histogramas empilhados
 * @param {number} bins - Número de bins
 * @param {number} categories - Número de categorias
 * @returns {Array} Array de dados para histogramas empilhados
 */
export const generateStackedHistogramData = (bins = 9, categories = 3) => {
  const categoryNames = ['Novato', 'Intermediário', 'Avançado'];
  
  return Array.from({ length: categories }, (_, i) => ({
    category: categoryNames[i] || `Category ${i+1}`,
    values: Array.from({ length: bins }, () => Math.floor(Math.random() * 20))
  }));
};

/**
 * Verifica se uma visualização foi renderizada corretamente
 * @param {Object} container - Contêiner do DOM com a visualização
 * @param {string} visualizationType - Tipo de visualização a verificar
 * @returns {boolean} Verdadeiro se a visualização foi renderizada
 */
export const checkVisualizationRendered = (container, visualizationType) => {
  switch (visualizationType) {
    case 'bar':
      return container.querySelector('[data-testid="bar-chart"]') !== null;
    case 'line':
      return container.querySelector('[data-testid="line-chart"]') !== null;
    case 'radar':
      return container.querySelector('[data-testid="radar-chart"]') !== null;
    case 'doughnut':
      return container.querySelector('[data-testid="doughnut-chart"]') !== null;
    case 'sankey':
      return container.querySelector('[data-testid="sankey-diagram"]') !== null;
    default:
      return false;
  }
};

/**
 * Simula o redimensionamento da janela para testar responsividade
 * @param {number} width - Nova largura da janela
 * @param {number} height - Nova altura da janela
 */
export const simulateResize = (width, height) => {
  // Definir as dimensões da janela
  global.innerWidth = width;
  global.innerHeight = height;
  
  // Disparar evento de redimensionamento
  global.dispatchEvent(new Event('resize'));
};
