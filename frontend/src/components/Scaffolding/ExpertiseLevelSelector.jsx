import React from 'react';
import { 
  Box, 
  ToggleButtonGroup, 
  ToggleButton, 
  Typography,
  Tooltip,
  Paper
} from '@mui/material';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SchoolIcon from '@mui/icons-material/School';
import { useScaffolding, EXPERTISE_LEVELS } from '../../contexts/ScaffoldingContext';

/**
 * Componente que permite ao usuário selecionar seu nível de expertise
 * e ajusta o nível de scaffolding correspondentemente.
 */
const ExpertiseLevelSelector = ({ compact = false }) => {
  const { expertiseLevel, updateExpertiseLevel } = useScaffolding();
  
  const handleExpertiseLevelChange = (event, newLevel) => {
    if (newLevel !== null) {
      updateExpertiseLevel(newLevel);
    }
  };
  
  // Versão compacta (apenas ícones com tooltip)
  if (compact) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ display: 'inline-flex', p: 0.5, borderRadius: 2 }}>
        <ToggleButtonGroup
          value={expertiseLevel}
          exclusive
          onChange={handleExpertiseLevelChange}
          aria-label="nível de expertise"
          size="small"
        >
          <Tooltip title="Iniciante: Mais orientações e explicações detalhadas">
            <ToggleButton value={EXPERTISE_LEVELS.BEGINNER} aria-label="iniciante">
              <EmojiPeopleIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
          
          <Tooltip title="Intermediário: Explicações balanceadas">
            <ToggleButton value={EXPERTISE_LEVELS.INTERMEDIATE} aria-label="intermediário">
              <SchoolIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
          
          <Tooltip title="Avançado: Explicações concisas e acesso a recursos avançados">
            <ToggleButton value={EXPERTISE_LEVELS.ADVANCED} aria-label="avançado">
              <PsychologyIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Paper>
    );
  }
  
  // Versão completa com texto explicativo
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Nível de orientação
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ajuste o nível de detalhamento das instruções e explicações de acordo com sua experiência.
      </Typography>
      
      <ToggleButtonGroup
        value={expertiseLevel}
        exclusive
        onChange={handleExpertiseLevelChange}
        aria-label="nível de expertise"
      >
        <ToggleButton value={EXPERTISE_LEVELS.BEGINNER} aria-label="iniciante">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EmojiPeopleIcon sx={{ mr: 1 }} />
            <Box>
              <Typography variant="body2">Iniciante</Typography>
              {!compact && (
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Instruções detalhadas
                </Typography>
              )}
            </Box>
          </Box>
        </ToggleButton>
        
        <ToggleButton value={EXPERTISE_LEVELS.INTERMEDIATE} aria-label="intermediário">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 1 }} />
            <Box>
              <Typography variant="body2">Intermediário</Typography>
              {!compact && (
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Instruções balanceadas
                </Typography>
              )}
            </Box>
          </Box>
        </ToggleButton>
        
        <ToggleButton value={EXPERTISE_LEVELS.ADVANCED} aria-label="avançado">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PsychologyIcon sx={{ mr: 1 }} />
            <Box>
              <Typography variant="body2">Avançado</Typography>
              {!compact && (
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Instruções concisas
                </Typography>
              )}
            </Box>
          </Box>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default ExpertiseLevelSelector;
