import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, 
  Stepper, Step, StepLabel, StepContent, 
  Chip, Divider, IconButton, Alert, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  Card, CardContent, CardActions
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MemoryIcon from '@mui/icons-material/Memory';

import { reflectionService } from '../../services/reflectionService';
import { useAuth } from '../../hooks/useAuth';

/**
 * Componente de Reflexão Guiada que estimula a metacognição após tarefas significativas
 * 
 * @param {Object} props
 * @param {string} props.taskType - Tipo de tarefa concluída ('fine-tuning', 'lmas')
 * @param {Object} props.taskData - Dados da tarefa concluída
 * @param {Function} props.onSave - Callback chamada após salvar a reflexão
 * @param {Function} props.onClose - Callback chamada ao fechar o componente
 * @param {boolean} props.isDialog - Se o componente deve ser exibido como uma caixa de diálogo
 * @param {boolean} props.open - Se a caixa de diálogo está aberta (quando isDialog=true)
 */
const GuidedReflection = ({ 
  taskType, 
  taskData, 
  onSave, 
  onClose, 
  isDialog = false,
  open = false
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { user } = useAuth();
  
  // Define as perguntas com base no tipo de tarefa
  const questions = getQuestionsForTaskType(taskType);
  
  // Inicializa as respostas
  useEffect(() => {
    const initialResponses = {};
    questions.forEach(q => {
      initialResponses[q.id] = '';
    });
    setResponses(initialResponses);
  }, [questions]);
  
  // Manipuladores
  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Resetar indicadores de salvamento/compartilhamento quando o usuário edita
    if (saved) setSaved(false);
    if (shared) setShared(false);
  };
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const reflectionData = {
        taskType,
        taskId: taskData?.id || 'unknown',
        taskName: taskData?.name || 'Tarefa sem nome',
        timestamp: new Date().toISOString(),
        userId: user?.id || 'anonymous',
        questions: questions.map(q => ({
          id: q.id,
          text: q.text,
          pcElement: q.pcElement,
          response: responses[q.id] || ''
        })),
        isPublic: false
      };
      
      await reflectionService.saveReflection(reflectionData);
      setSaved(true);
      
      if (onSave) {
        onSave(reflectionData);
      }
    } catch (error) {
      console.error('Erro ao salvar reflexão:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleShare = () => {
    setShareDialogOpen(true);
  };
  
  const confirmShare = async () => {
    setIsSaving(true);
    
    try {
      // Salvar a reflexão como pública
      const reflectionData = {
        taskType,
        taskId: taskData?.id || 'unknown',
        taskName: taskData?.name || 'Tarefa sem nome',
        timestamp: new Date().toISOString(),
        userId: user?.id || 'anonymous',
        userName: user?.name || 'Usuário Anônimo',
        questions: questions.map(q => ({
          id: q.id,
          text: q.text,
          pcElement: q.pcElement,
          response: responses[q.id] || ''
        })),
        isPublic: true
      };
      
      await reflectionService.shareReflection(reflectionData);
      setShared(true);
      setShareDialogOpen(false);
      
    } catch (error) {
      console.error('Erro ao compartilhar reflexão:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Renderização baseada na propriedade isDialog
  const content = (
    <>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PsychologyIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" component="h2">
            Reflexão Guiada
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          Reflita sobre sua experiência com esta tarefa. Este exercício ajuda a desenvolver 
          consciência sobre seu processo cognitivo e as estratégias que você utilizou.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Chip 
            icon={<PsychologyIcon fontSize="small" />} 
            label="Carga Cognitiva" 
            size="small" 
            color="primary" 
            variant="outlined"
          />
          <Chip 
            icon={<MemoryIcon fontSize="small" />} 
            label="Carga Computacional" 
            size="small"
            color="secondary"
            variant="outlined" 
          />
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
        {questions.map((question, index) => (
          <Step key={question.id}>
            <StepLabel>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1">{question.shortLabel || `Reflexão ${index + 1}`}</Typography>
                {question.pcElement && (
                  <Chip
                    label={question.pcElement}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            </StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" paragraph>
                  {question.text}
                </Typography>
                
                {question.hint && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      {question.hint}
                    </Typography>
                  </Alert>
                )}
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Digite sua reflexão aqui..."
                  value={responses[question.id] || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                />
              </Box>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  disabled={index === 0}
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                >
                  Anterior
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                >
                  {index === questions.length - 1 ? 'Finalizar' : 'Próxima'}
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      
      {activeStep === questions.length && (
        <Box>
          <Paper square elevation={0} sx={{ p: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              Reflexão Completa
            </Typography>
            <Typography paragraph>
              Você completou todas as perguntas de reflexão. Revise suas respostas e salve ou compartilhe sua reflexão.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={isSaving || saved}
              >
                {saved ? 'Salvo' : 'Salvar Reflexão'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={handleShare}
                disabled={isSaving || shared}
              >
                {shared ? 'Compartilhado' : 'Compartilhar'}
              </Button>
            </Box>
            
            {saved && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Sua reflexão foi salva com sucesso! Você pode acessá-la mais tarde no seu perfil.
              </Alert>
            )}
            
            <Box sx={{ mt: 3 }}>
              <Button onClick={() => setActiveStep(0)}>
                Revisar Respostas
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
      
      {/* Diálogo de confirmação para compartilhamento */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Compartilhar Reflexão</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Deseja compartilhar esta reflexão com a comunidade? Isso tornará suas respostas visíveis 
            para outros estudantes, permitindo aprendizagem colaborativa.
          </Typography>
          <Alert severity="info">
            O compartilhamento de reflexões ajuda a criar uma base de conhecimento coletiva
            sobre estratégias eficazes de gestão CL-CompL.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={confirmShare} 
            variant="contained" 
            color="primary" 
            disabled={isSaving}
          >
            Confirmar Compartilhamento
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
  
  // Renderizar como diálogo ou componente normal
  if (isDialog) {
    return (
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { minHeight: '60vh' } }}
      >
        <DialogContent>
          {content}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fechar</Button>
        </DialogActions>
      </Dialog>
    );
  }
  
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      {content}
    </Paper>
  );
};

/**
 * Retorna as perguntas de reflexão adequadas ao tipo de tarefa
 */
function getQuestionsForTaskType(taskType) {
  // Perguntas comuns a todos os tipos de tarefa
  const commonQuestions = [
    {
      id: 'cl_compl_balance',
      shortLabel: 'Equilíbrio CL-CompL',
      text: 'Como você gerenciou o equilíbrio entre Carga Cognitiva e Carga Computacional? Onde você sentiu maior dificuldade (CL alta)? A CompL foi um fator limitante?',
      hint: 'Considere momentos em que teve que escolher entre otimizar recursos computacionais (ex: Q4 vs Q8) e sua carga mental.',
      pcElement: 'Metacognição'
    },
    {
      id: 'key_learning',
      shortLabel: 'Aprendizado Principal',
      text: 'Qual foi seu principal aprendizado nesta tarefa? O que você faria diferente na próxima vez?',
      pcElement: 'Reflexão'
    }
  ];
  
  // Perguntas específicas para fine-tuning
  if (taskType === 'fine-tuning') {
    return [
      {
        id: 'decomposition',
        shortLabel: 'Decomposição',
        text: 'Como você aplicou a Decomposição para abordar este problema de fine-tuning? Em que etapas você dividiu o processo?',
        hint: 'Pense em como você quebrou o problema em partes gerenciáveis: preparação de dados, configuração de parâmetros, treinamento, avaliação.',
        pcElement: 'Decomposição'
      },
      {
        id: 'abstraction',
        shortLabel: 'Abstração',
        text: 'Que Abstrações foram úteis durante o processo de fine-tuning? Quais detalhes você ignorou para focar no que era importante?',
        hint: 'Considere como você simplificou a complexidade do ajuste fino para tomar decisões mais eficazes.',
        pcElement: 'Abstração'
      },
      {
        id: 'pattern_recognition',
        shortLabel: 'Reconhecimento de Padrões',
        text: 'Quais Padrões você observou nos resultados ou no uso de recursos durante o fine-tuning? Houve alguma relação consistente entre parâmetros e resultados?',
        hint: 'Por exemplo, relações entre rank LoRA e uso de VRAM, ou entre taxa de aprendizado e convergência.',
        pcElement: 'Reconhecimento de Padrões' 
      },
      {
        id: 'algorithm',
        shortLabel: 'Algoritmo',
        text: 'Como foi a definição e execução de seu "Algoritmo" de fine-tuning? Qual foi sua estratégia sequencial para atingir o objetivo?',
        hint: 'Descreva sua sequência de decisões e ações, incluindo ajustes que fez baseado em resultados intermediários.',
        pcElement: 'Algoritmo'
      },
      ...commonQuestions
    ];
  }
  
  // Perguntas específicas para LMAS
  if (taskType === 'lmas') {
    return [
      {
        id: 'decomposition',
        shortLabel: 'Decomposição',
        text: 'Como você aplicou a Decomposição para estruturar seu sistema multi-agente? Como dividiu as responsabilidades entre agentes?',
        hint: 'Pense em como você dividiu a tarefa geral em subtarefas e as atribuiu a diferentes agentes.',
        pcElement: 'Decomposição'
      },
      {
        id: 'abstraction',
        shortLabel: 'Abstração',
        text: 'Que Abstrações você criou para simplificar a comunicação entre agentes? Como você modelou o problema para os agentes?',
        hint: 'Considere como você representou as informações compartilhadas entre agentes e o nível de detalhe nos prompts.',
        pcElement: 'Abstração'
      },
      {
        id: 'pattern_recognition',
        shortLabel: 'Reconhecimento de Padrões',
        text: 'Quais Padrões você observou nas interações entre agentes? Houve comportamentos recorrentes ou gargalos específicos?',
        hint: 'Por exemplo, padrões de erro, latências, ou formas eficazes de estruturar comunicações.',
        pcElement: 'Reconhecimento de Padrões'
      },
      {
        id: 'algorithm',
        shortLabel: 'Algoritmo',
        text: 'Como o fluxo de trabalho (Algoritmo) do seu sistema multi-agente se comportou? Os agentes seguiram a sequência esperada?',
        hint: 'Descreva como o processo fluiu de um agente para outro e quaisquer ajustes que você precisou fazer.',
        pcElement: 'Algoritmo'
      },
      ...commonQuestions
    ];
  }
  
  // Para outros tipos de tarefa, usar perguntas genéricas
  return [
    {
      id: 'decomposition',
      shortLabel: 'Decomposição',
      text: 'Como você aplicou a Decomposição para abordar este problema? Em que partes menores você o dividiu?',
      pcElement: 'Decomposição'
    },
    {
      id: 'abstraction',
      shortLabel: 'Abstração',
      text: 'Que Abstrações foram úteis para você nesta tarefa? Que detalhes você ignorou para focar no essencial?',
      pcElement: 'Abstração'
    },
    {
      id: 'pattern_recognition',
      shortLabel: 'Reconhecimento de Padrões',
      text: 'Quais Padrões você observou durante a execução da tarefa ou nos resultados obtidos?',
      pcElement: 'Reconhecimento de Padrões'
    },
    {
      id: 'algorithm',
      shortLabel: 'Algoritmo',
      text: 'Como o Algoritmo que você definiu se comportou? Quais foram os passos da sua solução?',
      pcElement: 'Algoritmo'
    },
    ...commonQuestions
  ];
}

export default GuidedReflection;
