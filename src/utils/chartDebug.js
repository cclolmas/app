/**
 * Chart debugging utility to identify container sizing issues
 */
export const debugChartContainer = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Chart container #${containerId} not found`);
    return null;
  }

  // Compute and log container dimensions
  const styles = window.getComputedStyle(container);
  const parentStyles = window.getComputedStyle(container.parentElement);
  
  const info = {
    id: containerId,
    width: container.clientWidth,
    height: container.clientHeight,
    display: styles.display,
    position: styles.position,
    overflow: styles.overflow,
    parentWidth: container.parentElement.clientWidth,
    parentHeight: container.parentElement.clientHeight,
    parentDisplay: parentStyles.display,
    cssHeight: styles.height,
    cssWidth: styles.width
  };
  
  console.table(info);

  // Highlight container with issues
  if (info.width === 0 || info.height === 0) {
    container.style.border = '2px dashed red';
    container.setAttribute('data-debug-issue', 'Zero dimensions');
    console.error(`Chart container #${containerId} has zero dimensions!`);
    return false;
  }
  
  return info;
};

/**
 * Apply temporary visual debugging to all chart containers
 */
export const visualDebugAllCharts = () => {
  const containers = document.querySelectorAll('.chart-container');
  containers.forEach((container, index) => {
    const id = container.id || `chart-container-${index}`;
    container.id = id;
    
    const styles = window.getComputedStyle(container);
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Add debugging overlay
    const debugEl = document.createElement('div');
    debugEl.style.position = 'absolute';
    debugEl.style.top = '0';
    debugEl.style.left = '0';
    debugEl.style.background = 'rgba(255,0,0,0.1)';
    debugEl.style.border = '1px solid rgba(255,0,0,0.5)';
    debugEl.style.padding = '2px 5px';
    debugEl.style.fontSize = '10px';
    debugEl.style.zIndex = '1000';
    debugEl.style.pointerEvents = 'none';
    debugEl.textContent = `${width}×${height}`;
    container.style.position = 'relative';
    container.appendChild(debugEl);
    
    console.log(`Container #${id}: ${width}×${height}`);
  });
};
