const winston = require('winston');

// Configure logger with various transport options
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Console output for development
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    // File output for production and later analysis
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Helper method to log value comparisons
logger.compareValues = (expected, actual, context = '') => {
  const isEqual = JSON.stringify(expected) === JSON.stringify(actual);
  const logLevel = isEqual ? 'info' : 'warn';
  
  logger.log({
    level: logLevel,
    message: `Value comparison ${isEqual ? 'MATCHED' : 'FAILED'}`,
    context,
    expected,
    actual,
    diff: isEqual ? null : getDifferences(expected, actual),
  });
  
  return isEqual;
};

// Helper function to identify differences between objects
function getDifferences(expected, actual) {
  if (typeof expected !== 'object' || typeof actual !== 'object') {
    return { expected, actual };
  }
  
  const diff = {};
  
  // Check for keys in expected missing from actual or different values
  Object.keys(expected).forEach(key => {
    if (!(key in actual)) {
      diff[key] = { expected: expected[key], actual: 'MISSING' };
    } else if (JSON.stringify(expected[key]) !== JSON.stringify(actual[key])) {
      if (typeof expected[key] === 'object' && typeof actual[key] === 'object') {
        diff[key] = getDifferences(expected[key], actual[key]);
      } else {
        diff[key] = { expected: expected[key], actual: actual[key] };
      }
    }
  });
  
  // Check for extra keys in actual
  Object.keys(actual).forEach(key => {
    if (!(key in expected) && !diff[key]) {
      diff[key] = { expected: 'MISSING', actual: actual[key] };
    }
  });
  
  return diff;
}

module.exports = logger;
