// Serviço para gerenciar tutoriais e exemplos

// Dados de exemplo - em um ambiente real, estes dados viriam de uma API
const TUTORIAL_DATA = [
  {
    id: 1,
    title: "Começando com o CrossDebate",
    description: "Um tutorial básico para novos usuários da plataforma.",
    category: "introdução",
    difficulty: "iniciante",
    steps: [
      {
        title: "Bem-vindo ao CrossDebate",
        description: "A plataforma CrossDebate é um ambiente colaborativo para estruturar e analisar debates. Neste tutorial, vamos guiá-lo pelos recursos básicos.",
        image: "/images/tutorials/welcome-screen.png"
      },
      {
        title: "Navegação pela Interface",
        description: "Conheça os principais elementos da interface do usuário e como navegar entre diferentes seções.",
        image: "/images/tutorials/navigation-guide.png"
      },
      {
        title: "Criando seu Primeiro Debate",
        description: "Aprenda a iniciar um novo debate, definir o tema e convidar participantes.",
        image: "/images/tutorials/create-debate.png"
      }
    ],
    example: null
  },
  {
    id: 2,
    title: "Usando Argumentos Estruturados",
    description: "Aprenda a criar argumentos bem estruturados com premissas e conclusões.",
    category: "argumentação",
    difficulty: "intermediário",
    steps: [
      {
        title: "Estrutura de Argumentos",
        description: "Entenda como funciona a estrutura básica de um argumento: premissas que sustentam uma conclusão.",
        image: "/images/tutorials/argument-structure.png"
      },
      {
        title: "Adicionando Premissas",
        description: "Saiba como adicionar premissas fortes e relevantes para seu argumento.",
        image: "/images/tutorials/adding-premises.png"
      },
      {
        title: "Formulando Conclusões",
        description: "Aprenda a formular conclusões claras e que decorrem logicamente das premissas.",
        image: "/images/tutorials/conclusions.png"
      }
    ],
    example: {
      title: "Argumento sobre Mudanças Climáticas",
      preview: `Premissa 1: Os níveis de CO2 na atmosfera aumentaram significativamente nos últimos 100 anos.
Premissa 2: O aumento de CO2 está diretamente ligado a atividades humanas.
Premissa 3: O CO2 em excesso causa efeito estufa.
Conclusão: As atividades humanas contribuem significativamente para o aquecimento global.`
    }
  },
  {
    id: 3,
    title: "Análise de Falácias",
    description: "Como identificar e evitar falácias comuns em debates.",
    category: "análise",
    difficulty: "avançado",
    steps: [
      {
        title: "O que são Falácias?",
        description: "Entenda o conceito de falácias e por que é importante identificá-las em debates.",
        image: "/images/tutorials/fallacies-intro.png"
      },
      {
        title: "Falácias Formais vs. Informais",
        description: "Aprenda a diferença entre falácias formais (estruturais) e informais (de conteúdo).",
        image: "/images/tutorials/formal-informal.png"
      },
      {
        title: "Falácias Comuns",
        description: "Conheça as falácias mais frequentes em debates: Ad Hominem, Espantalho, Apelo à Autoridade e outras.",
        image: "/images/tutorials/common-fallacies.png"
      },
      {
        title: "Como Responder a Falácias",
        description: "Estratégias eficazes para apontar falácias e reorientar o debate de forma construtiva.",
        image: "/images/tutorials/responding-fallacies.png"
      }
    ],
    example: {
      title: "Análise de Debate Político",
      preview: `Exemplo de Ad Hominem:
"Não podemos considerar a proposta econômica do senador porque ele se divorciou três vezes."

Exemplo de Falso Dilema:
"Ou aprovamos este projeto exatamente como está, ou a economia entrará em colapso."

Exemplo de Espantalho:
"Meu oponente quer controle de armas, portanto ele quer deixar todos os cidadãos indefesos diante dos criminosos."`
    }
  },
  {
    id: 4,
    title: "Técnicas de Debate em Equipe",
    description: "Estratégias para debates colaborativos e distribuição de responsabilidades.",
    category: "estratégia",
    difficulty: "intermediário",
    steps: [
      {
        title: "Definindo Papéis na Equipe",
        description: "Como distribuir papéis e responsabilidades entre os membros da equipe de debate.",
        image: "/images/tutorials/team-roles.png"
      },
      {
        title: "Preparação Colaborativa",
        description: "Técnicas para pesquisa, brainstorming e preparação de argumentos em grupo.",
        image: "/images/tutorials/collaborative-prep.png"
      },
      {
        title: "Comunicação Durante o Debate",
        description: "Como manter comunicação eficiente entre membros da equipe durante um debate ao vivo.",
        image: "/images/tutorials/team-communication.png"
      }
    ],
    example: null
  }
];

export const fetchTutorials = () => {
  // Simulando uma chamada de API assíncrona
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(TUTORIAL_DATA);
    }, 800);
  });
};

export const fetchTutorialById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const tutorial = TUTORIAL_DATA.find(t => t.id === parseInt(id));
      if (tutorial) {
        resolve(tutorial);
      } else {
        reject(new Error("Tutorial não encontrado"));
      }
    }, 500);
  });
};
