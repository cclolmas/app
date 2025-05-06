# Testes de Visualizações

Este diretório contém testes abrangentes para as visualizações gráficas do sistema CL-CompL.

## Estrutura de Arquivos

- `VisualizationTest.js`: Testes unitários para os componentes individuais de visualização.
- `VisualizationIntegrationTest.js`: Testes de integração para verificar interações entre visualizações e dados.
- `EndToEndVisualTest.js`: Testes end-to-end para verificar o comportamento completo das visualizações na aplicação real.
- `utils/ChartTestHelpers.js`: Funções auxiliares para testes de visualizações.

## Executando os Testes

### Pré-requisitos

- Node.js 14+ instalado
- Todas as dependências do projeto instaladas (`npm install`)

### Executar Testes Unitários

```bash
npm test -- tests/visualizations/VisualizationTest.js
```

### Executar Testes de Integração

```bash
npm test -- tests/visualizations/VisualizationIntegrationTest.js
```

### Executar Testes End-to-End

Certifique-se de que a aplicação está em execução em `http://localhost:3000` antes de executar estes testes.

```bash
npm run test:e2e
```

## Screenshots de Teste

Os testes end-to-end capturam screenshots em diferentes estados da aplicação, que são armazenados em `/tests/visualizations/screenshots/`. Estas screenshots são úteis para verificação visual e comparação manual.

## Adicionando Novos Testes

Para adicionar testes para novas visualizações:

1. Importe o componente de visualização no arquivo de teste apropriado.
2. Use as funções auxiliares em `ChartTestHelpers.js` para gerar dados de mock.
3. Escreva testes para verificar o comportamento do componente com diferentes dados e interações.

## Simulação de Dados

Os testes usam dados simulados para evitar dependências de APIs externas. Os dados simulados são projetados para se aproximar da estrutura real dos dados usados pela aplicação.

## Limitações Conhecidas

- Os testes unitários não verificam o rendering exato dos gráficos, apenas se os componentes são chamados com os parâmetros corretos.
- Os testes end-to-end requerem uma conexão com a internet para carregar as bibliotecas de gráficos (como Chart.js).
