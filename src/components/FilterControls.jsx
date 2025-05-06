import React from 'react';
import '../styles/dashboard.css';

const FilterControls = ({ 
  filters, 
  setFilters, 
  studentList, 
  selectedStudent, 
  setSelectedStudent 
}) => {
  return (
    <div className="filter-controls">
      <div className="filter-group">
        <label htmlFor="task-filter">Task Type:</label>
        <select 
          id="task-filter"
          value={filters.taskType}
          onChange={(e) => setFilters({...filters, taskType: e.target.value})}
        >
          <option value="all">All Tasks</option>
          <option value="qlora">QLoRA Fine-tuning</option>
          <option value="lmas">LMAS Debugging</option>
          <option value="prompt">Prompt Engineering</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label htmlFor="config-filter">Configuration:</label>
        <select 
          id="config-filter"
          value={filters.configuration}
          onChange={(e) => setFilters({...filters, configuration: e.target.value})}
        >
          <option value="all">All Configs</option>
          <option value="q4">Q4 Quantization</option>
          <option value="q8">Q8 Quantization</option>
          <option value="8bit">8-bit Training</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label htmlFor="module-filter">Course Module:</label>
        <select 
          id="module-filter"
          value={filters.module}
          onChange={(e) => setFilters({...filters, module: e.target.value})}
        >
          <option value="all">All Modules</option>
          <option value="module1">Foundation Models</option>
          <option value="module2">Fine-tuning Techniques</option>
          <option value="module3">Evaluation Methods</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label htmlFor="view-filter">View Type:</label>
        <select 
          id="view-filter"
          value={filters.view}
          onChange={(e) => setFilters({...filters, view: e.target.value})}
        >
          <option value="individual">Individual Profile</option>
          <option value="class">Class Average</option>
          <option value="comparison">Comparison View</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label htmlFor="student-selector">Select Student:</label>
        <select
          id="student-selector"
          value={selectedStudent ? selectedStudent.id : ''}
          onChange={(e) => {
            const student = studentList.find(s => s.id === e.target.value);
            setSelectedStudent(student || null);
          }}
        >
          <option value="">Average of Selected Filters</option>
          {studentList.map(student => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterControls;
