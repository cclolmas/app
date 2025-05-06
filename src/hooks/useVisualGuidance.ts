import { useState, useEffect } from 'react';

type GuidanceOptions = {
  isFirstVisit?: boolean;
  featureHighlight?: string;
  autoStart?: boolean;
  persistKey?: string;
};

export function useVisualGuidance({
  isFirstVisit = false,
  featureHighlight,
  autoStart = false,
  persistKey,
}: GuidanceOptions = {}) {
  const [isGuideActive, setIsGuideActive] = useState(autoStart);
  const [highlightedElements, setHighlightedElements] = useState<string[]>([]);
  const [completedGuides, setCompletedGuides] = useState<string[]>(() => {
    if (persistKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`guide-completed-${persistKey}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    if (isFirstVisit && !isGuideActive && featureHighlight) {
      // Check if this guide was already completed
      const wasCompleted = completedGuides.includes(featureHighlight);
      if (!wasCompleted) {
        setIsGuideActive(true);
      }
    }
  }, [isFirstVisit, isGuideActive, featureHighlight, completedGuides]);

  useEffect(() => {
    if (persistKey && completedGuides.length > 0) {
      localStorage.setItem(
        `guide-completed-${persistKey}`,
        JSON.stringify(completedGuides)
      );
    }
  }, [completedGuides, persistKey]);

  const highlightElement = (elementId: string) => {
    setHighlightedElements(prev => [...prev, elementId]);
    return () => {
      setHighlightedElements(prev => prev.filter(id => id !== elementId));
    };
  };

  const startGuide = () => {
    setIsGuideActive(true);
  };

  const completeGuide = () => {
    setIsGuideActive(false);
    if (featureHighlight && !completedGuides.includes(featureHighlight)) {
      setCompletedGuides(prev => [...prev, featureHighlight]);
    }
  };

  const dismissGuide = () => {
    setIsGuideActive(false);
  };

  const resetGuides = () => {
    if (persistKey) {
      localStorage.removeItem(`guide-completed-${persistKey}`);
    }
    setCompletedGuides([]);
  };

  return {
    isGuideActive,
    highlightedElements,
    startGuide,
    completeGuide,
    dismissGuide,
    highlightElement,
    resetGuides,
  };
}
