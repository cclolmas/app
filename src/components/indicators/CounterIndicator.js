import React from 'react';
import PropTypes from 'prop-types';

const CounterIndicator = ({ value, label, icon, color }) => {
  return (
    <div className="counter-indicator" data-testid="counter-indicator">
      <div className="counter-value" style={{ color }}>
        {icon && <span className="counter-icon">{icon}</span>}
        <span data-testid="counter-value">{value}</span>
      </div>
      {label && <div className="counter-label">{label}</div>}
    </div>
  );
};

CounterIndicator.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  label: PropTypes.string,
  icon: PropTypes.node,
  color: PropTypes.string,
};

CounterIndicator.defaultProps = {
  label: '',
  icon: null,
  color: '#000',
};

export default CounterIndicator;
