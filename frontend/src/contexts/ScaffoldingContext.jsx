import React, { createContext, useContext, useState, useEffect } from 'react';

// Níveis de expertise disponíveis
export const EXPERTISE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

// Níveis de detalhamento de scaffolding
export const SCAFFOLDING_LEVELS = {
  DETAILED: 'detailed',     // Para iniciantes: instruções detalhadas, muitos exemplos
  MODERATE: 'moderate',     // Para intermediários: instruções concisas, alguns exemplos
  MINIMAL: 'minimal'        // Para avançados: atalhos, menos explicações, foco em recursos avançados
};

// Mapeamento de expertise para nível de scaffolding padrão
const expertiseToScaffolding = {
  [EXPERTISE_LEVELS.BEGINNER]: SCAFFOLDING_LEVELS.DETAILED,
  [EXPERTISE_LEVELS.INTERMEDIATE]: SCAFFOLDING_LEVELS.MODERATE,
  [EXPERTISE_LEVELS.ADVANCED]: SCAFFOLDING_LEVELS.MINIMAL
};

// Contexto para o scaffolding
const ScaffoldingContext = createContext();

/**
 * Provedor de contexto para o sistema de scaffolding adaptativo
 */
export const ScaffoldingProvider = ({ children }) => {
  // Estado para o nível de expertise do usuário
  const [expertiseLevel, setExpertiseLevel] = useState(EXPERTISE_LEVELS.INTERMEDIATE);
  
  // Estado para o nível de scaffolding
  const [scaffoldingLevel, setScaffoldingLevel] = useState(SCAFFOLDING_LEVELS.MODERATE);
  
  // Estado para armazenar o progresso/ações completadas por fluxo
  const [progress, setProgress] = useState({});
  
  // Estado para guardar dicas visualizadas (evita mostrar a mesma dica várias vezes)
  const [viewedHints, setViewedHints] = useState({});
  
  // Detecta o nível de expertise com base em interações anteriores
  useEffect(() => {
    // Em uma implementação real, poderíamos buscar o nível de expertise do backend
    // ou calcular com base em métricas de uso
    const detectExpertise = async () => {
      try {
        // Aqui você poderia ter uma lógica para buscar dados do usuário ou 
        // usar heurísticas locais baseadas em uso anterior
        
        // Por enquanto, usaremos localStorage como exemplo simples
        const savedExpertise = localStorage.getItem('userExpertiseLevel');
        if (savedExpertise && Object.values(EXPERTISE_LEVELS).includes(savedExpertise)) {
          setExpertiseLevel(savedExpertise);
        }
      } catch (error) {
        console.error("Erro ao detectar expertise:", error);
      }
    };
    
    detectExpertise();
  }, []);
  
  // Atualiza o nível de scaffolding quando o nível de expertise muda
  useEffect(() => {
    setScaffoldingLevel(expertiseToScaffolding[expertiseLevel]);
  }, [expertiseLevel]);
  
  // Função para atualizar manualmente o nível de expertise
  const updateExpertiseLevel = (level) => {
    if (Object.values(EXPERTISE_LEVELS).includes(level)) {
      setExpertiseLevel(level);
      
      // Salva a preferência
      try {
        localStorage.setItem('userExpertiseLevel', level);
      } catch (error) {
        console.error("Erro ao salvar nível de expertise:", error);
      }
    }
  };
  
  // Função para ajustar manualmente o nível de scaffolding
  const updateScaffoldingLevel = (level) => {
    if (Object.values(SCAFFOLDING_LEVELS).includes(level)) {
      setScaffoldingLevel(level);
    }
  };
  
  // Função para registrar progresso em um fluxo de trabalho específico
  const markStepComplete = (flowId, stepId) => {
    setProgress(prev => ({
      ...prev,
      [flowId]: {
        ...(prev[flowId] || {}),
        [stepId]: true
      }
    }));
  };
  
  // Função para verificar se um passo está completo
  const isStepComplete = (flowId, stepId) => {
    return !!(progress[flowId] && progress[flowId][stepId]);
  };
  
  // Função para marcar uma dica como visualizada
  const markHintAsViewed = (hintId) => {
    setViewedHints(prev => ({
      ...prev,
      [hintId]: true
    }));
  };
  
  // Função para verificar se uma dica já foi visualizada
  const isHintViewed = (hintId) => {
    return !!viewedHints[hintId];
  };
  
  // Função para obter o texto apropriado com base no nível de expertise
  const getScaffoldingText = (detailedText, moderateText, minimalText) => {
    switch (scaffoldingLevel) {
      case SCAFFOLDING_LEVELS.DETAILED:
        return detailedText;
      case SCAFFOLDING_LEVELS.MODERATE:
        return moderateText;
      case SCAFFOLDING_LEVELS.MINIMAL:
        return minimalText;
      default:
        return moderateText;
    }
  };
  
  // Valor do contexto a ser fornecido
  const value = {
    expertiseLevel,
    scaffoldingLevel,
    updateExpertiseLevel,
    updateScaffoldingLevel,
    markStepComplete,
    isStepComplete,
    markHintAsViewed,
    isHintViewed,
    getScaffoldingText,
    progress
  };
  
  return (
    <ScaffoldingContext.Provider value={value}>
      {children}
    </ScaffoldingContext.Provider>
  );
};

// Hook para usar o contexto de scaffolding
export const useScaffolding = () => {
  const context = useContext(ScaffoldingContext);
  if (context === undefined) {
    throw new Error('useScaffolding deve ser usado dentro de um ScaffoldingProvider');
  }
  return context;
};
