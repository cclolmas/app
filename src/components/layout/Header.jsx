import React from 'react';
import { Link } from 'react-router-dom';
import { AccessibilityButton } from './AccessibilityButton';

export function Header() {
  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">CrossDebate</Link>
          </div>
          
          <nav className="main-nav">
            {/* Navigation links */}
          </nav>
          
          <div className="header-actions">
            <AccessibilityButton />
            {/* Other header action buttons */}
          </div>
        </div>
      </div>
    </header>
  );
}