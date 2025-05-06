/**
 * Serviço para gerenciar preferências e configurações do usuário
 */
class UserPreferencesService {
  constructor() {
    this.storageKey = 'userPreferences';
    this.defaultPreferences = {
      experienceLevel: 'novice',
      interfaceMode: 'simplified',
      enableTutorials: true,
      completedTutorials: [],
      lastFeatureUnlock: null
    };
  }

  /**
   * Obtém todas as preferências do usuário
   * @returns {Object} As preferências do usuário
   */
  getAllPreferences() {
    try {
      const savedPrefs = localStorage.getItem(this.storageKey);
      return savedPrefs ? JSON.parse(savedPrefs) : {...this.defaultPreferences};
    } catch (e) {
      console.error('Erro ao recuperar preferências do usuário:', e);
      return {...this.defaultPreferences};
    }
  }

  /**
   * Obtém uma preferência específica do usuário
   * @param {string} key - A chave da preferência
   * @param {any} defaultValue - Valor padrão caso a preferência não exista
   * @returns {any} O valor da preferência
   */
  getPreference(key, defaultValue = null) {
    const prefs = this.getAllPreferences();
    return prefs[key] !== undefined ? prefs[key] : defaultValue;
  }

  /**
   * Define uma preferência do usuário
   * @param {string} key - A chave da preferência
   * @param {any} value - O novo valor
   */
  setPreference(key, value) {
    try {
      const prefs = this.getAllPreferences();
      prefs[key] = value;
      localStorage.setItem(this.storageKey, JSON.stringify(prefs));
      return true;
    } catch (e) {
      console.error('Erro ao salvar preferências do usuário:', e);
      return false;
    }
  }

  /**
   * Verifica se o usuário deve ver a interface simplificada
   * @returns {boolean} True se deve exibir interface simplificada
   */
  shouldShowSimplifiedInterface() {
    const experienceLevel = this.getPreference('experienceLevel');
    const interfaceMode = this.getPreference('interfaceMode');
    
    // Interface simplificada se for novato ou se o modo foi explicitamente escolhido
    return experienceLevel === 'novice' || interfaceMode === 'simplified';
  }

  /**
   * Atualiza o nível de experiência do usuário
   * @param {string} level - O novo nível de experiência
   */
  updateExperienceLevel(level) {
    if (['novice', 'intermediate', 'advanced'].includes(level)) {
      this.setPreference('experienceLevel', level);
      
      // Registra quando o usuário avançou para um nível não-novato
      if (level !== 'novice') {
        this.setPreference('lastFeatureUnlock', new Date().toISOString());
      }
      
      return true;
    }
    return false;
  }

  /**
   * Verifica se é a primeira sessão do usuário
   * @returns {boolean} True se for a primeira sessão
   */
  isFirstSession() {
    return !localStorage.getItem(this.storageKey);
  }
}

export default new UserPreferencesService();
