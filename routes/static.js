const express = require('express');
const router = express.Router();

// About Us page
router.get('/about', (req, res) => {
  res.render('static/about');
});

// Feedback page
router.get('/feedback', (req, res) => {
  res.render('static/feedback');
});

// Events page
router.get('/events', (req, res) => {
  res.render('static/events');
});

// Account page
router.get('/account', (req, res) => {
  res.render('static/account');
});

// FAQ page
router.get('/faq', (req, res) => {
  res.render('static/faq');
});

// Contact Us page
router.get('/contact', (req, res) => {
  res.render('static/contact');
});

module.exports = router; 