/**
 * Gerador de tarefas padronizadas para testes de carga cognitiva
 */

class TaskGenerator {
  constructor() {
    this.basicTopics = [
      "Uso de uniformes escolares deve ser obrigatório",
      "Redes sociais têm mais impacto negativo que positivo",
      "Livros físicos são melhores que e-books"
    ];
    
    this.intermediateTopics = [
      "Inteligência artificial vai criar mais empregos do que eliminar",
      "Deveria existir uma renda básica universal",
      "O voto deveria ser facultativo, não obrigatório"
    ];
    
    this.complexTopics = [
      "A privacidade individual deve ser priorizada sobre a segurança pública",
      "O sistema de propriedade intelectual precisa ser radicalmente reformulado",
      "Democracia representativa é superior à democracia direta"
    ];
  }

  generateSimpleTask() {
    const topic = this._getRandomItem(this.basicTopics);
    
    return {
      level: "simple",
      topic,
      instructions: `
        Crie um argumento simples sobre o tema: "${topic}".
        
        Seu argumento deve conter:
        1. Uma afirmação clara (a favor ou contra)
        2. Uma justificativa para sua posição
        
        Tempo sugerido: 5 minutos
      `
    };
  }

  generateMediumTask() {
    const topic = this._getRandomItem(this.intermediateTopics);
    const sampleArgument = this._generateSampleArgument(topic);
    
    return {
      level: "medium",
      topic,
      instructions: `
        Responda ao seguinte argumento sobre: "${topic}"
        
        Argumento original:
        "${sampleArgument}"
        
        Sua tarefa:
        1. Identifique pelo menos uma fraqueza no argumento apresentado
        2. Elabore um contra-argumento que aborde essa fraqueza
        3. Apresente pelo menos uma evidência para apoiar seu contra-argumento
        
        Tempo sugerido: 10 minutos
      `
    };
  }

  generateComplexTask() {
    const topic = this._getRandomItem(this.complexTopics);
    
    return {
      level: "complex",
      topic,
      instructions: `
        Desenvolva uma linha argumentativa completa sobre: "${topic}"
        
        Sua tarefa:
        1. Estabeleça sua posição principal sobre o tema
        2. Desenvolva pelo menos três argumentos de apoio diferentes
        3. Para cada argumento, forneça evidências ou exemplos específicos
        4. Antecipe pelo menos duas possíveis objeções à sua posição
        5. Responda a essas objeções com contra-argumentos
        6. Conclua reforçando sua posição principal
        
        Tempo sugerido: 20 minutos
      `
    };
  }

  generateAllTasksForParticipant() {
    return {
      simple: this.generateSimpleTask(),
      medium: this.generateMediumTask(),
      complex: this.generateComplexTask()
    };
  }

  _getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  _generateSampleArgument(topic) {
    // Argumentos pré-definidos para cada tópico intermediário
    const sampleArguments = {
      "Inteligência artificial vai criar mais empregos do que eliminar": 
        "A IA eliminará empregos de baixa qualificação, mas criará novos empregos em desenvolvimento e manutenção de IA. Historicamente, novas tecnologias sempre geraram mais empregos do que eliminaram.",
      
      "Deveria existir uma renda básica universal":
        "Uma renda básica universal eliminaria a pobreza extrema e reduziria a desigualdade social. Além disso, com a automação crescente, muitos trabalhos tradicionais desaparecerão, tornando necessário um novo modelo econômico.",
      
      "O voto deveria ser facultativo, não obrigatório":
        "O voto obrigatório força pessoas desinteressadas e desinformadas a votar, o que pode levar a decisões eleitorais de baixa qualidade. Um sistema facultativo garantiria que apenas cidadãos realmente engajados participassem do processo democrático."
    };
    
    return sampleArguments[topic] || "Argumento não disponível para este tópico.";
  }
}

module.exports = TaskGenerator;
