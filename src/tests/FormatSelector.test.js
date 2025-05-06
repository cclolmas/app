import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FormatSelector from '../components/FormatSelector'; // Adjust path as needed

describe('FormatSelector Component', () => {
  test('renders format selector with both Q4 and Q8 options', () => {
    const handleChange = jest.fn();
    render(<FormatSelector selectedFormat="Q4" onChange={handleChange} />);
    
    // Check if both format options are present
    expect(screen.getByText(/Q4/i)).toBeInTheDocument();
    expect(screen.getByText(/Q8/i)).toBeInTheDocument();
  });
  
  test('shows Q4 as selected when defaulted to Q4', () => {
    const handleChange = jest.fn();
    render(<FormatSelector selectedFormat="Q4" onChange={handleChange} />);
    
    // Verify that Q4 is selected
    const selectElement = screen.getByRole('combobox');
    expect(selectElement.value).toBe('Q4');
  });
  
  test('shows Q8 as selected when defaulted to Q8', () => {
    const handleChange = jest.fn();
    render(<FormatSelector selectedFormat="Q8" onChange={handleChange} />);
    
    // Verify that Q8 is selected
    const selectElement = screen.getByRole('combobox');
    expect(selectElement.value).toBe('Q8');
  });
  
  test('calls onChange handler when selection changes to Q8', () => {
    const handleChange = jest.fn();
    render(<FormatSelector selectedFormat="Q4" onChange={handleChange} />);
    
    // Change selection to Q8
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Q8' } });
    
    // Verify handler was called with the new format
    expect(handleChange).toHaveBeenCalledWith('Q8');
  });
  
  test('calls onChange handler when selection changes to Q4', () => {
    const handleChange = jest.fn();
    render(<FormatSelector selectedFormat="Q8" onChange={handleChange} />);
    
    // Change selection to Q4
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Q4' } });
    
    // Verify handler was called with the new format
    expect(handleChange).toHaveBeenCalledWith('Q4');
  });
});
