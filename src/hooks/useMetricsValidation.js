import { useState, useEffect } from 'react';
import MetricsValidationService from '../services/MetricsValidationService';

/**
 * Hook personalizado para validar e calcular métricas de CL
 * @param {Object|Array} inputData - Dados brutos de entrada
 * @param {string} metricType - Tipo de métrica ('subjective' ou 'progress')
 * @returns {Object} Objeto contendo dados validados, métricas calculadas e informações de erro
 */
function useMetricsValidation(inputData, metricType) {
  const [state, setState] = useState({
    isValidating: true,
    validatedData: null,
    calculatedMetrics: null,
    error: null,
    isValid: false
  });

  useEffect(() => {
    if (!inputData) {
      setState({
        isValidating: false,
        validatedData: null,
        calculatedMetrics: null,
        error: 'Dados de entrada não fornecidos',
        isValid: false
      });
      return;
    }

    setState(prev => ({ ...prev, isValidating: true }));

    try {
      let validated;
      
      if (metricType === 'subjective') {
        validated = MetricsValidationService.validateSubjectiveScaleInput(inputData);
      } else if (metricType === 'progress') {
        validated = MetricsValidationService.validateProgressIndicators(inputData);
      } else {
        throw new Error(`Tipo de métrica não suportado: ${metricType}`);
      }

      const metrics = MetricsValidationService.calculateMetrics(validated);

      setState({
        isValidating: false,
        validatedData: validated,
        calculatedMetrics: metrics,
        error: null,
        isValid: true
      });
    } catch (err) {
      console.error('Erro na validação de métricas:', err);
      setState({
        isValidating: false,
        validatedData: null,
        calculatedMetrics: null,
        error: err.message,
        isValid: false
      });
    }
  }, [inputData, metricType]);

  return state;
}

export default useMetricsValidation;
