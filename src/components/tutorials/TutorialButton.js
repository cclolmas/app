import React from 'react';
import './TutorialButton.css';

const TutorialButton = ({ onClick, position = 'bottom-right' }) => {
  return (
    <button 
      className={`tutorial-access-btn ${position}`}
      onClick={onClick}
      aria-label="Acessar tutoriais e exemplos"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
      </svg>
      <span>Tutoriais & Exemplos</span>
    </button>
  );
};

export default TutorialButton;
