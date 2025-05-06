import React, { useState, useEffect } from 'react';
import { ExpertiseLevel, UserExpertiseSettings } from '../models/UserExpertiseSettings';
import { ExpertiseLevelService } from '../services/ExpertiseLevelService';

export const ExpertiseLevelSelector: React.FC = () => {
  const [settings, setSettings] = useState<UserExpertiseSettings | null>(null);
  const expertiseService = ExpertiseLevelService.getInstance();

  useEffect(() => {
    setSettings(expertiseService.getUserSettings());
  }, []);

  if (!settings) return null;

  const handleLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const level = event.target.value as ExpertiseLevel;
    expertiseService.updateExpertiseLevel(level);
    setSettings(expertiseService.getUserSettings());
  };

  const handleAutoAdjustChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSettings = { 
      ...settings, 
      autoAdjustInterface: event.target.checked 
    };
    expertiseService.setCustomPreference('autoAdjustInterface', event.target.checked);
    setSettings(newSettings);
  };

  return (
    <div className="expertise-level-selector">
      <h3>Interface Settings</h3>
      
      <div className="form-group">
        <label htmlFor="expertiseLevel">Your expertise level:</label>
        <select 
          id="expertiseLevel" 
          value={settings.currentLevel}
          onChange={handleLevelChange}
        >
          <option value={ExpertiseLevel.BEGINNER}>Beginner</option>
          <option value={ExpertiseLevel.INTERMEDIATE}>Intermediate</option>
          <option value={ExpertiseLevel.ADVANCED}>Advanced</option>
          <option value={ExpertiseLevel.EXPERT}>Expert</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={settings.autoAdjustInterface}
            onChange={handleAutoAdjustChange}
          />
          Automatically adjust interface based on my progress
        </label>
      </div>
    </div>
  );
};
