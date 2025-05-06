import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel,
  Radio, Paper, Button, Grid, Card, CardContent, IconButton, Alert,
  AlertTitle, Tab, Tabs, Tooltip, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SyncIcon from '@mui/icons-material/Sync';
import SchemaIcon from '@mui/icons-material/Schema';

import FlowEditor from './FlowEditor';

// Estilos para o workflow
const workflowStyles = {
  sequentialFlow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    overflowX: 'auto',
    padding: 2,
    '& > *': {
      flexShrink: 0,
    }
  },
  hierarchicalFlow: {
    padding: 2
  },
  debateFlow: {
    padding: 2
  },
  workflowBox: {
    padding: 2,
    border: '1px dashed',
    borderColor: 'divider',
    borderRadius: 1,
    minHeight: '200px',
    position: 'relative',
    marginTop: 2
  }
};

const WorkflowDefinition = ({ workflow, agents, onUpdate, validationErrors }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [currentConnection, setCurrentConnection] = useState(null);
  const [editConnectionIndex, setEditConnectionIndex] = useState(-1);
  
  const handleWorkflowTypeChange = (event) => {
    const newType = event.target.value;
    
    // Reiniciar conexões ao mudar o tipo de fluxo
    onUpdate({
      ...workflow,
      type: newType,
      connections: [],
      startNode: null
    });
  };
  
  const handleStartNodeChange = (event) => {
    onUpdate({
      ...workflow,
      startNode: event.target.value
    });
  };
  
  const handleAddConnection = () => {
    setCurrentConnection({
      from: '',
      to: '',
      condition: '',
      description: ''
    });
    setEditConnectionIndex(-1);
    setConnectionDialogOpen(true);
  };
  
  const handleEditConnection = (index) => {
    setCurrentConnection({ ...workflow.connections[index] });
    setEditConnectionIndex(index);
    setConnectionDialogOpen(true);
  };
  
  const handleDeleteConnection = (index) => {
    const newConnections = [...workflow.connections];
    newConnections.splice(index, 1);
    onUpdate({
      ...workflow,
      connections: newConnections
    });
  };
  
  const handleSaveConnection = () => {
    if (editConnectionIndex === -1) {
      onUpdate({
        ...workflow,
        connections: [...workflow.connections, currentConnection]
      });
    } else {
      const newConnections = [...workflow.connections];
      newConnections[editConnectionIndex] = currentConnection;
      onUpdate({
        ...workflow,
        connections: newConnections
      });
    }
    setConnectionDialogOpen(false);
    setCurrentConnection(null);
  };
  
  const handleConnectionChange = (field, value) => {
    setCurrentConnection({ ...currentConnection, [field]: value });
  };

  const renderWorkflowType = () => {
    return (
      <Box sx={{ mb: 4 }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Tipo de Fluxo de Trabalho</FormLabel>
          <RadioGroup
            row
            name="workflow-type"
            value={workflow.type}
            onChange={handleWorkflowTypeChange}
          >
            <FormControlLabel 
              value="sequential" 
              control={<Radio />} 
              label={
                <Tooltip title="Os agentes trabalham em sequência, um após o outro">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>Sequencial</Typography>
                    <InfoIcon fontSize="small" sx={{ ml: 0.5, color: 'action.active' }} />
                  </Box>
                </Tooltip>
              } 
            />
            <FormControlLabel 
              value="hierarchical" 
              control={<Radio />} 
              label={
                <Tooltip title="Um agente coordenador delega tarefas a agentes subordinados">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>Hierárquico</Typography>
                    <InfoIcon fontSize="small" sx={{ ml: 0.5, color: 'action.active' }} />
                  </Box>
                </Tooltip>
              } 
            />
            <FormControlLabel 
              value="debate" 
              control={<Radio />} 
              label={
                <Tooltip title="Os agentes debatem e colaboram para chegar a uma conclusão">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>Debate</Typography>
                    <InfoIcon fontSize="small" sx={{ ml: 0.5, color: 'action.active' }} />
                  </Box>
                </Tooltip>
              } 
            />
          </RadioGroup>
        </FormControl>
      </Box>
    );
  };
  
  const renderSequentialWorkflow = () => {
    return (
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Ordem de Execução dos Agentes
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <FormLabel>Agente Inicial</FormLabel>
          <Select
            value={workflow.startNode || ''}
            onChange={handleStartNodeChange}
            displayEmpty
            fullWidth
          >
            <MenuItem value="" disabled>Selecione o agente inicial</MenuItem>
            {agents.map(agent => (
              <MenuItem key={agent.id} value={agent.id}>{agent.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Conexões entre Agentes
        </Typography>
        
        {workflow.connections && workflow.connections.length > 0 ? (
          <Box sx={{ mb: 2 }}>
            {workflow.connections.map((conn, index) => {
              const fromAgent = agents.find(a => a.id === conn.from);
              const toAgent = agents.find(a => a.id === conn.to);
              
              return (
                <Card sx={{ mb: 1 }} key={index} variant="outlined">
                  <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={fromAgent?.name || conn.from} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                        <ArrowForwardIcon sx={{ mx: 1 }} />
                        <Chip 
                          label={toAgent?.name || conn.to} 
                          size="small"
                          color="primary" 
                          variant="outlined"
                        />
                        {conn.condition && (
                          <Tooltip title={conn.condition}>
                            <Chip 
                              label="Condição" 
                              size="small"
                              sx={{ ml: 1 }}
                              variant="outlined"
                            />
                          </Tooltip>
                        )}
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleEditConnection(index)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteConnection(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            Nenhuma conexão definida. Adicione conexões para especificar o fluxo entre agentes.
          </Alert>
        )}
        
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddConnection}
        >
          Adicionar Conexão
        </Button>
        
        <Box sx={{ ...workflowStyles.workflowBox, mt: 4 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              top: -10, 
              left: 10, 
              bgcolor: 'background.paper',
              px: 1 
            }}
          >
            Visualização do Fluxo
          </Typography>
          
          <FlowEditor 
            agents={agents}
            connections={workflow.connections}
            workflowType={workflow.type}
            startNodeId={workflow.startNode}
            readOnly={true}
          />
        </Box>
      </Box>
    );
  };
  
  const renderHierarchicalWorkflow = () => {
    return (
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Estrutura Hierárquica
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <FormLabel>Agente Coordenador</FormLabel>
          <Select
            value={workflow.startNode || ''}
            onChange={handleStartNodeChange}
            displayEmpty
            fullWidth
          >
            <MenuItem value="" disabled>Selecione o agente coordenador</MenuItem>
            {agents.map(agent => (
              <MenuItem key={agent.id} value={agent.id}>{agent.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Delegações
        </Typography>
        
        {workflow.connections && workflow.connections.length > 0 ? (
          <Box sx={{ mb: 2 }}>
            {workflow.connections.map((conn, index) => {
              const fromAgent = agents.find(a => a.id === conn.from);
              const toAgent = agents.find(a => a.id === conn.to);
              
              return (
                <Card sx={{ mb: 1 }} key={index} variant="outlined">
                  <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={fromAgent?.name || conn.from} 
                          size="small" 
                          color="primary"
                        />
                        <ArrowForwardIcon sx={{ mx: 1 }} />
                        <Chip 
                          label={toAgent?.name || conn.to} 
                          size="small"
                          color="primary" 
                        />
                        {conn.description && (
                          <Tooltip title={conn.description}>
                            <Typography variant="caption" sx={{ ml: 1 }}>
                              "{conn.description.substring(0, 20)}..."
                            </Typography>
                          </Tooltip>
                        )}
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleEditConnection(index)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteConnection(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            Nenhuma delegação definida. Adicione delegações do coordenador para os agentes subordinados.
          </Alert>
        )}
        
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddConnection}
        >
          Adicionar Delegação
        </Button>
        
        <Box sx={{ ...workflowStyles.workflowBox, mt: 4 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              top: -10, 
              left: 10, 
              bgcolor: 'background.paper',
              px: 1 
            }}
          >
            Visualização Hierárquica
          </Typography>
          
          <FlowEditor 
            agents={agents}
            connections={workflow.connections}
            workflowType={workflow.type}
            startNodeId={workflow.startNode}
            readOnly={true}
          />
        </Box>
      </Box>
    );
  };
  
  const renderDebateWorkflow = () => {
    return (
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Configuração do Debate
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <FormLabel>Agente Moderador (opcional)</FormLabel>
              <Select
                value={workflow.startNode || ''}
                onChange={handleStartNodeChange}
                displayEmpty
                fullWidth
              >
                <MenuItem value="">Sem moderador</MenuItem>
                {agents.map(agent => (
                  <MenuItem key={agent.id} value={agent.id}>{agent.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Interações do Debate
        </Typography>
        
        {workflow.connections && workflow.connections.length > 0 ? (
          <Box sx={{ mb: 2 }}>
            {workflow.connections.map((conn, index) => {
              const fromAgent = agents.find(a => a.id === conn.from);
              const toAgent = agents.find(a => a.id === conn.to);
              
              return (
                <Card sx={{ mb: 1 }} key={index} variant="outlined">
                  <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={fromAgent?.name || conn.from} 
                          size="small" 
                          color="primary"
                        />
                        <SyncIcon sx={{ mx: 1 }} />
                        <Chip 
                          label={toAgent?.name || conn.to} 
                          size="small"
                          color="primary" 
                        />
                        {conn.description && (
                          <Tooltip title={conn.description}>
                            <Typography variant="caption" sx={{ ml: 1 }}>
                              "{conn.description.substring(0, 20)}..."
                            </Typography>
                          </Tooltip>
                        )}
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleEditConnection(index)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteConnection(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            Nenhuma interação definida. Adicione interações entre agentes para estruturar o debate.
          </Alert>
        )}
        
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddConnection}
        >
          Adicionar Interação
        </Button>
        
        <Box sx={{ ...workflowStyles.workflowBox, mt: 4 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              top: -10, 
              left: 10, 
              bgcolor: 'background.paper',
              px: 1 
            }}
          >
            Visualização do Debate
          </Typography>
          
          <FlowEditor 
            agents={agents}
            connections={workflow.connections}
            workflowType={workflow.type}
            startNodeId={workflow.startNode}
            readOnly={true}
          />
        </Box>
      </Box>
    );
  };

  const renderWorkflowContent = () => {
    if (agents.length === 0) {
      return (
        <Alert severity="warning">
          <AlertTitle>Defina agentes primeiro</AlertTitle>
          Você precisa definir pelo menos um agente antes de configurar o fluxo de trabalho.
        </Alert>
      );
    }
    
    switch (workflow.type) {
      case 'sequential':
        return renderSequentialWorkflow();
      case 'hierarchical':
        return renderHierarchicalWorkflow();
      case 'debate':
        return renderDebateWorkflow();
      default:
        return null;
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  return (
    <Box>
      {renderWorkflowType()}
      
      <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Configuração de Fluxo" />
        <Tab label="Visualização" icon={<SchemaIcon />} iconPosition="start" />
      </Tabs>
      
      {currentTab === 0 && renderWorkflowContent()}
      
      {currentTab === 1 && (
        <Box sx={{ height: '500px', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <FlowEditor 
            agents={agents}
            connections={workflow.connections}
            workflowType={workflow.type}
            startNodeId={workflow.startNode}
            readOnly={false}
            onConnectionsChange={(connections) => {
              onUpdate({
                ...workflow,
                connections
              });
            }}
          />
        </Box>
      )}
      
      {/* Display validation errors */}
      {validationErrors && validationErrors.workflow && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {validationErrors.workflow}
        </Alert>
      )}
      
      {/* Connection Dialog */}
      <Dialog 
        open={connectionDialogOpen} 
        onClose={() => setConnectionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editConnectionIndex === -1 ? 'Adicionar Conexão' : 'Editar Conexão'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <FormLabel>De</FormLabel>
                <Select
                  value={currentConnection?.from || ''}
                  onChange={(e) => handleConnectionChange('from', e.target.value)}
                  displayEmpty
                  fullWidth
                >
                  <MenuItem value="" disabled>Selecione o agente de origem</MenuItem>
                  {agents.map(agent => (
                    <MenuItem key={agent.id} value={agent.id}>{agent.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <FormLabel>Para</FormLabel>
                <Select
                  value={currentConnection?.to || ''}
                  onChange={(e) => handleConnectionChange('to', e.target.value)}
                  displayEmpty
                  fullWidth
                >
                  <MenuItem value="" disabled>Selecione o agente de destino</MenuItem>
                  {agents.map(agent => (
                    <MenuItem key={agent.id} value={agent.id}>{agent.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {workflow.type === 'sequential' && (
              <Grid item xs={12}>
                <TextField
                  label="Condição (opcional)"
                  value={currentConnection?.condition || ''}
                  onChange={(e) => handleConnectionChange('condition', e.target.value)}
                  fullWidth
                  placeholder="Ex: se resultado.score > 0.7"
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                label="Descrição"
                value={currentConnection?.description || ''}
                onChange={(e) => handleConnectionChange('description', e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="Descreva o propósito desta conexão..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setConnectionDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveConnection} 
            color="primary" 
            variant="contained"
            disabled={!currentConnection?.from || !currentConnection?.to}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowDefinition;
