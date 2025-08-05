const express = require('express');
const router = express.Router();

// Import production routes
const authRoutes = require('./auth');
const productRoutes = require('./products');
const cartRoutes = require('./cart');
const apiRoutes = require('./api');

// Mount routes with proper prefixes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/api', apiRoutes);

// Production-specific middleware for route logging
router.use((req, res, next) => {
  // Log all production route requests
  console.log(`[PRODUCTION] ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

module.exports = router; 