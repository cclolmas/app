import React, { useState, useEffect } from 'react';
import UserPreferencesService from '../services/UserPreferencesService';

const InterfaceToggler = () => {
  const [isSimplified, setIsSimplified] = useState(
    UserPreferencesService.shouldShowSimplifiedInterface()
  );

  const toggleInterface = () => {
    const newMode = isSimplified ? 'advanced' : 'simplified';
    UserPreferencesService.setPreference('interfaceMode', newMode);
    setIsSimplified(!isSimplified);
    
    // Se está mudando para avançado, atualiza o nível de experiência
    if (newMode === 'advanced') {
      const currentLevel = UserPreferencesService.getPreference('experienceLevel');
      if (currentLevel === 'novice') {
        UserPreferencesService.updateExperienceLevel('intermediate');
      }
    }
  };

  return (
    <div className="interface-toggler">
      <button 
        className={`toggle-button ${isSimplified ? 'simple-mode' : 'advanced-mode'}`}
        onClick={toggleInterface}
        aria-label={isSimplified ? 'Ativar modo avançado' : 'Voltar para modo simplificado'}
      >
        {isSimplified ? 'Desbloquear Recursos Avançados' : 'Voltar para Interface Simples'}
      </button>
      <div className="mode-indicator" aria-live="polite">
        Modo atual: {isSimplified ? 'Simplificado' : 'Avançado'}
      </div>
    </div>
  );
};

export default InterfaceToggler;
