import React, { createContext, useContext } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
  const accessibilityValue = useAccessibility();
  
  return (
    <AccessibilityContext.Provider value={accessibilityValue}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibilityContext() {
  const context = useContext(AccessibilityContext);
  if (context === null) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
}
