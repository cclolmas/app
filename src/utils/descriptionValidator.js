/**
 * Utility functions for validating and improving problem descriptions
 */

/**
 * Checks if a description meets clarity standards
 * @param {string} description - The problem description to validate
 * @returns {Object} Validation result with status and suggestions
 */
export const validateDescription = (description) => {
  if (!description) {
    return {
      isValid: false,
      message: 'A descrição não pode estar vazia.',
      suggestions: []
    };
  }

  const result = {
    isValid: true,
    message: 'A descrição parece clara.',
    suggestions: []
  };

  // Check minimum length
  if (description.length < 30) {
    result.isValid = false;
    result.message = 'A descrição é muito curta para ser clara.';
    result.suggestions.push('Adicione mais detalhes para tornar o problema compreensível.');
  }

  // Check for technical jargon (simplistic approach)
  const jargonPattern = /\b(técnico|complexo|específico|implementação|algoritmo|framework)\b/gi;
  const jargonMatches = description.match(jargonPattern);
  if (jargonMatches && jargonMatches.length > 3) {
    result.isValid = false;
    result.message = 'A descrição contém muito jargão técnico.';
    result.suggestions.push('Simplifique a linguagem para torná-la mais acessível.');
  }

  // Check for structure
  if (!description.includes('.') && description.length > 100) {
    result.suggestions.push('Considere dividir o texto em frases curtas para melhor compreensão.');
  }

  // Check for examples
  if (!description.toLowerCase().includes('exemplo') && !description.toLowerCase().includes('por exemplo')) {
    result.suggestions.push('Incluir exemplos pode tornar o problema mais compreensível.');
  }

  return result;
};

/**
 * Suggests improvements for a problem description
 * @param {string} description - The problem description to improve
 * @returns {string} Improved description suggestion
 */
export const suggestImprovedDescription = (description) => {
  const validation = validateDescription(description);
  
  if (validation.isValid && validation.suggestions.length === 0) {
    return description;
  }
  
  // Simple improvement logic - in a real app, this could be much more sophisticated
  let improved = description;
  
  if (improved.length < 30) {
    improved += " Considere expandir esta descrição com mais detalhes sobre o contexto do problema e o que se espera como solução.";
  }
  
  return improved;
};
