# CCLOLMAS: Plataforma Pedagógica para Integração de IA em Engenharia de Software

## Visão Geral

CCLOLMAS é uma plataforma pedagógica inovadora, desenvolvida com **React** (frontend) e **FastAPI** (backend), projetada para enfrentar o desafio de integrar tópicos avançados e disruptivos de Inteligência Artificial (IA) – como **orquestração de Sistemas Multi-Agente Locais (LMAS)** e **ajuste fino eficiente (fine-tuning) via QLoRA** – nos currículos de Engenharia de Software (SE). A plataforma serve como uma ferramenta prática e um ambiente de aprendizado que operacionaliza um quadro pedagógico centrado na gestão ativa da interdependência crítica entre a **Carga Cognitiva (CL)** do estudante e a **Carga Computacional (CompL)** do ambiente de execução.

O principal objetivo do CCLOLMAS é capacitar estudantes e educadores a navegar pelas complexidades da IA moderna em cenários realistas, especialmente em ambientes com **recursos computacionais limitados**, uma realidade comum em muitas instituições de ensino brasileiras. A plataforma facilita a exploração de trade-offs, promove a metacognição sobre a interação humano-máquina e apoia o desenvolvimento de competências essenciais para a próxima geração de engenheiros de software.

## Motivação

A Engenharia de Software está sendo transformada pela IA Generativa (GenAI), criando uma demanda urgente por profissionais com competências em IA. No entanto, a educação em SE no Brasil, apesar dos esforços (PNE, DCNs), luta para incorporar adequadamente esses avanços, especialmente tópicos complexos como ajuste fino local (QLoRA) e orquestração de LMAS. Esses tópicos impõem desafios significativos:

1.  **Alta Complexidade Intrínseca (ICL):** Os conceitos e procedimentos são inerentemente complexos.
2.  **Ferramentas Imaturas/Não Ergonômicas:** Muitas ferramentas aumentam a Carga Extrínseca (ECL), dificultando o aprendizado.
3.  **Restrições de Hardware:** A execução local de modelos de linguagem grandes (LLMs) e tarefas de IA intensivas (fine-tuning, LMAS) exige recursos computacionais (VRAM, CPU, RAM) que muitas vezes excedem a capacidade disponível em ambientes acadêmicos.
4.  **Interdependência CL-CompL:** A necessidade de otimizar a CompL (ex: usando quantização agressiva como Q4) pode paradoxalmente aumentar a CL devido à instabilidade, dificuldade de depuração e resultados incertos (Hipótese H1). Tarefas complexas como LMAS aumentam ambas as cargas (Hipótese H2). Ignorar essa dinâmica leva à sobrecarga cognitiva ou à inviabilidade prática das atividades.
5.  **Lacuna Pedagógica:** Falta um quadro pedagógico sistemático que aborde explicitamente a gestão da interação CL-CompL como um objetivo de aprendizagem central, especialmente considerando a necessidade de encontrar um "ponto ideal" (Hipótese H3) e adaptar a instrução à expertise do aluno (Hipótese H4).
6.  **Contexto Brasileiro:** A variação na oferta de vagas e a infraestrutura desigual reforçam a necessidade de abordagens pedagógicas que transformem a limitação de recursos em oportunidade formativa, alinhando-se também a iniciativas estratégicas como o Brics Educação e a necessidade de práticas responsáveis em IA.

CCLOLMAS foi criado para preencher essas lacunas, oferecendo um ambiente controlado onde a dinâmica CL-CompL pode ser explorada, gerenciada e compreendida como parte fundamental da prática de engenharia de software na era da IA.

## Funcionalidades Principais

CCLOLMAS implementa um conjunto de funcionalidades diretamente alinhadas aos desafios e ao quadro pedagógico proposto no estudo:

### 1. Suporte à Gestão Explícita da Interação CL-CompL
   *   **Monitoramento Integrado:** Visualização em tempo real (ou pós-execução) de métricas de CompL (uso de VRAM, RAM, tempo de execução, latência) lado a lado com proxies de CL (ex: autoavaliações baseadas em questionários como SEQ/NASA-TLX adaptado, observações do instrutor).
   *   **Feedback Duplo:** Ferramentas que fornecem feedback não apenas sobre o resultado da tarefa de IA, mas também sobre os custos cognitivos e computacionais envolvidos, incentivando a reflexão.

### 2. Execução e Orquestração de Tarefas de IA Avançadas
   *   **Ajuste Fino Local (Fine-Tuning):**
        *   Interface dedicada para configuração e execução de ajuste fino com **QLoRA** (Dettmers et al., 2023), permitindo experimentação com diferentes níveis de quantização (ex: **Q4 vs Q8**). (Conforme Figura 1 do estudo e o snippet `QLoRA Fine-Tuning Experiment`).
        *   Suporte para curadoria de datasets e análise de métricas de treinamento (ex: perdas), com atenção à instabilidade potencial (especialmente com Q4).
   *   **Orquestração de LMAS:**
        *   Facilita a criação, execução e depuração de Sistemas Multi-Agente Locais.
        *   Integração com frameworks populares como **LangChain** e **CrewAI** (Wu et al., 2023; Luo et al., 2025).
        *   Permite explorar a CompL agregada de múltiplos agentes rodando em paralelo ou sequência.
   *   **Execução Local de LLMs:**
        *   Suporte para carregar e interagir com diversos LLMs em formatos eficientes como **GGUF**, utilizando backends como `llama-cpp-python`.
        *   Foco em modelos de tamanho moderado, adequados para hardware limitado (ex: **Mistral 7B, Phi-4-mini, Qwen 7B, DeepSeek-R1**).

### 3. Ferramentas Pedagógicas e de Scaffolding
   *   **Laboratórios Comparativos:** Ambientes pré-configurados para comparar diretamente os efeitos de diferentes escolhas técnicas (ex: Q4 vs Q8 em QLoRA, diferentes arquiteturas LMAS) na CompL e na qualidade/estabilidade do resultado, facilitando a compreensão dos trade-offs (H1, H3).
   *   **Scaffolding Adaptativo:** Oferece diferentes níveis de suporte (exemplos trabalhados, dicas contextuais, templates de código, interfaces simplificadas) que podem ser ajustados com base na expertise do aluno, ajudando a gerenciar a ICL e minimizar a ECL (Wood et al., 1976; Kalyuga et al., 2003).
   *   **Gerenciamento de Execução Assíncrona:** Ferramentas para submeter tarefas computacionalmente intensivas e acompanhar seu progresso, permitindo que os alunos realizem outras atividades (reflexão, análise preparatória) enquanto aguardam, mitigando a frustração da latência e aproveitando o "sleep-time compute".

### 4. Usabilidade e Design Instrucional
   *   **Interface Intuitiva:** Frontend em React projetado com base em princípios de HCI (Nielsen, 1993; Norman, 1988) para minimizar a ECL. O design da interface (ex: painel de ajuste fino da Figura 1) visa clareza e facilidade de uso.
   *   **Foco na Metacognição:** A plataforma incentiva os alunos a refletir sobre suas escolhas (ex: justificar a escolha entre Q4 e Q8), monitorar seu próprio esforço (CL) e avaliar os resultados em relação aos custos (CompL), buscando o "ponto ideal" (H3).
   *   **Testes de Usabilidade:** A própria plataforma é objeto de testes de usabilidade focados em medir a CL percebida (usando NASA-TLX), garantindo um ciclo de melhoria contínua (conforme snippet `Testes de Usabilidade da Plataforma CCLOLMAS`).

### 5. Integração com o Ecossistema Open Source
   *   Compatibilidade e integração guiada com ferramentas padrão da indústria como **Ollama**, **LangChain**, `llama-cpp-python`, e modelos do **Hugging Face**, preparando os alunos para o ambiente profissional.

## Abordagem Pedagógica Suportada

CCLOLMAS não é apenas uma ferramenta técnica, mas a personificação de uma abordagem pedagógica específica:

1.  **Reconhecimento Explícito da Interdependência CL-CompL:** As atividades são projetadas para tornar essa dinâmica visível e um objeto de estudo em si.
2.  **Busca pelo "Ponto Ideal" como Competência Metacognitiva:** O objetivo não é apenas executar tarefas de IA, mas aprender a otimizar o equilíbrio entre esforço cognitivo, recursos computacionais e qualidade do resultado.
3.  **Design Instrucional Baseado na CLT e HCI:** Minimizar a carga extrínseca (interfaces claras, WEs), gerenciar a intrínseca (sequenciamento, decomposição) e otimizar a germânica (reflexão, metacognição, desafios autênticos).
4.  **Adaptação à Expertise e ao Contexto:** Flexibilidade no sequenciamento, no nível de scaffolding e nas ferramentas/modelos utilizados para acomodar diferentes níveis de conhecimento prévio e disponibilidade de hardware (evitando o efeito de reversão da expertise).
5.  **Aprendizagem Ativa e Autêntica (PBL/PjBL):** Integração de tarefas de IA em projetos realistas de SE (ex: ajuste fino para tradução de código, agentes para revisão de código, geração de testes automatizados, práticas de LLMOps), tornando a aprendizagem significativa e transferível.
6.  **Sequenciamento Progressivo:** Introdução gradual de conceitos e ferramentas: Engenharia de Prompt -> Quantização -> Execução Local -> Ajuste Fino (QLoRA) -> Orquestração LMAS.
7.  **Avaliação Formativa e Reflexiva:** Foco no processo de tomada de decisão, na capacidade de depuração e na justificativa dos trade-offs, além dos resultados finais.

## Arquitetura Técnica

-   **Frontend:** **React.js** - Proporciona uma interface de usuário rica, interativa e responsiva, otimizada para visualização de dados e fluxos de trabalho complexos.
-   **Backend:** **FastAPI** (Python) - Oferece alta performance, suporte nativo a operações assíncronas (crucial para lidar com tarefas de IA de longa duração) e facilidade no desenvolvimento de APIs RESTful.
-   **Integração de IA:** Utiliza bibliotecas como `transformers`, `PEFT` (Parameter-Efficient Fine-Tuning), `bitsandbytes` (para quantização), `llama-cpp-python` (para inferência GGUF), `LangChain`, `CrewAI` para orquestração.
-   **Monitoramento:** Módulos customizados para capturar métricas de sistema (VRAM, CPU, RAM via `psutil` ou `nvidia-smi`) e integrar com mecanismos de coleta de feedback subjetivo (CL).
-   **Persistência:** Banco de dados (não especificado no texto, mas implícito para gerenciar usuários, projetos, resultados) e armazenamento de arquivos para modelos, datasets e logs.

## Desenvolvimento e QA

### Sistema de Qualidade

A plataforma incorpora um sistema de QA robusto para detectar e mitigar problemas:

- **Diagnóstico Automático**: Identifica elementos ausentes no DOM e problemas de interface
- **Recuperação Resiliente**: Cria elementos substitutos quando necessário
- **Monitoramento**: Acompanha erros de console e problemas de inicialização
- **Acessibilidade**: Verifica problemas comuns de acessibilidade

### Modo de Diagnóstico

Para ativar o modo de diagnóstico, acesse a aplicação com `?debug=true` ou `?qa=true` na URL:

```
http://localhost:3000/?debug=true
```

### Comandos no Console

Comandos úteis para diagnóstico via console do navegador:

```javascript
// Executar diagnóstico completo (não corrige problemas)
qaUtils.diagnose();

// Executar diagnóstico e tentar corrigir problemas
qaUtils.diagnose(true);

// Criar placeholder para elemento ausente
qaUtils.createPlaceholder('elemento-id', 'módulo-nome');
```

## Iniciando

### Pré-requisitos

-   Python 3.10+
-   Node.js 18+
-   Gerenciador de pacotes `pip` e `npm` (ou `yarn`)
-   **GPU NVIDIA com suporte a CUDA 11.8+ e VRAM de:**
    *   Mínimo 6-8GB para modelos menores (ex: Phi-3-mini, Mistral 7B Q4) e tarefas básicas.
    *   **Recomendado 16GB+** para ajuste fino QLoRA e LMAS mais complexos (conforme snippet `QLoRA Fine-Tuning Experiment`).
-   Drivers NVIDIA e CUDA Toolkit instalados.
-   `git` para clonar o repositório.

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/crossdebate_platform.git # Substitua pela URL real
cd crossdebate_platform

# 2. Configure o Backend (FastAPI)
cd backend # Ou diretório equivalente
python -m venv venv
# Ative o ambiente virtual
# Linux/macOS:
source venv/bin/activate
# Windows:
# venv\Scripts\activate
pip install -r requirements.txt
cd ..

# 3. Configure o Frontend (React)
cd frontend # Ou diretório equivalente
npm install # Ou yarn install
cd ..

# 4. Baixe Modelos GGUF de Exemplo (Ex: Mistral 7B Q4 e Q8)
# (Necessário para os laboratórios comparativos Q4 vs Q8)
mkdir -p models/gguf # Ou diretório configurado
cd models/gguf
# Exemplo usando curl (pode usar wget ou baixar manualmente)
# Modelo Q4 (Menor CompL, potencialmente maior CL - H1)
curl -L -o mistral-7b-instruct-v0.2.Q4_K_M.gguf https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf
# Modelo Q8 (Maior CompL, potencialmente menor CL - H3 "sweet spot")
curl -L -o mistral-7b-instruct-v0.2.Q8_0.gguf https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q8_0.gguf
cd ../..

# 5. (Opcional) Configure variáveis de ambiente (ex: caminhos de modelo, chaves de API se necessário)
# Crie um arquivo .env conforme .env.example, se fornecido

# 6. Inicie os Serviços
# Terminal 1: Backend FastAPI
cd backend # Ou diretório equivalente
source venv/bin/activate # Se não estiver ativo
uvicorn main:app --reload --host 0.0.0.0 --port 8000 # Exemplo de comando de execução
# Verifique a documentação específica do backend para o comando correto

# Terminal 2: Frontend React
cd frontend # Ou diretório equivalente
npm start # Ou yarn start
```

Acesse a plataforma no seu navegador, geralmente em `http://localhost:3000`.

## Exemplos de Uso Pedagógico

### Exemplo 1: Laboratório Comparativo QLoRA (Q4 vs Q8) - Explorando H1 e H3

1.  **Navegação:** Acesse o módulo "Ajuste Fino QLoRA" na plataforma.
2.  **Configuração Tarefa 1 (Q8 - Baseline "Sweet Spot"):**
    *   Selecione um modelo base (ex: `mistral-7b-instruct-v0.2.Q8_0.gguf`).
    *   Carregue um dataset de ajuste fino (ex: `data/code_translation_examples.jsonl`).
    *   Configure hiperparâmetros (épocas, taxa de aprendizado).
    *   **Observe:** O monitor de CompL mostrará o uso de VRAM esperado/atual.
    *   Inicie o ajuste fino.
3.  **Monitoramento e Análise (Q8):**
    *   Acompanhe a curva de perda e as métricas de CompL.
    *   Após a conclusão, avalie a qualidade do modelo ajustado.
    *   Responda a um breve questionário de CL (SEQ) sobre a facilidade de configuração e interpretação.
4.  **Configuração Tarefa 2 (Q4 - Otimização CompL):**
    *   Repita a configuração, mas selecione o modelo Q4 (`mistral-7b-instruct-v0.2.Q4_K_M.gguf`).
    *   **Observe:** Note a redução na VRAM estimada/utilizada (menor CompL).
    *   Inicie o ajuste fino.
5.  **Monitoramento e Análise (Q4):**
    *   Acompanhe a curva de perda (pode ser mais instável).
    *   Monitore a CompL.
    *   Avalie a qualidade do modelo (pode ser inferior ou exigir mais esforço de validação).
    *   Responda ao questionário de CL novamente. Note se houve mais dificuldade/incerteza (maior CL).
6.  **Reflexão Guiada:** A plataforma apresenta um resumo comparativo (CompL, qualidade, CL percebida) e prompts para reflexão sobre o trade-off Q4 vs Q8, conectando a experiência às Hipóteses H1 e H3.

### Exemplo 2: Orquestração de LMAS para Revisão de Código - Explorando H2

1.  **Navegação:** Acesse o módulo "Orquestração LMAS".
2.  **Design do Agente:** Use a interface (ou um notebook integrado) para definir um LMAS simples com LangChain/CrewAI:
    *   Agente 1: Identifica potenciais bugs em um trecho de código.
    *   Agente 2: Sugere refatorações para melhorar a legibilidade.
    *   Agente 3: Consolida os resultados.
3.  **Configuração:** Selecione LLMs locais (ex: Phi-4-mini Q4 para cada agente, para simular restrição severa).
4.  **Execução e Monitoramento:**
    *   Execute o LMAS em um trecho de código de exemplo.
    *   **Observe:** O monitor de CompL mostrará a carga *agregada* dos agentes (maior que um único agente - H2).
    *   Acompanhe a latência e o fluxo de comunicação entre agentes.
5.  **Depuração e Análise:**
    *   Analise a saída consolidada.
    *   Use ferramentas de depuração da plataforma para entender falhas ou resultados inesperados (a complexidade da depuração contribui para a CL).
    *   Responda a prompts sobre a dificuldade de orquestrar e depurar o sistema multi-agente (CL).
6.  **Reflexão:** Discuta como a CompL aumenta com múltiplos agentes e como a complexidade da tarefa (orquestração, depuração) impacta a CL (H2).

### Exemplo 3: Monitoramento CL-CompL em Tarefa Autêntica (Usando o Monitor)

```python
# Exemplo de script (poderia ser executado via interface ou notebook na plataforma)
# Simula um estudante usando a API do monitor durante uma tarefa complexa

from crossdebate.client import CCLOLMASClient # API hipotética do cliente
from crossdebate.monitoring import CLCompLMonitor # API hipotética do monitor

client = CCLOLMASClient()
monitor = CLCompLMonitor(enable_subjective_prompts=True) # Habilita prompts de CL

# Inicia sessão de monitoramento para um aluno específico
session_id = monitor.start_session(participant_id="Aluno01", task_name="AjusteFino_QLoRA_Q4")

try:
    # Configura e executa uma tarefa de ajuste fino via API (ou interface)
    finetune_job = client.submit_qlora_finetune(
        model_path="models/gguf/mistral-7b-instruct-v0.2.Q4_K_M.gguf",
        dataset_path="data/se_tasks_dataset.jsonl",
        output_path="models/finetuned/se_specialist_q4",
        epochs=2,
        monitor_session_id=session_id # Associa a tarefa à sessão de monitoramento
    )

    # Durante a execução, a plataforma coleta CompL (VRAM, CPU)
    # e pode periodicamente apresentar prompts de CL (SEQ) ao usuário na interface

    results = client.wait_for_job(finetune_job)
    print("Ajuste fino concluído.")

    # O aluno analisa os resultados e reflete sobre o processo
    client.analyze_results(results, monitor_session_id=session_id)

finally:
    # Para a sessão e gera um relatório combinando CL e CompL
    monitor.stop_session(session_id)
    report_path = monitor.generate_report(session_id, output_path="reports/")
    print(f"Relatório CL-CompL gerado em: {report_path}")

# O relatório visualizaria a evolução da CompL ao longo do tempo
# e os pontos de coleta de CL, ajudando o aluno e o instrutor
# a identificar gargalos e momentos de alta carga cognitiva.
```

## Modelos e Frameworks Suportados (Exemplos)

-   **Modelos LLM (formato GGUF):**
    *   Mistral 7B (Q4, Q8)
    *   Phi-3 Mini / Phi-4-mini (quando GGUF disponível)
    *   Qwen (ex: Qwen 1.5 7B)
    *   DeepSeek Coder / DeepSeek-R1 (quando GGUF disponível)
    *   Outros modelos compatíveis com `llama-cpp-python`.
-   **Frameworks de Orquestração:**
    *   LangChain
    *   CrewAI
-   **Bibliotecas de Backend:**
    *   `llama-cpp-python`
    *   `transformers`, `peft`, `bitsandbytes` (para QLoRA)
-   **Ferramentas Externas (Integração):**
    *   Ollama (para gerenciamento simplificado de modelos locais)

## Contribuição

Contribuições são bem-vindas! Se você deseja melhorar o CCLOLMAS, por favor, leia nossas [diretrizes de contribuição](CONTRIBUTING.md) (criar este arquivo com as diretrizes). Issues e Pull Requests são encorajados.

## Como Citar

Se você utilizar o CCLOLMAS em sua pesquisa ou ensino, por favor, cite o trabalho original:

```
PESSOA JÚNIOR, H. C. CCLOLMAS: Uma plataforma para integração pedagógica de IA avançada em currículos de Engenharia de Software. [Detalhes da Publicação - Ex: Tese, Artigo, Repositório]. 2025.
```
*(Nota: Atualize com os detalhes corretos da publicação quando disponíveis)*

## Licença

Este projeto é licenciado sob a [MIT License](LICENSE).

# CCLO-LMAS Project

## Overview
CCLO-LMAS is a project focused on balancing computational and cognitive loads in language model applications.

## Installation

### Dependencies
Install the required dependencies:

```bash
pip install -r requirements.txt
```

### Running Tests
To run the quantization tests:

```bash
python -m tests.quantization.run_tests --model "meta-llama/Llama-2-7b-hf" --alternations 5 --output-dir "./test_results" --verbose
```

## Project Structure

- `js/`: Frontend JavaScript code
- `tests/`: Test suites and utilities
  - `quantization/`: Tests for model quantization effects
  - `q_model_tester.py`: Utilities for testing models with different quantization

## Development
The project is still under development. See the issues for current tasks and roadmap.
