import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Button,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

// Catálogo de feedbacks rastreados na aplicação
const initialFeedbackCatalog = [
  {
    actionType: 'form_submission_success',
    description: 'Sucesso ao enviar um formulário',
    expectedType: 'success',
    expectedPattern: 'enviado|salvo|criado|atualizado com sucesso',
    expectedDuration: 3000,
    occurrences: []
  },
  {
    actionType: 'form_submission_error',
    description: 'Erro ao enviar um formulário',
    expectedType: 'error',
    expectedPattern: 'erro|falha ao enviar|salvar|criar|atualizar',
    expectedDuration: 5000,
    occurrences: []
  },
  {
    actionType: 'data_loading_error',
    description: 'Erro ao carregar dados',
    expectedType: 'error',
    expectedPattern: 'erro|falha ao carregar|obter dados|informações',
    expectedDuration: 5000,
    occurrences: []
  },
  {
    actionType: 'authentication_success',
    description: 'Sucesso ao autenticar usuário',
    expectedType: 'success',
    expectedPattern: 'login|autenticado|conectado com sucesso',
    expectedDuration: 3000,
    occurrences: []
  },
  {
    actionType: 'authentication_error',
    description: 'Erro ao autenticar usuário',
    expectedType: 'error',
    expectedPattern: 'falha|erro na autenticação|ao autenticar|no login',
    expectedDuration: 5000,
    occurrences: []
  },
  {
    actionType: 'delete_confirmation',
    description: 'Confirmação de exclusão',
    expectedType: 'success',
    expectedPattern: 'excluído|removido|deletado com sucesso',
    expectedDuration: 3000,
    occurrences: []
  },
  {
    actionType: 'validation_error',
    description: 'Erro de validação de formulário',
    expectedType: 'warning',
    expectedPattern: 'erro de validação|campos inválidos|obrigatórios|incorretos',
    expectedDuration: 4000,
    occurrences: []
  },
];

const FeedbackConsistencyAuditor = () => {
  const [feedbackCatalog, setFeedbackCatalog] = useState(initialFeedbackCatalog);
  const [capturedFeedbacks, setCapturedFeedbacks] = useState([]);
  const [consistencyReport, setConsistencyReport] = useState(null);
  const [mockFeedback, setMockFeedback] = useState({
    actionType: 'form_submission_success',
    type: 'success',
    message: 'Dados salvos com sucesso!',
    duration: 3000
  });

  // Adicionar feedback capturado manualmente (para teste)
  const addFeedbackOccurrence = () => {
    const newOccurrence = {
      ...mockFeedback,
      timestamp: new Date().toISOString()
    };
    
    setCapturedFeedbacks(prev => [...prev, newOccurrence]);
    
    // Atualizar o catálogo com a nova ocorrência
    setFeedbackCatalog(catalog => 
      catalog.map(item => 
        item.actionType === mockFeedback.actionType 
          ? { ...item, occurrences: [...item.occurrences, newOccurrence] }
          : item
      )
    );
  };

  // Analisa a consistência dos feedbacks capturados
  const analyzeConsistency = () => {
    const report = {
      totalFeedbacks: capturedFeedbacks.length,
      actionTypes: {},
      inconsistencies: []
    };

    // Agrupar feedbacks por tipo de ação
    feedbackCatalog.forEach(catalogItem => {
      if (catalogItem.occurrences.length === 0) return;
      
      const actionTypeReport = {
        description: catalogItem.description,
        count: catalogItem.occurrences.length,
        typeConsistency: true,
        durationConsistency: true,
        messagePatternConsistency: true,
        issues: []
      };

      // Verificar consistência de tipo
      const types = new Set(catalogItem.occurrences.map(o => o.type));
      if (types.size > 1 || !types.has(catalogItem.expectedType)) {
        actionTypeReport.typeConsistency = false;
        actionTypeReport.issues.push({
          issue: 'Inconsistência de tipo',
          expected: catalogItem.expectedType,
          found: Array.from(types).join(', ')
        });
      }

      // Verificar consistência de duração
      const durations = new Set(catalogItem.occurrences.map(o => o.duration));
      if (durations.size > 1 || !durations.has(catalogItem.expectedDuration)) {
        actionTypeReport.durationConsistency = false;
        actionTypeReport.issues.push({
          issue: 'Inconsistência de duração',
          expected: catalogItem.expectedDuration,
          found: Array.from(durations).join(', ')
        });
      }

      // Verificar consistência de padrão de mensagem
      const pattern = new RegExp(catalogItem.expectedPattern, 'i');
      const nonMatchingMessages = catalogItem.occurrences
        .filter(o => !pattern.test(o.message))
        .map(o => o.message);

      if (nonMatchingMessages.length > 0) {
        actionTypeReport.messagePatternConsistency = false;
        actionTypeReport.issues.push({
          issue: 'Inconsistência de mensagem',
          expected: catalogItem.expectedPattern,
          found: nonMatchingMessages.join('; ')
        });
      }

      report.actionTypes[catalogItem.actionType] = actionTypeReport;
      
      // Adicionar à lista geral de inconsistências
      if (actionTypeReport.issues.length > 0) {
        report.inconsistencies.push({
          actionType: catalogItem.actionType,
          description: catalogItem.description,
          issues: actionTypeReport.issues
        });
      }
    });

    setConsistencyReport(report);
  };

  const handleMockFeedbackChange = (field, value) => {
    setMockFeedback(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFeedbacks = () => {
    setCapturedFeedbacks([]);
    setFeedbackCatalog(catalog => 
      catalog.map(item => ({ ...item, occurrences: [] }))
    );
    setConsistencyReport(null);
  };

  // Simular feedbacks de componentes reais
  const simulateRealAppFeedbacks = () => {
    const simulatedFeedbacks = [
      // Consistente
      {
        actionType: 'form_submission_success',
        type: 'success',
        message: 'Formulário enviado com sucesso!',
        duration: 3000
      },
      {
        actionType: 'form_submission_success',
        type: 'success',
        message: 'Dados salvos com sucesso!',
        duration: 3000
      },
      // Inconsistente - duração errada
      {
        actionType: 'form_submission_success',
        type: 'success',
        message: 'Perfil atualizado com sucesso!',
        duration: 5000  // Deveria ser 3000
      },
      // Inconsistente - tipo errado
      {
        actionType: 'validation_error',
        type: 'error',  // Deveria ser warning
        message: 'Erro de validação: campos obrigatórios não preenchidos',
        duration: 4000
      },
      // Inconsistente - mensagem fora do padrão
      {
        actionType: 'authentication_error',
        type: 'error',
        message: 'Não conseguimos processar seu login',  // Não segue o padrão esperado
        duration: 5000
      }
    ];

    // Adicionar timestamp e atualizar o estado
    const timestampedFeedbacks = simulatedFeedbacks.map(f => ({
      ...f,
      timestamp: new Date().toISOString()
    }));

    setCapturedFeedbacks(prev => [...prev, ...timestampedFeedbacks]);

    // Atualizar o catálogo com as novas ocorrências
    setFeedbackCatalog(catalog => 
      catalog.map(item => {
        const newOccurrences = timestampedFeedbacks
          .filter(f => f.actionType === item.actionType);
        
        return {
          ...item,
          occurrences: [...item.occurrences, ...newOccurrences]
        };
      })
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Auditor de Consistência de Feedback
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Adicionar Feedback para Análise
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Tipo de Ação</InputLabel>
            <Select
              value={mockFeedback.actionType}
              label="Tipo de Ação"
              onChange={(e) => handleMockFeedbackChange('actionType', e.target.value)}
            >
              {feedbackCatalog.map(item => (
                <MenuItem key={item.actionType} value={item.actionType}>
                  {item.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>Tipo de Feedback</InputLabel>
            <Select
              value={mockFeedback.type}
              label="Tipo de Feedback"
              onChange={(e) => handleMockFeedbackChange('type', e.target.value)}
            >
              <MenuItem value="success">Sucesso</MenuItem>
              <MenuItem value="error">Erro</MenuItem>
              <MenuItem value="warning">Aviso</MenuItem>
              <MenuItem value="info">Informação</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Mensagem"
            fullWidth
            value={mockFeedback.message}
            onChange={(e) => handleMockFeedbackChange('message', e.target.value)}
          />
          
          <TextField
            label="Duração (ms)"
            fullWidth
            type="number"
            value={mockFeedback.duration}
            onChange={(e) => handleMockFeedbackChange('duration', parseInt(e.target.value))}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={addFeedbackOccurrence}>
            Adicionar Feedback
          </Button>
          <Button variant="outlined" onClick={simulateRealAppFeedbacks}>
            Simular Feedbacks Reais
          </Button>
          <Button variant="contained" color="primary" onClick={analyzeConsistency}>
            Analisar Consistência
          </Button>
          <Button variant="outlined" color="secondary" onClick={clearFeedbacks}>
            Limpar
          </Button>
        </Box>
      </Paper>
      
      {capturedFeedbacks.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Feedbacks Capturados ({capturedFeedbacks.length})
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tipo de Ação</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Mensagem</TableCell>
                  <TableCell>Duração</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {capturedFeedbacks.map((feedback, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {feedbackCatalog.find(c => c.actionType === feedback.actionType)?.description || feedback.actionType}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        size="small" 
                        label={feedback.type} 
                        color={
                          feedback.type === 'success' ? 'success' :
                          feedback.type === 'error' ? 'error' :
                          feedback.type === 'warning' ? 'warning' :
                          'info'
                        }
                      />
                    </TableCell>
                    <TableCell>{feedback.message}</TableCell>
                    <TableCell>{feedback.duration}ms</TableCell>
                    <TableCell>{new Date(feedback.timestamp).toLocaleTimeString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {consistencyReport && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Relatório de Consistência
          </Typography>
          
          {consistencyReport.inconsistencies.length === 0 ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Todos os feedbacks estão consistentes com os padrões definidos!
            </Alert>
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Encontradas {consistencyReport.inconsistencies.length} inconsistências nos feedbacks.
            </Alert>
          )}
          
          {consistencyReport.inconsistencies.map((inconsistency, idx) => (
            <Box key={idx} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1">
                {inconsistency.description} ({inconsistency.actionType})
              </Typography>
              
              {inconsistency.issues.map((issue, issueIdx) => (
                <Box key={issueIdx} sx={{ ml: 2, mt: 1 }}>
                  <Typography variant="body2" color="error">
                    {issue.issue}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Esperado:</strong> {issue.expected}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Encontrado:</strong> {issue.found}
                  </Typography>
                </Box>
              ))}
            </Box>
          ))}
          
          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Total de feedbacks analisados: {consistencyReport.totalFeedbacks}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default FeedbackConsistencyAuditor;
