/**
 * Utilities to integrate with external monitoring tools
 * for value comparison and verification
 */

const axios = require('axios');
const logger = require('./logger');

class ExternalToolsIntegration {
  /**
   * Send data to a generic HTTP endpoint (e.g., for tools like Datadog, New Relic, etc.)
   */
  static async sendToHttpEndpoint(url, data, options = {}) {
    try {
      const response = await axios.post(url, data, options);
      logger.info('Data sent to external monitoring tool', { url, status: response.status });
      return response.data;
    } catch (error) {
      logger.error('Failed to send data to external monitoring tool', { 
        url, 
        error: error.message,
        stack: error.stack 
      });
      throw error;
    }
  }
  
  /**
   * Compare application values with values from an external API
   */
  static async compareWithExternalApi(appValue, apiEndpoint, transformFn = data => data) {
    try {
      const response = await axios.get(apiEndpoint);
      const externalValue = transformFn(response.data);
      
      const isEqual = JSON.stringify(appValue) === JSON.stringify(externalValue);
      
      logger.compareValues(externalValue, appValue, `External API comparison: ${apiEndpoint}`);
      
      return {
        isEqual,
        appValue,
        externalValue,
        source: apiEndpoint
      };
    } catch (error) {
      logger.error('Failed to compare with external API', {
        apiEndpoint,
        error: error.message
      });
      throw error;
    }
  }
  
  /**
   * Export application data to a format compatible with external analysis tools
   */
  static exportForExternalAnalysis(data, format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(data, null, 2);
        
      case 'csv':
        // Simple conversion for flat objects
        if (!data || !data.length || typeof data[0] !== 'object') {
          return 'No data or invalid format for CSV conversion';
        }
        
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => 
          Object.values(row).map(val => 
            typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
          ).join(',')
        );
        
        return [headers, ...rows].join('\n');
        
      default:
        logger.warn(`Unsupported export format: ${format}`);
        return JSON.stringify(data);
    }
  }
  
  /**
   * Send data to a webhook for integration with tools like Slack, Discord, etc.
   */
  static async sendWebhookNotification(webhookUrl, message, data = {}) {
    try {
      const payload = {
        text: message,
        attachments: [
          {
            title: 'Comparison Results',
            fields: Object.entries(data).map(([key, value]) => ({
              title: key,
              value: typeof value === 'object' ? JSON.stringify(value) : String(value),
              short: false
            }))
          }
        ]
      };
      
      await axios.post(webhookUrl, payload);
      logger.info('Webhook notification sent', { webhookUrl });
      return true;
    } catch (error) {
      logger.error('Failed to send webhook notification', {
        webhookUrl,
        error: error.message
      });
      return false;
    }
  }
}

module.exports = ExternalToolsIntegration;
