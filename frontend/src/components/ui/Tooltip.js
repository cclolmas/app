import React, { useState, useRef } from 'react';
import './Tooltip.css';

/**
 * Tooltip component that shows explanatory text on hover
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Element that triggers the tooltip
 * @param {string} props.content - Text content for the tooltip
 * @param {string} props.position - Position of tooltip (top, bottom, left, right)
 * @param {number|string} props.delay - Delay before showing tooltip in ms
 */
const Tooltip = ({ children, content, position = 'top', delay = '300' }) => {
  const [active, setActive] = useState(false);
  const timeoutRef = useRef(null);

  const showTip = () => {
    // Convert delay to number if it's a string
    const delayMs = parseInt(delay, 10);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a timeout to show the tooltip after the delay
    timeoutRef.current = setTimeout(() => {
      setActive(true);
    }, delayMs);
  };

  const hideTip = () => {
    // Clear the timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActive(false);
  };

  return (
    <div 
      className="tooltip-wrapper"
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
      onFocus={showTip}
      onBlur={hideTip}
    >
      {children}
      {active && (
        <div className={`tooltip-tip ${position}`} role="tooltip">
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
