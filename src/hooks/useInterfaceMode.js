import { useState, useEffect } from 'react';
import UserPreferencesService from '../services/UserPreferencesService';

/**
 * Hook para gerenciar o modo de interface nos componentes
 * @param {Object} options Opções de configuração
 * @param {boolean} options.listenToChanges Se deve atualizar automaticamente com mudanças
 * @returns {Object} Estado e funções para gerenciar o modo de interface
 */
const useInterfaceMode = ({ listenToChanges = true } = {}) => {
  const [isSimplified, setIsSimplified] = useState(
    UserPreferencesService.shouldShowSimplifiedInterface()
  );
  
  const toggleInterfaceMode = () => {
    const newMode = isSimplified ? 'advanced' : 'simplified';
    UserPreferencesService.setPreference('interfaceMode', newMode);
    setIsSimplified(!isSimplified);
    
    // Dispara evento para notificar outros componentes da mudança
    window.dispatchEvent(new Event('interfaceModeChanged'));
  };
  
  useEffect(() => {
    if (!listenToChanges) return;
    
    const handleInterfaceModeChange = () => {
      setIsSimplified(UserPreferencesService.shouldShowSimplifiedInterface());
    };
    
    window.addEventListener('interfaceModeChanged', handleInterfaceModeChange);
    window.addEventListener('storage', handleInterfaceModeChange);
    
    return () => {
      window.removeEventListener('interfaceModeChanged', handleInterfaceModeChange);
      window.removeEventListener('storage', handleInterfaceModeChange);
    };
  }, [listenToChanges]);
  
  return {
    isSimplified,
    isAdvanced: !isSimplified,
    toggleInterfaceMode,
    setSimplifiedMode: () => {
      UserPreferencesService.setPreference('interfaceMode', 'simplified');
      setIsSimplified(true);
      window.dispatchEvent(new Event('interfaceModeChanged'));
    },
    setAdvancedMode: () => {
      UserPreferencesService.setPreference('interfaceMode', 'advanced');
      setIsSimplified(false);
      window.dispatchEvent(new Event('interfaceModeChanged'));
    }
  };
};

export default useInterfaceMode;
