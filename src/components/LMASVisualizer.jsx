import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import CustomSankeyNode from './CustomSankeyNode';
import CustomSankeyLink from './CustomSankeyLink';
import CustomTooltip from './CustomTooltip';

const LMASVisualizer = ({ rawData }) => {
  const [flowData, setFlowData] = useState({ nodes: [], links: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Use the adapter if available, otherwise fall back to basic validation
      if (window.ChartDataAdapter) {
        const adaptedData = window.ChartDataAdapter.forRechartsSankey(rawData);
        setFlowData(adaptedData);
        setError(null);
        return;
      }
      
      // Basic validation if adapter isn't available
      // Validate rawData structure before processing
      if (!rawData || typeof rawData !== 'object' || !rawData.nodes || !rawData.links || !Array.isArray(rawData.nodes) || !Array.isArray(rawData.links)) {
        console.warn("Invalid or incomplete rawData structure for Sankey:", rawData);
        // Set empty data or a placeholder to avoid errors
        setFlowData({ nodes: [{ name: "Invalid Data" }], links: [] });
        setError("Invalid data structure received");
        return; // Stop processing if data is invalid
      }

      // Process nodes: Ensure unique IDs and add default properties if needed
      const nodeMap = {};
      const processedNodes = rawData.nodes.map((node, index) => {
        // Ensure each node has a unique identifier (use index if 'id' is missing)
        const nodeId = node.id || `node-${index}`;
        if (nodeMap[nodeId]) {
          console.warn(`Duplicate node ID found: ${nodeId}. Using index.`);
          nodeMap[`node-${index}`] = index; // Use index as fallback key
          return { ...node, name: node.name || `Node ${index}`, originalId: nodeId, sankeyId: index };
        }
        nodeMap[nodeId] = index;
        return { ...node, name: node.name || `Node ${index}`, originalId: nodeId, sankeyId: index };
      });

      // Process links: Convert source/target IDs to numerical indices
      const processedLinks = rawData.links
        .map(link => {
          const sourceIndex = typeof link.source === 'string' ? nodeMap[link.source] : link.source;
          const targetIndex = typeof link.target === 'string' ? nodeMap[link.target] : link.target;

          // Check if source and target nodes exist in the map
          if (sourceIndex === undefined || targetIndex === undefined) {
            console.warn(`Skipping link with invalid source/target ID:`, link);
            return null; // Skip invalid links
          }

          return {
            ...link,
            source: sourceIndex,
            target: targetIndex,
            value: link.value || 1 // Ensure value is present, default to 1
          };
        })
        .filter(link => link !== null); // Remove skipped links

      setFlowData({ nodes: processedNodes, links: processedLinks });
      setError(null);
    } catch (err) {
      console.error("Error processing Sankey data:", err);
      setError(`Error processing data: ${err.message}`);
      setFlowData({ 
        nodes: [{ name: "Error" }, { name: "Processing Data" }],
        links: [{ source: 0, target: 1, value: 1 }]
      });
    }
  }, [rawData]); // Dependency array includes rawData

  // Safely check if we have valid data to render
  const hasValidData = flowData && 
                      Array.isArray(flowData.nodes) && 
                      flowData.nodes.length > 0 && 
                      Array.isArray(flowData.links) &&
                      flowData.links.length > 0;

  if (error) {
    return (
      <div className="lmas-visualizer-error" style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
        <p>Error rendering Sankey diagram: {error}</p>
        <p>Please check the data structure or reload the page.</p>
      </div>
    );
  }

  return (
    <div className="lmas-visualizer">
      {!hasValidData ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>No valid data available for visualization</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={500}>
          <Sankey
            data={flowData}
            node={<CustomSankeyNode />}
            link={<CustomSankeyLink />}
            iterations={32}
            nodePadding={50}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Tooltip content={<CustomTooltip />} />
          </Sankey>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default LMASVisualizer;