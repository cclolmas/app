import React, { useState } from 'react';
import TutorialButton from './TutorialButton';
import TutorialSidebar from './TutorialSidebar';
import TutorialModal from './TutorialModal';

const TutorialSystem = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState(null);

  const handleTutorialClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleTutorialSelect = (tutorial) => {
    setSelectedTutorial(tutorial);
    setSidebarOpen(false);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <>
      <TutorialButton onClick={handleTutorialClick} position="bottom-right" />
      <TutorialSidebar 
        isOpen={sidebarOpen} 
        onClose={handleSidebarClose} 
        onSelectTutorial={handleTutorialSelect} 
      />
      <TutorialModal 
        isOpen={modalOpen} 
        onClose={handleModalClose}
        tutorial={selectedTutorial}
      />
    </>
  );
};

export default TutorialSystem;
