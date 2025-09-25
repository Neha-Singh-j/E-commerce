
# Shopiko E-Commerce Platform

A modern, secure e-commerce platform built with Node.js, Express, MongoDB, and Passport.js.

## 🚀 Features

- **User Authentication**: Secure login/register with Passport.js
- **Product Management**: CRUD operations for products
- **Shopping Cart**: Add/remove items from cart
- **Reviews & Ratings**: Product reviews system
- **Responsive Design**: Modern UI with EJS templates
- **Security**: Helmet, CORS, Rate limiting, Input sanitization
- **Production Ready**: Environment-based configuration

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB (local or cloud)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/shopiko.git
   cd shopiko
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit the .env file with your configuration
   nano .env
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if using local)
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGO_URI in .env file
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=8080

# Database
MONGO_URI=mongodb://localhost:27017/shopiko

# Security
SECRET=your-super-secret-key-change-this-in-production
SESSION_SECRET=another-super-secret-session-key-change-this

# Optional: For production features
JWT_SECRET=your-jwt-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🏗️ Project Structure

```
shopiko/
├── config/
│   └── config.js          # Application configuration
├── middlewares/
│   ├── middlewares.js     # Authentication middleware
│   └── security.js        # Security middleware
├── models/
│   ├── Product.js         # Product model
│   ├── Review.js          # Review model
│   └── User.js            # User model
├── routes/
│   ├── api/
│   │   └── productapi.js  # API routes
│   ├── auth.js            # Authentication routes
│   ├── cart.js            # Cart routes
│   ├── productRoutes.js   # Product routes
│   ├── review.js          # Review routes
│   └── static.js          # Static pages
├── views/                 # EJS templates
├── public/                # Static assets
├── app.js                 # Main application file
├── package.json           # Dependencies
└── README.md              # This file
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **Input Sanitization**: XSS protection
- **Session Security**: Secure session configuration
- **Environment Variables**: Secure configuration management

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Set production environment
NODE_ENV=production

# Use strong secrets
SECRET=your-very-long-random-secret-key
SESSION_SECRET=another-very-long-random-session-secret

# Database (use MongoDB Atlas or cloud database)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/shopiko

# Disable debug mode
DEBUG=false
```

### 2. Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start app.js --name "shopiko"

# Monitor
pm2 monit

# Logs
pm2 logs shopiko
```

### 3. Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📊 Monitoring

- **Health Check**: `GET /health`
- **Application Info**: `GET /test`
- **Logs**: Check console output and log files

## 🔧 Development

```bash
# Start development server with auto-reload
npm run dev

# Install new dependencies
npm install package-name

# Update dependencies
npm update
```

## 📝 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/logout` - Logout user

### Products
- `GET /products` - List all products
- `POST /products` - Create new product
- `GET /products/:id` - Get product details
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Cart
- `GET /cart` - View cart
- `POST /cart/:id` - Add to cart
- `DELETE /cart/:id` - Remove from cart

### API
- `POST /api/products/:productId/like` - Like/unlike product

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/shopiko/issues)
- **Documentation**: Check the code comments and this README
- **Security**: Report security issues privately

## 🔄 Changelog

### v1.0.0
- Initial release
- Basic e-commerce functionality
- Security middleware
- Production-ready configuration

---

**Built with ❤️ using Node.js, Express, MongoDB, and Passport.js**
