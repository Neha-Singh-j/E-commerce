# Production Setup Guide for Shopiko

This guide will help you deploy Shopiko to production with all security and performance optimizations.

## 🚀 Quick Start

1. **Clone and setup**
   ```bash
   git clone <your-repo-url>
   cd shopiko
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

3. **Run production deployment**
   ```bash
   NODE_ENV=production node scripts/deploy.js
   ```

## 📋 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# ========================================
# PRODUCTION ENVIRONMENT VARIABLES
# ========================================

# Application
NODE_ENV=production
PORT=8080

# Database (REQUIRED)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/shopiko?retryWrites=true&w=majority

# Security (REQUIRED - Change these!)
SECRET=your-very-long-random-secret-key-at-least-32-characters
SESSION_SECRET=another-very-long-random-session-secret-at-least-32-characters

# JWT (Optional - for future features)
JWT_SECRET=your-jwt-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email (Optional - for future features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload (Optional - for future features)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment Gateway (Optional - for future features)
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key

# Redis (Optional - for session storage)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://yourdomain.com

# API
API_VERSION=v1
API_PREFIX=/api

# Development (should be false in production)
DEBUG=false
SEED_DATABASE=false
```

## 🔒 Security Checklist

- [ ] Change all default secrets
- [ ] Use HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Enable security headers
- [ ] Use strong database passwords
- [ ] Set up proper logging
- [ ] Configure backup strategy

## 🛠️ Production Deployment

### 1. Server Requirements

- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 20GB
- **Node.js**: 18.x or higher
- **MongoDB**: 5.0+ (local or cloud)

### 2. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install nginx
sudo apt install nginx -y

# Install MongoDB (if using local)
sudo apt install mongodb -y
```

### 3. Deploy Application

```bash
# Clone your repository
git clone <your-repo-url>
cd shopiko

# Install dependencies
npm install --production

# Set up environment
cp .env.example .env
nano .env  # Edit with your production values

# Run deployment script
NODE_ENV=production node scripts/deploy.js

# Start the application
./start-production.sh
```

### 4. Configure Nginx

```bash
# Copy the generated nginx configuration
sudo cp nginx-shopiko.conf /etc/nginx/sites-available/shopiko

# Enable the site
sudo ln -s /etc/nginx/sites-available/shopiko /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### 5. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring

### PM2 Commands

```bash
# Monitor application
pm2 monit

# View logs
pm2 logs shopiko

# Restart application
pm2 restart shopiko

# Stop application
pm2 stop shopiko

# View status
pm2 status
```

### Health Checks

- **Application Health**: `GET /health`
- **API Health**: `GET /api/health`
- **Database**: Check MongoDB connection
- **Memory Usage**: Monitor with PM2

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :8080
   sudo kill -9 <PID>
   ```

2. **MongoDB connection failed**
   - Check MONGO_URI in .env
   - Verify network connectivity
   - Check MongoDB service status

3. **Permission denied**
   ```bash
   sudo chown -R $USER:$USER /path/to/app
   chmod +x start-production.sh
   ```

4. **Memory issues**
   - Increase Node.js memory limit
   - Optimize database queries
   - Use PM2 cluster mode

### Log Locations

- **Application logs**: `logs/app.log`
- **PM2 logs**: `~/.pm2/logs/`
- **Nginx logs**: `/var/log/nginx/`
- **System logs**: `/var/log/syslog`

## 🚀 Performance Optimization

### Database Optimization

```javascript
// Add indexes to MongoDB
db.products.createIndex({ "name": "text", "desc": "text" })
db.products.createIndex({ "category": 1 })
db.products.createIndex({ "price": 1 })
db.reviews.createIndex({ "product": 1 })
```

### Caching Strategy

- **Redis**: For session storage
- **CDN**: For static assets
- **Browser caching**: Configure in nginx

### Load Balancing

```bash
# PM2 cluster mode (already configured)
pm2 start ecosystem.config.js

# Nginx load balancing
upstream shopiko {
    server 127.0.0.1:8080;
    server 127.0.0.1:8081;
    server 127.0.0.1:8082;
}
```

## 🔄 Backup Strategy

### Database Backup

```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="your-mongo-uri" --out="/backup/mongo_$DATE"
tar -czf "/backup/mongo_$DATE.tar.gz" "/backup/mongo_$DATE"
rm -rf "/backup/mongo_$DATE"
```

### Application Backup

```bash
# Backup application files
tar -czf "shopiko_backup_$(date +%Y%m%d).tar.gz" \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=logs \
  .
```

## 📈 Scaling

### Horizontal Scaling

1. **Multiple instances**: Use PM2 cluster mode
2. **Load balancer**: Configure nginx upstream
3. **Database sharding**: For large datasets
4. **CDN**: For static assets

### Vertical Scaling

1. **Increase server resources**: RAM, CPU
2. **Optimize code**: Profile and optimize
3. **Database optimization**: Indexes, queries
4. **Caching**: Redis, CDN

## 🔐 Security Hardening

### Firewall Configuration

```bash
# UFW firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### SSL/TLS Configuration

```nginx
# Strong SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
```

### Security Headers

```nginx
# Additional security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## 📞 Support

- **Documentation**: Check README.md
- **Issues**: GitHub Issues
- **Security**: Report privately
- **Community**: GitHub Discussions

---

**Happy deploying! 🚀** 