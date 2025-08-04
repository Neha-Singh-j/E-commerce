const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const seedDB = require("./seed");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require("./routes/review");
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const productApi = require("./routes/api/productapi"); //api
const staticRoutes = require("./routes/static"); //static pages
const passport = require("passport"); //pass
const LocalStrategy = require("passport-local"); //pass
const User = require("./models/User"); //pass
require("dotenv").config(); // Make sure this is at the top

// Environment variable validation
const requiredEnvVars = ['MONGO_URI', 'SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('💡 Please set these variables in your deployment environment');
  console.error('💡 For now, using default values but this may cause issues');
  // Don't exit in production, just warn
}

mongoose.set("strictQuery", true);

// Use a default MongoDB URI if not provided in environment
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/shopiko";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoURI.includes('localhost') ? 'Local MongoDB' : 'Cloud MongoDB'}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    if (!process.env.MONGO_URI) {
      console.log("💡 For local development: Make sure MongoDB is running locally");
      console.log("💡 For production: Set MONGO_URI environment variable");
    } else {
      console.log("💡 Check your MONGO_URI connection string");
    }
    console.log("⚠️ App will start without database connection - some features may not work");
    // Don't exit - let the app start without database
  });


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// now for public folder
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// seeding dummy data
// seedDB(); // Commented out to prevent crashes when DB is not available

let configSession = {
  secret: process.env.SECRET || "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(configSession));
app.use(flash());

// use static serialize and deserialize of model for passport session support
try {
  app.use(passport.initialize()); //pass
  app.use(passport.session()); //pass
  passport.serializeUser(User.serializeUser()); //pass
  passport.deserializeUser(User.deserializeUser()); //pass

  // use static authenticate method of model in LocalStrategy
  passport.use(new LocalStrategy(User.authenticate())); //pass
  console.log("✅ Passport authentication configured successfully");
} catch (error) {
  console.error("⚠️ Passport configuration failed:", error.message);
  console.log("⚠️ Authentication features may not work without database");
}

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

// Routes
console.log("🔧 Registering routes...");
app.use(productRoutes);
app.use(reviewRoutes);
app.use(authRoutes);
app.use(cartRoutes);
app.use(productApi);
app.use(staticRoutes);
console.log("✅ All routes registered successfully");

// 404 handler - must be last
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.originalUrl}`);
  res.status(404).render('error', { 
    message: `Page not found: ${req.originalUrl}`,
    error: { status: 404 }
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`server connected at port : ${port}`);
});