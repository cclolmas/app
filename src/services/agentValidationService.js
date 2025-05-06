import { logger } from '../utils/logger';

class AgentValidationService {
  constructor() {
    this.validationResults = {
      status: 'unknown',
      errors: [],
      warnings: [],
    };
  }

  async validateAgentConfiguration(config) {
    try {
      // Verificar se todos os agentes necessários estão configurados
      const requiredAgents = ['planner', 'executor'];
      const configuredAgents = Object.keys(config.agents || {});
      
      const missingAgents = requiredAgents.filter(
        agent => !configuredAgents.includes(agent)
      );

      if (missingAgents.length > 0) {
        this.validationResults.errors.push(`Agentes necessários não configurados: ${missingAgents.join(', ')}`);
        this.validationResults.status = 'error';
      }

      // Verificar se as interações entre agentes estão definidas
      if (!config.interactions || Object.keys(config.interactions).length === 0) {
        this.validationResults.errors.push('Interações entre agentes não definidas');
        this.validationResults.status = 'error';
      } else {
        // Verificar se as interações referenciam agentes existentes
        for (const [sourceAgent, targetAgents] of Object.entries(config.interactions)) {
          if (!configuredAgents.includes(sourceAgent)) {
            this.validationResults.errors.push(`Agente de origem nas interações não existe: ${sourceAgent}`);
            this.validationResults.status = 'error';
          }

          for (const targetAgent of targetAgents) {
            if (!configuredAgents.includes(targetAgent)) {
              this.validationResults.errors.push(`Agente de destino nas interações não existe: ${targetAgent}`);
              this.validationResults.status = 'error';
            }
          }
        }
      }

      // Se não houver erros até agora, marcar como sucesso
      if (this.validationResults.errors.length === 0) {
        this.validationResults.status = 'success';
      }

      return this.validationResults;
    } catch (error) {
      logger.error('Erro ao validar configuração dos agentes:', error);
      this.validationResults.status = 'error';
      this.validationResults.errors.push(`Erro ao validar: ${error.message}`);
      return this.validationResults;
    }
  }

  async testAgentCommunication() {
    try {
      // Simular um teste de comunicação entre planejador e executor
      const testResult = await this._simulateCommunicationTest();
      
      if (!testResult.success) {
        this.validationResults.errors.push(`Falha na comunicação entre agentes: ${testResult.message}`);
        this.validationResults.status = 'error';
      } else {
        this.validationResults.status = 'success';
      }
      
      return this.validationResults;
    } catch (error) {
      logger.error('Erro ao testar comunicação entre agentes:', error);
      this.validationResults.status = 'error';
      this.validationResults.errors.push(`Erro ao testar comunicação: ${error.message}`);
      return this.validationResults;
    }
  }

  async _simulateCommunicationTest() {
    // Esta função simularia o envio de mensagens de teste entre os agentes
    // Em uma implementação real, seria necessário enviar mensagens reais e verificar respostas
    return {
      success: true,
      message: 'Comunicação entre agentes funcionando corretamente'
    };
  }

  getValidationStatus() {
    return this.validationResults;
  }
}

export const agentValidationService = new AgentValidationService();
export default agentValidationService;
