const express = require("express");
const User = require("../../models/User");
const passport = require("passport");
const { validateInput, sanitizeInput } = require("../../middlewares/security");
const Joi = require("joi");
const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('buyer', 'seller').default('buyer'),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

// Register page
router.get("/register", (req, res) => {
  if (req.isAuthenticated()) {
    req.flash("error", "You are already logged in");
    return res.redirect("/products");
  }
  res.render("auth/signup", {
    title: "Register - Shopiko",
    error: req.flash("error"),
  });
});

// Register user
router.post("/register", 
  sanitizeInput,
  validateInput(registerSchema),
  async (req, res, next) => {
    try {
      const { username, password, email, role, gender } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ username }, { email }]
      });

      if (existingUser) {
        req.flash("error", "Username or email already exists");
        return res.redirect("/auth/register");
      }

      // Create new user
      const user = new User({ username, email, gender, role });
      await User.register(user, password);

      req.flash("success", "Registration successful! Please log in.");
      res.redirect("/auth/login");
    } catch (error) {
      console.error("Registration error:", error);
      req.flash("error", "Registration failed. Please try again.");
      res.redirect("/auth/register");
    }
  }
);

// Login page
router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    req.flash("error", "You are already logged in");
    return res.redirect("/products");
  }
  res.render("auth/login", {
    title: "Login - Shopiko",
    error: req.flash("error"),
  });
});

// Login user
router.post("/login",
  sanitizeInput,
  validateInput(loginSchema),
  (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login error:", err);
        req.flash("error", "Login failed. Please try again.");
        return res.redirect("/auth/login");
      }

      if (!user) {
        req.flash("error", info.message || "Invalid username or password");
        return res.redirect("/auth/login");
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          req.flash("error", "Login failed. Please try again.");
          return res.redirect("/auth/login");
        }

        req.flash("success", `Welcome back, ${user.username}!`);
        
        // Redirect to intended page or products
        const redirectTo = req.session.returnTo || "/products";
        delete req.session.returnTo;
        
        res.redirect(redirectTo);
      });
    })(req, res, next);
  }
);

// Logout user
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return next(err);
    }
    req.flash("success", "Logged out successfully");
    res.redirect("/auth/login");
  });
});

// Profile page
router.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "Please log in to view your profile");
    return res.redirect("/auth/login");
  }
  
  res.render("auth/profile", {
    title: "Profile - Shopiko",
    user: req.user,
  });
});

// Update profile
router.post("/profile", 
  sanitizeInput,
  async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        req.flash("error", "Please log in to update your profile");
        return res.redirect("/auth/login");
      }

      const { email, gender } = req.body;
      const user = await User.findById(req.user._id);
      
      if (email) user.email = email;
      if (gender) user.gender = gender;
      
      await user.save();
      
      req.flash("success", "Profile updated successfully");
      res.redirect("/auth/profile");
    } catch (error) {
      console.error("Profile update error:", error);
      req.flash("error", "Failed to update profile");
      res.redirect("/auth/profile");
    }
  }
);

module.exports = router; 