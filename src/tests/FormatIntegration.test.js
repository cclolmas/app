import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DebateSetup from '../components/DebateSetup'; // Adjust path as needed

// Mock child components if necessary
jest.mock('../components/FormatSelector', () => ({ selectedFormat, onChange }) => (
  <div data-testid="mock-format-selector">
    <select 
      value={selectedFormat} 
      onChange={(e) => onChange(e.target.value)}
      data-testid="format-select"
    >
      <option value="Q4">Q4</option>
      <option value="Q8">Q8</option>
    </select>
  </div>
));

describe('Format Selection Integration Tests', () => {
  test('format selection updates the debate configuration', async () => {
    render(<DebateSetup />);
    
    // Change format from default to the other option
    const selectElement = screen.getByTestId('format-select');
    const initialFormat = selectElement.value;
    const newFormat = initialFormat === 'Q4' ? 'Q8' : 'Q4';
    
    fireEvent.change(selectElement, { target: { value: newFormat } });
    
    // Check if the UI updates to reflect the new format
    await waitFor(() => {
      // This will depend on how your UI shows the selected format
      // For example, it might change the number of speakers displayed
      if (newFormat === 'Q8') {
        expect(screen.getByText(/8 speakers/i)).toBeInTheDocument();
      } else {
        expect(screen.getByText(/4 speakers/i)).toBeInTheDocument();
      }
    });
  });
  
  test('switching between formats adjusts team configuration properly', async () => {
    render(<DebateSetup />);
    
    // Switch to Q8 format
    fireEvent.change(screen.getByTestId('format-select'), { target: { value: 'Q8' } });
    
    // Verify that the team configuration reflects Q8 format
    await waitFor(() => {
      const teamConfig = screen.getByTestId('team-config');
      expect(teamConfig).toHaveTextContent(/8 speakers/i);
    });
    
    // Switch back to Q4 format
    fireEvent.change(screen.getByTestId('format-select'), { target: { value: 'Q4' } });
    
    // Verify that the team configuration now reflects Q4 format
    await waitFor(() => {
      const teamConfig = screen.getByTestId('team-config');
      expect(teamConfig).toHaveTextContent(/4 speakers/i);
    });
  });
});
