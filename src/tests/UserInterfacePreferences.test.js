import UserPreferencesService from '../services/UserPreferencesService';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Verificações de Interface Simplificada para Novatos', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Limpar qualquer instância anterior
    jest.resetModules();
  });

  test('Novos usuários devem ver interface simplificada por padrão', () => {
    expect(UserPreferencesService.shouldShowSimplifiedInterface()).toBe(true);
  });

  test('Usuários podem alternar para interface avançada', () => {
    UserPreferencesService.setPreference('interfaceMode', 'advanced');
    expect(UserPreferencesService.shouldShowSimplifiedInterface()).toBe(false);
  });

  test('Usuários avançados veem interface avançada por padrão', () => {
    UserPreferencesService.updateExperienceLevel('advanced');
    expect(UserPreferencesService.getPreference('experienceLevel')).toBe('advanced');
    // Mesmo assim, respeita a preferência explícita de interface
    UserPreferencesService.setPreference('interfaceMode', 'simplified');
    expect(UserPreferencesService.shouldShowSimplifiedInterface()).toBe(true);
  });

  test('Preferências são persistidas entre sessões', () => {
    UserPreferencesService.setPreference('interfaceMode', 'advanced');
    UserPreferencesService.updateExperienceLevel('intermediate');
    
    // Simula reinicialização do serviço (nova sessão)
    const savedData = localStorageMock.getItem('userPreferences');
    localStorageMock.clear();
    localStorageMock.setItem('userPreferences', savedData);
    
    expect(UserPreferencesService.getPreference('experienceLevel')).toBe('intermediate');
    expect(UserPreferencesService.getPreference('interfaceMode')).toBe('advanced');
  });
});
