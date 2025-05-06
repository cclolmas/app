import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Badge, 
  Drawer, 
  Fab, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemButton,
  Divider,
  LinearProgress,
  Tooltip
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';
import SyncIcon from '@mui/icons-material/Sync';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

import { useTaskMonitor } from '../../contexts/TaskMonitorContext';
import TaskProgressMonitor from './TaskProgressMonitor';

/**
 * Componente flutuante que permite monitorar tarefas em execução
 * enquanto navega por outras partes da aplicação
 */
const FloatingTaskMonitor = () => {
  const { tasks, dismissTask, updateSettings, settings } = useTaskMonitor();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  
  // Verificar se há tarefas ativas
  const activeTasks = Object.values(tasks);
  const runningTasks = activeTasks.filter(task => task.status === 'running');
  const completedTasks = activeTasks.filter(task => task.status === 'completed');
  const failedTasks = activeTasks.filter(task => task.status === 'failed');
  
  if (activeTasks.length === 0) {
    return null;
  }
  
  // Obter cor do botão baseado no estado das tarefas
  const getButtonColor = () => {
    if (failedTasks.length > 0) return 'error';
    if (runningTasks.length > 0) return 'primary';
    if (completedTasks.length > 0) return 'success';
    return 'default';
  };
  
  // Obter ícone do botão baseado no estado das tarefas
  const getButtonIcon = () => {
    if (failedTasks.length > 0) return <ErrorIcon />;
    if (runningTasks.length > 0) return <SyncIcon sx={{ animation: 'spin 2s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />;
    if (completedTasks.length > 0) return <DoneIcon />;
    return <SyncIcon />;
  };
  
  return (
    <>
      {/* Botão flutuante */}
      <Tooltip title={`${activeTasks.length} tarefas ativas`}>
        <Badge 
          badgeContent={activeTasks.length} 
          color={getButtonColor()}
          overlap="circular"
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24, 
            zIndex: 1000 
          }}
        >
          <Fab 
            color={getButtonColor()} 
            onClick={() => setDrawerOpen(true)}
            aria-label="Ver tarefas em andamento"
          >
            {getButtonIcon()}
          </Fab>
        </Badge>
      </Tooltip>
      
      {/* Drawer com lista de tarefas */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedTaskId(null);
        }}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            maxWidth: '100%'
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6">
            Tarefas em Execução
          </Typography>
          
          <Box>
            <Tooltip title={settings.soundEnabled ? "Som ativado" : "Som desativado"}>
              <IconButton 
                size="small" 
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                color={settings.soundEnabled ? "primary" : "default"}
              >
                {settings.soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title={settings.notificationsEnabled ? "Notificações ativadas" : "Notificações desativadas"}>
              <IconButton 
                size="small" 
                onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
                color={settings.notificationsEnabled ? "primary" : "default"}
                sx={{ mx: 1 }}
              >
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
            
            <IconButton 
              size="small" 
              onClick={() => {
                setDrawerOpen(false);
                setSelectedTaskId(null);
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Divider />
        
        {selectedTaskId ? (
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <IconButton 
                size="small" 
                onClick={() => setSelectedTaskId(null)}
                sx={{ mr: 1 }}
              >
                <KeyboardArrowUpIcon />
              </IconButton>
              <Typography variant="subtitle1" component="span">
                Voltar para lista
              </Typography>
            </Box>
            
            <TaskProgressMonitor
              taskId={selectedTaskId}
              detailed={true}
              onClose={() => {
                setSelectedTaskId(null);
                dismissTask(selectedTaskId);
              }}
            />
          </Box>
        ) : (
          <List sx={{ width: '100%', p: 0 }}>
            {activeTasks.map((task) => (
              <React.Fragment key={task.id}>
                <ListItem 
                  disablePadding
                  secondaryAction={
                    task.status === 'completed' || task.status === 'failed' ? (
                      <IconButton 
                        edge="end" 
                        aria-label="Descartar" 
                        onClick={() => dismissTask(task.id)}
                      >
                        <CloseIcon />
                      </IconButton>
                    ) : null
                  }
                >
                  <ListItemButton 
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      {task.status === 'running' && <SyncIcon color="primary" sx={{ animation: 'spin 2s linear infinite' }} />}
                      {task.status === 'completed' && <DoneIcon color="success" />}
                      {task.status === 'failed' && <ErrorIcon color="error" />}
                    </Box>
                    <ListItemText 
                      primary={task.title}
                      secondary={
                        task.status === 'running' 
                          ? `${task.progress || 0}% concluído` 
                          : task.status === 'completed' 
                            ? 'Concluído' 
                            : 'Falhou'
                      }
                      sx={{ ml: 1 }}
                    />
                  </ListItemButton>
                </ListItem>
                
                {task.status === 'running' && (
                  <LinearProgress 
                    variant={task.progress !== undefined ? "determinate" : "indeterminate"} 
                    value={task.progress || 0}
                    sx={{ height: 2 }}
                  />
                )}
                
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Drawer>
    </>
  );
};

export default FloatingTaskMonitor;
