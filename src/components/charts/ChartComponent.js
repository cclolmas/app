import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import PropTypes from 'prop-types';

const ChartComponent = ({ type, data, options, height, width }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // Destruir o gráfico anterior se existir
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Criar novo gráfico
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...options,
      },
    });

    // Cleanup ao desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options]);

  return (
    <div style={{ height, width }}>
      <canvas ref={chartRef} />
    </div>
  );
};

ChartComponent.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  options: PropTypes.object,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

ChartComponent.defaultProps = {
  options: {},
  height: '300px',
  width: '100%',
};

export default ChartComponent;
