const express = require("express");
const path = require("path");

// Initialize Express app
const app = express();

// Load environment variables
require("dotenv").config();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Simple test routes
app.get("/", (req, res) => {
  res.json({
    message: "Shopiko is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development"
  });
});

app.get("/test-feedback", (req, res) => {
  res.json({
    message: "Feedback route is working!",
    timestamp: new Date().toISOString(),
    route: "/test-feedback"
  });
});

app.get("/feedback", (req, res) => {
  try {
    res.render("static/feedback");
  } catch (error) {
    res.json({
      error: "Failed to render feedback page",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    availableRoutes: ["/", "/health", "/test-feedback", "/feedback"]
  });
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 Simple server running on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
});

module.exports = app; 