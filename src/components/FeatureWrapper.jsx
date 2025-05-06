import React, { useState, useEffect } from 'react';
import UserPreferencesService from '../services/UserPreferencesService';

/**
 * Wrapper para controlar a exibição de funcionalidades com base
 * no nível de experiência do usuário
 */
const FeatureWrapper = ({ 
  advancedOnly = false, 
  noviceOnly = false, 
  featureId = null,
  children, 
  fallback = null 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const checkVisibility = () => {
      const isSimplified = UserPreferencesService.shouldShowSimplifiedInterface();
      
      // Verifica se o componente deve ser exibido com base no nível do usuário
      const shouldShow = 
        (advancedOnly && !isSimplified) || 
        (noviceOnly && isSimplified) || 
        (!advancedOnly && !noviceOnly);
      
      setIsVisible(shouldShow);
      
      // Se o featureId estiver definido e o componente estiver visível, registra que o usuário viu este recurso
      if (featureId && shouldShow) {
        const seenFeatures = UserPreferencesService.getPreference('seenFeatures', []);
        if (!seenFeatures.includes(featureId)) {
          UserPreferencesService.setPreference('seenFeatures', [...seenFeatures, featureId]);
        }
      }
    };

    checkVisibility();
    
    // Adicionar um ouvinte para localStorage, para detectar mudanças de preferências
    const handleStorageChange = () => checkVisibility();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [advancedOnly, noviceOnly, featureId]);

  return isVisible ? children : fallback;
};

export default FeatureWrapper;
