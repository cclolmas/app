import React from 'react';
import RadarChart from './charts/RadarChart';
import HistogramChart from './charts/HistogramChart';
import StackedBarChart from './charts/StackedBarChart';
import SankeyDiagram from './charts/SankeyDiagram';
import ViolinPlot from './charts/ViolinPlot';
import KdePlot from './charts/KdePlot';
import BarsWithCurvePlot from './charts/BarsWithCurvePlot';

const ChartDashboard = ({ data }) => {
  return (
    <div className="chart-dashboard">
      <div className="chart-row">
        <div className="chart-cell">
          <RadarChart 
            data={data.clDimensions} 
            width={320} 
            height={240} 
          />
        </div>
        <div className="chart-cell">
          <HistogramChart 
            data={data.taskDistribution} 
            width={320} 
            height={240}
            filters={{
              period: 'hour',
              expertise: 'all'
            }}
          />
        </div>
        <div className="chart-cell">
          <StackedBarChart 
            data={data.resourceAllocation} 
            width={320} 
            height={240}
            compareQ4Q8={true}
          />
        </div>
      </div>
      <div className="chart-row">
        <div className="chart-cell">
          <SankeyDiagram 
            data={data.computationFlow} 
            width={320} 
            height={240}
          />
        </div>
        <div className="chart-cell">
          <ViolinPlot 
            data={data.clComplDistribution} 
            width={320} 
            height={240}
          />
        </div>
        <div className="chart-cell">
          <KdePlot 
            data={data.clComplDensity} 
            width={320} 
            height={240}
          />
        </div>
      </div>
      <div className="chart-row">
        <div className="chart-cell">
          <BarsWithCurvePlot 
            data={data.ggufRelations} 
            width={320} 
            height={240}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartDashboard;
