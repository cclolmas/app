/**
 * Script loading utility to ensure proper dependency management
 */
class ScriptLoader {
  constructor() {
    this.loaded = new Set();
    this.loading = new Map();
    this.callbacks = new Map();
  }

  /**
   * Load a script with proper dependency handling
   * @param {string} url - Script URL to load
   * @param {Array} dependencies - Array of script URLs that must be loaded first
   * @param {Function} callback - Function to call when script is loaded
   */
  load(url, dependencies = [], callback = null) {
    // If already loaded, just call the callback
    if (this.loaded.has(url)) {
      if (callback) callback();
      return Promise.resolve();
    }

    // If already loading, add callback to queue
    if (this.loading.has(url)) {
      if (callback) {
        const callbacks = this.callbacks.get(url) || [];
        callbacks.push(callback);
        this.callbacks.set(url, callbacks);
      }
      return this.loading.get(url);
    }

    // Load dependencies first
    const dependencyPromises = dependencies.map(dep => {
      return this.load(dep);
    });

    // Create promise for this script
    const loadPromise = Promise.all(dependencyPromises)
      .then(() => {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = url;
          script.async = true;

          script.onload = () => {
            console.info(`✅ Script loaded: ${url}`);
            this.loaded.add(url);
            this.loading.delete(url);
            
            // Call this script's callback
            if (callback) callback();
            
            // Call any queued callbacks
            const callbacks = this.callbacks.get(url) || [];
            callbacks.forEach(cb => cb());
            this.callbacks.delete(url);
            
            resolve();
          };

          script.onerror = (error) => {
            console.error(`❌ Failed to load script: ${url}`, error);
            this.loading.delete(url);
            reject(error);
          };

          document.head.appendChild(script);
        });
      });

    this.loading.set(url, loadPromise);
    return loadPromise;
  }

  /**
   * Check if all required scripts are loaded
   * @param {Array} scripts - Array of script URLs to check
   * @returns {boolean} - True if all scripts are loaded
   */
  areLoaded(scripts) {
    return scripts.every(script => this.loaded.has(script));
  }
}

// Create global instance
window.scriptLoader = new ScriptLoader();

// Helper function to load app scripts in the right order
window.loadAppScripts = function() {
  const scriptLoader = window.scriptLoader;
  
  // Define script dependencies
  scriptLoader.load('/js/error-handler.js')
    .then(() => {
      return scriptLoader.load('/js/dom-utils.js', ['/js/error-handler.js']);
    })
    .then(() => {
      return scriptLoader.load('/js/custom.js', ['/js/error-handler.js', '/js/dom-utils.js']);
    })
    .then(() => {
      return scriptLoader.load('/js/scripts.js', ['/js/error-handler.js', '/js/dom-utils.js', '/js/custom.js']);
    })
    .then(() => {
      console.info('✅ All application scripts loaded successfully');
      // Initialize application
      if (typeof window.initApplication === 'function') {
        window.initApplication();
      }
    })
    .catch(error => {
      console.error('❌ Error loading application scripts:', error);
    });
};

// Load Chart.js dynamically
window.loadChartJs = function(callback) {
  const scriptLoader = window.scriptLoader;
  
  scriptLoader.load('https://cdn.jsdelivr.net/npm/chart.js', [], callback)
    .then(() => {
      console.info('✅ Chart.js carregado com sucesso');
    })
    .catch(error => {
      console.error('❌ Falha ao carregar Chart.js:', error);
    });
};
