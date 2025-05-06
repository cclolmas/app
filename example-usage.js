const ValueComparator = require('./utils/valueComparator');
const ExternalToolsIntegration = require('./utils/externalToolsIntegration');
const logger = require('./utils/logger');

// Example function: This could represent any part of your application
// that displays values to users
async function exampleUsage() {
  // Initialize value comparator
  const comparator = new ValueComparator({
    logDirectory: './value-comparison-logs',
    logToConsole: true
  });
  
  // Example 1: Simple value comparison
  const displayedTotal = 1250.75;
  const calculatedTotal = 1250.75;
  comparator.compareValues(
    'Order total amount', 
    displayedTotal, 
    calculatedTotal, 
    { orderId: 'ORDER12345' }
  );
  
  // Example 2: Object comparison
  const displayedUserProfile = {
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    role: 'admin'
  };
  
  const databaseUserProfile = {
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    role: 'user' // Mismatch!
  };
  
  comparator.compareValues(
    'User profile data', 
    displayedUserProfile, 
    databaseUserProfile, 
    { userId: 1 }
  );
  
  // Example 3: Compare with external API
  try {
    const localWeatherData = { temp: 72.5, humidity: 65, condition: 'Cloudy' };
    
    // This would be a real API in production code
    const comparisonResult = await ExternalToolsIntegration.compareWithExternalApi(
      localWeatherData,
      'https://api.example.com/weather?city=newyork',
      (data) => data.current // Transform function to extract relevant part
    );
    
    if (!comparisonResult.isEqual) {
      logger.warn('Weather data mismatch detected', comparisonResult);
      
      // Optional: Send notification about the mismatch
      await ExternalToolsIntegration.sendWebhookNotification(
        'https://hooks.slack.com/services/your-webhook-url',
        'Weather data discrepancy detected',
        comparisonResult
      );
    }
  } catch (error) {
    logger.error('External API comparison failed', { error: error.message });
  }
  
  // Generate a final report
  const report = comparator.generateReport();
  console.log('Comparison Report:', report);
  
  // Export data for external analysis
  const csvData = ExternalToolsIntegration.exportForExternalAnalysis(
    comparator.comparisons,
    'csv'
  );
  console.log('CSV Export:', csvData);
}

// Run the example
exampleUsage().catch(console.error);
