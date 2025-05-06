import React from 'react';
import { AdaptiveFeature } from '../components/AdaptiveFeature';
import { ExpertiseLevelSelector } from '../components/ExpertiseLevelSelector';
import { ExpertiseLevel } from '../models/UserExpertiseSettings';
import { UserProgressTracker } from '../services/UserProgressTracker';

export const DebateDashboard: React.FC = () => {
  const progressTracker = UserProgressTracker.getInstance();
  
  const handleAdvancedAction = () => {
    progressTracker.recordAdvancedAction();
    progressTracker.recordFeatureUsed('advanced-search');
    // Perform the actual action...
  };

  return (
    <div className="dashboard-container">
      <h1>Debate Dashboard</h1>
      
      {/* Basic features available to all users */}
      <div className="basic-features">
        <h2>Actions</h2>
        <button onClick={() => progressTracker.recordFeatureUsed('create-debate')}>
          Create New Debate
        </button>
        <button onClick={() => progressTracker.recordFeatureUsed('join-debate')}>
          Join Debate
        </button>
      </div>
      
      {/* Intermediate level features */}
      <AdaptiveFeature 
        featureId="debate-templates" 
        requiredLevel={ExpertiseLevel.INTERMEDIATE}
      >
        <div className="intermediate-features">
          <h3>Debate Templates</h3>
          <p>Use pre-defined templates to structure your debates</p>
          <button onClick={() => progressTracker.recordFeatureUsed('debate-templates')}>
            Browse Templates
          </button>
        </div>
      </AdaptiveFeature>
      
      {/* Advanced features */}
      <AdaptiveFeature 
        featureId="advanced-search" 
        requiredLevel={ExpertiseLevel.ADVANCED}
        fallback={
          <div className="locked-feature-hint">
            <p>Continue using the platform to unlock Advanced Search</p>
          </div>
        }
      >
        <div className="advanced-features">
          <h3>Advanced Search</h3>
          <p>Search debates with complex filters and parameters</p>
          <button onClick={handleAdvancedAction}>
            Open Advanced Search
          </button>
        </div>
      </AdaptiveFeature>
      
      {/* Expert level features */}
      <AdaptiveFeature 
        featureId="debate-analytics" 
        requiredLevel={ExpertiseLevel.EXPERT}
      >
        <div className="expert-features">
          <h3>Debate Analytics</h3>
          <p>Access detailed statistics and insights about your debates</p>
          <button onClick={() => progressTracker.recordFeatureUsed('debate-analytics')}>
            View Analytics Dashboard
          </button>
        </div>
      </AdaptiveFeature>
      
      {/* Settings panel for expertise level */}
      <div className="settings-panel">
        <ExpertiseLevelSelector />
      </div>
    </div>
  );
};
