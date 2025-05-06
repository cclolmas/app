import { useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  // Interface
  interfaceLevel: 'standard', // 'simplified', 'standard', 'advanced'
  fontSize: 'medium', // 'small', 'medium', 'large', 'x-large'
  colorMode: 'default', // 'default', 'high-contrast', 'dark', 'light', 'custom'
  customColors: {
    primary: '#3b82f6',
    secondary: '#10b981',
    background: '#ffffff',
    text: '#111827',
  },
  
  // Cognitive Load Management
  reduceAnimations: false,
  reduceVisualComplexity: false,
  enableProgressiveDifficulty: true, // Adapta baseado no progresso do usuário
  
  // Feedback & Notificações
  notificationLevel: 'standard', // 'minimal', 'standard', 'detailed'
  feedbackStyle: 'visual-text', // 'visual-only', 'text-only', 'visual-text', 'audio-visual'
  feedbackFrequency: 'medium', // 'low', 'medium', 'high'
  
  // Assistência Cognitiva
  enableScaffolding: true, // Suporte gradual para tarefas complexas
  showCognitiveLoadIndicator: false, // Mostra indicador de carga cognitiva estimada
  showComputationalLoadIndicator: false, // Mostra indicador de carga computacional
};

export function useAccessibility() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega configurações salvas no inicialização
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('accessibilitySettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Failed to load accessibility settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Salva as configurações sempre que forem alteradas
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    }
  }, [settings, isLoading]);

  // Aplica as configurações de fonte e cores ao elemento root
  useEffect(() => {
    if (isLoading) return;
    
    const root = document.documentElement;
    
    // Aplica tamanho da fonte
    const fontSizeMap = {
      'small': '0.875rem',
      'medium': '1rem',
      'large': '1.125rem',
      'x-large': '1.25rem',
    };
    root.style.fontSize = fontSizeMap[settings.fontSize] || '1rem';
    
    // Aplica modo de cor
    // Always remove all mode classes first to ensure a clean state
    root.classList.remove('high-contrast', 'dark-mode', 'light-mode');

    // Add the specific mode class if it's not 'default' and explicitly not 'dark'
    if (settings.colorMode !== 'default' && settings.colorMode !== 'dark') {
      // Ensure we only add valid mode classes like 'high-contrast-mode' or 'light-mode'
      if (settings.colorMode === 'high-contrast' || settings.colorMode === 'light') {
         root.classList.add(`${settings.colorMode}-mode`);
      }
      // The 'custom' mode doesn't add a class, it uses CSS variables below
    }
    
    // Aplica cores customizadas se estiver no modo personalizado
    if (settings.colorMode === 'custom') {
      root.style.setProperty('--color-primary', settings.customColors.primary);
      root.style.setProperty('--color-secondary', settings.customColors.secondary);
      root.style.setProperty('--color-background', settings.customColors.background);
      root.style.setProperty('--color-text', settings.customColors.text);
    } else {
       // Clear custom properties if not in custom mode
       root.style.removeProperty('--color-primary');
       root.style.removeProperty('--color-secondary');
       root.style.removeProperty('--color-background');
       root.style.removeProperty('--color-text');
    }
    
    // Aplica redução de animações
    if (settings.reduceAnimations) {
      root.classList.add('reduce-animations');
    } else {
      root.classList.remove('reduce-animations');
    }
    
    // Aplica redução de complexidade visual
    if (settings.reduceVisualComplexity) {
      root.classList.add('reduce-visual-complexity');
    } else {
      root.classList.remove('reduce-visual-complexity');
    }
    
  }, [settings, isLoading]);

  // Funções para atualizar configurações específicas
  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNestedSetting = (parentKey, childKey, value) => {
    setSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value
      }
    }));
  };

  // Reset para configurações padrão
  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    isLoading,
    updateSetting,
    updateNestedSetting,
    resetToDefaults,
    
    // Helpers para verificar estados específicos
    isSimplifiedInterface: settings.interfaceLevel === 'simplified',
    isAdvancedInterface: settings.interfaceLevel === 'advanced',
    isStandardInterface: settings.interfaceLevel === 'standard',
    shouldReduceAnimations: settings.reduceAnimations,
    shouldReduceComplexity: settings.reduceVisualComplexity,
    
    // Getters para configurações específicas
    getFontSizeClass: () => `font-size-${settings.fontSize}`,
    getColorModeClass: () => `color-mode-${settings.colorMode}`,
  };
}
