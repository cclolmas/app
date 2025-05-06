import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Grid, TextField,
  FormControl, InputLabel, Select, MenuItem, Button,
  Chip, Alert, IconButton, Divider, Paper, List, ListItem,
  ListItemText, ListItemSecondaryAction, Tooltip
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import PreviewIcon from '@mui/icons-material/Preview';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DatasetPreview from './DatasetPreview';

const DatasetSelection = ({ config, onConfigUpdate, advancedMode, errors }) => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(config.dataset);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [validationSplit, setValidationSplit] = useState(config.validationSplit);
  const [dataFormat, setDataFormat] = useState(config.dataFormat);
  
  // Função para carregar datasets disponíveis
  useEffect(() => {
    // Em uma implementação real, isso seria uma chamada de API
    const fetchDatasets = async () => {
      // Dados simulados
      const mockDatasets = [
        { 
          id: 'alpaca-gpt4-subset', 
          name: 'Alpaca-GPT4 (Subset)',
          description: 'Conjunto de dados de instruções geradas por GPT-4 (versão reduzida)',
          format: 'json',
          samples: 1000,
          sizeInGB: 0.05,
          tags: ['instruções', 'gpt4', 'geral']
        },
        { 
          id: 'code-helpers', 
          name: 'Auxiliares de Código',
          description: 'Exemplos de snippets de código com explicações',
          format: 'json',
          samples: 500,
          sizeInGB: 0.03,
          tags: ['código', 'documentação', 'python']
        },
        { 
          id: 'bugfix-examples', 
          name: 'Exemplos de Correção de Bugs',
          description: 'Problemas de código e suas soluções',
          format: 'json',
          samples: 300,
          sizeInGB: 0.02,
          tags: ['correção', 'bugs', 'código']
        }
      ];
      
      setDatasets(mockDatasets);
      
      // Se não houver dataset selecionado e existirem datasets disponíveis
      if (!selectedDataset && mockDatasets.length > 0) {
        setSelectedDataset(mockDatasets[0]);
        onConfigUpdate({ dataset: mockDatasets[0] });
      }
    };
    
    fetchDatasets();
  }, []);
  
  // Função para selecionar um dataset
  const handleDatasetSelect = (dataset) => {
    setSelectedDataset(dataset);
    onConfigUpdate({ dataset });
  };
  
  // Função para atualizar a divisão de validação
  const handleValidationSplitChange = (e) => {
    const value = parseFloat(e.target.value);
    setValidationSplit(value);
    onConfigUpdate({ validationSplit: value });
  };
  
  // Função para atualizar o formato de dados
  const handleDataFormatChange = (e) => {
    const format = e.target.value;
    setDataFormat(format);
    onConfigUpdate({ dataFormat: format });
  };
  
  // Função para abrir o modal de visualização do dataset
  const handlePreviewClick = () => {
    setPreviewOpen(true);
  };
  
  // Função para upload de dataset personalizado
  const handleDatasetUpload = (e) => {
    // Em uma implementação real, isso enviaria o arquivo para o servidor
    const file = e.target.files[0];
    if (file) {
      alert(`Upload do arquivo ${file.name} simulado. Em uma aplicação real, este arquivo seria processado.`);
      
      // Criar um objeto dataset simulado
      const customDataset = {
        id: `custom-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        description: 'Dataset personalizado',
        format: file.name.endsWith('.json') ? 'json' : file.name.endsWith('.csv') ? 'csv' : 'texto',
        samples: Math.floor(file.size / 500), // Estimativa grosseira
        sizeInGB: file.size / (1024 * 1024 * 1024),
        tags: ['personalizado'],
        custom: true
      };
      
      setDatasets([customDataset, ...datasets]);
      setSelectedDataset(customDataset);
      onConfigUpdate({ dataset: customDataset });
    }
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Selecione o Conjunto de Dados
      </Typography>
      
      <Typography variant="body2" paragraph color="text.secondary">
        Escolha um conjunto de dados para ajustar o modelo. A qualidade e relevância dos dados 
        são fatores críticos para o sucesso do fine-tuning.
      </Typography>
      
      {errors && errors.dataset && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.dataset}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3 }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileIcon />}
              sx={{ mb: 2 }}
            >
              Carregar Dataset Personalizado
              <input
                type="file"
                hidden
                accept=".json,.jsonl,.csv,.txt"
                onChange={handleDatasetUpload}
              />
            </Button>
            
            <Typography variant="caption" display="block" color="text.secondary">
              Formatos aceitos: JSON, JSONL, CSV, TXT
            </Typography>
          </Box>
          
          <Typography variant="subtitle2" gutterBottom>
            Datasets Disponíveis
          </Typography>
          
          <List component={Paper} variant="outlined" sx={{ mb: 3, maxHeight: 300, overflow: 'auto' }}>
            {datasets.map((dataset) => (
              <ListItem
                key={dataset.id}
                button
                selected={selectedDataset && selectedDataset.id === dataset.id}
                onClick={() => handleDatasetSelect(dataset)}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DescriptionOutlinedIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                      <Typography variant="subtitle2">{dataset.name}</Typography>
                      {dataset.custom && (
                        <Chip size="small" label="Personalizado" sx={{ ml: 1 }} variant="outlined" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {dataset.description}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip 
                          size="small" 
                          label={`${dataset.samples} amostras`} 
                          sx={{ mr: 0.5, fontSize: '0.7rem' }}
                        />
                        <Chip 
                          size="small" 
                          label={`${dataset.sizeInGB.toFixed(2)} GB`}
                          sx={{ mr: 0.5, fontSize: '0.7rem' }} 
                        />
                        <Chip 
                          size="small" 
                          label={dataset.format.toUpperCase()} 
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Visualizar amostras">
                    <IconButton edge="end" onClick={handlePreviewClick}>
                      <PreviewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            
            {datasets.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="Nenhum dataset disponível"
                  secondary="Carregue um dataset personalizado ou crie um novo"
                />
              </ListItem>
            )}
          </List>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Configurações do Dataset
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel id="data-format-label">Formato dos Dados</InputLabel>
                <Select
                  labelId="data-format-label"
                  value={dataFormat}
                  label="Formato dos Dados"
                  onChange={handleDataFormatChange}
                >
                  <MenuItem value="json">JSON</MenuItem>
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="text">Texto Simples</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Divisão de Validação"
                type="number"
                value={validationSplit}
                onChange={handleValidationSplitChange}
                fullWidth
                margin="normal"
                InputProps={{ 
                  inputProps: { min: 0, max: 0.5, step: 0.05 }
                }}
                size="small"
                helperText="Porcentagem dos dados usada para validação (0.1 = 10%)"
              />
            </Box>
            
            {advancedMode && (
              <>
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Configurações Avançadas
                </Typography>
                
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel id="text-column-label">Coluna de Texto</InputLabel>
                  <Select
                    labelId="text-column-label"
                    value="text"
                    label="Coluna de Texto"
                  >
                    <MenuItem value="text">text</MenuItem>
                    <MenuItem value="content">content</MenuItem>
                    <MenuItem value="input">input</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel id="preprocessing-label">Pré-processamento</InputLabel>
                  <Select
                    labelId="preprocessing-label"
                    value="default"
                    label="Pré-processamento"
                  >
                    <MenuItem value="default">Padrão</MenuItem>
                    <MenuItem value="clean_whitespace">Limpar Espaços em Branco</MenuItem>
                    <MenuItem value="remove_html">Remover Tags HTML</MenuItem>
                    <MenuItem value="custom">Personalizado</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </Paper>
          
          {selectedDataset && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" icon={<InfoIcon />}>
                <Typography variant="body2">
                  O dataset selecionado tem {selectedDataset.samples} amostras e tamanho de {selectedDataset.sizeInGB.toFixed(2)} GB.
                </Typography>
              </Alert>
            </Box>
          )}
        </Grid>
      </Grid>
      
      {/* Modal de visualização do dataset */}
      <DatasetPreview 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)} 
        dataset={selectedDataset}
      />
    </Box>
  );
};

export default DatasetSelection;
