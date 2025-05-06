import React, { useState, useEffect } from 'react';
import './styles.css';

interface FilterOption {
  id: string;
  label: string;
}

interface DataFilterProps {
  title: string;
  options: FilterOption[];
  onFilterChange: (selectedOptions: string[]) => void;
  multiSelect?: boolean;
}

const DataFilter: React.FC<DataFilterProps> = ({ 
  title, 
  options, 
  onFilterChange, 
  multiSelect = false 
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleOptionToggle = (optionId: string) => {
    let newSelectedOptions: string[];
    
    if (multiSelect) {
      newSelectedOptions = selectedOptions.includes(optionId)
        ? selectedOptions.filter(id => id !== optionId)
        : [...selectedOptions, optionId];
    } else {
      newSelectedOptions = selectedOptions.includes(optionId) 
        ? [] 
        : [optionId];
    }
    
    setSelectedOptions(newSelectedOptions);
  };

  useEffect(() => {
    onFilterChange(selectedOptions);
  }, [selectedOptions, onFilterChange]);

  return (
    <div className="data-filter-container">
      <h3>{title}</h3>
      <div className="filter-options">
        {options.map((option) => (
          <div 
            key={option.id}
            className={`filter-option ${selectedOptions.includes(option.id) ? 'selected' : ''}`}
            onClick={() => handleOptionToggle(option.id)}
          >
            <span className="checkbox">
              {selectedOptions.includes(option.id) && <span className="checkmark">✓</span>}
            </span>
            <span>{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataFilter;
