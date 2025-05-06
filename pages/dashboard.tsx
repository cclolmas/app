import React, { useState } from 'react';
import CompLMetrics from '../components/CompLMetrics';
import CognitiveLoadRadar from '../components/charts/CognitiveLoadRadar';
import TaskDistributionHistogram from '../components/charts/TaskDistributionHistogram';
import ResourceAllocationBar from '../components/charts/ResourceAllocationBar';
import EnergyFlowSankey from '../components/charts/EnergyFlowSankey';
import CLCompLViolin from '../components/charts/CLCompLViolin';
import CLCompLKDE from '../components/charts/CLCompLKDE';
// import FineTuningBarsWithCurve from '../components/charts/FineTuningBarsWithCurve';

function Dashboard() {
  const [selectedModel, setSelectedModel] = useState('model1'); // Default selection

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard de Monitoramento CompL</h1>
      
      <div className="mb-4">
        <label htmlFor="model-select" className="mr-2">Select Model:</label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="border rounded p-1"
        >
          {/* Populate with actual model options */}
          <option value="model1">Modelo Llama3-8B-Q4</option>
          <option value="model2">Modelo Llama3-8B-Q8</option>
          <option value="model3">Modelo Mistral-7B-Q5</option>
        </select>
      </div>

      {/* Grid for Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* CompL Metrics (Existing) */}
        <div className="border rounded p-2 shadow">
           <CompLMetrics modelId={selectedModel} />
        </div>

        {/* Cognitive Load Radar */}
        <div className="border rounded p-2 shadow">
          <CognitiveLoadRadar />
        </div>

        {/* Task Distribution Histogram */}
        <div className="border rounded p-2 shadow">
          <TaskDistributionHistogram />
        </div>

        {/* Resource Allocation Bar */}
        <div className="border rounded p-2 shadow">
          <ResourceAllocationBar />
        </div>

        {/* Energy Flow Sankey */}
        <div className="border rounded p-2 shadow">
          <EnergyFlowSankey />
        </div>

        {/* CL vs CompL Violin */}
        <div className="border rounded p-2 shadow">
          <CLCompLViolin />
        </div>

        {/* CL-CompL KDE */}
        <div className="border rounded p-2 shadow">
          <CLCompLKDE />
        </div>

        {/* Fine Tuning Bars with Curve */}
        {/* <div className="border rounded p-2 shadow">
          <FineTuningBarsWithCurve />
        </div> */}

        {/* Add more components/charts here as needed */}
      </div>
    </div>
  );
}

export default Dashboard;