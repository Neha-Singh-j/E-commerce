const express = require('express');
const router = express.Router();

console.log("📄 Loading static routes...");

// About Us page
router.get('/about', (req, res) => {
  console.log("📍 About page requested");
  res.render('static/about');
});

// Feedback page
router.get('/feedback', (req, res) => {
  console.log("📍 Feedback page requested");
  res.render('static/feedback');
});

// Events page
router.get('/events', (req, res) => {
  console.log("📍 Events page requested");
  res.render('static/events');
});

// Account page
router.get('/account', (req, res) => {
  console.log("📍 Account page requested");
  res.render('static/account');
});

// FAQ page
router.get('/faq', (req, res) => {
  console.log("📍 FAQ page requested");
  res.render('static/faq');
});

// Contact Us page
router.get('/contact', (req, res) => {
  console.log("📍 Contact page requested");
  res.render('static/contact');
});

console.log("✅ Static routes loaded successfully");

module.exports = router; 