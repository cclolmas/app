import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type VisualHighlightProps = {
  children: React.ReactNode;
  active?: boolean;
  priority?: 'low' | 'medium' | 'high';
  type?: 'pulse' | 'glow' | 'outline';
  duration?: number;
  onComplete?: () => void;
};

export const VisualHighlight: React.FC<VisualHighlightProps> = ({
  children,
  active = true,
  priority = 'medium',
  type = 'pulse',
  duration = 3,
  onComplete,
}) => {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (active && duration > 0) {
      const timer = setTimeout(() => {
        setIsComplete(true);
        onComplete?.();
      }, duration * 1000);

      return () => clearTimeout(timer);
    }
  }, [active, duration, onComplete]);

  if (!active || isComplete) return <>{children}</>;

  const getAnimationStyles = () => {
    const priorityColors = {
      low: 'rgba(59, 130, 246, 0.5)', // blue
      medium: 'rgba(245, 158, 11, 0.5)', // amber
      high: 'rgba(239, 68, 68, 0.5)', // red
    };
    
    switch (type) {
      case 'pulse':
        return {
          animate: {
            boxShadow: [
              `0 0 0 0px ${priorityColors[priority]}`,
              `0 0 0 8px ${priorityColors[priority]}`,
              `0 0 0 0px ${priorityColors[priority]}`,
            ],
          },
          transition: {
            repeat: Infinity,
            duration: 2,
          },
        };
      case 'glow':
        return {
          animate: {
            boxShadow: `0 0 12px 6px ${priorityColors[priority]}`,
          },
        };
      case 'outline':
        return {
          animate: {
            boxShadow: `0 0 0 2px ${priorityColors[priority]}`,
          },
        };
      default:
        return {};
    }
  };

  return (
    <motion.div
      className="relative rounded-md"
      {...getAnimationStyles()}
    >
      {children}
    </motion.div>
  );
};
