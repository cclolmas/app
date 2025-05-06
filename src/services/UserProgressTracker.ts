import { ExpertiseLevel } from '../models/UserExpertiseSettings';
import { ExpertiseLevelService } from './ExpertiseLevelService';

interface ProgressMetrics {
  debatesCompleted: number;
  featuresUsed: Set<string>;
  advancedActionsUsed: number;
  timeSpentOnPlatform: number; // in minutes
  lastUpdate: number;
}

export class UserProgressTracker {
  private metrics: ProgressMetrics;
  private static instance: UserProgressTracker;
  private expertiseService = ExpertiseLevelService.getInstance();

  private constructor() {
    // Load stored metrics or initialize new ones
    const savedMetrics = localStorage.getItem('userProgressMetrics');
    this.metrics = savedMetrics 
      ? JSON.parse(savedMetrics, (key, value) => {
          if (key === 'featuresUsed') return new Set(value);
          return value;
        }) 
      : {
          debatesCompleted: 0,
          featuresUsed: new Set<string>(),
          advancedActionsUsed: 0,
          timeSpentOnPlatform: 0,
          lastUpdate: Date.now()
        };
    
    // Start tracking time on platform
    this.startTimeTracking();
  }

  static getInstance(): UserProgressTracker {
    if (!UserProgressTracker.instance) {
      UserProgressTracker.instance = new UserProgressTracker();
    }
    return UserProgressTracker.instance;
  }

  recordDebateCompleted(): void {
    this.metrics.debatesCompleted++;
    this.saveMetrics();
    this.evaluateExpertiseLevel();
  }

  recordFeatureUsed(featureId: string): void {
    this.metrics.featuresUsed.add(featureId);
    this.saveMetrics();
    this.evaluateExpertiseLevel();
  }

  recordAdvancedAction(): void {
    this.metrics.advancedActionsUsed++;
    this.saveMetrics();
    this.evaluateExpertiseLevel();
  }

  private startTimeTracking(): void {
    // Update time spent every minute
    setInterval(() => {
      const now = Date.now();
      const minutesElapsed = (now - this.metrics.lastUpdate) / (1000 * 60);
      this.metrics.timeSpentOnPlatform += minutesElapsed;
      this.metrics.lastUpdate = now;
      this.saveMetrics();
      this.evaluateExpertiseLevel();
    }, 60000); // Check every minute
  }

  private evaluateExpertiseLevel(): void {
    const userSettings = this.expertiseService.getUserSettings();
    
    // Only auto-adjust if the setting is enabled
    if (!userSettings.autoAdjustInterface) return;
    
    let newLevel = ExpertiseLevel.BEGINNER;
    
    // Determine expertise level based on metrics
    if (
      this.metrics.debatesCompleted >= 20 ||
      this.metrics.timeSpentOnPlatform >= 1000 ||
      this.metrics.featuresUsed.size >= 15
    ) {
      newLevel = ExpertiseLevel.EXPERT;
    } else if (
      this.metrics.debatesCompleted >= 10 ||
      this.metrics.timeSpentOnPlatform >= 500 ||
      this.metrics.featuresUsed.size >= 10
    ) {
      newLevel = ExpertiseLevel.ADVANCED;
    } else if (
      this.metrics.debatesCompleted >= 3 ||
      this.metrics.timeSpentOnPlatform >= 120 ||
      this.metrics.featuresUsed.size >= 5
    ) {
      newLevel = ExpertiseLevel.INTERMEDIATE;
    }
    
    // Update if level has increased
    if (this.getLevelValue(newLevel) > this.getLevelValue(userSettings.currentLevel)) {
      this.expertiseService.updateExpertiseLevel(newLevel);
    }
  }

  private getLevelValue(level: ExpertiseLevel): number {
    const levels = {
      [ExpertiseLevel.BEGINNER]: 0,
      [ExpertiseLevel.INTERMEDIATE]: 1,
      [ExpertiseLevel.ADVANCED]: 2,
      [ExpertiseLevel.EXPERT]: 3
    };
    return levels[level];
  }

  private saveMetrics(): void {
    localStorage.setItem('userProgressMetrics', JSON.stringify(
      this.metrics,
      (key, value) => {
        if (key === 'featuresUsed') return Array.from(value);
        return value;
      }
    ));
  }
}
