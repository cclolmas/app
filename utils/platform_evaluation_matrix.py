import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Criar matriz de avaliação
def create_evaluation_matrix():
    # Definir critérios de avaliação
    criteria = {
        "Alinhamento com PBL/PjBL": [
            "Problemas autênticos e relevantes",
            "Colaboração entre estudantes",
            "Aprendizagem autodirigida",
            "Reflexão integrada ao processo",
            "Avaliação formativa"
        ],
        "Integração de IA em SE": [
            "Revisão de código automatizada",
            "Tradução/refatoração de código",
            "Geração de casos de teste",
            "Análise de requisitos",
            "Documentação automática"
        ],
        "Contextualização Brasileira": [
            "Alinhamento com DCNs",
            "Compatibilidade com limitações técnicas",
            "Relevância para o mercado local",
            "Inclusividade linguística",
            "Consideração de disparidades regionais"
        ],
        "Aspectos Éticos": [
            "Transparência sobre limitações da IA",
            "Discussão sobre vieses algorítmicos",
            "Reflexão sobre impactos sociais",
            "Privacidade e segurança",
            "Responsabilidade profissional"
        ]
    }
    
    # Criar DataFrame vazio para avaliação
    df = pd.DataFrame()
    
    # Para cada categoria de critérios
    for category, items in criteria.items():
        category_df = pd.DataFrame({
            'Categoria': [category] * len(items),
            'Critério': items,
            'Nota (0-5)': [0] * len(items),
            'Observações': [''] * len(items)
        })
        df = pd.concat([df, category_df], ignore_index=True)
    
    return df

# Visualizar resultados da avaliação
def visualize_evaluation(df):
    # Calcular médias por categoria
    category_means = df.groupby('Categoria')['Nota (0-5)'].mean()
    
    # Criar gráfico
    plt.figure(figsize=(10, 6))
    category_means.plot(kind='bar', color='skyblue')
    plt.title('Avaliação da Plataforma por Categoria')
    plt.ylabel('Pontuação Média (0-5)')
    plt.ylim(0, 5)
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    plt.tight_layout()
    
    # Salvar gráfico
    plt.savefig('/media/sema/400E99720E9961A8/crossdebate_platform/docs/evaluation_results.png')
    plt.close()
    
    return category_means

# Gerar relatório resumido
def generate_summary_report(df):
    summary = {
        'Pontos Fortes': [],
        'Áreas para Melhoria': [],
        'Recomendações': []
    }
    
    # Identificar pontos fortes (critérios com nota >= 4)
    high_scores = df[df['Nota (0-5)'] >= 4]
    summary['Pontos Fortes'] = [
        f"{row['Critério']} ({row['Categoria']}): {row['Observações']}"
        for _, row in high_scores.iterrows()
    ]
    
    # Identificar áreas para melhoria (critérios com nota <= 2)
    low_scores = df[df['Nota (0-5)'] <= 2]
    summary['Áreas para Melhoria'] = [
        f"{row['Critério']} ({row['Categoria']}): {row['Observações']}"
        for _, row in low_scores.iterrows()
    ]
    
    return summary

if __name__ == "__main__":
    # Criar matriz de avaliação vazia
    evaluation_matrix = create_evaluation_matrix()
    
    # Salvar para preenchimento manual
    evaluation_matrix.to_csv('/media/sema/400E99720E9961A8/crossdebate_platform/docs/evaluation_matrix.csv', index=False)
    
    print("Matriz de avaliação criada e salva em 'docs/evaluation_matrix.csv'")
    print("Preencha a matriz com suas avaliações e execute este script novamente para visualizar os resultados.")
