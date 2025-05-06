import React, { useState } from 'react';
import { VisualHighlight } from '../components/ui/VisualHighlight';
import { UserGuide } from '../components/ui/UserGuide';
import { useVisualGuidance } from '../hooks/useVisualGuidance';

export const FeatureHighlightExample = () => {
  const [showTour, setShowTour] = useState(false);
  const { 
    isGuideActive,
    startGuide,
    completeGuide,
    dismissGuide
  } = useVisualGuidance({
    featureHighlight: 'main-features',
    persistKey: 'user-onboarding'
  });

  const guideSteps = [
    {
      targetId: 'debate-button',
      content: <p>Clique aqui para iniciar um novo debate ou participar de um debate existente.</p>,
      position: 'bottom' as const
    },
    {
      targetId: 'search-box',
      content: <p>Pesquise tópicos, usuários ou debates para encontrar conteúdo relevante.</p>,
      position: 'right' as const
    },
    {
      targetId: 'settings-panel',
      content: <p>Acesse suas configurações para personalizar sua experiência na plataforma.</p>,
      position: 'left' as const
    }
  ];

  return (
    <div className="p-6">
      <h1>Plataforma de Debate</h1>
      
      <div className="mt-4 flex justify-between items-center">
        <VisualHighlight active={!isGuideActive} type="pulse" priority="medium">
          <button 
            id="debate-button"
            className="px-4 py-2 bg-blue-600 text-white rounded interactive-element"
          >
            Iniciar Debate
          </button>
        </VisualHighlight>
        
        <div id="search-box" className="border rounded-md px-3 py-2 w-64">
          <input 
            type="text" 
            placeholder="Pesquisar debates..." 
            className="w-full outline-none"
          />
        </div>
        
        <VisualHighlight type="glow" priority="low">
          <div 
            id="settings-panel"
            className="border rounded-md p-2 cursor-pointer interactive-element"
          >
            Configurações
          </div>
        </VisualHighlight>
      </div>
      
      <div className="mt-8">
        <button 
          onClick={() => setShowTour(true)}
          className="text-blue-600 underline"
        >
          Mostrar tour de orientação
        </button>
      </div>

      {showTour && (
        <UserGuide
          steps={guideSteps}
          isActive={true}
          onComplete={() => {
            setShowTour(false);
            completeGuide();
          }}
          onDismiss={() => {
            setShowTour(false);
            dismissGuide();
          }}
        />
      )}
    </div>
  );
};
