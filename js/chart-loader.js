/**
 * Chart Loader
 * Ensures Chart.js and other dependencies are loaded before charts are initialized
 */

class ChartLoader {
  constructor(options = {}) {
    this.options = {
      chartJsUrl: 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js',
      rechartsUrl: 'https://unpkg.com/recharts@2.5.0/umd/Recharts.min.js',
      d3Url: 'https://d3js.org/d3.v7.min.js',
      ...options
    };
    this.loadedLibraries = {};
  }

  /**
   * Loads a script asynchronously and returns a promise
   */
  loadScript(url, globalVarName) {
    return new Promise((resolve, reject) => {
      // If the library is already loaded, resolve immediately
      if (window[globalVarName]) {
        this.loadedLibraries[globalVarName] = true;
        resolve(window[globalVarName]);
        return;
      }

      // If we've already attempted to load this script, check if it's still loading
      if (document.querySelector(`script[src="${url}"]`)) {
        const checkExistence = setInterval(() => {
          if (window[globalVarName]) {
            clearInterval(checkExistence);
            this.loadedLibraries[globalVarName] = true;
            resolve(window[globalVarName]);
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkExistence);
          reject(new Error(`Timeout loading ${globalVarName} from ${url}`));
        }, 10000);
        
        return;
      }

      // Create and append the script
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      
      script.onload = () => {
        console.log(`${globalVarName} loaded successfully`);
        this.loadedLibraries[globalVarName] = true;
        resolve(window[globalVarName]);
      };
      
      script.onerror = () => {
        reject(new Error(`Failed to load ${globalVarName} from ${url}`));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Ensures Chart.js is loaded and available
   */
  async ensureChartJs() {
    try {
      if (!window.Chart) {
        await this.loadScript(this.options.chartJsUrl, 'Chart');
      }
      return window.Chart;
    } catch (error) {
      console.error('Failed to load Chart.js:', error);
      this.renderFallbackMessage('chart-container', 'Failed to load Chart.js library. Please check your internet connection and reload the page.');
      throw error;
    }
  }

  /**
   * Ensures Recharts is loaded and available
   */
  async ensureRecharts() {
    try {
      if (!window.Recharts) {
        await this.loadScript(this.options.rechartsUrl, 'Recharts');
      }
      return window.Recharts;
    } catch (error) {
      console.error('Failed to load Recharts:', error);
      this.renderFallbackMessage('recharts-container', 'Failed to load Recharts library. Please check your internet connection and reload the page.');
      throw error;
    }
  }

  /**
   * Renders a fallback message if chart libraries fail to load
   */
  renderFallbackMessage(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; border: 1px dashed #ccc;">
          <p style="color: #666;">${message}</p>
        </div>
      `;
    }
  }
}

// Make it globally accessible
window.ChartLoader = new ChartLoader();

// Export the instance
export default window.ChartLoader;
