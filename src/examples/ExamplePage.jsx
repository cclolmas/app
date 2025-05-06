import React from 'react';
import FeatureWrapper from '../components/FeatureWrapper';
import InterfaceToggler from '../components/InterfaceToggler';
import { shouldShowSimplifiedInterface } from '../utils/userExperienceLevel';

const ExamplePage = () => {
  const isSimplified = shouldShowSimplifiedInterface();

  return (
    <div className="example-page">
      <h1>Exemplo de Interface Adaptativa</h1>
      
      {/* Sempre visível */}
      <section className="basic-features">
        <h2>Recursos Básicos</h2>
        <p>Estes recursos são sempre visíveis para todos os usuários.</p>
        <div className="feature">Recurso básico 1</div>
        <div className="feature">Recurso básico 2</div>
      </section>

      {/* Visível apenas em modo avançado */}
      <FeatureWrapper 
        advancedOnly 
        fallback={
          <div className="locked-feature-notice">
            <p>Recursos avançados estão disponíveis ao mudar para o modo avançado.</p>
          </div>
        }
      >
        <section className="advanced-features">
          <h2>Recursos Avançados</h2>
          <p>Estes recursos são visíveis apenas no modo avançado.</p>
          <div className="feature">Configurações avançadas</div>
          <div className="feature">Análise detalhada</div>
          <div className="feature">Opções personalizadas</div>
        </section>
      </FeatureWrapper>

      {/* Visível apenas para novatos */}
      <FeatureWrapper noviceOnly>
        <section className="tutorial-section">
          <h2>Dicas para Iniciantes</h2>
          <p>Esta seção contém dicas úteis para ajudar usuários novatos.</p>
          <div className="tip">Dica 1: Comece com as funções básicas</div>
          <div className="tip">Dica 2: Explore aos poucos os recursos</div>
        </section>
      </FeatureWrapper>

      {/* Botão para alternar entre modos */}
      <InterfaceToggler />
    </div>
  );
};

export default ExamplePage;
