import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component for selecting debate format (Q4 or Q8)
 * @param {Object} props - Component props
 * @param {string} props.selectedFormat - Currently selected format ('Q4' or 'Q8')
 * @param {Function} props.onChange - Handler called when format selection changes
 * @returns {JSX.Element} - Rendered component
 */
const FormatSelector = ({ selectedFormat, onChange }) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <div className="format-selector">
      <label htmlFor="debate-format">Debate Format:</label>
      <select
        id="debate-format"
        value={selectedFormat}
        onChange={handleChange}
        className="format-select"
      >
        <option value="Q4">Q4 (4 speakers per team)</option>
        <option value="Q8">Q8 (8 speakers per team)</option>
      </select>
    </div>
  );
};

FormatSelector.propTypes = {
  selectedFormat: PropTypes.oneOf(['Q4', 'Q8']).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FormatSelector;
