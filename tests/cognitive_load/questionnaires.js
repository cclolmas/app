/**
 * Questionários para avaliação de carga cognitiva e experiência do usuário
 */

const demographicQuestions = [
  {
    id: 'age',
    type: 'range',
    question: 'Qual sua idade?',
    options: ['18-24', '25-34', '35-44', '45-54', '55+']
  },
  {
    id: 'education',
    type: 'select',
    question: 'Qual seu nível de escolaridade?',
    options: ['Ensino Médio', 'Graduação incompleta', 'Graduação completa', 'Pós-graduação']
  },
  {
    id: 'debate_experience',
    type: 'select',
    question: 'Qual seu nível de experiência em debates estruturados?',
    options: ['Nenhuma', 'Básico', 'Intermediário', 'Avançado', 'Profissional']
  },
  {
    id: 'platform_familiarity',
    type: 'select',
    question: 'Quão familiarizado está com plataformas digitais de debate ou argumentação?',
    options: ['Nada familiarizado', 'Pouco familiarizado', 'Moderadamente familiarizado', 'Muito familiarizado']
  }
];

// Versão adaptada do NASA Task Load Index (NASA-TLX)
const nasaTLXQuestions = [
  {
    id: 'mental_demand',
    type: 'scale',
    question: 'Demanda Mental: Quanto esforço mental foi necessário para completar a tarefa?',
    scale: [0, 20], // 0 = Muito baixo, 20 = Muito alto
  },
  {
    id: 'physical_demand',
    type: 'scale',
    question: 'Demanda Física: Quanto esforço físico foi necessário para completar a tarefa?',
    scale: [0, 20],
  },
  {
    id: 'temporal_demand',
    type: 'scale',
    question: 'Demanda Temporal: Quanta pressão de tempo você sentiu durante a tarefa?',
    scale: [0, 20],
  },
  {
    id: 'performance',
    type: 'scale',
    question: 'Desempenho: Quão bem-sucedido você acha que foi em atingir os objetivos da tarefa?',
    scale: [0, 20], // 0 = Sucesso total, 20 = Fracasso total
  },
  {
    id: 'effort',
    type: 'scale',
    question: 'Esforço: Quanto você teve que se esforçar para alcançar seu nível de desempenho?',
    scale: [0, 20],
  },
  {
    id: 'frustration',
    type: 'scale',
    question: 'Frustração: Quão inseguro, desanimado, irritado ou estressado você se sentiu durante a tarefa?',
    scale: [0, 20],
  }
];

const postTestQuestions = [
  {
    id: 'interface_clarity',
    type: 'scale',
    question: 'A interface da plataforma era clara e fácil de entender?',
    scale: [1, 7] // 1 = Discordo totalmente, 7 = Concordo totalmente
  },
  {
    id: 'cognitive_assistance',
    type: 'scale',
    question: 'As ferramentas da plataforma ajudaram a organizar seu pensamento?',
    scale: [1, 7]
  },
  {
    id: 'expertise_reversal',
    type: 'scale',
    question: 'Em algum momento você sentiu que seu conhecimento prévio dificultou o uso da plataforma?',
    scale: [1, 7]
  },
  {
    id: 'open_feedback',
    type: 'text',
    question: 'Quais aspectos da plataforma você achou mais confusos ou difíceis de usar?'
  }
];

module.exports = {
  demographicQuestions,
  nasaTLXQuestions,
  postTestQuestions
};
