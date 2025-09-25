#!/usr/bin/env node

/**
 * Production Deployment Script for Shopiko
 * Handles deployment-specific configurations and optimizations
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production deployment...');

// Check environment
const isProduction = process.env.NODE_ENV === 'production';
const isRender = process.env.RENDER === 'true';

console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Platform: ${isRender ? 'Render' : 'Other'}`);

// Production optimizations
if (isProduction) {
  console.log('✅ Production mode detected');
  
  // Set production-specific environment variables if not set
  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = require('crypto').randomBytes(64).toString('hex');
    console.log('🔐 Generated session secret');
  }
  
  if (!process.env.SECRET) {
    process.env.SECRET = require('crypto').randomBytes(64).toString('hex');
    console.log('🔐 Generated app secret');
  }
}

// Render-specific optimizations
if (isRender) {
  console.log('✅ Render platform detected');
  
  // Ensure proper port binding
  const port = process.env.PORT || 8080;
  console.log(`🌐 Server will bind to port: ${port}`);
  
  // Create logs directory if it doesn't exist
  const logsDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('📁 Created logs directory');
  }
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory');
  }
}

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️ Missing environment variables:', missingVars.join(', '));
  console.warn('⚠️ Some features may not work properly');
} else {
  console.log('✅ All required environment variables are set');
}

// Performance optimizations
if (isProduction) {
  // Disable source maps in production
  process.env.GENERATE_SOURCEMAP = 'false';
  
  // Optimize for production
  process.env.NODE_OPTIONS = '--max-old-space-size=512';
  
  console.log('⚡ Production optimizations applied');
}

console.log('🎉 Deployment script completed successfully!');
console.log('📝 Next steps:');
console.log('   1. Ensure MongoDB connection is working');
console.log('   2. Test all routes and functionality');
console.log('   3. Monitor application logs for any issues');
console.log('   4. Set up proper environment variables in Render dashboard');

// Export for use in other scripts
module.exports = {
  isProduction,
  isRender,
  validateEnvironment: () => {
    return missingVars.length === 0;
  }
}; 