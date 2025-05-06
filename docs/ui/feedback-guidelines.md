# Diretrizes de Feedback de UI

Este documento estabelece diretrizes para implementação e avaliação dos componentes de feedback na plataforma CrossDebate.

## Objetivos de Feedback Efetivo

Um sistema de feedback eficaz deve:

1. **Informar o usuário** sobre o resultado de suas ações
2. **Fornecer orientações** claras sobre próximos passos
3. **Evitar sobrecarga** de informações ou interrupções
4. **Ser consistente** em toda a aplicação

## Tipos de Feedback

### Feedback de Sucesso
- Usar para confirmação de ações completadas com êxito
- Mostrar por 3 segundos (padrão)
- Usar a cor verde (`success`)

### Feedback de Erro
- Usar para informar falhas que requerem atenção do usuário
- Mostrar por 5 segundos ou até interação do usuário
- Usar a cor vermelha (`error`)
- Incluir orientação sobre como resolver o problema quando possível

### Feedback de Alerta
- Usar para avisos que não impedem o funcionamento mas requerem atenção
- Mostrar por 4 segundos
- Usar a cor amarela (`warning`)

### Feedback Informativo
- Usar para atualizações gerais que não são críticas
- Mostrar por 3 segundos
- Usar a cor azul (`info`)

## Métricas de Qualidade

Para avaliar a qualidade do feedback, monitore:

1. **Tempo de resposta**: O feedback deve aparecer em menos de 100ms após a ação do usuário
2. **Clareza**: A mensagem deve ter entre 40-80 caracteres
3. **Visibilidade**: O componente deve estar visível por tempo suficiente para ser lido
4. **Posicionamento**: Colocar em local consistente e visível (padrão: topo-centro)

## Componentes Disponíveis

A plataforma oferece dois sistemas principais de feedback:

1. **Contexto de Feedback**: Componente global para feedbacks transientes via `useFeedback()`
2. **FeedbackTester**: Componente para testar diferentes configurações de feedback

## Como Testar

Para avaliar se o feedback é apresentado de forma clara e em tempo hábil:

1. Use o componente `FeedbackTester` para simular diferentes cenários
2. Execute os testes automatizados em `src/tests/feedback/`
3. Verifique se os alertas são renderizados dentro do limite de 100ms
4. Confirme que as mensagens permanecem visíveis pelo tempo configurado
5. Teste em diferentes tamanhos de tela para garantir visibilidade

## Exemplo de Uso

```jsx
import { useFeedback } from './components/feedback/FeedbackContext';

const MyComponent = () => {
  const { showFeedback } = useFeedback();
  
  const handleSubmit = async (data) => {
    try {
      await api.postData(data);
      showFeedback({
        type: 'success',
        message: 'Dados salvos com sucesso!',
      });
    } catch (error) {
      showFeedback({
        type: 'error',
        message: 'Erro ao salvar os dados. Tente novamente.',
      });
    }
  };
  
  // resto do componente...
};
```

## Recomendações para Desenvolvedores

1. Use o `FeedbackContext` para mensagens globais transitórias
2. Use componentes `Alert` inline para mensagens persistentes
3. Mantenha mensagens concisas e específicas
4. Inclua ações quando apropriado (ex: "Desfazer" ou "Tentar novamente")
5. Teste com usuários para calibrar tempos de exibição
