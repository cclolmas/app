import React, { useState, useEffect } from 'react';
import { ExpertiseLevel } from '../models/UserExpertiseSettings';
import { ExpertiseLevelService } from '../services/ExpertiseLevelService';

interface AdaptiveFeatureProps {
  featureId: string;
  requiredLevel?: ExpertiseLevel;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdaptiveFeature: React.FC<AdaptiveFeatureProps> = ({ 
  featureId,
  requiredLevel, 
  children,
  fallback
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const expertiseService = ExpertiseLevelService.getInstance();
  
  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(expertiseService.isFeatureVisible(featureId, requiredLevel));
    };
    
    // Initial check
    updateVisibility();
    
    // Subscribe to expertise changes
    const checkInterval = setInterval(updateVisibility, 1000);
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [featureId, requiredLevel]);

  return isVisible ? <>{children}</> : <>{fallback || null}</>;
};
