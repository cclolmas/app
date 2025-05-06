import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Collapse, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Divider,
  Link
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import SchoolIcon from '@mui/icons-material/School';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useScaffolding, SCAFFOLDING_LEVELS } from '../../contexts/ScaffoldingContext';

/**
 * Componente que fornece ajuda contextual adaptada ao nível de expertise
 */
const ContextualHelp = ({
  id,
  title = 'Precisa de ajuda?',
  detailedContent,
  moderateContent,
  minimalContent,
  examples = [],
  tips = [],
  resources = [],
  initialExpanded = false,
  hideForAdvanced = false,
  variant = 'default',  // 'default', 'compact', 'inline'
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const { scaffoldingLevel, expertiseLevel, markHintAsViewed, isHintViewed } = useScaffolding();

  // Verifica se este componente deve ser exibido com base no nível de expertise
  if (hideForAdvanced && scaffoldingLevel === SCAFFOLDING_LEVELS.MINIMAL) {
    return null;
  }
  
  const handleToggle = () => {
    setExpanded(!expanded);
    if (id && !isHintViewed(id)) {
      markHintAsViewed(id);
    }
  };
  
  // Seleciona o conteúdo apropriado com base no nível de scaffolding
  const getContent = () => {
    switch (scaffoldingLevel) {
      case SCAFFOLDING_LEVELS.DETAILED:
        return detailedContent;
      case SCAFFOLDING_LEVELS.MODERATE:
        return moderateContent || detailedContent;
      case SCAFFOLDING_LEVELS.MINIMAL:
        return minimalContent || moderateContent || detailedContent;
      default:
        return detailedContent;
    }
  };
  
  // Filtra exemplos e dicas com base no nível de scaffolding
  const getExamples = () => {
    if (scaffoldingLevel === SCAFFOLDING_LEVELS.MINIMAL) {
      return examples.filter(ex => ex.essential);
    }
    return examples;
  };
  
  const getTips = () => {
    if (scaffoldingLevel === SCAFFOLDING_LEVELS.MINIMAL) {
      return tips.filter(tip => tip.essential);
    }
    return tips;
  };
  
  const getResources = () => {
    if (scaffoldingLevel === SCAFFOLDING_LEVELS.MINIMAL) {
      return resources.filter(res => res.essential);
    }
    return resources;
  };

  // Renderiza o conteúdo da ajuda
  const renderContent = () => (
    <Box sx={{ mt: expanded ? 2 : 0 }}>
      {/* Conteúdo principal */}
      {getContent() && (
        <Typography variant="body2" paragraph>
          {getContent()}
        </Typography>
      )}
      
      {/* Exemplos */}
      {getExamples().length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon fontSize="small" sx={{ mr: 0.5 }} />
            Exemplos
          </Typography>
          <List dense disablePadding>
            {getExamples().map((example, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <ArrowRightIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={example.title || example.text}
                  secondary={scaffoldingLevel !== SCAFFOLDING_LEVELS.MINIMAL ? example.description : null}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      {/* Dicas */}
      {getTips().length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <TipsAndUpdatesIcon fontSize="small" sx={{ mr: 0.5 }} />
            Dicas úteis
          </Typography>
          <List dense disablePadding>
            {getTips().map((tip, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <ArrowRightIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={tip.text}
                  secondary={scaffoldingLevel !== SCAFFOLDING_LEVELS.MINIMAL ? tip.explanation : null}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      {/* Recursos adicionais */}
      {getResources().length > 0 && (
        <Box sx={{ mb: 1 }}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" gutterBottom>
            Recursos adicionais
          </Typography>
          <List dense disablePadding>
            {getResources().map((resource, index) => (
              <ListItem key={index} sx={{ py: 0.25 }}>
                <Link 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {resource.title}
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );

  // Versão compacta (apenas botão de ajuda com conteúdo em collapse)
  if (variant === 'compact') {
    return (
      <Box>
        <Button
          size="small"
          startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={handleToggle}
          sx={{ mb: 1 }}
        >
          {title}
        </Button>
        <Collapse in={expanded}>
          {renderContent()}
        </Collapse>
      </Box>
    );
  }
  
  // Versão inline (sem papel, apenas texto e toggler)
  if (variant === 'inline') {
    return (
      <Box sx={{ my: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            cursor: 'pointer',
            color: 'primary.main'
          }}
          onClick={handleToggle}
        >
          <HelpOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {title}
          </Typography>
          {expanded ? <ExpandLessIcon fontSize="small" sx={{ ml: 0.5 }} /> : <ExpandMoreIcon fontSize="small" sx={{ ml: 0.5 }} />}
        </Box>
        <Collapse in={expanded}>
          <Box sx={{ pl: 3, mt: 1, borderLeft: '2px solid', borderColor: 'primary.light' }}>
            {renderContent()}
          </Box>
        </Collapse>
      </Box>
    );
  }

  // Versão padrão (com papel)
  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2,
        mt: 2, 
        mb: 2,
        backgroundColor: 'background.default'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={handleToggle}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HelpOutlineIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1">
            {title}
          </Typography>
        </Box>
        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Box>
      
      <Collapse in={expanded}>
        <Divider sx={{ my: 1.5 }} />
        {renderContent()}
      </Collapse>
    </Paper>
  );
};

export default ContextualHelp;
