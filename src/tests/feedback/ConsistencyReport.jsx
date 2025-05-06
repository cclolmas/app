import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { analyzeFeedbackConsistency } from '../../utils/feedback/feedbackConsistencyUtils';

/**
 * Componente para exibir um relatório detalhado sobre inconsistências de feedback
 */
const ConsistencyReport = ({ feedbacks }) => {
  // Analisar consistência dos feedbacks
  const report = analyzeFeedbackConsistency(feedbacks);
  
  // Calcular porcentagem de consistência
  const consistencyPercentage = report.totalFeedbacks > 0 
    ? (report.consistentFeedbacks / report.totalFeedbacks) * 100 
    : 100;
  
  // Determinar status geral
  let overallStatus = 'success';
  if (consistencyPercentage < 80) {
    overallStatus = 'error';
  } else if (consistencyPercentage < 95) {
    overallStatus = 'warning';
  }
  
  return (
    <Paper sx={{ p: 3, mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Relatório de Consistência de Feedback
      </Typography>
      
      <Alert severity={overallStatus} sx={{ mb: 3 }}>
        <Typography variant="subtitle1">
          Consistência geral: {consistencyPercentage.toFixed(1)}%
        </Typography>
        <Typography variant="body2">
          {report.consistentFeedbacks} de {report.totalFeedbacks} feedbacks estão consistentes
        </Typography>
      </Alert>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Análise por Tipo de Ação
      </Typography>
      
      {Object.entries(report.actionTypeConsistency).map(([actionType, consistency]) => (
        <Accordion key={actionType} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Typography sx={{ flexGrow: 1 }}>
                {actionType.replace(/_/g, ' ')}
              </Typography>
              <Chip 
                label={consistency.isConsistent ? 'Consistente' : 'Inconsistente'} 
                color={consistency.isConsistent ? 'success' : 'error'}
                size="small"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Padrão Esperado:
              </Typography>
              <Box sx={{ ml: 2, mb: 2 }}>
                <Typography variant="body2">
                  <strong>Tipo:</strong> {consistency.pattern.type}
                </Typography>
                <Typography variant="body2">
                  <strong>Duração:</strong> {consistency.pattern.duration}ms
                </Typography>
                <Typography variant="body2">
                  <strong>Padrão de Mensagem:</strong> {consistency.pattern.messagePattern.toString()}
                </Typography>
              </Box>
              
              {consistency.inconsistencies.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Inconsistências Encontradas:
                  </Typography>
                  
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Campo</TableCell>
                        <TableCell>Esperado</TableCell>
                        <TableCell>Recebido</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {consistency.inconsistencies.map((item, idx) => (
                        item.issues.map((issue, issueIdx) => (
                          <TableRow key={`${idx}-${issueIdx}`}>
                            <TableCell>{issue.field}</TableCell>
                            <TableCell>{issue.expected}</TableCell>
                            <TableCell>{issue.received}</TableCell>
                          </TableRow>
                        ))
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  );
};

export default ConsistencyReport;
