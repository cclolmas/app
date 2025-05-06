const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Import monitoring components
const systemMonitor = require('./services/monitoring/systemMonitor');
const monitoringRoutes = require('./routes/monitoringRoutes');

// Middleware
app.use(express.json());

// Start system monitoring
systemMonitor.start();

// Register monitoring routes
app.use(monitoringRoutes);

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});