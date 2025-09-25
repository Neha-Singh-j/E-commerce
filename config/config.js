const path = require('path');
require('dotenv').config();

const config = {
  // Application
  app: {
    name: 'Shopiko E-Commerce',
    version: '1.0.0',
    port: process.env.PORT || 8080,
    env: process.env.NODE_ENV || 'development',
    debug: process.env.DEBUG === 'true',
  },

  // Database
  database: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/shopiko',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  // Security
  security: {
    secret: process.env.SECRET || 'keyboard-cat-change-this-in-production',
    sessionSecret: process.env.SESSION_SECRET || 'session-secret-change-this',
    jwtSecret: process.env.JWT_SECRET || 'jwt-secret-change-this',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'session-secret-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
    },
  },

  // Email (for future features)
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    secure: false,
  },

  // File Upload (for future features)
  upload: {
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
  },

  // Payment (for future features)
  payment: {
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
    },
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },

  // API
  api: {
    version: process.env.API_VERSION || 'v1',
    prefix: process.env.API_PREFIX || '/api',
  },

  // Development
  development: {
    seedDatabase: process.env.SEED_DATABASE === 'true',
  },

  // Paths
  paths: {
    views: path.join(__dirname, '../views'),
    public: path.join(__dirname, '../public'),
    uploads: path.join(__dirname, '../public/uploads'),
    logs: path.join(__dirname, '../logs'),
  },
};

// Validation function
const validateConfig = () => {
  const required = ['database.uri', 'security.secret'];
  const missing = [];

  required.forEach(key => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    if (!value) {
      missing.push(key);
    }
  });

  if (missing.length > 0 && config.app.env === 'production') {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }

  return config;
};

module.exports = {
  config: validateConfig(),
  validateConfig,
}; 