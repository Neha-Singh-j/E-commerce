// const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { config } = require('../config/config');

// Rate limiting middleware
const createRateLimiter = (windowMs, max, message = 'Too many requests from this IP') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General rate limiter
const generalLimiter = createRateLimiter(
  config.rateLimit.windowMs,
  config.rateLimit.max,
  'Too many requests from this IP, please try again later'
);

// Auth rate limiter (stricter for login attempts)
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many login attempts, please try again later'
);

// API rate limiter
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'API rate limit exceeded'
);

// CORS configuration
const corsOptions = {
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  optionsSuccessStatus: 200,
};

// Helmet configuration for security headers
// const helmetConfig = {
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//       scriptSrc: ["'self'"],
//       imgSrc: ["'self'", "data:", "https:"],
//       connectSrc: ["'self'"],
//       fontSrc: ["'self'"],
//       objectSrc: ["'none'"],
//       mediaSrc: ["'self'"],
//       frameSrc: ["'none'"],
//     },
//   },
//   hsts: {
//     maxAge: 31536000,
//     includeSubDomains: true,
//     preload: true,
//   },
// };

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error in production
  if (config.app.env === 'production') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  }

  // Don't leak error details in production
  const errorResponse = config.app.env === 'production' 
    ? { error: 'Something went wrong' }
    : { error: message, stack: err.stack };

  res.status(statusCode).json(errorResponse);
};

// Not found middleware
const notFound = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  
  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

// Input validation middleware
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message),
      });
    }
    next();
  };
};

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  // Basic XSS protection
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  
  next();
};

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
  corsOptions,
  // helmetConfig,
  errorHandler,
  notFound,
  requestLogger,
  securityHeaders,
  validateInput,
  sanitizeInput,
}; 