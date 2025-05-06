import React from 'react';
import NonLinearChart from '../components/charts/NonLinearChart';
import RadarChart from '../components/charts/RadarChart';
import ViolinPlot from '../components/charts/ViolinPlot';
import KdePlot from '../components/charts/KdePlot';
import StackedHistogram from '../components/charts/StackedHistogram';
import StackedBarChart from '../components/charts/StackedBarChart';
import SankeyDiagram from '../components/charts/SankeyDiagram';
import '../styles/Dashboard.css';

const Home = () => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard de Análise de Debates</h1>
      </header>
      
      <div className="dashboard-container">
        <div className="chart-row">
          <div className="chart-column">
            <NonLinearChart />
          </div>
          <div className="chart-column">
            <RadarChart />
          </div>
        </div>
        
        <div className="chart-row">
          <div className="chart-column">
            <ViolinPlot />
          </div>
          <div className="chart-column">
            <KdePlot />
          </div>
        </div>
        
        <div className="chart-row">
          <div className="chart-column">
            <StackedHistogram />
          </div>
          <div className="chart-column">
            <StackedBarChart />
          </div>
        </div>
        
        <div className="chart-row full-width">
          <SankeyDiagram />
        </div>
      </div>
    </div>
  );
};

export default Home;
