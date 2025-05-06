// Configurações comuns dos gráficos
const configBase = {
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { // Configuração padrão do eixo Y
                beginAtZero: true,
                stacked: true // Enable stacking by default for y-axis
            },
            x: { // Enable stacking by default for x-axis (for horizontal bars if used)
                stacked: true
            }
        },
        plugins: {
            legend: {
                position: 'top',
            },
        }
    }
};

// Standard Colors - Brazilian flag colors
const primaryBlue = '#002776';
const secondaryGreen = '#009c3b';
const accentYellow = '#ffdf00';
const lighterBlue = '#4e79a7';
const lighterGreen = '#59a14f';
const gray = '#bab0ab';

// Exemplo de dados para o gráfico de despesas por categoria (Barras Empilhadas)
// Data generated with a more realistic pattern - higher essential expenses for basic necessities
const dadosDespesas = {
    labels: ['Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Moradia', 'Educação'],
    datasets: [{
        label: 'Essencial',
        data: [450, 200, 80, 320, 650, 280], // Higher values for food, housing, health
        backgroundColor: primaryBlue,
    }, {
        label: 'Discricionário',
        data: [150, 100, 350, 80, 150, 120], // Higher discretionary spending on leisure
        backgroundColor: lighterBlue,
    }]
};

// Exemplo de dados para o gráfico de receitas vs despesas (Barras Empilhadas)
// More realistic data with seasonal patterns (higher expenses at end of year, etc.)
const dadosReceitasDespesas = {
    labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
    datasets: [
        {
            label: 'Receitas Fixas',
            data: [3200, 3200, 3200, 3300, 3300, 3300], // Stable fixed income
            backgroundColor: secondaryGreen,
        },
        {
            label: 'Receitas Variáveis',
            data: [800, 1200, 900, 1800, 1400, 2200], // More variable additional income
            backgroundColor: lighterGreen,
        },
        {
            label: 'Despesas Essenciais',
            data: [2200, 2100, 2150, 2250, 2300, 2400], // Gradually increasing essential expenses
            backgroundColor: primaryBlue,
        },
        {
            label: 'Despesas Discricionárias',
            data: [900, 750, 1100, 1300, 1100, 1500], // More variable discretionary spending
            backgroundColor: lighterBlue,
        }
    ]
};

// Exemplo de dados para o gráfico de tendência de saldo (Line chart com dados mais realistas)
// Shows a realistic pattern with ups and downs
const dadosSaldo = {
    labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
    datasets: [{
        label: 'Saldo Mensal',
        data: [900, 1550, 850, 1550, 1300, 1600], // More realistic fluctuation pattern
        borderColor: primaryBlue,
        backgroundColor: 'rgba(0, 39, 118, 0.2)', // Semi-transparent blue
        tension: 0.4, // Smooth curve
        fill: true
    }]
};

// Exemplo de dados para o gráfico de metas vs realizado (Barras Empilhadas)
// Changed from grouped to stacked to follow the requirement
const dadosMetas = {
    labels: ['Economia', 'Investimentos', 'Pagamento Dívidas', 'Fundo Emergência'],
    datasets: [
        {
            label: 'Realizado',
            data: [650, 700, 450, 300],
            backgroundColor: secondaryGreen,
        },
        {
            label: 'Meta Restante',
            data: [150, -100, 50, 100], // Difference between goal and achieved (negative means exceeded)
            backgroundColor: lighterBlue,
        }
    ]
};

// Exemplo de dados para o gráfico de fluxo de caixa (Histograma Empilhado)
// Converted to stacked histogram format
const dadosFluxoCaixa = {
    labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
    datasets: [
        {
            label: 'Entradas Essenciais',
            data: [3200, 3200, 3200, 3300, 3300, 3300],
            backgroundColor: secondaryGreen,
            stack: 'Stack 0', // Group in same stack
        },
        {
            label: 'Entradas Variáveis',
            data: [800, 1200, 900, 1800, 1400, 2200],
            backgroundColor: lighterGreen,
            stack: 'Stack 0', // Group in same stack
        },
        {
            label: 'Saídas Essenciais',
            data: [-2200, -2100, -2150, -2250, -2300, -2400], // Negative values for outflows
            backgroundColor: primaryBlue,
            stack: 'Stack 1', // Different stack for expenses
        },
        {
            label: 'Saídas Variáveis',
            data: [-900, -750, -1100, -1300, -1100, -1500], // Negative values for outflows
            backgroundColor: lighterBlue,
            stack: 'Stack 1', // Different stack for expenses
        }
    ]
};

// Exemplo de dados para o gráfico de investimentos (Doughnut/Pie com cores padrão)
const dadosInvestimentos = {
    labels: ['Ações', 'Renda Fixa', 'Fundos Imobiliários', 'Tesouro Direto', 'Criptomoedas'],
    datasets: [{
        label: 'Distribuição de Investimentos',
        data: [35, 30, 15, 15, 5], // More realistic investment distribution
        backgroundColor: [
            primaryBlue,
            secondaryGreen,
            accentYellow,
            lighterBlue,
            lighterGreen
        ]
    }]
};

// Função para inicializar os gráficos
function inicializarGraficos() {
    // Gráfico 1: Despesas por Categoria (Barras Empilhadas)
    const ctxDespesas = document.getElementById('despesasChart')?.getContext('2d');
    if (ctxDespesas) {
        new Chart(ctxDespesas, {
            type: 'bar',
            data: dadosDespesas,
            options: configBase.options
        });
    } else {
        console.error("Elemento canvas 'despesasChart' não encontrado.");
    }

    // Gráfico 2: Receitas vs Despesas (Barras Empilhadas)
    const ctxReceitasDespesas = document.getElementById('receitasDespesasChart')?.getContext('2d');
    if (ctxReceitasDespesas) {
        new Chart(ctxReceitasDespesas, {
            type: 'bar',
            data: dadosReceitasDespesas,
            options: configBase.options
        });
    } else {
        console.error("Elemento canvas 'receitasDespesasChart' não encontrado.");
    }

    // Gráfico 3: Tendência de Saldo (Line)
    const ctxSaldo = document.getElementById('saldoChart')?.getContext('2d');
    if (ctxSaldo) {
        new Chart(ctxSaldo, {
            type: 'line',
            data: dadosSaldo,
            options: {
                ...configBase.options,
                scales: {
                    y: { beginAtZero: true }, // Line chart doesn't need stacking
                    x: {} // No specific x-axis options needed
                }
            }
        });
    } else {
        console.error("Elemento canvas 'saldoChart' não encontrado.");
    }

    // Gráfico 4: Metas vs Realizado (Barras Empilhadas)
    const ctxMetas = document.getElementById('metasChart')?.getContext('2d');
    if (ctxMetas) {
        new Chart(ctxMetas, {
            type: 'bar',
            data: dadosMetas,
            options: configBase.options // Use stacked configuration
        });
    } else {
        console.error("Elemento canvas 'metasChart' não encontrado.");
    }

    // Gráfico 5: Fluxo de Caixa (Histograma Empilhado)
    const ctxFluxoCaixa = document.getElementById('fluxoCaixaChart')?.getContext('2d');
    if (ctxFluxoCaixa) {
        new Chart(ctxFluxoCaixa, {
            type: 'bar', // Changed to bar type for stacked histogram
            data: dadosFluxoCaixa,
            options: {
                ...configBase.options,
                scales: {
                    y: {
                        beginAtZero: true,
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Valor (R$)'
                        }
                    },
                    x: {
                        stacked: true,
                    }
                }
            }
        });
    } else {
        console.error("Elemento canvas 'fluxoCaixaChart' não encontrado.");
    }

    // Gráfico 6: Investimentos (Doughnut com cores padronizadas)
    const ctxInvestimentos = document.getElementById('investimentosChart')?.getContext('2d');
    if (ctxInvestimentos) {
        new Chart(ctxInvestimentos, {
            type: 'doughnut',
            data: dadosInvestimentos,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Distribuição de Investimentos'
                    }
                }
            }
        });
    } else {
        console.error("Elemento canvas 'investimentosChart' não encontrado.");
    }
}

// Garante que o DOM está carregado antes de tentar acessar os elementos canvas
document.addEventListener('DOMContentLoaded', inicializarGraficos);