import React, { useState, useEffect } from 'react';
import RadarChart from './RadarChart';
import StackedHistogram from './StackedHistogram';
import FilterControls from './FilterControls';
import { mockStudentData, mockClassData } from '../utils/mockData';
import '../styles/dashboard.css';

const CognitiveLoadDashboard = () => {
  // State for filters and selected data
  const [filters, setFilters] = useState({
    taskType: 'all',
    configuration: 'all',
    module: 'all',
    view: 'individual', // individual, class, comparison
    timeframe: 'current' // current, before, after
  });
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCognitiveLoad, setSelectedCognitiveLoad] = useState(null);
  
  // Filtered data based on current filters
  const [filteredData, setFilteredData] = useState({
    studentData: mockStudentData,
    classData: mockClassData
  });
  
  // Update filtered data when filters change
  useEffect(() => {
    // In a real app, this would fetch or filter data based on selected filters
    // For now, we're just using mock data
    setFilteredData({
      studentData: mockStudentData.filter(student => 
        (filters.taskType === 'all' || student.taskType === filters.taskType) &&
        (filters.configuration === 'all' || student.configuration === filters.configuration) &&
        (filters.module === 'all' || student.module === filters.module)
      ),
      classData: mockClassData
    });
  }, [filters]);

  return (
    <div className="cognitive-load-dashboard">
      <h1>Cognitive Load Visualization Dashboard</h1>
      
      <div className="dashboard-controls">
        <FilterControls 
          filters={filters} 
          setFilters={setFilters}
          studentList={mockStudentData}
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
        />
      </div>
      
      <div className="visualization-container">
        <div className="radar-chart-container">
          <h2>Cognitive Load Profile</h2>
          <RadarChart 
            studentData={selectedStudent ? [selectedStudent] : filteredData.studentData}
            classData={filteredData.classData}
            filters={filters}
            onDimensionSelect={(dimension) => {
              setSelectedCognitiveLoad(dimension);
            }}
          />
        </div>
        
        <div className="histogram-container">
          <h2>Cognitive Load Distribution</h2>
          <StackedHistogram 
            studentData={filteredData.studentData}
            classData={filteredData.classData}
            filters={filters}
            selectedDimension={selectedCognitiveLoad}
            onBarSelect={(loadLevel) => {
              // Filter students by selected load level
              console.log("Selected load level:", loadLevel);
            }}
          />
        </div>
      </div>
      
      <div className="dashboard-footer">
        <p>Based on Cognitive Load Theory (CLT) - Zimmerman (2002), Kalyuga et al. (2003), Paas et al. (2003)</p>
      </div>
    </div>
  );
};

export default CognitiveLoadDashboard;
