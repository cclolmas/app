import React from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Tooltip,
  Rating, Divider, Chip, Stack, useTheme
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { estimateVramUsage } from '../../utils/modelUtils';

const QuantizationComparison = ({ modelSize, contextLength = 4096 }) => {
  const theme = useTheme();

  // Dados para comparação de quantização
  const comparisonData = [
    {
      aspect: 'VRAM Utilizada',
      q4: {
        value: `~${(estimateVramUsage(modelSize, 'q4', contextLength) / 1024 / 1024 / 1024).toFixed(1)} GB`,
        performance: 5,
        notes: 'Redução significativa no uso de memória',
        color: theme.palette.success.main
      },
      q8: {
        value: `~${(estimateVramUsage(modelSize, 'q8', contextLength) / 1024 / 1024 / 1024).toFixed(1)} GB`,
        performance: 3,
        notes: 'Uso moderado de memória',
        color: theme.palette.info.main
      }
    },
    {
      aspect: 'Velocidade de Inferência',
      q4: {
        value: 'Mais rápida',
        performance: 4,
        notes: 'Operações matemáticas mais simples',
        color: theme.palette.success.main
      },
      q8: {
        value: 'Moderada',
        performance: 3,
        notes: 'Bom desempenho geral',
        color: theme.palette.info.main
      }
    },
    {
      aspect: 'Qualidade do Output',
      q4: {
        value: 'Reduzida',
        performance: 2,
        notes: 'Possível degeneração de texto e alucinações',
        color: theme.palette.warning.main
      },
      q8: {
        value: 'Boa',
        performance: 4,
        notes: 'Próxima à qualidade do modelo original',
        color: theme.palette.success.main
      }
    },
    {
      aspect: 'Estabilidade',
      q4: {
        value: 'Baixa',
        performance: 1,
        notes: 'Maior risco de falhas e inconsistências',
        color: theme.palette.error.main,
        icon: <WarningAmberIcon fontSize="small" color="error" />
      },
      q8: {
        value: 'Alta',
        performance: 4,
        notes: 'Comportamento previsível e confiável',
        color: theme.palette.success.main,
        icon: <CheckCircleIcon fontSize="small" color="success" />
      }
    },
    {
      aspect: 'Carga Cognitiva (CL)',
      q4: {
        value: 'Alta',
        performance: 1,
        notes: 'Exige mais esforço mental para depuração e validação (H1)',
        color: theme.palette.error.main
      },
      q8: {
        value: 'Baixa',
        performance: 4,
        notes: 'Menor necessidade de gerenciar instabilidades',
        color: theme.palette.success.main
      }
    },
    {
      aspect: 'Casos de Uso Ideais',
      q4: {
        value: 'Hardware limitado',
        performance: null,
        notes: 'Quando recursos computacionais são extremamente restritos',
        chips: ['Prototipagem rápida', 'Hardware limitado', 'Tarefas simples']
      },
      q8: {
        value: 'Produção e aprendizado',
        performance: null,
        notes: 'Melhor para desenvolvimento educacional e aplicações confiáveis',
        chips: ['Projetos educacionais', 'Produção', 'Tarefas complexas']
      }
    }
  ];

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" paragraph>
        Esta comparação mostra o impacto de diferentes níveis de quantização no equilíbrio entre Carga Cognitiva (CL) e Carga Computacional (CompL).
      </Typography>
      
      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Aspecto</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Q4 (4-bit)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Q8 (8-bit)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comparisonData.map((row) => (
              <TableRow key={row.aspect} hover>
                <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                  {row.aspect}
                </TableCell>
                
                <TableCell>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ color: row.q4.color }}>
                      {row.q4.value}
                    </Typography>
                    {row.q4.icon}
                  </Box>
                  
                  {row.q4.performance !== null && (
                    <Tooltip title={`Classificação: ${row.q4.performance}/5`}>
                      <Box>
                        <Rating 
                          value={row.q4.performance} 
                          readOnly 
                          size="small" 
                          precision={0.5} 
                        />
                      </Box>
                    </Tooltip>
                  )}
                  
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {row.q4.notes}
                  </Typography>
                  
                  {row.q4.chips && (
                    <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
                      {row.q4.chips.map((chip) => (
                        <Chip 
                          key={chip} 
                          label={chip} 
                          size="small" 
                          variant="outlined" 
                          color="default" 
                          sx={{ my: 0.25 }}
                        />
                      ))}
                    </Stack>
                  )}
                </TableCell>
                
                <TableCell>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ color: row.q8.color }}>
                      {row.q8.value}
                    </Typography>
                    {row.q8.icon}
                  </Box>
                  
                  {row.q8.performance !== null && (
                    <Tooltip title={`Classificação: ${row.q8.performance}/5`}>
                      <Box>
                        <Rating 
                          value={row.q8.performance} 
                          readOnly 
                          size="small" 
                          precision={0.5} 
                        />
                      </Box>
                    </Tooltip>
                  )}
                  
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {row.q8.notes}
                  </Typography>
                  
                  {row.q8.chips && (
                    <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
                      {row.q8.chips.map((chip) => (
                        <Chip 
                          key={chip} 
                          label={chip} 
                          size="small" 
                          variant="outlined" 
                          color="default"
                          sx={{ my: 0.25 }}
                        />
                      ))}
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            ))}
            
            <TableRow sx={{ bgcolor: 'background.paper' }}>
              <TableCell colSpan={3} sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningAmberIcon color="warning" fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">
                    Hipótese H1: Quantizações mais agressivas (Q4) podem aumentar a Carga Cognitiva mesmo reduzindo a Carga Computacional
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default QuantizationComparison;
