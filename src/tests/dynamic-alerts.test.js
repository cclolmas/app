import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Dynamic alert component example
const DynamicAlertComponent = () => {
  const [error, setError] = useState(null);
  const [isStable, setIsStable] = useState(true);
  
  const checkStability = () => {
    // Simulates some condition check
    if (!isStable) {
      setError('Saída instável detectada');
      return false;
    }
    return true;
  };
  
  const toggleStability = () => {
    setIsStable(!isStable);
  };
  
  const attemptOperation = () => {
    if (!checkStability()) {
      return;
    }
    // Operation would proceed here
  };
  
  const dismissError = () => {
    setError(null);
  };
  
  return (
    <div>
      <button data-testid="toggle-stability" onClick={toggleStability}>
        Toggle Stability
      </button>
      <button data-testid="perform-operation" onClick={attemptOperation}>
        Perform Operation
      </button>
      
      {error && (
        <div role="dialog" aria-modal="true" data-testid="error-dialog">
          <h3>Error Alert</h3>
          <p data-testid="error-message">{error}</p>
          <button onClick={dismissError} data-testid="dismiss-error">OK</button>
        </div>
      )}
      
      <div data-testid="status">
        Current Status: {isStable ? 'Stable' : 'Unstable'}
      </div>
    </div>
  );
};

describe('Dynamic Alerts', () => {
  test('Error dialog appears with correct message when system is unstable', async () => {
    render(<DynamicAlertComponent />);
    
    // Initially the system is stable, no error should be shown
    expect(screen.queryByTestId('error-dialog')).not.toBeInTheDocument();
    
    // Toggle to make the system unstable
    fireEvent.click(screen.getByTestId('toggle-stability'));
    
    // Status should change
    expect(screen.getByTestId('status')).toHaveTextContent('Unstable');
    
    // Perform operation which should trigger the error
    fireEvent.click(screen.getByTestId('perform-operation'));
    
    // Error dialog should appear
    const errorDialog = await screen.findByTestId('error-dialog');
    expect(errorDialog).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toHaveTextContent('Saída instável detectada');
    
    // Dismiss the error
    fireEvent.click(screen.getByTestId('dismiss-error'));
    
    // Dialog should be gone
    await waitFor(() => {
      expect(screen.queryByTestId('error-dialog')).not.toBeInTheDocument();
    });
  });
  
  test('Error dialog does not appear when system is stable', async () => {
    render(<DynamicAlertComponent />);
    
    // System starts stable
    expect(screen.getByTestId('status')).toHaveTextContent('Stable');
    
    // Perform operation which should NOT trigger errors
    fireEvent.click(screen.getByTestId('perform-operation'));
    
    // No error dialog should appear
    expect(screen.queryByTestId('error-dialog')).not.toBeInTheDocument();
  });
});
