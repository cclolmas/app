/**
 * Script principal para execução dos testes de carga cognitiva
 */

const TaskGenerator = require('./task_generator');
const CognitiveLoadAnalyzer = require('./data_analysis');
const { demographicQuestions, nasaTLXQuestions, postTestQuestions } = require('./questionnaires');

class CognitiveLoadTest {
  constructor() {
    this.taskGenerator = new TaskGenerator();
    this.participantData = [];
    this.currentParticipantId = 1;
  }

  async runFullTestSession() {
    console.log("Iniciando sessão de testes de carga cognitiva");
    
    try {
      // Fase 1: Recrutamento e classificação
      await this.recruitParticipants();
      
      // Fase 2: Execução dos testes
      await this.runAllParticipantTests();
      
      // Fase 3: Análise dos resultados
      const results = this.analyzeResults();
      
      // Fase 4: Gerar relatório
      this.generateReport(results);
      
      console.log("Sessão de testes concluída com sucesso");
      return results;
    } catch (error) {
      console.error("Erro na sessão de testes:", error);
      throw error;
    }
  }

  async recruitParticipants() {
    console.log("Fase de recrutamento e classificação de participantes");
    
    // Simulação do processo de recrutamento
    // Em um cenário real, isso envolveria um sistema de inscrição, 
    // formulários de consentimento, etc.
    
    console.log("- Envio de convites para potenciais participantes");
    console.log("- Coleta de informações demográficas");
    console.log("- Classificação em novatos ou especialistas com base na experiência");
    
    // Simular participantes para testes
    this._generateSimulatedParticipants(10, 'novice');
    this._generateSimulatedParticipants(10, 'expert');
    
    console.log(`Recrutados ${this.participantData.length} participantes`);
  }

  async runAllParticipantTests() {
    console.log("Iniciando testes com todos os participantes");
    
    for (const participant of this.participantData) {
      await this.runParticipantTest(participant);
    }
    
    console.log("Todos os testes de participantes concluídos");
  }

  async runParticipantTest(participant) {
    console.log(`Executando teste com participante #${participant.id} (${participant.type})`);
    
    // Gerar tarefas para o participante
    const participantTasks = this.taskGenerator.generateAllTasksForParticipant();
    
    // Executar cada tarefa e coletar dados
    for (const [taskLevel, task] of Object.entries(participantTasks)) {
      console.log(`- Executando tarefa ${taskLevel}: ${task.topic}`);
      
      // Simular a execução da tarefa
      const taskResult = await this._simulateTaskExecution(participant, task);
      
      // Armazenar resultados
      participant.results.push({
        taskLevel,
        topic: task.topic,
        completionTime: taskResult.completionTime,
        nasaTLXScores: taskResult.nasaTLXScores,
        qualityScore: taskResult.qualityScore,
        feedback: taskResult.feedback
      });
    }
    
    // Coletar feedback pós-teste
    participant.postTestFeedback = await this._collectPostTestFeedback();
    
    console.log(`Teste concluído para participante #${participant.id}`);
  }

  analyzeResults() {
    console.log("Analisando resultados dos testes");
    
    // Preparar dados para análise
    const analyzableData = this.participantData.map(participant => {
      return participant.results.map(result => ({
        participantId: participant.id,
        experienceLevel: participant.experienceLevel,
        type: participant.type,
        task: result.taskLevel,
        nasaTLX: result.nasaTLXScores,
        completionTime: result.completionTime,
        quality: result.qualityScore,
        feedback: result.feedback
      }));
    }).flat();
    
    // Usar o analisador para processar os dados
    const analyzer = new CognitiveLoadAnalyzer(analyzableData);
    const results = analyzer.analyzeAll();
    
    // Gerar recomendações baseadas nos resultados
    const recommendations = analyzer.generateRecommendations();
    
    return {
      analysisResults: results,
      recommendations
    };
  }

  generateReport(results) {
    console.log("Gerando relatório final");
    
    // Aqui seria implementada a geração de um relatório detalhado
    // com gráficos, tabelas e insights
    
    console.log("Resumo de resultados:");
    console.log("- Diferenças de carga cognitiva entre novatos e especialistas:", 
                results.analysisResults.comparison);
    
    console.log("- Pontos de possível reversão de expertise:", 
                results.analysisResults.expertiseReversal);
    
    console.log("- Recomendações:", results.recommendations);
    
    // O relatório completo seria salvo em arquivo
    console.log("Relatório completo salvo");
  }

  // Métodos auxiliares

  _generateSimulatedParticipants(count, type) {
    for (let i = 0; i < count; i++) {
      const experienceLevel = type === 'novice' ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2) + 4;
      
      this.participantData.push({
        id: this.currentParticipantId++,
        type,
        experienceLevel, // 1-3 para novatos, 4-5 para especialistas
        demographics: this._generateRandomDemographics(),
        results: [],
        postTestFeedback: {}
      });
    }
  }

  _generateRandomDemographics() {
    // Simulação de dados demográficos
    return {
      age: ['18-24', '25-34', '35-44', '45-54', '55+'][Math.floor(Math.random() * 5)],
      education: ['Ensino Médio', 'Graduação incompleta', 'Graduação completa', 'Pós-graduação'][Math.floor(Math.random() * 4)],
      // Outros dados demográficos simulados
    };
  }

  async _simulateTaskExecution(participant, task) {
    // Simulação de execução de tarefa e coleta de dados
    // Em um teste real, isso seria feito com usuários reais interagindo com a plataforma
    
    // Simular tempo de conclusão (novatos tipicamente demoram mais)
    let baseTime;
    switch (task.level) {
      case 'simple': baseTime = 300; break; // 5 min em segundos
      case 'medium': baseTime = 600; break; // 10 min
      case 'complex': baseTime = 1200; break; // 20 min
    }
    
    // Especialistas tendem a ser mais rápidos, exceto em casos de reversão de expertise
    const expertiseFactor = participant.type === 'expert' ? 0.8 : 1.2;
    // Simular variabilidade
    const randomFactor = 0.8 + (Math.random() * 0.4); // entre 0.8 e 1.2
    
    const completionTime = baseTime * expertiseFactor * randomFactor;
    
    // Simular pontuações NASA-TLX
    const baseCognitiveLoad = task.level === 'simple' ? 7 : (task.level === 'medium' ? 12 : 16);
    // Novamente, simular reversão de expertise em tarefas complexas para especialistas
    const cognitiveLoadFactor = 
      participant.type === 'expert' && task.level === 'complex' ? 1.1 : 
      participant.type === 'expert' ? 0.7 : 1.3;
    
    const nasaTLXScores = {
      mental_demand: Math.min(20, Math.floor(baseCognitiveLoad * cognitiveLoadFactor * (0.9 + Math.random() * 0.2))),
      physical_demand: Math.floor(Math.random() * 5), // Baixa demanda física
      temporal_demand: Math.min(20, Math.floor((baseCognitiveLoad - 3) * cognitiveLoadFactor * (0.9 + Math.random() * 0.2))),
      performance: Math.min(20, Math.floor((20 - baseCognitiveLoad) * (participant.type === 'expert' ? 0.7 : 1.1))),
      effort: Math.min(20, Math.floor(baseCognitiveLoad * cognitiveLoadFactor * (0.9 + Math.random() * 0.2))),
      frustration: Math.min(20, Math.floor((baseCognitiveLoad - 2) * cognitiveLoadFactor * (0.9 + Math.random() * 0.3)))
    };
    
    // Simular qualidade do resultado (especialistas geralmente produzem melhor qualidade)
    const baseQuality = participant.type === 'expert' ? 8 : 5;
    const qualityScore = Math.min(10, Math.max(1, Math.floor(baseQuality + (Math.random() * 4 - 2))));
    
    // Simular feedback qualitativo
    const feedbackOptions = [
      "A interface era clara e intuitiva",
      "Tive dificuldade em entender como estruturar meu argumento",
      "As ferramentas me ajudaram a organizar meus pensamentos",
      "A plataforma parecia muito complexa para a tarefa simples",
      "Senti que minha experiência prévia não foi aproveitada pelo sistema",
      "A interface me forçou a pensar de maneira diferente do que estou acostumado",
      "As ferramentas complementaram bem meu processo de pensamento"
    ];
    
    const feedback = feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
    
    return {
      completionTime,
      nasaTLXScores,
      qualityScore,
      feedback
    };
  }

  async _collectPostTestFeedback() {
    // Simulação de coleta de feedback pós-teste
    return {
      interface_clarity: Math.floor(Math.random() * 7) + 1,
      cognitive_assistance: Math.floor(Math.random() * 7) + 1,
      expertise_reversal: Math.floor(Math.random() * 7) + 1,
      open_feedback: "Feedback simulado do participante"
    };
  }
}

// Executar os testes quando o script for chamado diretamente
if (require.main === module) {
  const test = new CognitiveLoadTest();
  test.runFullTestSession()
    .then(() => console.log("Testes concluídos com sucesso"))
    .catch(err => console.error("Erro na execução dos testes:", err));
}

module.exports = CognitiveLoadTest;
