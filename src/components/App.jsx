import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useAccessibilityContext } from '../contexts/AccessibilityContext';
import AppLayout from './layout/AppLayout';
import Routes from './routes/Routes';

// Componentes de indicadores de carga cognitiva/computacional
import { CognitiveLoadIndicator } from './accessibility/CognitiveLoadIndicator';
import { ComputationalLoadIndicator } from './accessibility/ComputationalLoadIndicator';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AccessibilityProvider>
          <div className="app">
            {/* Layout da aplicação */}
            <AppLayout>
              <Routes>
                {/* Rotas da aplicação */}
              </Routes>
              
              {/* Componentes de acessibilidade que são renderizados condicionalmente */}
              <AccessibilityIndicators />
            </AppLayout>
          </div>
        </AccessibilityProvider>
      </ThemeProvider>
    </Router>
  );
}

// Componente auxiliar para renderizar os indicadores com base nas configurações
function AccessibilityIndicators() {
  const { settings } = useAccessibilityContext();
  
  return (
    <>
      {settings.showCognitiveLoadIndicator && <CognitiveLoadIndicator />}
      {settings.showComputationalLoadIndicator && <ComputationalLoadIndicator />}
    </>
  );
}

export default App;