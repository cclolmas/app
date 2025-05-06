import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Link, 
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FunctionsIcon from '@mui/icons-material/Functions';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Componente que fornece sugestões contextuais de atividades para realizar
 * enquanto uma tarefa computacionalmente intensiva está sendo executada.
 * 
 * @param {Object} props
 * @param {string} props.taskType - Tipo da tarefa ('fine-tuning', 'lmas')
 * @param {number} props.elapsedTime - Tempo decorrido em segundos
 * @param {number} props.estimatedTotalTime - Estimativa de tempo total em segundos
 */
const WaitTimeSuggestion = ({ taskType, elapsedTime, estimatedTotalTime }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  
  // Preparar sugestões com base no tipo de tarefa e no tempo estimado
  useEffect(() => {
    let taskSpecificSuggestions = [];
    
    // Sugestões específicas para fine-tuning
    if (taskType === 'fine-tuning') {
      taskSpecificSuggestions = [
        {
          title: "Revise conceitos de transferência de aprendizado",
          description: "Entenda melhor como a adaptação de parâmetros funciona em LLMs",
          icon: <SchoolIcon />,
          link: "/docs/fine-tuning/transfer-learning",
          timeCategory: "short"
        },
        {
          title: "Prepare dados para avaliação do modelo",
          description: "Organize um conjunto de testes para avaliar o modelo após o treinamento",
          icon: <AssignmentIcon />,
          link: "/tools/data-preparation",
          timeCategory: "medium"
        },
        {
          title: "Estude os trade-offs de quantização Q4 vs Q8",
          description: "Compreenda como diferentes níveis de quantização afetam performance e qualidade",
          icon: <FunctionsIcon />,
          link: "/docs/fine-tuning/quantization",
          timeCategory: "medium"
        },
        {
          title: "Explore estratégias de otimização de hiperparâmetros",
          description: "Aprenda técnicas para encontrar as configurações ideais para seu caso de uso",
          icon: <AutorenewIcon />,
          link: "/docs/fine-tuning/hyperparameters",
          timeCategory: "long"
        },
        {
          title: "Estude o algoritmo LoRA em profundidade",
          description: "Mergulhe nos detalhes técnicos da adaptação de baixo rank",
          icon: <MenuBookIcon />,
          link: "/docs/fine-tuning/lora-explained",
          timeCategory: "long"
        }
      ];
    } 
    // Sugestões específicas para LMAS
    else if (taskType === 'lmas') {
      taskSpecificSuggestions = [
        {
          title: "Revise padrões de comunicação entre agentes",
          description: "Compreenda diferentes abordagens para orquestração de múltiplos agentes",
          icon: <AutorenewIcon />,
          link: "/docs/lmas/communication-patterns",
          timeCategory: "medium"
        },
        {
          title: "Prepare prompts para ajustar seu sistema",
          description: "Esboce instruções claras para melhorar a qualidade das interações",
          icon: <AssignmentIcon />,
          link: "/tools/prompt-engineering",
          timeCategory: "short"
        },
        {
          title: "Estude técnicas de depuração para sistemas multi-agente",
          description: "Aprenda a identificar e resolver problemas em LMAS complexos",
          icon: <CodeIcon />,
          link: "/docs/lmas/debugging",
          timeCategory: "medium"
        },
        {
          title: "Compare diferentes frameworks de orquestração",
          description: "Analise as diferenças entre CrewAI, LangChain e outros frameworks",
          icon: <MenuBookIcon />,
          link: "/docs/lmas/frameworks-comparison",
          timeCategory: "long"
        }
      ];
    }
    
    // Adicionar sugestões genéricas válidas para qualquer tipo de tarefa
    const genericSuggestions = [
      {
        title: "Documente seu processo e decisões",
        description: "Registre os parâmetros e escolhas para facilitar reprodução futura",
        icon: <AssignmentIcon />,
        timeCategory: "short"
      },
      {
        title: "Revise o equilíbrio CL-CompL em seus projetos",
        description: "Reflita sobre como você está gerenciando carga cognitiva e computacional",
        icon: <SchoolIcon />,
        link: "/docs/concepts/cl-compl-balance",
        timeCategory: "medium"
      }
    ];
    
    // Combinar e filtrar sugestões com base no tempo estimado
    const allSuggestions = [...taskSpecificSuggestions, ...genericSuggestions];
    
    // Categorizar o tempo disponível
    let timeCategory = "short"; // < 5 minutos
    if (estimatedTotalTime) {
      if (estimatedTotalTime > 1800) { // > 30 minutos
        timeCategory = "long";
      } else if (estimatedTotalTime > 600) { // > 10 minutos
        timeCategory = "medium";
      }
    }
    
    // Filtrar sugestões apropriadas para o tempo disponível
    let filteredSuggestions = allSuggestions;
    if (timeCategory === "short") {
      filteredSuggestions = allSuggestions.filter(s => s.timeCategory === "short");
    } else if (timeCategory === "medium") {
      filteredSuggestions = allSuggestions.filter(s => s.timeCategory === "short" || s.timeCategory === "medium");
    }
    
    // Embaralhar as sugestões para variedade
    filteredSuggestions = filteredSuggestions
      .sort(() => Math.random() - 0.5)
      .slice(0, 3); // Limitar a 3 sugestões
    
    setSuggestions(filteredSuggestions);
  }, [taskType, estimatedTotalTime]);
  
  // Alternar entre sugestões a cada 30 segundos
  useEffect(() => {
    if (suggestions.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSuggestionIndex(prev => (prev + 1) % suggestions.length);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [suggestions]);
  
  if (suggestions.length === 0) return null;
  
  const currentSuggestion = suggestions[currentSuggestionIndex];
  
  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2, 
        bgcolor: 'background.paper',
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Box sx={{ mr: 2, mt: 0.5 }}>
          {currentSuggestion.icon || <MenuBookIcon color="primary" />}
        </Box>
        
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {currentSuggestion.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            {currentSuggestion.description}
          </Typography>
          
          {currentSuggestion.link && (
            <Link 
              component={RouterLink} 
              to={currentSuggestion.link}
              variant="button"
              color="primary"
            >
              Explorar
            </Link>
          )}
        </Box>
      </Box>
      
      {suggestions.length > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          {suggestions.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: index === currentSuggestionIndex ? 'primary.main' : 'grey.300',
                mx: 0.5,
                cursor: 'pointer'
              }}
              onClick={() => setCurrentSuggestionIndex(index)}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default WaitTimeSuggestion;
