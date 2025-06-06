import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { AccessibilitySettingsModal } from '../accessibility/AccessibilitySettingsModal';
import { useAccessibilityContext } from '../../contexts/AccessibilityContext';

export function AccessibilityButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { settings } = useAccessibilityContext();
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  // Adaptamos o botão com base nas configurações de acessibilidade
  const buttonLabel = settings.interfaceLevel === 'simplified' 
    ? 'Personalizar' 
    : 'Configurações de Acessibilidade';
  
  return (
    <>
      <Button 
        onClick={openModal}
        variant="secondary"
        className="accessibility-button"
        aria-label="Abrir configurações de acessibilidade"
        title="Configurações de acessibilidade e personalização"
      >
        <span className="icon accessibility-icon">
          {/* Ícone SVG simplificado ou texto, dependendo do nível da interface */}
          {settings.interfaceLevel === 'simplified' ? 'Aa' : (
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          )}
        </span>
        {settings.interfaceLevel !== 'simplified' && <span className="button-text">{buttonLabel}</span>}
      </Button>
      
      <AccessibilitySettingsModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </>
  );
}
