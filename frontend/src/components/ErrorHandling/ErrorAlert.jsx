import React, { useState } from 'react';
import { 
  Alert, 
  AlertTitle, 
  Collapse, 
  Typography, 
  Button, 
  Box, 
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildIcon from '@mui/icons-material/Build';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DescriptionIcon from '@mui/icons-material/Description';
import MemoryIcon from '@mui/icons-material/Memory';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Componente avançado para exibição de erros com suporte a diferentes níveis de detalhe,
 * diagnóstico e sugestões de correção, incluindo feedback sobre o trade-off CL-CompL.
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.title - Título do erro
 * @param {string} props.message - Mensagem principal de erro
 * @param {string} props.severity - Severidade do alerta ('error', 'warning', 'info', 'success')
 * @param {string} props.errorCode - Código de erro (opcional)
 * @param {string} props.errorType - Tipo de erro ('memory', 'convergence', 'agent', 'stability', etc.)
 * @param {string} props.context - Contexto adicional sobre o erro
 * @param {Array} props.suggestions - Sugestões de correção
 * @param {Object} props.resources - Links para recursos adicionais (logs, docs)
 * @param {Object} props.clComplInfo - Informações sobre o trade-off CL-CompL relacionado a este erro
 * @param {Function} props.onClose - Função chamada ao fechar o alerta
 * @param {boolean} props.expanded - Estado inicial de expansão dos detalhes
 */
const ErrorAlert = ({ 
  title, 
  message, 
  severity = 'error',
  errorCode,
  errorType,
  context,
  suggestions = [],
  resources = {},
  clComplInfo,
  onClose,
  expanded = false
}) => {
  const [showDetails, setShowDetails] = useState(expanded);
  const [showTechnical, setShowTechnical] = useState(false);

  const getIcon = (type) => {
    switch (type) {
      case 'memory':
        return <MemoryIcon />;
      case 'convergence':
        return <ErrorIcon />;
      case 'agent':
        return <WarningIcon />;
      case 'stability':
        return <PsychologyIcon />;
      default:
        return <ErrorIcon />;
    }
  };

  return (
    <Paper elevation={3} sx={{ mb: 3, overflow: 'hidden', borderRadius: '4px' }}>
      <Alert 
        severity={severity}
        onClose={onClose}
        icon={getIcon(errorType)}
        sx={{
          '& .MuiAlert-icon': {
            fontSize: '1.5rem',
          },
          borderBottomLeftRadius: showDetails ? 0 : undefined,
          borderBottomRightRadius: showDetails ? 0 : undefined,
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
              {title}
              {errorCode && <Typography component="span" sx={{ ml: 1, fontSize: '0.8rem', color: 'text.secondary' }}>
                (Código: {errorCode})
              </Typography>}
            </AlertTitle>
            
            <Button 
              size="small" 
              onClick={() => setShowDetails(!showDetails)}
              endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ minWidth: 100 }}
            >
              {showDetails ? "Menos" : "Detalhes"}
            </Button>
          </Box>
          
          <Typography variant="body2">{message}</Typography>
        </Box>
      </Alert>
      
      <Collapse in={showDetails}>
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          {/* Contexto do erro */}
          {context && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>O que aconteceu?</Typography>
              <Typography variant="body2" sx={{ ml: 1 }}>{context}</Typography>
            </Box>
          )}
          
          {/* Sugestões de correção */}
          {suggestions.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Sugestões para resolução:</Typography>
              <List dense disablePadding>
                {suggestions.map((suggestion, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <BuildIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={suggestion} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {/* Trade-off CL-CompL */}
          {clComplInfo && (
            <Box sx={{ mb: 2 }}>
              <Divider sx={{ my: 1.5 }} />
              
              <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <PsychologyIcon fontSize="small" sx={{ mr: 1 }} color="primary" />
                <span>Relação Carga Cognitiva - Carga Computacional</span>
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1 }}>{clComplInfo.message}</Typography>
              
              {clComplInfo.suggestion && (
                <Box sx={{ mt: 1, bgcolor: 'background.paper', p: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    {clComplInfo.suggestion}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          
          {/* Links para recursos */}
          {Object.keys(resources).length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Recursos adicionais:</Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {resources.logs && (
                  <Button
                    startIcon={<DescriptionIcon />}
                    size="small"
                    variant="outlined"
                    component={RouterLink}
                    to={resources.logs}
                  >
                    Ver logs completos
                  </Button>
                )}
                
                {resources.docs && (
                  <Button
                    startIcon={<MenuBookIcon />}
                    size="small"
                    variant="outlined"
                    component="a"
                    href={resources.docs}
                    target="_blank"
                  >
                    Documentação
                  </Button>
                )}
              </Box>
            </Box>
          )}
          
          {/* Detalhes técnicos (expandíveis) */}
          {errorCode && (
            <Box sx={{ mt: 2 }}>
              <Button 
                size="small" 
                onClick={() => setShowTechnical(!showTechnical)}
                endIcon={showTechnical ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ color: 'text.secondary' }}
              >
                {showTechnical ? "Ocultar detalhes técnicos" : "Ver detalhes técnicos"}
              </Button>
              
              <Collapse in={showTechnical}>
                <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap', display: 'block' }}>
                    Erro: {errorCode}<br />
                    Tipo: {errorType}<br />
                    Contexto: {errorType === 'memory' ? 'VRAM/RAM' : errorType === 'convergence' ? 'Fine-tuning' : 'Agente' }
                  </Typography>
                </Box>
              </Collapse>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ErrorAlert;
