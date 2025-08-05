const express = require('express');
const router = express.Router();

// Import production routes
const authRoutes = require('./auth');
const productRoutes = require('./products');
const cartRoutes = require('./cart');
const apiRoutes = require('./api');
const staticRoutes = require('../static');
const reviewRoutes = require('../review');

// Home route (must be first to avoid conflicts)
router.get('/', (req, res) => {
  res.render("home", {
    title: "Welcome to Shopiko",
    description: "Your one-stop shop for everything you need",
  });
});

// Mount routes with proper prefixes
router.use('/', staticRoutes); // Mount static routes at root level FIRST
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/api', apiRoutes);
router.use('/', reviewRoutes); // Mount review routes at root level

// Debug route to test if routes are working
router.get('/debug', (req, res) => {
  res.json({
    message: 'Production routes are working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    routes: {
      static: ['/about', '/feedback', '/events', '/account', '/faq', '/contact'],
      auth: '/auth/*',
      products: '/products/*',
      cart: '/cart/*',
      api: '/api/*'
    },
    middleware: {
      currentUser: req.user ? 'User logged in' : 'No user',
      flashMessages: req.flash ? 'Flash available' : 'No flash'
    }
  });
});

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: "App is working!", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// Production-specific middleware for route logging
router.use((req, res, next) => {
  // Log all production route requests
  console.log(`[PRODUCTION] ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

module.exports = router; 