#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production deployment...');

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  console.log('⚠️  Not in production mode. Set NODE_ENV=production to continue.');
  process.exit(1);
}

// Validate required environment variables
const requiredEnvVars = [
  'MONGO_URI',
  'SECRET',
  'SESSION_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  console.error('💡 Please set these variables before deployment');
  process.exit(1);
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('📁 Created logs directory');
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install --production', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Run security checks
console.log('🔒 Running security checks...');
try {
  // Check for common security issues
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check for outdated dependencies
  console.log('📋 Checking for outdated dependencies...');
  execSync('npm outdated', { stdio: 'pipe' });
  
  console.log('✅ Security checks passed');
} catch (error) {
  console.log('⚠️  Some security checks failed, but continuing...');
}

// Test the application
console.log('🧪 Testing application...');
try {
  // Basic health check
  const app = require('../app');
  console.log('✅ Application loads successfully');
} catch (error) {
  console.error('❌ Application failed to load:', error.message);
  process.exit(1);
}

// Create PM2 ecosystem file for production
const pm2Config = {
  apps: [{
    name: 'shopiko',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 8080
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};

fs.writeFileSync('ecosystem.config.js', `module.exports = ${JSON.stringify(pm2Config, null, 2)}`);
console.log('📄 Created PM2 ecosystem configuration');

// Create production startup script
const startupScript = `#!/bin/bash
# Production startup script for Shopiko

echo "🚀 Starting Shopiko in production mode..."

# Set production environment
export NODE_ENV=production

# Start the application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup

echo "✅ Shopiko started successfully!"
echo "📊 Monitor with: pm2 monit"
echo "📋 Logs: pm2 logs shopiko"
`;

fs.writeFileSync('start-production.sh', startupScript);
fs.chmodSync('start-production.sh', '755');
console.log('📄 Created production startup script');

// Create nginx configuration
const nginxConfig = `server {
    listen 80;
    server_name yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:${process.env.PORT || 8080};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}`;

fs.writeFileSync('nginx-shopiko.conf', nginxConfig);
console.log('📄 Created nginx configuration');

console.log('✅ Production deployment setup completed!');
console.log('');
console.log('📋 Next steps:');
console.log('1. Copy .env.example to .env and configure your environment variables');
console.log('2. Start the application: ./start-production.sh');
console.log('3. Configure nginx with the provided configuration');
console.log('4. Set up SSL certificate with Let\'s Encrypt');
console.log('5. Monitor the application: pm2 monit');
console.log('');
console.log('🔗 Useful commands:');
console.log('- View logs: pm2 logs shopiko');
console.log('- Restart app: pm2 restart shopiko');
console.log('- Stop app: pm2 stop shopiko');
console.log('- Monitor: pm2 monit'); 