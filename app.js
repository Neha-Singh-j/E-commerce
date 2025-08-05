const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Import configuration and security middleware
const { config } = require("./config/config");
const {
  generalLimiter,
  authLimiter,
  apiLimiter,
  corsOptions,
  // helmetConfig,
  errorHandler,
  notFound,
  requestLogger,
  securityHeaders,
  sanitizeInput,
} = require("./middlewares/security");

// Import production routes
const productionRoutes = require("./routes/production");
const staticRoutes = require("./routes/static");

// Import models and utilities
const seedDB = require("./seed");

// Initialize Express app
const app = express();

// Load environment variables
require("dotenv").config();

// Security middleware
// app.use(require("helmet")(helmetConfig));
app.use(require("cors")(corsOptions));
app.use(securityHeaders);
app.use(sanitizeInput);

// Rate limiting
app.use(generalLimiter);
app.use("/auth", authLimiter);
app.use("/api", apiLimiter);

// Request logging
app.use(requestLogger);

// View engine setup
app.set("view engine", "ejs");
app.set("views", config.paths.views);

// Static files
app.use(express.static(config.paths.public));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(methodOverride("_method"));

// Session configuration
const sessionConfig = {
  ...config.session,
  secret: config.security.sessionSecret,
  name: "shopiko_session", // Change default session name
  cookie: {
    ...config.session.cookie,
    secure: config.app.env === "production",
    sameSite: config.app.env === "production" ? "strict" : "lax",
  },
};

app.use(session(sessionConfig));
app.use(flash());

// Passport configuration
function initializePassport() {
  try {
    const User = require("./models/User");
    app.use(passport.initialize());
    app.use(passport.session());
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
    passport.use(new LocalStrategy(User.authenticate()));
    console.log("✅ Passport authentication configured successfully");
  } catch (error) {
    console.error("⚠️ Passport configuration failed:", error.message);
    console.log("⚠️ Authentication features may not work without database");
  }
}

// Database connection
mongoose.set("strictQuery", true);

mongoose
  .connect(config.database.uri, config.database.options)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${config.database.uri.includes('localhost') ? 'Local MongoDB' : 'Cloud MongoDB'}`);
    initializePassport();
    
    // Seed database if enabled
    if (config.development.seedDatabase) {
      console.log("🌱 Seeding database...");
      seedDB();
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    if (!config.database.uri.includes('localhost')) {
      console.log("💡 Check your MONGO_URI connection string");
    } else {
      console.log("💡 For local development: Make sure MongoDB is running locally");
      console.log("💡 For production: Set MONGO_URI environment variable");
    }
    console.log("⚠️ App will start without database connection - some features may not work");
    initializePassport();
  });

// Global middleware for user and flash messages
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.appName = config.app.name;
  res.locals.appVersion = config.app.version;
  next();
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.app.env,
    version: config.app.version,
  });
});

// Home route
app.get("/", (req, res) => {
  res.render("home", {
    title: "Welcome to Shopiko",
    description: "Your one-stop shop for everything you need",
  });
});

// Test route
app.get("/test", (req, res) => {
  res.json({ 
    message: "App is working!", 
    timestamp: new Date().toISOString(),
    environment: config.app.env,
    version: config.app.version,
  });
});

// Mount production routes
console.log("🔧 Registering production routes...");
app.use("/", productionRoutes);
app.use("/", staticRoutes);
console.log("✅ All production routes registered successfully");

// 404 handler
app.use("*", notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start server
const port = config.app.port;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌍 Environment: ${config.app.env}`);
  console.log(`📱 App: ${config.app.name} v${config.app.version}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
});

module.exports = app;