require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const seeddB = require("./seed");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");

const productRoutes = require("./routes/productRoutes");
const productsCategoryRoutes = require('./routes/products'); // ✅ added line
const reviewRoutes = require("./routes/review");
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const productApi = require("./routes/api/productapi");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/User");

mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

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

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

// ✅ Registering routes
app.use(productRoutes);
app.use(productsCategoryRoutes); // ✅ added this
app.use(reviewRoutes);
app.use(authRoutes);
app.use(cartRoutes);
app.use(productApi);

const port = 8080;
app.listen(port, () => {
  console.log(`server connected at port : ${port}`);
});
