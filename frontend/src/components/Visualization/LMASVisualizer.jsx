import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Tabs, Tab,
  Card, CardContent, Divider, Chip, Avatar,
  List, ListItem, ListItemText, ListItemAvatar,
  ListItemSecondaryAction, IconButton, Tooltip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import {
  Sankey, Tooltip as RechartsTooltip, Rectangle, Layer
} from 'recharts';

const LMASVisualizer = ({ data, status }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [expandedMessages, setExpandedMessages] = useState({});
  const [flowData, setFlowData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    if (data && data.interactions) {
      // Preparar dados para o diagrama de Sankey
      const nodesMap = new Map();
      const linksCount = new Map();
      
      // Adicionar todos os agentes como nós
      if (data.agentsConfig) {
        data.agentsConfig.forEach(agent => {
          nodesMap.set(agent.id, { name: agent.name });
        });
      }
      
      // Adicionar usuário como nó
      nodesMap.set("user", { name: "Usuário" });
      
      // Contar interações entre agentes
      data.interactions.forEach(interaction => {
        const linkKey = `${interaction.from}:${interaction.to}`;
        linksCount.set(linkKey, (linksCount.get(linkKey) || 0) + 1);
      });
      
      // Converter para o formato esperado pelo Sankey
      const nodes = Array.from(nodesMap.entries()).map(([id, info], index) => ({
        name: info.name,
        id: id,
        color: id === "user" ? "#ff9800" : "#2196f3"
      }));
      
      const links = Array.from(linksCount.entries()).map(([key, value]) => {
        const [source, target] = key.split(':');
        return {
          source: nodes.findIndex(node => node.id === source),
          target: nodes.findIndex(node => node.id === target),
          value: value
        };
      });
      
      setFlowData({ nodes, links });
    }
  }, [data]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleMessageExpand = (messageId) => {
    setExpandedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // Obter cor baseada no agente
  const getAgentColor = (agentId) => {
    if (agentId === "user") return "#ff9800";
    return "#2196f3";
  };

  // Obter ícone baseado no agente
  const getAgentIcon = (agentId) => {
    if (agentId === "user") return <PersonIcon />;
    return <SmartToyIcon />;
  };

  // Formatar timestamp
  const formatTimestamp = (timestampStr) => {
    const date = new Date(timestampStr);
    return date.toLocaleTimeString();
  };

  // Renderizar conteúdo truncado
  const renderTruncatedContent = (content, messageId) => {
    const isExpanded = expandedMessages[messageId];
    const shouldTruncate = content.length > 100 && !isExpanded;
    
    return (
      <>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {shouldTruncate ? `${content.substring(0, 100)}...` : content}
        </Typography>
        
        {content.length > 100 && (
          <IconButton size="small" onClick={() => handleMessageExpand(messageId)}>
            {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        )}
      </>
    );
  };

  // Renderizar lista de interações
  const renderInteractionsList = () => {
    if (!data || !data.interactions || data.interactions.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          Nenhuma interação registrada.
        </Typography>
      );
    }

    return (
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {data.interactions.map((interaction, index) => {
          const messageId = `msg-${index}`;
          return (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getAgentColor(interaction.from) }}>
                    {getAgentIcon(interaction.from)}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography component="span" variant="subtitle2" sx={{ mr: 1 }}>
                        {interaction.from === "user" ? "Usuário" : 
                          data.agentsConfig?.find(a => a.id === interaction.from)?.name || interaction.from}
                      </Typography>
                      <Typography component="span" variant="caption" color="text.secondary">
                        para {interaction.to === "user" ? "Usuário" : 
                          data.agentsConfig?.find(a => a.id === interaction.to)?.name || interaction.to}
                      </Typography>
                    </Box>
                  }
                  secondary={renderTruncatedContent(interaction.content, messageId)}
                />
                
                <ListItemSecondaryAction>
                  <Typography variant="caption" color="text.secondary">
                    {formatTimestamp(interaction.timestamp)}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
              
              {index < data.interactions.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          );
        })}
      </List>
    );
  };

  // Renderizar visualização de fluxo
  const renderFlowVisualization = () => {
    if (!data || !data.interactions || data.interactions.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          Nenhuma interação disponível para visualização.
        </Typography>
      );
    }

    return (
      <Box sx={{ height: 400, width: '100%' }}>
        <Sankey
          width={800}
          height={400}
          data={flowData}
          node={({ x, y, width, height, index, payload }) => {
            return (
              <Rectangle
                x={x}
                y={y}
                width={width}
                height={height}
                fill={payload.color || "#8884d8"}
                fillOpacity={0.9}
              >
                <title>{payload.name}</title>
              </Rectangle>
            );
          }}
          link={({ sourceX, sourceY, sourceControlX, targetX, targetY, targetControlX, linkWidth, index }) => (
            <Layer key={`link-${index}`}>
              <path
                d={`
                  M${sourceX},${sourceY}
                  C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
                `}
                fill="none"
                stroke="#aaa"
                strokeWidth={linkWidth}
                strokeOpacity={0.5}
              />
            </Layer>
          )}
          margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
        />
      </Box>
    );
  };

  // Renderizar sumário do sistema
  const renderSystemSummary = () => {
    if (!data || !data.agentsConfig) return null;

    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Configuração do Sistema Multi-Agente
          </Typography>
        </Grid>
        
        {data.agentsConfig.map((agent, index) => (
          <Grid item xs={12} sm={6} md={4} key={agent.id}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: getAgentColor(agent.id), mr: 1 }}>
                    <SmartToyIcon />
                  </Avatar>
                  <Typography variant="subtitle2">
                    {agent.name}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Modelo: {agent.model}
                </Typography>
                
                <Box sx={{ mt: 1 }}>
                  <Chip size="small" label={`ID: ${agent.id}`} variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        
        {/* Estatísticas básicas */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Estatísticas de Interação
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5">{data.interactions?.length || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Total de Interações</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5">
                    {data.agentsConfig?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Agentes</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5">
                    {data.interactions?.filter(i => i.from === "user" || i.to === "user").length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Interações com Usuário</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Resultado final */}
        {data.result && (
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Resultado Final
              </Typography>
              <Typography variant="body1">
                {data.result}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <Box>
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        aria-label="lmas visualization tabs"
        sx={{ mb: 2 }}
      >
        <Tab icon={<SmartToyIcon />} iconPosition="start" label="Interações" />
        <Tab icon={<AnalyticsIcon />} iconPosition="start" label="Fluxo" />
        <Tab icon={<InfoIcon />} iconPosition="start" label="Sumário" />
      </Tabs>
      
      <Paper elevation={1} sx={{ p: 2 }}>
        {currentTab === 0 && renderInteractionsList()}
        {currentTab === 1 && renderFlowVisualization()}
        {currentTab === 2 && renderSystemSummary()}
      </Paper>
    </Box>
  );
};

export default LMASVisualizer;
