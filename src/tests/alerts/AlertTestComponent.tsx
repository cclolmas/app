import React, { useState } from 'react';
import { Toast } from '../../components/ui/Toast'; // Ajuste conforme necessário
import { Modal } from '../../components/ui/Modal'; // Ajuste conforme necessário

interface AlertTestComponentProps {
  triggerType: 'unstableOutput' | 'connectionError' | 'validationError';
  toastDuration?: number;
}

const AlertTestComponent: React.FC<AlertTestComponentProps> = ({ 
  triggerType, 
  toastDuration = 3000 
}) => {
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('');

  const handleTriggerAlert = () => {
    switch (triggerType) {
      case 'unstableOutput':
        setShowToast(true);
        // Configura o timer para fechar o toast
        setTimeout(() => {
          setShowToast(false);
        }, toastDuration);
        break;
      case 'connectionError':
        setErrorTitle('Erro de conexão');
        setErrorMessage('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
        setShowModal(true);
        break;
      case 'validationError':
        setErrorTitle('Erro de validação');
        setErrorMessage('Verifique os dados inseridos e tente novamente.');
        setShowModal(true);
        break;
      default:
        break;
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      {triggerType === 'unstableOutput' && (
        <button onClick={handleTriggerAlert}>Simular saída instável</button>
      )}
      {triggerType === 'connectionError' && (
        <button onClick={handleTriggerAlert}>Simular erro de conexão</button>
      )}
      {triggerType === 'validationError' && (
        <button onClick={handleTriggerAlert}>Simular erro de validação</button>
      )}

      {showToast && (
        <Toast 
          message="Saída instável detectada" 
          type="warning" 
          onClose={() => setShowToast(false)} 
        />
      )}

      {showModal && (
        <Modal
          title={errorTitle}
          isOpen={showModal}
          onClose={closeModal}
        >
          <p>{errorMessage}</p>
          <button onClick={closeModal}>Fechar</button>
        </Modal>
      )}
    </div>
  );
};

export default AlertTestComponent;
