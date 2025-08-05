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
  console.log("📍 Request URL:", req.originalUrl);
  console.log("📍 Request method:", req.method);
  
  // Check if we're in a test environment
  if (process.env.NODE_ENV === 'test') {
    return res.json({
      message: 'Feedback route is working!',
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
  
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

// Simple test route that doesn't use templates
router.get('/test-static', (req, res) => {
  res.json({
    message: 'Static routes are working!',
    timestamp: new Date().toISOString(),
    route: '/test-static'
  });
});

// Simple feedback test route
router.get('/feedback-test', (req, res) => {
  res.json({
    message: 'Feedback route is accessible!',
    timestamp: new Date().toISOString(),
    route: '/feedback-test'
  });
});

console.log("✅ Static routes loaded successfully");

module.exports = router; 