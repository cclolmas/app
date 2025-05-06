export enum ExpertiseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface UserExpertiseSettings {
  currentLevel: ExpertiseLevel;
  advancedFeaturesEnabled: boolean;
  autoAdjustInterface: boolean;
  hiddenFeatures: string[];
  customPreferences: Record<string, boolean>;
}

export const defaultExpertiseSettings: UserExpertiseSettings = {
  currentLevel: ExpertiseLevel.BEGINNER,
  advancedFeaturesEnabled: false,
  autoAdjustInterface: true,
  hiddenFeatures: [],
  customPreferences: {}
};
