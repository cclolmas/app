import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent,
  IconButton, Grid, MenuItem, Select, FormControl,
  InputLabel, Chip, Divider, Alert, FormHelperText,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, Tooltip, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MemoryIcon from '@mui/icons-material/Memory';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { estimateAgentCompL } from '../../utils/lmasUtils';
import ModelSelector from '../ModelConfiguration/ModelSelector';
import CompLIndicator from './CompLIndicator';

// Lista de possíveis papéis predefinidos
const PREDEFINED_ROLES = [
  { id: 'researcher', name: 'Pesquisador', description: 'Coleta e analisa informações' },
  { id: 'coder', name: 'Programador', description: 'Escreve e revisa código' },
  { id: 'critic', name: 'Crítico', description: 'Avalia resultados e sugere melhorias' },
  { id: 'planner', name: 'Planejador', description: 'Define estratégias e organiza tarefas' },
  { id: 'user_proxy', name: 'Proxy do Usuário', description: 'Simula interações do usuário' }
];

// Lista de ferramentas disponíveis
const AVAILABLE_TOOLS = [
  { id: 'web_search', name: 'Busca Web', description: 'Realiza buscas na web' },
  { id: 'code_executor', name: 'Executor de Código', description: 'Executa código em ambiente sandbox' },
  { id: 'file_reader', name: 'Leitor de Arquivos', description: 'Lê arquivos do projeto' },
  { id: 'memory', name: 'Memória', description: 'Armazena e recupera informações' }
];

const AgentDefinition = ({ agents, onUpdate, systemMetrics, validationErrors }) => {
  const [currentAgent, setCurrentAgent] = useState(null);
  const [editIndex, setEditIndex] = useState(-1);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleAddAgent = () => {
    setCurrentAgent({
      id: `agent_${Date.now()}`,
      name: '',
      role: '',
      customRole: false,
      description: '',
      model: null,
      tools: [],
      systemPrompt: '',
    });
    setEditIndex(-1);
    setDialogOpen(true);
  };

  const handleEditAgent = (index) => {
    setCurrentAgent({ ...agents[index] });
    setEditIndex(index);
    setDialogOpen(true);
  };

  const handleDeleteAgent = (index) => {
    const newAgents = [...agents];
    newAgents.splice(index, 1);
    onUpdate(newAgents);
  };

  const handleSaveAgent = () => {
    if (editIndex === -1) {
      onUpdate([...agents, currentAgent]);
    } else {
      const newAgents = [...agents];
      newAgents[editIndex] = currentAgent;
      onUpdate(newAgents);
    }
    setDialogOpen(false);
    setCurrentAgent(null);
  };

  const handleAgentChange = (field, value) => {
    setCurrentAgent({ ...currentAgent, [field]: value });
  };

  const handleModelSelect = (model) => {
    setCurrentAgent({ ...currentAgent, model });
  };

  const handleRoleSelect = (roleId) => {
    if (roleId === 'custom') {
      setCurrentAgent({ 
        ...currentAgent, 
        role: '', 
        customRole: true 
      });
    } else {
      const selectedRole = PREDEFINED_ROLES.find(r => r.id === roleId);
      setCurrentAgent({ 
        ...currentAgent, 
        role: roleId,
        description: selectedRole?.description || currentAgent.description,
        customRole: false
      });
    }
  };

  const handleToolToggle = (toolId) => {
    const currentTools = currentAgent.tools || [];
    const toolIndex = currentTools.findIndex(t => t === toolId);
    
    if (toolIndex === -1) {
      // Add the tool
      setCurrentAgent({ ...currentAgent, tools: [...currentTools, toolId] });
    } else {
      // Remove the tool
      const newTools = [...currentTools];
      newTools.splice(toolIndex, 1);
      setCurrentAgent({ ...currentAgent, tools: newTools });
    }
  };

  // Verificar se um agente tem erro de validação
  const getAgentError = (index) => {
    if (validationErrors && validationErrors.agents && validationErrors.agents[index]) {
      return validationErrors.agents[index];
    }
    return null;
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Agentes Definidos ({agents.length})
        </Typography>
        {agents.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Nenhum agente definido. Adicione agentes para construir seu sistema.
          </Alert>
        ) : null}
      </Box>

      <Grid container spacing={2}>
        {agents.map((agent, index) => {
          const agentError = getAgentError(index);
          const compLEstimate = estimateAgentCompL(agent, systemMetrics);
          
          return (
            <Grid item xs={12} md={6} lg={4} key={agent.id}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderColor: agentError ? 'error.main' : 'transparent',
                  borderWidth: agentError ? 1 : 0,
                  borderStyle: 'solid'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }}>
                      {agent.name}
                    </Typography>
                    
                    <Box>
                      <Tooltip title="Editar agente">
                        <IconButton size="small" onClick={() => handleEditAgent(index)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir agente">
                        <IconButton size="small" onClick={() => handleDeleteAgent(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <Chip 
                    label={PREDEFINED_ROLES.find(r => r.id === agent.role)?.name || agent.role || "Papel personalizado"} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, height: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {agent.description}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MemoryIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {agent.model?.name || "Modelo não definido"}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 1 }}>
                    <CompLIndicator 
                      compLEstimate={compLEstimate}
                      compact={true}
                    />
                  </Box>
                  
                  {agent.tools && agent.tools.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Ferramentas:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {agent.tools.map(toolId => {
                          const tool = AVAILABLE_TOOLS.find(t => t.id === toolId);
                          return (
                            <Chip 
                              key={toolId}
                              label={tool?.name || toolId}
                              size="small"
                              variant="outlined"
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                  
                  {agentError && (
                    <Alert severity="error" sx={{ mt: 1 }} size="small">
                      {agentError}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            sx={{ 
              height: '100%', 
              minHeight: '200px',
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              backgroundColor: 'action.hover',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.selected',
              }
            }} 
            onClick={handleAddAgent}
          >
            <Box sx={{ textAlign: 'center' }}>
              <IconButton size="large" color="primary">
                <AddIcon fontSize="large" />
              </IconButton>
              <Typography>Adicionar Agente</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog for adding/editing agents */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editIndex === -1 ? 'Adicionar Novo Agente' : 'Editar Agente'}
        </DialogTitle>
        
        <DialogContent dividers>
          {currentAgent && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Nome do Agente"
                  value={currentAgent.name}
                  onChange={(e) => handleAgentChange('name', e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                />
                
                <FormControl fullWidth margin="normal">
                  <InputLabel id="agent-role-label">Papel do Agente</InputLabel>
                  <Select
                    labelId="agent-role-label"
                    value={currentAgent.customRole ? 'custom' : currentAgent.role}
                    onChange={(e) => handleRoleSelect(e.target.value)}
                    label="Papel do Agente"
                  >
                    {PREDEFINED_ROLES.map(role => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                    <MenuItem value="custom">Papel Personalizado</MenuItem>
                  </Select>
                </FormControl>
                
                {currentAgent.customRole && (
                  <TextField
                    label="Nome do Papel Personalizado"
                    value={currentAgent.role}
                    onChange={(e) => handleAgentChange('role', e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                )}
                
                <TextField
                  label="Descrição do Agente"
                  value={currentAgent.description}
                  onChange={(e) => handleAgentChange('description', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Modelo LLM
                </Typography>
                
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  {currentAgent.model ? (
                    <Box>
                      <Typography variant="body1">{currentAgent.model.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentAgent.model.parameters} parâmetros • {currentAgent.model.quantization || 'Q8'}
                      </Typography>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        sx={{ mt: 1 }}
                        onClick={() => handleAgentChange('model', null)}
                      >
                        Trocar Modelo
                      </Button>
                    </Box>
                  ) : (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => {
                        // Aqui, você poderia abrir um diálogo para selecionar o modelo
                        // Por simplicidade, vamos só demonstrar um modelo pré-configurado
                        handleModelSelect({
                          id: 'mistral-7b',
                          name: 'Mistral 7B',
                          parameters: 7,
                          quantization: 'Q4',
                          contextSize: 4096
                        });
                      }}
                    >
                      Selecionar Modelo
                    </Button>
                  )}
                </Paper>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Ferramentas
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {AVAILABLE_TOOLS.map(tool => (
                      <Chip
                        key={tool.id}
                        label={tool.name}
                        onClick={() => handleToolToggle(tool.id)}
                        color={currentAgent.tools?.includes(tool.id) ? 'primary' : 'default'}
                        variant={currentAgent.tools?.includes(tool.id) ? 'filled' : 'outlined'}
                        clickable
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Prompt do Sistema
                  </Typography>
                  <TextField
                    value={currentAgent.systemPrompt}
                    onChange={(e) => handleAgentChange('systemPrompt', e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Instrução que define o comportamento do agente..."
                  />
                </Box>
              </Grid>
              
              {currentAgent.model && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1">
                      Estimativa de Carga Computacional (CompL)
                    </Typography>
                    
                    <CompLIndicator
                      compLEstimate={estimateAgentCompL(currentAgent, systemMetrics)}
                      compact={false}
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveAgent} 
            color="primary" 
            variant="contained"
            disabled={!currentAgent?.name || !currentAgent?.role}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dicas para configuração */}
      {agents.length === 0 && (
        <Alert severity="info" icon={<LightbulbIcon />} sx={{ mt: 4 }}>
          <AlertTitle>Dicas para Definir Agentes</AlertTitle>
          <ul>
            <li>Defina agentes com papéis específicos e complementares</li>
            <li>Escolha modelos menores (7B) para agentes com tarefas mais simples</li>
            <li>Reserve modelos maiores para agentes com tarefas complexas</li>
            <li>Use prompts de sistema claros para orientar o comportamento de cada agente</li>
          </ul>
        </Alert>
      )}
    </Box>
  );
};

export default AgentDefinition;
