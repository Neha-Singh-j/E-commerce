const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());

// Simple routes
app.get('/', (req, res) => {
  res.json({
    message: 'Shopiko is running!',
    timestamp: new Date().toISOString(),
    platform: 'Express.js',
    status: 'success'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/test', (req, res) => {
  res.json({
    message: 'Test route is working!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    availableRoutes: ['/', '/health', '/test']
  });
});

// Start server (only if not on Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app; 