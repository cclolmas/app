import React, { useState } from 'react';
import { Tooltip, Typography, Box, IconButton, Link } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoIcon from '@mui/icons-material/Info';
import { useScaffolding, SCAFFOLDING_LEVELS } from '../../contexts/ScaffoldingContext';

/**
 * Tooltip adaptativo que mostra diferentes níveis de detalhamento baseado no nível de expertise
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Elemento que receberá o tooltip
 * @param {string} props.id - ID único para o tooltip
 * @param {string} props.detailedText - Texto explicativo detalhado (para iniciantes)
 * @param {string} props.moderateText - Texto explicativo moderado (para intermediários)
 * @param {string} props.minimalText - Texto explicativo conciso (para avançados)
 * @param {string} props.title - Título opcional para o tooltip
 * @param {string} props.learnMoreLink - Link para mais informações
 * @param {boolean} props.showIcon - Se deve mostrar ícone de ajuda (se children for fornecido)
 * @param {string} props.placement - Posicionamento do tooltip
 */
const AdaptiveTooltip = ({
  children,
  id,
  detailedText,
  moderateText,
  minimalText,
  title,
  learnMoreLink,
  showIcon = true,
  placement = 'top',
  ...tooltipProps
}) => {
  const [open, setOpen] = useState(false);
  const { scaffoldingLevel, markHintAsViewed } = useScaffolding();
  
  // Seleciona o texto baseado no nível de scaffolding
  const getTooltipText = () => {
    switch (scaffoldingLevel) {
      case SCAFFOLDING_LEVELS.DETAILED:
        return detailedText;
      case SCAFFOLDING_LEVELS.MODERATE:
        return moderateText || detailedText;
      case SCAFFOLDING_LEVELS.MINIMAL:
        return minimalText || moderateText || detailedText;
      default:
        return detailedText;
    }
  };

  // Estilo para o tooltip baseado no nível de scaffolding
  const getTooltipStyle = () => {
    switch (scaffoldingLevel) {
      case SCAFFOLDING_LEVELS.DETAILED:
        return { maxWidth: 350 };
      case SCAFFOLDING_LEVELS.MODERATE:
        return { maxWidth: 300 };
      case SCAFFOLDING_LEVELS.MINIMAL:
        return { maxWidth: 250 };
      default:
        return { maxWidth: 300 };
    }
  };
  
  const handleOpen = () => {
    setOpen(true);
    if (id) markHintAsViewed(id);
  };
  
  const handleClose = () => {
    setOpen(false);
  };

  // Componente para o conteúdo do tooltip
  const TooltipContent = () => (
    <Box sx={{ p: 0.5 }}>
      {title && (
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {title}
        </Typography>
      )}
      <Typography variant="body2">{getTooltipText()}</Typography>
      
      {learnMoreLink && scaffoldingLevel !== SCAFFOLDING_LEVELS.MINIMAL && (
        <Link 
          href={learnMoreLink}
          target="_blank"
          rel="noopener"
          sx={{ display: 'block', fontSize: '0.8rem', mt: 1 }}
        >
          Saiba mais
        </Link>
      )}
    </Box>
  );

  // Se tiver children, envolve-os com o tooltip
  if (children) {
    return (
      <Tooltip
        title={<TooltipContent />}
        open={open}
        onOpen={handleOpen}
        onClose={handleClose}
        placement={placement}
        arrow
        PopperProps={{
          sx: getTooltipStyle()
        }}
        {...tooltipProps}
      >
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          {children}
          {showIcon && (
            <IconButton 
              size="small" 
              sx={{ ml: 0.5, p: 0.2 }}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(prev => !prev);
              }}
            >
              <HelpOutlineIcon fontSize="small" color="action" />
            </IconButton>
          )}
        </Box>
      </Tooltip>
    );
  }

  // Se não tiver children, mostrar apenas um ícone de ajuda
  return (
    <Tooltip
      title={<TooltipContent />}
      placement={placement}
      arrow
      PopperProps={{
        sx: getTooltipStyle()
      }}
      {...tooltipProps}
    >
      <IconButton size="small" color="primary">
        <InfoIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default AdaptiveTooltip;
