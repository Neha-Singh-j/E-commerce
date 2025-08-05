#!/usr/bin/env node

/**
 * Route Testing Script for Shopiko
 * Tests all routes to ensure they're working correctly
 */

const express = require('express');
const path = require('path');

console.log('🧪 Starting route testing...');

// Set test environment
process.env.NODE_ENV = 'test';

// Create test app
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Mock middleware for testing (simulates the main app's middleware)
app.use((req, res, next) => {
  // Mock user and flash messages for testing
  res.locals.currentUser = null; // Set to null for testing
  res.locals.success = [];
  res.locals.error = [];
  res.locals.appName = 'Shopiko E-Commerce';
  res.locals.appVersion = '1.0.0';
  next();
});

// Import routes
const productionRoutes = require('../routes/production');

// Mount routes
app.use('/', productionRoutes);

// Test route to check if server is running
app.get('/test-server', (req, res) => {
  res.json({ 
    message: 'Test server is running!', 
    timestamp: new Date().toISOString(),
    availableRoutes: [
      '/',
      '/debug',
      '/test',
      '/about',
      '/feedback',
      '/events',
      '/account',
      '/faq',
      '/contact',
      '/auth/*',
      '/products/*',
      '/cart/*',
      '/api/*'
    ]
  });
});

// 404 handler for testing
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    requestedUrl: req.originalUrl,
    availableRoutes: [
      '/',
      '/debug',
      '/test',
      '/about',
      '/feedback',
      '/events',
      '/account',
      '/faq',
      '/contact'
    ]
  });
});

const port = 3002;
app.listen(port, () => {
  console.log(`✅ Test server running on port ${port}`);
  console.log('📋 Test the following URLs:');
  console.log(`   http://localhost:${port}/test-server`);
  console.log(`   http://localhost:${port}/debug`);
  console.log(`   http://localhost:${port}/test`);
  console.log(`   http://localhost:${port}/about`);
  console.log(`   http://localhost:${port}/feedback`);
  console.log(`   http://localhost:${port}/events`);
  console.log(`   http://localhost:${port}/account`);
  console.log(`   http://localhost:${port}/faq`);
  console.log(`   http://localhost:${port}/contact`);
  console.log('');
  console.log('🔍 If any routes return 404, there may be an issue with route mounting');
});

module.exports = app; 