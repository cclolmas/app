import React from 'react';
import { Modal } from '../ui/Modal';
import { AccessibilitySettings } from './AccessibilitySettings';

export function AccessibilitySettingsModal({ isOpen, onClose }) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Configurações de Acessibilidade"
      size="large"
      className="accessibility-modal"
    >
      <AccessibilitySettings onClose={onClose} />
    </Modal>
  );
}
