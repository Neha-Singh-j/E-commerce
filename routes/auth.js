const express = require("express");
const User = require("../models/User");
const passport = require("passport");
const router = express.Router();

// ===================== LOCAL AUTH =====================

// Register page
router.get("/register", (req, res) => {
  res.render("auth/signup");
});

// Register POST
router.post("/register", async (req, res) => {
  let { username, password, email, role, gender } = req.body;
  let user = new User({ username, email, gender, role });
  let newUser = await User.register(user, password);
  res.redirect("/login");
});

// Login page
router.get("/login", (req, res) => {
  res.render("auth/login");
});

// Login POST
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureMessage: true,
  }),
  (req, res) => {
    try {
      req.flash("success", `Welcome Back ${req.user.username}`);
      res.redirect("/products");
    } catch (error) {
      res.json(error);
    }
  }
);

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    req.flash("success", "Logged out successfully");
    res.redirect("/login");
  });
});

// ===================== GOOGLE OAUTH =====================

// Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // After successful login
    req.flash("success", `Welcome ${req.user.username || req.user.name}`);
    res.redirect("/products");
  }
);

module.exports = router;
