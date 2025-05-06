/**
 * Serviço para gerenciar o nível de expertise do usuário
 */
class ExpertiseService {
  constructor() {
    this.expertiseLevel = this.getStoredExpertiseLevel() || 'beginner';
    this.featureVisibility = this.getStoredFeatureVisibility() || this.getDefaultFeatureVisibility();
  }

  getStoredExpertiseLevel() {
    return localStorage.getItem('userExpertiseLevel');
  }

  getStoredFeatureVisibility() {
    const stored = localStorage.getItem('featureVisibility');
    return stored ? JSON.parse(stored) : null;
  }

  getDefaultFeatureVisibility() {
    return {
      advancedSearch: false,
      customQueries: false,
      dataAnalytics: false,
      exportTools: false,
      apiAccess: false
    };
  }

  setExpertiseLevel(level) {
    this.expertiseLevel = level;
    localStorage.setItem('userExpertiseLevel', level);
    
    // Ajusta características visíveis com base no nível
    this.updateFeatureVisibility(level);
  }

  updateFeatureVisibility(level) {
    const visibility = { ...this.getDefaultFeatureVisibility() };
    
    switch(level) {
      case 'intermediate':
        visibility.advancedSearch = true;
        visibility.exportTools = true;
        break;
      case 'advanced':
        visibility.advancedSearch = true;
        visibility.customQueries = true;
        visibility.exportTools = true;
        visibility.dataAnalytics = true;
        break;
      case 'expert':
        visibility.advancedSearch = true;
        visibility.customQueries = true;
        visibility.exportTools = true;
        visibility.dataAnalytics = true;
        visibility.apiAccess = true;
        break;
    }
    
    this.featureVisibility = visibility;
    localStorage.setItem('featureVisibility', JSON.stringify(visibility));
  }

  isFeatureVisible(featureName) {
    return this.featureVisibility[featureName] || false;
  }

  toggleFeature(featureName, isVisible) {
    this.featureVisibility[featureName] = isVisible;
    localStorage.setItem('featureVisibility', JSON.stringify(this.featureVisibility));
  }

  // Método para detectar progresso e ajustar o nível automaticamente
  trackProgress(action, count) {
    // Implementação de lógica para detectar uso avançado
    // e recomendar automaticamente um nível mais alto
  }
}

export default new ExpertiseService();
