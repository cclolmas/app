import React from 'react';
import PropTypes from 'prop-types';

const DataTable = ({ headers, data, caption }) => {
  if (!data || data.length === 0) {
    return <div className="empty-table">Nenhum dado disponível</div>;
  }

  return (
    <div className="table-container" data-testid="data-table">
      <table className="data-table">
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} data-testid={`table-row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

DataTable.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.string).isRequired,
  data: PropTypes.arrayOf(PropTypes.array).isRequired,
  caption: PropTypes.string,
};

export default DataTable;
