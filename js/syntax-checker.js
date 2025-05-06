/**
 * Syntax Checker Tool for JavaScript files
 * Helps identify and fix common syntax errors
 */
const SyntaxChecker = {
  /**
   * Initialize the syntax checker
   * @param {Object} options - Configuration options
   */
  init: function(options = {}) {
    const defaultOptions = {
      autoFix: false,
      targetFiles: [],
      logLevel: 'warning' // 'info', 'warning', 'error'
    };
    
    this.options = { ...defaultOptions, ...options };
    console.info('🔍 Syntax Checker: Initialized');
    
    if (this.options.targetFiles.length > 0) {
      this.checkFiles(this.options.targetFiles);
    }
    
    return this;
  },
  
  /**
   * Check multiple files for syntax errors
   * @param {Array} files - List of file paths or script elements
   */
  checkFiles: function(files) {
    const results = {};
    
    files.forEach(file => {
      if (typeof file === 'string') {
        // Assume it's an ID of a script element
        const scriptEl = document.getElementById(file);
        if (scriptEl && scriptEl.tagName === 'SCRIPT') {
          results[file] = this.checkCode(scriptEl.textContent);
        } else {
          results[file] = { error: 'Script element not found' };
        }
      } else if (file instanceof HTMLScriptElement) {
        // It's a script element
        results[file.src || 'inline-script'] = this.checkCode(file.textContent);
      }
    });
    
    console.info('📊 Syntax check results:', results);
    return results;
  },
  
  /**
   * Check code string for syntax errors
   * @param {string} code - JavaScript code to check
   * @returns {Object} - Results with issues found
   */
  checkCode: function(code) {
    const issues = [];
    let isValid = true;
    
    try {
      // Try to parse the code without executing it
      new Function(code);
    } catch (error) {
      isValid = false;
      
      // Extract line and column information
      const lineMatch = error.stack.match(/(\d+):(\d+)/);
      let line = null;
      let column = null;
      
      if (lineMatch) {
        line = parseInt(lineMatch[1], 10);
        column = parseInt(lineMatch[2], 10);
      }
      
      // Extract code snippet if we know the line
      let snippet = null;
      if (line !== null) {
        const codeLines = code.split('\n');
        if (line <= codeLines.length) {
          snippet = codeLines[line - 1];
        }
      }
      
      // Create issue object
      issues.push({
        message: error.message,
        line,
        column,
        snippet,
        type: this._categorizeError(error.message),
        suggestion: this._getSuggestion(error.message)
      });
    }
    
    return {
      isValid,
      issues
    };
  },
  
  /**
   * Categorize error based on error message
   * @private
   */
  _categorizeError: function(message) {
    if (message.includes("expected")) {
      return "syntax";
    } else if (message.includes("undefined")) {
      return "reference";
    } else {
      return "unknown";
    }
  },
  
  /**
   * Generate suggestion for fixing the error
   * @private
   */
  _getSuggestion: function(message) {
    // Common syntax errors
    if (message.includes("')' expected")) {
      return "Missing closing parenthesis. Check function calls and if/while conditions.";
    } else if (message.includes("'}' expected")) {
      return "Missing closing brace. Check function, object, or block definitions.";
    } else if (message.includes("'catch' or 'finally' expected")) {
      return "Incomplete try block. Add catch or finally block.";
    } else if (message.includes("';' expected")) {
      return "Missing semicolon. Add semicolon at the end of the statement.";
    } else {
      return "Check syntax at the indicated location.";
    }
  }
};

// Export for browser or Node.js
if (typeof window !== 'undefined') {
  window.SyntaxChecker = SyntaxChecker;
} else if (typeof module !== 'undefined') {
  module.exports = SyntaxChecker;
}
