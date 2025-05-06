import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import useSound from 'use-sound';

const TaskMonitorContext = createContext();

// Sons
const completionSoundUrl = '/sounds/task-complete.mp3';
const errorSoundUrl = '/sounds/task-error.mp3';

// Ações
const ACTIONS = {
  START_TASK: 'START_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  COMPLETE_TASK: 'COMPLETE_TASK',
  FAIL_TASK: 'FAIL_TASK',
  DISMISS_TASK: 'DISMISS_TASK',
  TOGGLE_MINIMIZE: 'TOGGLE_MINIMIZE',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
};

// Estado inicial
const initialState = {
  tasks: {},
  settings: {
    soundEnabled: true,
    notificationsEnabled: true,
    showSuggestions: true,
  },
};

// Reducer para gerenciar ações
function taskReducer(state, action) {
  switch (action.type) {
    case ACTIONS.START_TASK:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.payload.id]: {
            id: action.payload.id,
            type: action.payload.type,
            title: action.payload.title,
            status: 'running',
            progress: 0,
            startTime: Date.now(),
            estimatedEndTime: action.payload.estimatedDuration 
              ? Date.now() + action.payload.estimatedDuration * 1000
              : null,
            logs: [],
            minimized: false,
            error: null,
            result: null,
          },
        },
      };
    
    case ACTIONS.UPDATE_TASK:
      if (!state.tasks[action.payload.id]) return state;
      
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.payload.id]: {
            ...state.tasks[action.payload.id],
            ...action.payload.updates,
          },
        },
      };
    
    case ACTIONS.COMPLETE_TASK:
      if (!state.tasks[action.payload.id]) return state;
      
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.payload.id]: {
            ...state.tasks[action.payload.id],
            status: 'completed',
            progress: 100,
            endTime: Date.now(),
            result: action.payload.result,
          },
        },
      };
    
    case ACTIONS.FAIL_TASK:
      if (!state.tasks[action.payload.id]) return state;
      
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.payload.id]: {
            ...state.tasks[action.payload.id],
            status: 'failed',
            endTime: Date.now(),
            error: action.payload.error,
          },
        },
      };
    
    case ACTIONS.DISMISS_TASK:
      const newTasks = { ...state.tasks };
      delete newTasks[action.payload.id];
      
      return {
        ...state,
        tasks: newTasks,
      };
    
    case ACTIONS.TOGGLE_MINIMIZE:
      if (!state.tasks[action.payload.id]) return state;
      
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.payload.id]: {
            ...state.tasks[action.payload.id],
            minimized: !state.tasks[action.payload.id].minimized,
          },
        },
      };
    
    case ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };
    
    default:
      return state;
  }
}

export function TaskMonitorProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { enqueueSnackbar } = useSnackbar();
  
  const [playSuccessSound] = useSound(completionSoundUrl, { volume: 0.5 });
  const [playErrorSound] = useSound(errorSoundUrl, { volume: 0.5 });

  // Gerenciar notificações de tarefas completadas ou com erro
  useEffect(() => {
    const tasks = Object.values(state.tasks);
    
    tasks.forEach(task => {
      // Verificar tarefas recém-completadas (com endTime presente e recente)
      if (task.status === 'completed' && 
          task.endTime && 
          Date.now() - task.endTime < 1000 && 
          state.settings.notificationsEnabled) {
        
        enqueueSnackbar(`Tarefa "${task.title}" concluída com sucesso!`, { 
          variant: 'success',
          autoHideDuration: 5000,
        });
        
        if (state.settings.soundEnabled) {
          playSuccessSound();
        }
      }
      
      // Verificar tarefas que falharam (com endTime presente e recente)
      if (task.status === 'failed' && 
          task.endTime && 
          Date.now() - task.endTime < 1000 && 
          state.settings.notificationsEnabled) {
        
        enqueueSnackbar(`Erro na tarefa "${task.title}": ${task.error?.message || 'Ocorreu um erro.'}`, { 
          variant: 'error',
          autoHideDuration: 8000,
        });
        
        if (state.settings.soundEnabled) {
          playErrorSound();
        }
      }
    });
  }, [state.tasks, state.settings, enqueueSnackbar, playSuccessSound, playErrorSound]);

  // Funções de ação simplificadas
  const startTask = (taskData) => {
    dispatch({ 
      type: ACTIONS.START_TASK, 
      payload: taskData 
    });
    return taskData.id;
  };

  const updateTask = (id, updates) => {
    dispatch({ 
      type: ACTIONS.UPDATE_TASK, 
      payload: { id, updates } 
    });
  };

  const completeTask = (id, result = null) => {
    dispatch({ 
      type: ACTIONS.COMPLETE_TASK, 
      payload: { id, result } 
    });
  };

  const failTask = (id, error) => {
    dispatch({ 
      type: ACTIONS.FAIL_TASK, 
      payload: { id, error } 
    });
  };

  const dismissTask = (id) => {
    dispatch({ 
      type: ACTIONS.DISMISS_TASK, 
      payload: { id } 
    });
  };

  const toggleMinimize = (id) => {
    dispatch({ 
      type: ACTIONS.TOGGLE_MINIMIZE, 
      payload: { id } 
    });
  };

  const updateSettings = (settings) => {
    dispatch({ 
      type: ACTIONS.UPDATE_SETTINGS, 
      payload: settings 
    });
  };

  // Adicionar um log a uma tarefa específica
  const addTaskLog = (id, logEntry) => {
    const task = state.tasks[id];
    
    if (!task) return;
    
    updateTask(id, {
      logs: [...task.logs, {
        time: Date.now(),
        message: logEntry.message,
        type: logEntry.type || 'info'
      }]
    });
  };

  const value = {
    tasks: state.tasks,
    settings: state.settings,
    startTask,
    updateTask,
    completeTask,
    failTask,
    dismissTask,
    toggleMinimize,
    updateSettings,
    addTaskLog,
  };

  return (
    <TaskMonitorContext.Provider value={value}>
      {children}
    </TaskMonitorContext.Provider>
  );
}

export function useTaskMonitor() {
  const context = useContext(TaskMonitorContext);
  
  if (context === undefined) {
    throw new Error('useTaskMonitor must be used within a TaskMonitorProvider');
  }
  
  return context;
}
