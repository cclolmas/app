import React, { useState } from 'react';
import '../styles/dashboard.css';

const Tooltip = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="tooltip-container">
      <span 
        className="info-icon"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        ℹ️
      </span>
      {isVisible && (
        <div className="tooltip-content">
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
