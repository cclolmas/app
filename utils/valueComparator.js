const logger = require('./logger');
const fs = require('fs').promises;
const path = require('path');

class ValueComparator {
  constructor(options = {}) {
    this.logDirectory = options.logDirectory || './comparison-logs';
    this.saveToFile = options.saveToFile !== false;
    this.logToConsole = options.logToConsole !== false;
    this.comparisons = [];
    this.setupLogDirectory();
  }

  async setupLogDirectory() {
    if (this.saveToFile) {
      try {
        await fs.mkdir(this.logDirectory, { recursive: true });
      } catch (error) {
        console.error('Failed to create log directory:', error);
      }
    }
  }

  /**
   * Compare values from different sources
   * @param {string} name - Name of the comparison
   * @param {any} displayedValue - Value shown in UI or primary source
   * @param {any} referenceValue - Value from logs or external source
   * @param {Object} metadata - Additional context for the comparison
   * @returns {boolean} - Whether values match
   */
  compareValues(name, displayedValue, referenceValue, metadata = {}) {
    const timestamp = new Date();
    const isMatch = JSON.stringify(displayedValue) === JSON.stringify(referenceValue);
    
    const comparison = {
      name,
      timestamp,
      isMatch,
      displayedValue,
      referenceValue,
      metadata,
    };
    
    // Add to our internal record
    this.comparisons.push(comparison);
    
    // Log using our logger
    logger.compareValues(referenceValue, displayedValue, name);
    
    // Log to console if enabled
    if (this.logToConsole) {
      console.log(
        `[${isMatch ? 'MATCH' : 'MISMATCH'}] ${name}`,
        isMatch ? '✓' : '❌',
        '\nDisplayed:', displayedValue,
        '\nReference:', referenceValue
      );
    }
    
    // Save to file if enabled
    if (this.saveToFile) {
      this.saveComparisonToFile(comparison);
    }
    
    return isMatch;
  }
  
  /**
   * Save a comparison record to a file
   */
  async saveComparisonToFile(comparison) {
    try {
      const fileName = `${comparison.name.replace(/\s+/g, '-')}_${Date.now()}.json`;
      const filePath = path.join(this.logDirectory, fileName);
      await fs.writeFile(filePath, JSON.stringify(comparison, null, 2));
    } catch (error) {
      console.error('Failed to save comparison to file:', error);
    }
  }
  
  /**
   * Generate a report of all comparisons
   */
  generateReport() {
    const matches = this.comparisons.filter(c => c.isMatch).length;
    const mismatches = this.comparisons.length - matches;
    
    return {
      totalComparisons: this.comparisons.length,
      matches,
      mismatches,
      matchRate: this.comparisons.length ? (matches / this.comparisons.length * 100).toFixed(2) + '%' : 'N/A',
      details: this.comparisons,
    };
  }
  
  /**
   * Clear all stored comparisons
   */
  clear() {
    this.comparisons = [];
  }
}

module.exports = ValueComparator;
