import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

type GuideStep = {
  targetId: string;
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
};

type UserGuideProps = {
  steps: GuideStep[];
  isActive: boolean;
  onComplete: () => void;
  onDismiss: () => void;
};

export const UserGuide: React.FC<UserGuideProps> = ({
  steps,
  isActive,
  onComplete,
  onDismiss,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isActive) return;
    
    const currentTarget = document.getElementById(steps[currentStep]?.targetId);
    if (currentTarget) {
      setTargetElement(currentTarget.getBoundingClientRect());
      
      // Add visual highlight to the element
      currentTarget.classList.add('guide-highlight');
      
      // Scroll to make sure the element is in view
      currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return () => {
      if (currentTarget) {
        currentTarget.classList.remove('guide-highlight');
      }
    };
  }, [isActive, currentStep, steps]);

  if (!isActive || !targetElement || !steps[currentStep]) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const getTooltipPosition = () => {
    const position = steps[currentStep].position || 'bottom';
    const gap = 12;
    
    switch (position) {
      case 'top':
        return {
          top: targetElement.top - gap - 80,
          left: targetElement.left + targetElement.width / 2 - 150,
        };
      case 'right':
        return {
          top: targetElement.top + targetElement.height / 2 - 40,
          left: targetElement.right + gap,
        };
      case 'left':
        return {
          top: targetElement.top + targetElement.height / 2 - 40,
          left: targetElement.left - gap - 300,
        };
      case 'bottom':
      default:
        return {
          top: targetElement.bottom + gap,
          left: targetElement.left + targetElement.width / 2 - 150,
        };
    }
  };

  const tooltipPosition = getTooltipPosition();

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed z-50 bg-white rounded-lg shadow-xl p-4 w-[300px]"
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
      }}
    >
      <button 
        onClick={onDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
      >
        <X size={16} />
      </button>
      
      <div className="mb-4">
        {steps[currentStep].content}
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <div className="text-sm text-gray-500">
          {currentStep + 1} / {steps.length}
        </div>
        
        <button
          onClick={handleNext}
          className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {currentStep < steps.length - 1 ? 'Próximo' : 'Concluir'}
        </button>
      </div>
    </motion.div>,
    document.body
  );
};
