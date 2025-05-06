import { ExpertiseLevel, UserExpertiseSettings, defaultExpertiseSettings } from '../models/UserExpertiseSettings';

export class ExpertiseLevelService {
  private userSettings: UserExpertiseSettings;
  private static instance: ExpertiseLevelService;

  private constructor() {
    // Load from localStorage or use default settings
    const savedSettings = localStorage.getItem('userExpertiseSettings');
    this.userSettings = savedSettings 
      ? JSON.parse(savedSettings) 
      : { ...defaultExpertiseSettings };
  }

  static getInstance(): ExpertiseLevelService {
    if (!ExpertiseLevelService.instance) {
      ExpertiseLevelService.instance = new ExpertiseLevelService();
    }
    return ExpertiseLevelService.instance;
  }

  getUserSettings(): UserExpertiseSettings {
    return { ...this.userSettings };
  }

  updateExpertiseLevel(level: ExpertiseLevel): void {
    this.userSettings.currentLevel = level;
    this.saveSettings();
  }

  toggleFeatureVisibility(featureId: string, visible: boolean): void {
    if (visible) {
      this.userSettings.hiddenFeatures = this.userSettings.hiddenFeatures.filter(id => id !== featureId);
    } else if (!this.userSettings.hiddenFeatures.includes(featureId)) {
      this.userSettings.hiddenFeatures.push(featureId);
    }
    this.saveSettings();
  }

  setCustomPreference(key: string, value: boolean): void {
    this.userSettings.customPreferences[key] = value;
    this.saveSettings();
  }

  isFeatureVisible(featureId: string, requiredLevel?: ExpertiseLevel): boolean {
    // Check if feature is explicitly hidden by user preference
    if (this.userSettings.hiddenFeatures.includes(featureId)) {
      return false;
    }
    
    // Check if feature requires a specific expertise level
    if (requiredLevel) {
      const levels = Object.values(ExpertiseLevel);
      const currentLevelIndex = levels.indexOf(this.userSettings.currentLevel);
      const requiredLevelIndex = levels.indexOf(requiredLevel);
      
      // Feature is visible only if user's level is equal to or higher than required level
      return currentLevelIndex >= requiredLevelIndex;
    }
    
    return true;
  }

  private saveSettings(): void {
    localStorage.setItem('userExpertiseSettings', JSON.stringify(this.userSettings));
  }
}
