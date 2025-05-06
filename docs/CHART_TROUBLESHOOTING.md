# Chart Troubleshooting Guide

## Common Issues with Chart Rendering

### Charts Not Visible or Improperly Sized

1. **Container Size Issues**

   The most common reason charts don't appear is that their containers have zero height or width.

   **Solution:**
   ```jsx
   // Always specify explicit height for chart containers
   <div style={{ height: '400px', width: '100%' }}>
     <ResponsiveContainer>
       {/* Chart component */}
     </ResponsiveContainer>
   </div>
   ```

2. **CSS Conflicts**

   Multiple CSS files defining styles for `.chart-container` can cause conflicts.

   **Solution:**
   - Use our `chartReset.css` which provides consistent container styling
   - Use the `withChartContainer` HOC which applies consistent sizing
   
   ```jsx
   import withChartContainer from '../charts/withChartContainer';
   
   const MyChart = ({ data }) => {
     // Chart implementation
   };
   
   export default withChartContainer(MyChart, { height: 350 });
   ```

3. **Recharts ResponsiveContainer Issues**

   `ResponsiveContainer` requires a parent with defined dimensions.

   **Solution:**
   ```jsx
   // Correct usage with explicit container height
   <div style={{ width: '100%', height: 400 }}>
     <ResponsiveContainer>
       <LineChart data={data}>
         {/* ... */}
       </LineChart>
     </ResponsiveContainer>
   </div>

   // INCORRECT - No height specified on parent
   <div style={{ width: '100%' }}>
     <ResponsiveContainer>
       {/* Chart won't render properly */}
     </ResponsiveContainer>
   </div>
   ```

4. **Dynamic Data Loading**

   Charts might not properly resize when data loads asynchronously.

   **Solution:**
   ```jsx
   useEffect(() => {
     // Force chart to update when data changes
     if (data.length > 0 && chartRef.current) {
       // For Recharts, we can use the update method
       chartRef.current.forceUpdate();
       
       // For d3, we might need to redraw
       // redrawChart();
     }
   }, [data]);
   ```

## Debugging Tools

Use the included chart debugging utilities to identify issues:

```js
import { debugChartContainer, visualDebugAllCharts } from '../utils/chartDebug';

// In your component
useEffect(() => {
  // Debug a specific chart container
  debugChartContainer('my-chart-container');
  
  // Or visualize all chart containers
  visualDebugAllCharts();
}, []);
```

## CSS Best Practices

1. **Always use explicit heights for chart containers**
2. **Avoid percentage heights without a parent container of known height**
3. **Use the provided `chartReset.css` to ensure consistent styling**
4. **For responsive charts, set min-height to ensure visibility on small screens**

## Common Chart Types and Their Specific Requirements

- **Line/Bar/Area Charts**: Need sufficient width and height to display axes and labels
- **Pie/Donut Charts**: Work better with equal width and height (square containers)
- **Scatter Plots**: Need sufficient space to display points without overcrowding
- **Heatmaps**: Need careful cell sizing based on data density
