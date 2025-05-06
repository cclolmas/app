import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, 
  CardActions, Button, Chip, Avatar,
  Paper, Divider, TextField, InputAdornment,
  IconButton, CircularProgress, Alert,
  Tab, Tabs, FormControl, InputLabel,
  Select, MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import { reflectionService } from '../../services/reflectionService';
import ReflectionDetail from './ReflectionDetail';

/**
 * Componente que exibe uma galeria de reflexões compartilhadas
 * para permitir aprendizagem colaborativa
 */
const ReflectionGallery = () => {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [taskTypeFilter, setTaskTypeFilter] = useState('all');
  const [selectedReflection, setSelectedReflection] = useState(null);
  
  // Carregar reflexões compartilhadas
  useEffect(() => {
    const loadReflections = async () => {
      setLoading(true);
      try {
        let data;
        
        if (filter === 'my') {
          data = await reflectionService.getUserReflections();
        } else {
          const filters = {};
          if (taskTypeFilter !== 'all') {
            filters.taskType = taskTypeFilter;
          }
          data = await reflectionService.getSharedReflections(filters);
        }
        
        setReflections(data);
      } catch (err) {
        console.error('Erro ao carregar reflexões:', err);
        setError('Não foi possível carregar as reflexões. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadReflections();
  }, [filter, taskTypeFilter]);
  
  // Filtrar reflexões pelo termo de busca
  const filteredReflections = reflections.filter(reflection => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    
    // Buscar no título da tarefa
    if (reflection.taskName.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Buscar nas respostas
    return reflection.questions.some(q => 
      q.response.toLowerCase().includes(searchLower)
    );
  });
  
  // Manipulador para abrir detalhes da reflexão
  const handleOpenReflection = (reflection) => {
    setSelectedReflection(reflection);
  };
  
  // Manipulador para fechar detalhes da reflexão
  const handleCloseReflection = () => {
    setSelectedReflection(null);
  };
  
  // Renderiza uma card de reflexão
  const renderReflectionCard = (reflection) => {
    const { taskName, taskType, userName, timestamp, questions } = reflection;
    
    // Encontrar a primeira resposta sobre equilíbrio CL-CompL
    const clCompLQuestion = questions.find(q => q.id === 'cl_compl_balance');
    
    return (
      <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" component="h3" noWrap>
              {taskName}
            </Typography>
            <Chip 
              label={taskType === 'fine-tuning' ? 'Fine-Tuning' : 'LMAS'}
              size="small"
              color={taskType === 'fine-tuning' ? 'primary' : 'secondary'}
              variant="outlined"
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.light' }}>
              <AccountCircleIcon fontSize="small" />
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {userName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              {new Date(timestamp).toLocaleDateString()}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          {clCompLQuestion ? (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Sobre equilíbrio CL-CompL:
              </Typography>
              <Typography variant="body2" sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}>
                {clCompLQuestion.response}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Clique para ver a reflexão completa...
            </Typography>
          )}
        </CardContent>
        
        <CardActions>
          <Button 
            size="small" 
            onClick={() => handleOpenReflection(reflection)}
            startIcon={<PsychologyIcon />}
          >
            Ver Reflexão
          </Button>
        </CardActions>
      </Card>
    );
  };
  
  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        Galeria de Reflexões
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Explore reflexões compartilhadas para aprender com as experiências de outros estudantes.
        Estas reflexões oferecem insights valiosos sobre estratégias para gerenciar o equilíbrio entre
        Carga Cognitiva (CL) e Carga Computacional (CompL).
      </Typography>
      
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="Buscar reflexões..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="task-type-filter-label">Tipo de Tarefa</InputLabel>
            <Select
              labelId="task-type-filter-label"
              value={taskTypeFilter}
              onChange={(e) => setTaskTypeFilter(e.target.value)}
              label="Tipo de Tarefa"
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="fine-tuning">Fine-Tuning</MenuItem>
              <MenuItem value="lmas">LMAS</MenuItem>
            </Select>
          </FormControl>
          
          <Tabs
            value={filter}
            onChange={(e, newValue) => setFilter(newValue)}
            aria-label="filtros de reflexão"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab value="all" label="Todas" />
            <Tab value="my" label="Minhas Reflexões" />
          </Tabs>
        </Box>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredReflections.length === 0 ? (
        <Alert severity="info">
          Nenhuma reflexão encontrada para os filtros selecionados.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredReflections.map((reflection) => (
            <Grid item xs={12} sm={6} md={4} key={reflection.id}>
              {renderReflectionCard(reflection)}
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Modal de detalhes da reflexão */}
      {selectedReflection && (
        <ReflectionDetail
          reflection={selectedReflection}
          open={!!selectedReflection}
          onClose={handleCloseReflection}
        />
      )}
    </Box>
  );
};

export default ReflectionGallery;
