const { initializeFirebase } = require('./config/firebase');
const { scheduleCronJobs } = require('./cronJobs');
const express = require('express');

// Initialize Firebase
initializeFirebase();

// Schedule cron jobs
scheduleCronJobs();

console.log('Server started and cron job scheduled');

// Create an Express app
const app = express();

// Define a simple route
app.get('/', (req, res) => {
  res.send('Cron job server is running');
});

// Listen on the port specified by Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
