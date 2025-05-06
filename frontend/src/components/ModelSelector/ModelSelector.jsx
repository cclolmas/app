import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, 
  CardActions, Chip, Button, Tooltip, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, TextField,
  Divider, Alert, Accordion, AccordionSummary, AccordionDetails,
  FormControlLabel, Switch, Tab, Tabs, Rating, IconButton,
  Paper, Badge
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Memory as MemoryIcon, 
  Storage as StorageIcon,
  InfoOutlined as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Lightbulb as LightbulbIcon,
  FilterList as FilterListIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { getAvailableModels, checkModelCompatibility, getSystemMetrics } from '../../services/api';
import { formatBytes } from '../../utils/formatters';

const ModelSelector = ({ 
  onModelSelect, 
  preSelectedModelId = null,
  showOnlyCompatible = true
}) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [modelCompatibility, setModelCompatibility] = useState({});
  
  // Filtros
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelperCard, setShowHelperCard] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  
  // Carrega modelos e métricas do sistema
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [modelsData, metricsData] = await Promise.all([
          getAvailableModels(),
          getSystemMetrics()
        ]);
        
        setModels(modelsData);
        setSystemMetrics(metricsData);
        
        // Verifica compatibilidade de cada modelo
        const compatibilityChecks = {};
        await Promise.all(
          modelsData.map(async (model) => {
            const q4Compatibility = await checkModelCompatibility(model.id, 'Q4');
            const q8Compatibility = await checkModelCompatibility(model.id, 'Q8');
            
            compatibilityChecks[model.id] = {
              Q4: q4Compatibility,
              Q8: q8Compatibility,
              anyCompatible: q4Compatibility.compatible || q8Compatibility.compatible
            };
          })
        );
        
        setModelCompatibility(compatibilityChecks);
      } catch (err) {
        setError('Falha ao carregar modelos disponíveis');
        console.error('Error loading models:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Categorias de modelos para filtro
  const categories = [
    { id: 'all', name: 'Todos os Modelos' },
    { id: 'light', name: 'Leves (1-3B)' },
    { id: 'moderate', name: 'Moderados (4-10B)' },
    { id: 'demanding', name: 'Exigentes (11-50B)' },
    { id: 'very-demanding', name: 'Extremamente Exigentes (>50B)' }
  ];
  
  // Lista filtrada de modelos
  const filteredModels = useMemo(() => {
    return models.filter(model => {
      // Filtrar por categoria
      const categoryMatch = categoryFilter === 'all' || model.category === categoryFilter;
      
      // Filtrar por texto de busca
      const searchTerms = searchQuery.toLowerCase().split(' ');
      const searchMatch = searchTerms.every(term => 
        model.name.toLowerCase().includes(term) || 
        model.displayName.toLowerCase().includes(term) || 
        model.description.toLowerCase().includes(term) ||
        model.tags.some(tag => tag.toLowerCase().includes(term))
      );
      
      // Filtrar por compatibilidade se a opção estiver ativada
      const compatibilityMatch = !showOnlyCompatible || 
        (modelCompatibility[model.id] && modelCompatibility[model.id].anyCompatible);
      
      return categoryMatch && searchMatch && compatibilityMatch;
    });
  }, [models, categoryFilter, searchQuery, showOnlyCompatible, modelCompatibility]);
  
  // Função para obter cor da tag de categoria
  const getCategoryColor = (category) => {
    switch(category) {
      case 'light': return 'success';
      case 'moderate': return 'info';
      case 'demanding': return 'warning';
      case 'very-demanding': return 'error';
      default: return 'default';
    }
  };
  
  // Função para obter o ícone de compatibilidade adequado
  const getCompatibilityIcon = (modelId, quantization) => {
    if (!modelCompatibility[modelId]) return null;
    
    const compatibility = modelCompatibility[modelId][quantization];
    if (!compatibility) return null;
    
    if (compatibility.compatible) {
      return <CheckCircleIcon fontSize="small" color="success" />;
    } else if (compatibility.margin > -1 * 1024 * 1024 * 1024) { // Dentro de 1GB da necessidade
      return <WarningIcon fontSize="small" color="warning" />;
    } else {
      return <ErrorIcon fontSize="small" color="error" />;
    }
  };
  
  // Tab para alternar entre visualizações
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  
  // Card de ajuda para iniciantes
  const renderHelperCard = () => {
    if (!showHelperCard) return null;
    
    return (
      <Paper elevation={3} sx={{ p: 2, mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <LightbulbIcon sx={{ mr: 2, fontSize: '2rem' }} />
          <Box>
            <Typography variant="h6" gutterBottom>
              Dicas para Escolha do Modelo (H3, H4)
            </Typography>
            <Typography variant="body2" paragraph>
              A escolha do modelo impacta tanto o desempenho computacional (CompL) quanto seu esforço cognitivo (CL):
            </Typography>
            <Box component="ul" sx={{ pl: 2, mt: 0 }}>
              <Typography component="li" variant="body2">
                <b>Modelos maiores</b> geralmente produzem respostas de maior qualidade e mais estáveis, 
                <b> reduzindo sua carga cognitiva</b> de validação (H1).
              </Typography>
              <Typography component="li" variant="body2">
                <b>Quantização mais alta (Q8)</b> mantém melhor qualidade mas usa mais memória.
              </Typography>
              <Typography component="li" variant="body2">
                <b>Quantização mais baixa (Q4)</b> economiza memória mas pode gerar resultados menos estáveis, 
                <b> aumentando sua carga cognitiva</b> de verificação (H1).
              </Typography>
              <Typography component="li" variant="body2">
                <b>O "ponto ideal" (H3)</b> é o modelo mais capaz que seu hardware pode executar sem lentidão excessiva.
              </Typography>
            </Box>
          </Box>
          <IconButton 
            size="small" 
            sx={{ ml: 'auto' }}
            onClick={() => setShowHelperCard(false)}
          >
            ×
          </IconButton>
        </Box>
      </Paper>
    );
  };
  
  // Visualiza como cartões
  const renderCardView = () => {
    return (
      <Grid container spacing={3}>
        {filteredModels.map(model => {
          const q4Compatible = modelCompatibility[model.id]?.Q4?.compatible || false;
          const q8Compatible = modelCompatibility[model.id]?.Q8?.compatible || false;
          const modelCategory = categories.find(cat => cat.id === model.category)?.name || 'Desconhecido';
          
          return (
            <Grid item xs={12} sm={6} md={4} key={model.id}>
              <Card 
                raised={modelCompatibility[model.id]?.anyCompatible}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  opacity: modelCompatibility[model.id]?.anyCompatible ? 1 : 0.7,
                  border: modelCompatibility[model.id]?.anyCompatible ? '1px solid' : 'none',
                  borderColor: 'primary.main',
                  position: 'relative'
                }}
              >
                {/* Badge de recomendação para iniciantes (H4) */}
                {model.category === 'light' && (
                  <Chip 
                    label="Recomendado para Iniciantes" 
                    color="success" 
                    size="small"
                    sx={{ 
                      position: 'absolute', 
                      top: 10, 
                      right: 10, 
                      zIndex: 2 
                    }} 
                  />
                )}
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {model.displayName}
                  </Typography>
                  
                  <Box sx={{ mb: 1 }}>
                    <Chip 
                      size="small" 
                      color={getCategoryColor(model.category)} 
                      label={modelCategory} 
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip 
                      size="small" 
                      variant="outlined" 
                      label={`${model.parameters} parâmetros`} 
                      sx={{ mr: 1, mb: 1 }}
                    />
                    {model.tags.map(tag => (
                      <Chip 
                        key={tag} 
                        size="small" 
                        label={tag} 
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {model.description}
                  </Typography>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  {/* Requisitos de hardware */}
                  <Typography variant="subtitle2" gutterBottom>
                    Requisitos Mínimos:
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <MemoryIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        VRAM: {formatBytes(model.requirements.minimal.vram)}
                      </Typography>
                      <Tooltip 
                        title={`${q8Compatible ? 'Compatível' : 'Não compatível'} com seu hardware`} 
                        arrow
                      >
                        <Box sx={{ ml: 1 }}>{getCompatibilityIcon(model.id, 'Q8')}</Box>
                      </Tooltip>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <StorageIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        RAM: {formatBytes(model.requirements.minimal.ram)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Indicadores de desempenho */}
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Qualidade:</Typography>
                      <Rating value={model.performance.quality} readOnly size="small" precision={0.5} />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Velocidade:</Typography>
                      <Rating value={model.performance.speed} readOnly size="small" precision={0.5} />
                    </Box>
                    
                    <Tooltip 
                      title={
                        <React.Fragment>
                          <Typography variant="body2">
                            A estabilidade afeta sua carga cognitiva (CL):
                          </Typography>
                          <Typography variant="body2">
                            • Baixa estabilidade: Respostas mais inconsistentes, exige mais verificação (↑ CL)
                          </Typography>
                          <Typography variant="body2">
                            • Alta estabilidade: Respostas mais confiáveis, menos verificação (↓ CL)
                          </Typography>
                        </React.Fragment>
                      } 
                      arrow
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          Estabilidade em Q8:
                          <InfoIcon fontSize="inherit" sx={{ ml: 0.5, fontSize: '1rem' }} />
                        </Typography>
                        <Rating value={model.performance.stabilityQ8} readOnly size="small" precision={0.5} />
                      </Box>
                    </Tooltip>
                    
                    <Tooltip 
                      title="Quantização Q4 reduz VRAM mas pode impactar a estabilidade" 
                      arrow
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          Estabilidade em Q4:
                          <InfoIcon fontSize="inherit" sx={{ ml: 0.5, fontSize: '1rem' }} />
                        </Typography>
                        <Rating value={model.performance.stabilityQ4} readOnly size="small" precision={0.5} />
                      </Box>
                    </Tooltip>
                  </Box>
                  
                  {/* Compatibilidade com quantização */}
                  <Box sx={{ mt: 2 }}>
                    <Alert 
                      severity={q8Compatible ? 'success' : q4Compatible ? 'warning' : 'error'}
                      variant="outlined" 
                      icon={false}
                      sx={{ py: 0.5 }}
                    >
                      {q8Compatible ? (
                        <Typography variant="body2">
                          <strong>Compatível (Q8)</strong> - Qualidade máxima
                        </Typography>
                      ) : q4Compatible ? (
                        <Typography variant="body2">
                          <strong>Compatível apenas com Q4</strong> - Pode exigir mais verificação (↑CL)
                        </Typography>
                      ) : (
                        <Typography variant="body2">
                          <strong>Hardware insuficiente</strong> - Considere um modelo menor
                        </Typography>
                      )}
                    </Alert>
                    
                    {/* Trade-off CL-CompL para modelos muito grandes em hardware limitado */}
                    {model.category === 'demanding' && !q8Compatible && q4Compatible && (
                      <Tooltip
                        title="A execução com recursos limitados pode afetar a responsividade, aumentando o tempo de espera e potencialmente sua frustração (↑ CL)."
                        arrow
                      >
                        <Alert 
                          severity="info" 
                          sx={{ mt: 1, py: 0.5 }}
                          icon={<HelpIcon fontSize="inherit" />}
                        >
                          <Typography variant="caption">
                            Modelo grande em hardware limitado pode aumentar CL (H3)
                          </Typography>
                        </Alert>
                      </Tooltip>
                    )}
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    variant="contained" 
                    fullWidth
                    disabled={!modelCompatibility[model.id]?.anyCompatible}
                    onClick={() => onModelSelect(model)}
                  >
                    Selecionar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };
  
  // Visualização em tabela (para comparação)
  const renderTableView = () => {
    // Implementação da visualização em tabela
    return (
      <Paper sx={{ overflowX: 'auto' }}>
        <Box sx={{ minWidth: 800, p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Visualização comparativa ainda não implementada
          </Typography>
        </Box>
      </Paper>
    );
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Selecione um Modelo de Linguagem
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Escolha um modelo compatível com seu hardware para otimizar o equilíbrio entre carga cognitiva (CL) e computacional (CompL).
        </Typography>
      </Box>
      
      {/* Card de dicas para iniciantes */}
      {renderHelperCard()}
      
      {/* Filtros e controles */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              label="Buscar modelos"
              variant="outlined"
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-filter-label">Categoria</InputLabel>
              <Select
                labelId="category-filter-label"
                value={categoryFilter}
                label="Categoria"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch 
                  checked={showOnlyCompatible}
                  onChange={(e) => onModelSelect({ showOnlyCompatible: e.target.checked })}
                />
              }
              label="Mostrar apenas modelos compatíveis"
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Hardware Info */}
      {systemMetrics && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">
            Recursos disponíveis no seu sistema:
          </Typography>
          <Typography variant="body2">
            VRAM (GPU): {formatBytes(systemMetrics.vram.total)} • 
            RAM: {formatBytes(systemMetrics.ram.total)}
          </Typography>
        </Alert>
      )}
      
      {/* Tabs de visualização */}
      <Tabs 
        value={selectedTab} 
        onChange={handleTabChange}
        sx={{ mb: 3 }}
      >
        <Tab label="Cartões" />
        <Tab label="Comparativo" />
      </Tabs>
      
      {/* Contagem de resultados */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Exibindo {filteredModels.length} de {models.length} modelos
        </Typography>
      </Box>
      
      {/* Visualização selecionada */}
      {selectedTab === 0 ? renderCardView() : renderTableView()}
    </Container>
  );
};

export default ModelSelector;
