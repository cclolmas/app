import React, { useState } from 'react';
import { useAccessibilityContext } from '../../contexts/AccessibilityContext';
import { Tabs, Tab, Panel } from '../ui/Tabs';
import { Switch } from '../ui/Switch';
import { RadioGroup } from '../ui/RadioGroup';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';
import { InfoTooltip } from '../ui/InfoTooltip';

export function AccessibilitySettings({ onClose }) {
  const {
    settings,
    updateSetting,
    updateNestedSetting,
    resetToDefaults,
    isLoading
  } = useAccessibilityContext();
  
  const [activeTab, setActiveTab] = useState('interface');
  
  if (isLoading) {
    return <div className="accessibility-settings-loading">Carregando configurações...</div>;
  }

  return (
    <div className="accessibility-settings">
      <div className="accessibility-settings-header">
        <h2>Configurações de Acessibilidade e Personalização</h2>
        <Button variant="icon" onClick={onClose} aria-label="Fechar">
          <span className="icon">×</span>
        </Button>
      </div>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tab id="interface" label="Interface" />
        <Tab id="cognitive" label="Carga Cognitiva" />
        <Tab id="notifications" label="Notificações" />
        <Tab id="advanced" label="Opções Avançadas" />
      </Tabs>

      <div className="accessibility-settings-content">
        <Panel id="interface" active={activeTab === 'interface'}>
          <h3>Nível de Interface</h3>
          <div className="setting-description">
            Escolha o nível de complexidade da interface que melhor se adapta às suas necessidades.
          </div>
          <RadioGroup
            name="interfaceLevel"
            value={settings.interfaceLevel}
            onChange={(value) => updateSetting('interfaceLevel', value)}
            options={[
              { 
                value: 'simplified', 
                label: 'Simplificada',
                description: 'Exibe apenas as funcionalidades essenciais, com passos guiados e menor carga cognitiva.'
              },
              { 
                value: 'standard', 
                label: 'Padrão',
                description: 'Equilíbrio entre funcionalidades e simplicidade para a maioria dos usuários.'
              },
              { 
                value: 'advanced', 
                label: 'Avançada',
                description: 'Acesso completo a todas as funcionalidades e configurações avançadas.'
              }
            ]}
          />

          <h3>Tamanho da Fonte</h3>
          <RadioGroup
            name="fontSize"
            value={settings.fontSize}
            onChange={(value) => updateSetting('fontSize', value)}
            options={[
              { value: 'small', label: 'Pequena' },
              { value: 'medium', label: 'Média' },
              { value: 'large', label: 'Grande' },
              { value: 'x-large', label: 'Extra grande' }
            ]}
          />

          <h3>Modo de Cor</h3>
          <RadioGroup
            name="colorMode"
            value={settings.colorMode}
            onChange={(value) => updateSetting('colorMode', value)}
            options={[
              { value: 'default', label: 'Padrão do sistema' },
              { value: 'light', label: 'Tema claro' },
              { value: 'dark', label: 'Tema escuro' },
              { 
                value: 'high-contrast', 
                label: 'Alto contraste',
                description: 'Cores de alto contraste para melhorar a legibilidade'
              },
              { value: 'custom', label: 'Personalizado' }
            ]}
          />

          {settings.colorMode === 'custom' && (
            <div className="custom-colors-section">
              <h4>Cores personalizadas</h4>
              <div className="color-pickers">
                <div className="color-picker-item">
                  <label>Cor primária</label>
                  <ColorPicker 
                    value={settings.customColors.primary}
                    onChange={(value) => updateNestedSetting('customColors', 'primary', value)}
                  />
                </div>
                <div className="color-picker-item">
                  <label>Cor secundária</label>
                  <ColorPicker 
                    value={settings.customColors.secondary}
                    onChange={(value) => updateNestedSetting('customColors', 'secondary', value)}
                  />
                </div>
                <div className="color-picker-item">
                  <label>Cor de fundo</label>
                  <ColorPicker 
                    value={settings.customColors.background}
                    onChange={(value) => updateNestedSetting('customColors', 'background', value)}
                  />
                </div>
                <div className="color-picker-item">
                  <label>Cor do texto</label>
                  <ColorPicker 
                    value={settings.customColors.text}
                    onChange={(value) => updateNestedSetting('customColors', 'text', value)}
                  />
                </div>
              </div>
            </div>
          )}
        </Panel>

        <Panel id="cognitive" active={activeTab === 'cognitive'}>
          <h3>Redução de Carga Cognitiva</h3>
          <div className="settings-option">
            <Switch
              id="reduceAnimations"
              checked={settings.reduceAnimations}
              onChange={(checked) => updateSetting('reduceAnimations', checked)}
              label="Reduzir animações"
            />
            <InfoTooltip text="Minimiza ou elimina animações que podem ser distrativas ou aumentar a carga cognitiva" />
          </div>

          <div className="settings-option">
            <Switch
              id="reduceVisualComplexity"
              checked={settings.reduceVisualComplexity}
              onChange={(checked) => updateSetting('reduceVisualComplexity', checked)}
              label="Reduzir complexidade visual"
            />
            <InfoTooltip text="Simplifica a interface removendo elementos decorativos e enfatizando o conteúdo essencial" />
          </div>

          <div className="settings-option">
            <Switch
              id="enableProgressiveDifficulty"
              checked={settings.enableProgressiveDifficulty}
              onChange={(checked) => updateSetting('enableProgressiveDifficulty', checked)}
              label="Dificuldade progressiva"
            />
            <InfoTooltip text="Adapta a complexidade das tarefas com base em seu progresso e nível de experiência" />
          </div>
          
          <h3>Monitoramento de Carga</h3>
          <div className="settings-option">
            <Switch
              id="showCognitiveLoadIndicator"
              checked={settings.showCognitiveLoadIndicator}
              onChange={(checked) => updateSetting('showCognitiveLoadIndicator', checked)}
              label="Mostrar indicador de Carga Cognitiva"
            />
            <InfoTooltip text="Exibe uma estimativa da carga cognitiva atual para ajudar no gerenciamento do esforço mental" />
          </div>

          <div className="settings-option">
            <Switch
              id="showComputationalLoadIndicator"
              checked={settings.showComputationalLoadIndicator}
              onChange={(checked) => updateSetting('showComputationalLoadIndicator', checked)}
              label="Mostrar indicador de Carga Computacional"
            />
            <InfoTooltip text="Exibe informações sobre o consumo de recursos computacionais das operações atuais" />
          </div>
        </Panel>

        <Panel id="notifications" active={activeTab === 'notifications'}>
          <h3>Nível de Notificações</h3>
          <RadioGroup
            name="notificationLevel"
            value={settings.notificationLevel}
            onChange={(value) => updateSetting('notificationLevel', value)}
            options={[
              { 
                value: 'minimal', 
                label: 'Mínimo', 
                description: 'Apenas notificações críticas e essenciais'
              },
              { 
                value: 'standard', 
                label: 'Padrão',
                description: 'Equilíbrio entre informação e distração'
              },
              { 
                value: 'detailed', 
                label: 'Detalhado',
                description: 'Todas as notificações e atualizações disponíveis'
              }
            ]}
          />

          <h3>Estilo de Feedback</h3>
          <RadioGroup
            name="feedbackStyle"
            value={settings.feedbackStyle}
            onChange={(value) => updateSetting('feedbackStyle', value)}
            options={[
              { value: 'visual-only', label: 'Apenas visual' },
              { value: 'text-only', label: 'Apenas texto' },
              { value: 'visual-text', label: 'Visual e texto' },
              { value: 'audio-visual', label: 'Áudio e visual' }
            ]}
          />

          <h3>Frequência de Feedback</h3>
          <RadioGroup
            name="feedbackFrequency"
            value={settings.feedbackFrequency}
            onChange={(value) => updateSetting('feedbackFrequency', value)}
            options={[
              { value: 'low', label: 'Baixa', description: 'Apenas em pontos críticos ou ao concluir tarefas' },
              { value: 'medium', label: 'Média', description: 'Equilíbrio entre orientação e autonomia' },
              { value: 'high', label: 'Alta', description: 'Feedback constante durante o progresso' }
            ]}
          />
        </Panel>

        <Panel id="advanced" active={activeTab === 'advanced'}>
          <h3>Suporte Cognitivo</h3>
          <div className="settings-option">
            <Switch
              id="enableScaffolding"
              checked={settings.enableScaffolding}
              onChange={(checked) => updateSetting('enableScaffolding', checked)}
              label="Habilitar scaffolding (suporte gradual)"
            />
            <InfoTooltip text="Oferece suporte adicional para tarefas complexas, que é gradualmente removido conforme você ganha proficiência" />
          </div>

          <h3>Configurações do sistema</h3>
          <Button 
            variant="secondary" 
            className="mt-4"
            onClick={resetToDefaults}
          >
            Restaurar configurações padrão
          </Button>
          
          <div className="accessibility-info mt-6">
            <h4>Sobre acessibilidade</h4>
            <p>
              Estas configurações foram desenvolvidas para ajudar a gerenciar a Carga Cognitiva (CL) e
              adaptar a interface às suas necessidades específicas. A personalização adequada pode 
              reduzir a Carga Extrínseca (ECL) e permitir um melhor foco nas tarefas importantes.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
