import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Slider, 
  Button, 
  Paper, 
  Grid, 
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { submitCognitiveLoadAssessment } from '../../services/cognitiveLoadService';

const dimensionDescriptions = {
  complexity: "Quão complexo o conteúdo pareceu para você? (1: muito simples, 9: extremamente complexo)",
  usability: "Quão fácil foi usar a interface/ferramentas? (1: muito fácil, 9: muito difícil)",
  effort: "Quanto esforço mental você precisou investir? (1: muito pouco, 9: extremo)",
  confidence: "Quão confiante você está na sua solução/compreensão? (1: nada confiante, 9: totalmente confiante)",
  frustration: "Quão frustrado ou ansioso você se sentiu durante a tarefa? (1: nada, 9: extremamente)",
  germane: "Quanto você acredita ter aprendido/desenvolvido esquemas mentais? (1: nada, 9: muito)",
  transfer: "Quão capaz você se sente de aplicar isso em novos contextos? (1: incapaz, 9: totalmente capaz)"
};

const AssessmentForm = ({ taskId, taskTitle, configOptions = [] }) => {
  const [assessmentData, setAssessmentData] = useState({
    task_id: taskId,
    complexity: 5,
    usability: 5,
    effort: 5,
    confidence: 5,
    frustration: 5,
    germane: 5,
    transfer: 5,
    config_type: configOptions.length ? configOptions[0].value : '',
    notes: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: false, error: null });
  
  const handleSliderChange = (dimension) => (event, newValue) => {
    setAssessmentData({ ...assessmentData, [dimension]: newValue });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setAssessmentData({ ...assessmentData, [name]: value });
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitStatus({ success: false, error: null });
    
    try {
      await submitCognitiveLoadAssessment(assessmentData);
      setSubmitStatus({ success: true, error: null });
      // Optional: Reset form or show confirmation
    } catch (error) {
      setSubmitStatus({ 
        success: false, 
        error: "Não foi possível enviar sua avaliação. Por favor, tente novamente."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getDimensionLabel = (dimension, value) => {
    const labels = {
      complexity: ['Muito simples', 'Simples', 'Moderadamente simples', 'Ligeiramente simples', 
                  'Neutro', 'Ligeiramente complexo', 'Moderadamente complexo', 'Complexo', 'Extremamente complexo'],
      usability: ['Muito fácil', 'Fácil', 'Moderadamente fácil', 'Ligeiramente fácil', 
                 'Neutro', 'Ligeiramente difícil', 'Moderadamente difícil', 'Difícil', 'Muito difícil'],
      effort: ['Muito baixo', 'Baixo', 'Moderadamente baixo', 'Ligeiramente baixo', 
              'Médio', 'Ligeiramente alto', 'Moderadamente alto', 'Alto', 'Muito alto'],
      confidence: ['Nada confiante', 'Pouco confiante', 'Algo confiante', 'Ligeiramente confiante', 
                  'Neutro', 'Razoavelmente confiante', 'Moderadamente confiante', 'Confiante', 'Completamente confiante'],
      frustration: ['Nenhuma', 'Muito baixa', 'Baixa', 'Ligeiramente baixa', 
                   'Média', 'Ligeiramente alta', 'Moderadamente alta', 'Alta', 'Extrema'],
      germane: ['Nada', 'Muito pouco', 'Pouco', 'Ligeiramente pouco', 
               'Médio', 'Ligeiramente muito', 'Moderadamente muito', 'Muito', 'Extremamente muito'],
      transfer: ['Incapaz', 'Muito pouco capaz', 'Pouco capaz', 'Ligeiramente capaz', 
                'Moderadamente capaz', 'Razoavelmente capaz', 'Capaz', 'Muito capaz', 'Completamente capaz']
    };
    
    return labels[dimension][value - 1];
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Avaliação de Carga Cognitiva
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        Tarefa: {taskTitle || `ID #${taskId}`}
      </Typography>
      
      <Typography variant="body2" paragraph color="text.secondary">
        Esta avaliação nos ajuda a entender seu esforço cognitivo e melhorar o design de atividades.
        Por favor, avalie cada dimensão na escala de 1 a 9.
      </Typography>
      
      {submitStatus.success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Avaliação enviada com sucesso! Obrigado pelo seu feedback.
        </Alert>
      )}
      
      {submitStatus.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitStatus.error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {Object.entries(dimensionDescriptions).map(([dimension, description]) => (
            <Grid item xs={12} key={dimension}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography id={`${dimension}-slider-label`}>
                  {dimension.charAt(0).toUpperCase() + dimension.slice(1)}
                </Typography>
                <Tooltip title={description} placement="right">
                  <HelpOutlineIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                  <Slider
                    value={assessmentData[dimension]}
                    onChange={handleSliderChange(dimension)}
                    aria-labelledby={`${dimension}-slider-label`}
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={1}
                    max={9}
                    sx={{ color: dimension === 'frustration' ? 'warning.main' : null }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary" align="right">
                    {getDimensionLabel(dimension, assessmentData[dimension])}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          ))}
          
          {configOptions.length > 0 && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="config-type-label">Configuração</InputLabel>
                <Select
                  labelId="config-type-label"
                  name="config_type"
                  value={assessmentData.config_type}
                  onChange={handleInputChange}
                  label="Configuração"
                >
                  {configOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <TextField
              name="notes"
              label="Observações (opcional)"
              multiline
              rows={3}
              value={assessmentData.notes}
              onChange={handleInputChange}
              fullWidth
              placeholder="Compartilhe desafios específicos, insights ou feedback..."
            />
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={24} /> : 'Enviar Avaliação'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default AssessmentForm;
